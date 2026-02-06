// src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { stripe, stripeConfig } from '@/lib/stripe/server'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { SubscriptionStatus, PlanType } from '@/types/subscription'

/**
 * Fix Stripe Invoice typing (subscription + payment_intent DO exist in the webhook)
 */
interface StripeInvoiceFix extends Stripe.Invoice {
    subscription?: string
    payment_intent?: string
}

/**
 * Subscription insert type (Fix TS error on current_period_end)
 */
interface SubscriptionInsert {
    tenant_id: number
    plan_id: number
    stripe_customer_id: string
    stripe_checkout_session_id: string
    status: SubscriptionStatus
    activated_at: string
    stripe_subscription_id?: string
    current_period_start?: string
    current_period_end?: string
}

/**
 * Helper to generate a unique invoice number
 */
function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `INV-${year}${month}-${random}`
}

/**
 * POST /api/stripe/webhook
 */
export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            stripeConfig.webhookSecret
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Log the raw event
    await supabase.from('stripe_events').insert({
        stripe_event_id: event.id,
        type: event.type,
        data: event.data,
        processed: false,
    })

    try {
        switch (event.type) {

            // ----------------------------------------------------------------
            // CHECKOUT COMPLETED
            // ----------------------------------------------------------------
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                const metadata = session.metadata || {}

                const planCode = metadata.plan_code
                const tenantName = metadata.tenant_name
                const tenantSlug = metadata.tenant_slug
                const tenantDomain = metadata.tenant_domain
                const tenantDescription = metadata.tenant_description
                const customerName = metadata.customer_name
                const referralCode = metadata.referral_code

                if (!planCode || !tenantSlug) {
                    console.error('Missing required metadata in checkout session')
                    break
                }

                // Fetch plan
                const { data: plan } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('code', planCode)
                    .single()

                if (!plan) {
                    console.error('Plan not found:', planCode)
                    break
                }

                try {
                    // Create tenant
                    const { data: tenant, error: tenantError } = await supabase
                        .from('tenants')
                        .insert({
                            name: tenantName,
                            slug: tenantSlug,
                            description: tenantDescription,
                            stripe_customer_id: session.customer as string,
                            current_plan_id: plan.id,
                            subscription_status:
                                plan.type === PlanType.SUBSCRIPTION ? 'active' : 'lifetime',
                            billing_email: session.customer_details?.email,
                            owner_name: customerName,
                            owner_email: session.customer_details?.email,
                            owner_phone: session.customer_details?.phone,
                            status: 'active',
                            plan: plan.code,
                        })
                        .select()
                        .single()

                    if (tenantError) throw tenantError

                    // Domain
                    if (tenantDomain) {
                        await supabase.from('tenant_domains').insert({
                            tenant_id: tenant.id,
                            domain: tenantDomain,
                            verified: false,
                        })
                    }

                    // Config
                    await supabase.from('tenant_config').insert({
                        tenant_id: tenant.id,
                        company_name: tenantName,
                        company_description: tenantDescription,
                    })

                    // Features
                    await supabase.from('tenant_features').insert({
                        tenant_id: tenant.id,
                        show_countdown: true,
                        show_progress_bar: true,
                        enable_referrals: plan.features.referral_system || false,
                        show_blessed_numbers: plan.features.blessed_numbers || false,
                    })

                    // Subscription initialization
                    const subscriptionData: SubscriptionInsert = {
                        tenant_id: tenant.id,
                        plan_id: plan.id,
                        stripe_customer_id: session.customer as string,
                        stripe_checkout_session_id: session.id,
                        status:
                            plan.type === PlanType.SUBSCRIPTION
                                ? SubscriptionStatus.ACTIVE
                                : SubscriptionStatus.LIFETIME,
                        activated_at: new Date().toISOString(),
                    }

                    // Add subscription info if subscription exists
                    if (plan.type === PlanType.SUBSCRIPTION && session.subscription) {
                        subscriptionData.stripe_subscription_id =
                            session.subscription as string

                        const subscription = await stripe.subscriptions.retrieve(
                            session.subscription as string
                        )

                        subscriptionData.current_period_start = new Date(
                            subscription.items.data[0].current_period_start * 1000
                        ).toISOString()

                        subscriptionData.current_period_end = new Date(
                            subscription.items.data[0].current_period_end * 1000
                        ).toISOString()
                    }

                    // Save subscription
                    const { data: tenantSubscription, error: subError } = await supabase
                        .from('tenant_subscriptions')
                        .insert(subscriptionData)
                        .select()
                        .single()

                    if (subError) throw subError

                    // First invoice
                    await supabase.from('subscription_invoices').insert({
                        tenant_id: tenant.id,
                        subscription_id: tenantSubscription.id,
                        invoice_number: generateInvoiceNumber(),
                        plan_name: plan.name,
                        amount: session.amount_total
                            ? session.amount_total / 100
                            : plan.price,
                        currency: session.currency?.toUpperCase() || 'USD',
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                        billing_details: {
                            name: session.customer_details?.name,
                            email: session.customer_details?.email,
                            phone: session.customer_details?.phone,
                            address: session.customer_details?.address,
                        },
                        stripe_payment_intent_id: session.payment_intent as string,
                    })

                    // Default role
                    const { data: role } = await supabase
                        .from('roles')
                        .select('id')
                        .eq('plan_id', plan.id)
                        .eq('is_plan_default', true)
                        .single()

                    // Create user in Supabase Auth
                    const { data: authUser, error: authError } =
                        await supabase.auth.admin.createUser({
                            email: session.customer_details?.email!,
                            email_confirm: true,
                            user_metadata: {
                                full_name: customerName,
                                tenant_id: tenant.id,
                                is_owner: true,
                            },
                        })

                    if (!authError && authUser.user) {
                        // Assign role
                        await supabase.from('user_roles').insert({
                            user_id: authUser.user.id,
                            role_id: role?.id,
                            tenant_id: tenant.id,
                        })

                        // Send password reset
                        await supabase.auth.admin.generateLink({
                            type: 'recovery',
                            email: session.customer_details?.email!,
                        })
                    }

                    // Referral
                    if (metadata.referral_code) {
                        const { data: referral } = await supabase
                            .from('referrals')
                            .select('id')
                            .eq('referral_code', metadata.referral_code)
                            .eq('is_active', true)
                            .single()

                        if (referral) {
                            console.log('Referral conversion:', metadata.referral_code)
                        }
                    }

                    console.log('Tenant enrollment completed:', tenant.slug)
                } catch (error) {
                    console.error('Error in checkout completion:', error)
                }

                break
            }

            // ----------------------------------------------------------------
            // SUBSCRIPTION UPDATED
            // ----------------------------------------------------------------
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription

                const { data: tenantSub } = await supabase
                    .from('tenant_subscriptions')
                    .select('id, tenant_id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single()

                if (tenantSub) {
                    let status: SubscriptionStatus = SubscriptionStatus.ACTIVE

                    switch (subscription.status) {
                        case 'past_due':
                            status = SubscriptionStatus.PAST_DUE
                            break
                        case 'canceled':
                            status = SubscriptionStatus.CANCELED
                            break
                        case 'incomplete':
                            status = SubscriptionStatus.INCOMPLETE
                            break
                    }

                    await supabase
                        .from('tenant_subscriptions')
                        .update({
                            status,
                            current_period_start: new Date(
                                subscription.items.data[0].current_period_start * 1000
                            ).toISOString(),
                            current_period_end: new Date(
                                subscription.items.data[0].current_period_end * 1000
                            ).toISOString(),
                            cancel_at_period_end: subscription.cancel_at_period_end,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', tenantSub.id)

                    await supabase
                        .from('tenants')
                        .update({
                            subscription_status:
                                status === SubscriptionStatus.ACTIVE
                                    ? 'active'
                                    : status === SubscriptionStatus.PAST_DUE
                                        ? 'past_due'
                                        : 'inactive',
                            subscription_end_date: subscription.cancel_at_period_end
                                ? new Date(
                                    subscription.items.data[0].current_period_end * 1000
                                ).toISOString()
                                : null,
                        })
                        .eq('id', tenantSub.tenant_id)
                }

                break
            }

            // ----------------------------------------------------------------
            // INVOICE PAID
            // ----------------------------------------------------------------
            case 'invoice.paid': {
                const invoice = event.data.object as StripeInvoiceFix

                if (!invoice.subscription) break

                const { data: tenantSub } = await supabase
                    .from('tenant_subscriptions')
                    .select('id, tenant_id')
                    .eq('stripe_subscription_id', invoice.subscription)
                    .single()

                if (tenantSub) {
                    await supabase.from('subscription_invoices').insert({
                        tenant_id: tenantSub.tenant_id,
                        subscription_id: tenantSub.id,
                        stripe_invoice_id: invoice.id,
                        stripe_payment_intent_id: invoice.payment_intent,
                        invoice_number:
                            invoice.number || generateInvoiceNumber(),
                        plan_name:
                            invoice.lines.data[0]?.description || 'Subscription',
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency.toUpperCase(),
                        status: 'paid',
                        paid_at: new Date(
                            invoice.status_transitions.paid_at! * 1000
                        ).toISOString(),
                        period_start: new Date(
                            invoice.period_start * 1000
                        ).toISOString(),
                        period_end: new Date(
                            invoice.period_end * 1000
                        ).toISOString(),
                        invoice_pdf: invoice.invoice_pdf,
                        hosted_invoice_url: invoice.hosted_invoice_url,
                        billing_details: {
                            name: invoice.customer_name,
                            email: invoice.customer_email,
                            phone: invoice.customer_phone,
                            address: invoice.customer_address,
                        },
                    })

                    await supabase
                        .from('tenant_subscriptions')
                        .update({
                            status: SubscriptionStatus.ACTIVE,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', tenantSub.id)
                        .eq('status', SubscriptionStatus.PAST_DUE)
                }

                break
            }

            // ----------------------------------------------------------------
            // INVOICE FAILED
            // ----------------------------------------------------------------
            case 'invoice.payment_failed': {
                const invoice = event.data.object as StripeInvoiceFix

                if (!invoice.subscription) break

                const { data: tenantSub } = await supabase
                    .from('tenant_subscriptions')
                    .select('id, tenant_id')
                    .eq('stripe_subscription_id', invoice.subscription)
                    .single()

                if (tenantSub) {
                    await supabase
                        .from('tenant_subscriptions')
                        .update({
                            status: SubscriptionStatus.PAST_DUE,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', tenantSub.id)

                    await supabase
                        .from('tenants')
                        .update({
                            subscription_status: 'past_due',
                        })
                        .eq('id', tenantSub.tenant_id)
                }

                break
            }

            // ----------------------------------------------------------------
            // SUBSCRIPTION DELETED
            // ----------------------------------------------------------------
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription

                const { data: tenantSub } = await supabase
                    .from('tenant_subscriptions')
                    .select('id, tenant_id')
                    .eq('stripe_subscription_id', subscription.id)
                    .single()

                if (tenantSub) {
                    await supabase
                        .from('tenant_subscriptions')
                        .update({
                            status: SubscriptionStatus.CANCELED,
                            canceled_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', tenantSub.id)

                    await supabase
                        .from('tenants')
                        .update({
                            subscription_status: 'canceled',
                            subscription_end_date: new Date().toISOString(),
                        })
                        .eq('id', tenantSub.tenant_id)
                }

                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        // mark event processed
        await supabase
            .from('stripe_events')
            .update({
                processed: true,
                processed_at: new Date().toISOString(),
            })
            .eq('stripe_event_id', event.id)

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)

        await supabase
            .from('stripe_events')
            .update({
                processed: true,
                processed_at: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('stripe_event_id', event.id)

        return NextResponse.json({ received: true, error: true })
    }
}
