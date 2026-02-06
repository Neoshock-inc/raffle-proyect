// src/app/services/subscriptionService.ts

import { stripe, getStripePriceId, stripeConfig } from '@/lib/stripe/server'
import { supabase } from '@/lib/supabase'
import {
    PlanCode,
    CreateCheckoutRequest,
    CreateCheckoutResponse,
    TenantSubscription,
    SubscriptionPlan,
    SubscriptionInvoice,
    UpdateSubscriptionRequest,
    SubscriptionResponse,
    ISubscriptionService,
    SubscriptionStatus,
    PlanType,
} from '@/types/subscription'

/**
 * Subscription Service Implementation
 */
class SubscriptionService implements ISubscriptionService {

    /**
     * Get all active plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')

        if (error) throw error
        return data || []
    }

    /**
     * Get a specific plan by code
     */
    async getPlanByCode(code: PlanCode): Promise<SubscriptionPlan | null> {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('code', code)
            .single()

        if (error) return null
        return data
    }

    /**
     * Create a Stripe Checkout Session for subscription
     */
    async createCheckoutSession(data: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
        const { planCode, customer, tenant, referralCode } = data

        // Get plan from database
        const plan = await this.getPlanByCode(planCode)
        if (!plan) {
            throw new Error('Plan not found')
        }

        // Check if tenant slug is already taken
        const { data: existingTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', tenant.slug)
            .single()

        if (existingTenant) {
            throw new Error('El slug ya está en uso. Por favor elige otro.')
        }

        try {
            // Create or get Stripe customer
            const stripeCustomer = await stripe.customers.create({
                email: customer.email,
                name: `${customer.name} ${customer.lastName}`,
                phone: customer.phone,
                address: {
                    line1: customer.address.line1,
                    city: customer.address.city,
                    country: customer.address.country,
                    postal_code: customer.address.postal_code,
                },
                metadata: {
                    tenant_name: tenant.name,
                    tenant_slug: tenant.slug,
                    plan_code: planCode,
                    referral_code: referralCode || '',
                },
            })

            // Prepare line items based on plan type
            const priceId = getStripePriceId(planCode)

            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                customer: stripeCustomer.id,
                mode: plan.type === PlanType.SUBSCRIPTION ? 'subscription' : 'payment',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${stripeConfig.urls.success}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: stripeConfig.urls.cancel,
                metadata: {
                    plan_code: planCode,
                    tenant_name: tenant.name,
                    tenant_slug: tenant.slug,
                    tenant_domain: tenant.domain || '',
                    tenant_description: tenant.description || '',
                    customer_name: `${customer.name} ${customer.lastName}`,
                    referral_code: referralCode || '',
                },
                // For subscriptions, allow promotion codes
                ...(plan.type === PlanType.SUBSCRIPTION && {
                    allow_promotion_codes: true,
                    subscription_data: {
                        metadata: {
                            plan_code: planCode,
                            tenant_slug: tenant.slug,
                        },
                    },
                }),
                // Collect billing address
                billing_address_collection: 'required',
                // Collect tax ID if needed
                customer_update: {
                    address: 'auto',
                    name: 'auto',
                },
            })

            // Store checkout session in database for tracking
            const { error: dbError } = await supabase
                .from('stripe_events')
                .insert({
                    stripe_event_id: `checkout_${session.id}`,
                    type: 'checkout.session.created',
                    data: {
                        session_id: session.id,
                        customer_id: stripeCustomer.id,
                        plan_code: planCode,
                        tenant_data: tenant,
                        customer_data: customer,
                    },
                    processed: false,
                })

            if (dbError) {
                console.error('Error storing checkout session:', dbError)
            }

            return {
                sessionId: session.id,
                checkoutUrl: session.url!,
                customerId: stripeCustomer.id,
                type: plan.type as PlanType,
            }

        } catch (error) {
            console.error('Error creating checkout session:', error)
            throw new Error('Failed to create checkout session')
        }
    }

    /**
     * Get tenant's current subscription
     */
    async getSubscription(tenantId: string): Promise<TenantSubscription | null> {

        const { data, error } = await supabase
            .from('tenant_subscriptions')
            .select(`
        *,
        plan:subscription_plans(*)
      `)
            .eq('tenant_id', tenantId)
            .in('status', ['active', 'lifetime', 'past_due'])
            .single()

        if (error) return null
        return data
    }

    /**
     * Update subscription (upgrade/downgrade/cancel/resume)
     */
    async updateSubscription(data: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
        const { tenantId, planCode, action } = data

        // Get current subscription
        const currentSub = await this.getSubscription(tenantId)
        if (!currentSub) {
            return {
                success: false,
                message: 'No active subscription found',
            }
        }

        // Get target plan
        const targetPlan = await this.getPlanByCode(planCode)
        if (!targetPlan) {
            return {
                success: false,
                message: 'Target plan not found',
            }
        }

        try {

            switch (action) {
                case 'upgrade':
                case 'downgrade': {
                    // For subscription plans only
                    if (currentSub.stripe_subscription_id && targetPlan.stripe_price_id) {
                        // Retrieve the subscription from Stripe
                        const subscription = await stripe.subscriptions.retrieve(
                            currentSub.stripe_subscription_id
                        )

                        // Update the subscription
                        const updatedSubscription = await stripe.subscriptions.update(
                            currentSub.stripe_subscription_id,
                            {
                                items: [
                                    {
                                        id: subscription.items.data[0].id,
                                        price: targetPlan.stripe_price_id,
                                    },
                                ],
                                proration_behavior: 'create_prorations',
                                metadata: {
                                    plan_code: planCode,
                                },
                            }
                        )

                        // Update database
                        await supabase
                            .from('tenant_subscriptions')
                            .update({
                                plan_id: targetPlan.id,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', currentSub.id)

                        // Update tenant's current plan
                        await supabase
                            .from('tenants')
                            .update({
                                current_plan_id: targetPlan.id,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', tenantId)

                        return {
                            success: true,
                            message: `Plan ${action}d successfully`,
                            nextBillingDate: new Date(updatedSubscription.items.data[0].current_period_end * 1000).toISOString(),
                        }
                    }
                    break
                }

                case 'cancel': {
                    if (currentSub.stripe_subscription_id) {
                        // Cancel at period end
                        await stripe.subscriptions.update(
                            currentSub.stripe_subscription_id,
                            {
                                cancel_at_period_end: true,
                            }
                        )

                        // Update database
                        await supabase
                            .from('tenant_subscriptions')
                            .update({
                                cancel_at_period_end: true,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', currentSub.id)

                        return {
                            success: true,
                            message: 'Subscription will be canceled at the end of the billing period',
                        }
                    }
                    break
                }

                case 'resume': {
                    if (currentSub.stripe_subscription_id && currentSub.cancel_at_period_end) {
                        // Resume subscription
                        await stripe.subscriptions.update(
                            currentSub.stripe_subscription_id,
                            {
                                cancel_at_period_end: false,
                            }
                        )

                        // Update database
                        await supabase
                            .from('tenant_subscriptions')
                            .update({
                                cancel_at_period_end: false,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', currentSub.id)

                        return {
                            success: true,
                            message: 'Subscription resumed successfully',
                        }
                    }
                    break
                }
            }

            return {
                success: false,
                message: 'Operation not supported for this subscription type',
            }

        } catch (error) {
            console.error('Error updating subscription:', error)
            return {
                success: false,
                message: 'Failed to update subscription',
            }
        }
    }

    /**
     * Cancel subscription immediately or at period end
     */
    async cancelSubscription(tenantId: string, immediate = false): Promise<SubscriptionResponse> {
        const currentSub = await this.getSubscription(tenantId)
        if (!currentSub || !currentSub.stripe_subscription_id) {
            return {
                success: false,
                message: 'No active subscription found',
            }
        }

        try {
            if (immediate) {
                // Cancel immediately
                await stripe.subscriptions.cancel(currentSub.stripe_subscription_id)

                // Update database
                await supabase
                    .from('tenant_subscriptions')
                    .update({
                        status: SubscriptionStatus.CANCELED,
                        canceled_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', currentSub.id)

                // Update tenant status
                await supabase
                    .from('tenants')
                    .update({
                        subscription_status: 'canceled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', tenantId)

                return {
                    success: true,
                    message: 'Subscription canceled immediately',
                }
            } else {
                // Cancel at period end
                return this.updateSubscription({
                    tenantId,
                    planCode: currentSub.plan?.code as PlanCode,
                    action: 'cancel',
                })
            }
        } catch (error) {
            console.error('Error canceling subscription:', error)
            return {
                success: false,
                message: 'Failed to cancel subscription',
            }
        }
    }

    /**
     * Get all invoices for a tenant
     */
    async getInvoices(tenantId: string): Promise<SubscriptionInvoice[]> {
        const { data, error } = await supabase
            .from('subscription_invoices')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    /**
     * Get a specific invoice
     */
    async getInvoice(invoiceId: string): Promise<SubscriptionInvoice | null> {  
        const { data, error } = await supabase
            .from('subscription_invoices')
            .select('*')
            .eq('id', invoiceId)
            .single()

        if (error) return null
        return data
    }

    /**
     * Download invoice PDF
     */
    async downloadInvoice(invoiceId: string): Promise<string> {
        const invoice = await this.getInvoice(invoiceId)
        if (!invoice || !invoice.stripe_invoice_id) {
            throw new Error('Invoice not found')
        }

        // Get invoice from Stripe
        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id)

        if (!stripeInvoice.invoice_pdf) {
            throw new Error('Invoice PDF not available')
        }

        return stripeInvoice.invoice_pdf
    }

    /**
     * Create customer portal session
     */
    async createPortalSession(tenantId: string, returnUrl: string): Promise<{ url: string }> {
        // Get tenant's stripe customer ID
        const { data: tenant } = await supabase
            .from('tenants')
            .select('stripe_customer_id')
            .eq('id', tenantId)
            .single()

        if (!tenant?.stripe_customer_id) {
            throw new Error('No Stripe customer found for this tenant')
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: tenant.stripe_customer_id,
            return_url: returnUrl || stripeConfig.urls.portal_return,
        })

        return { url: session.url }
    }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()