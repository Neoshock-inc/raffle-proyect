// src/app/lib/stripe/server.ts

import Stripe from 'stripe'

/**
 * Stripe server instance
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
    typescript: true,
})

/**
 * Stripe configuration
 */
export const stripeConfig = {
    // Price IDs from Stripe Dashboard (you need to create these in Stripe)
    prices: {
        basic_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY!,
        professional_lifetime: process.env.STRIPE_PRICE_PROFESSIONAL!,
        enterprise_lifetime: process.env.STRIPE_PRICE_ENTERPRISE!,
    },

    // Product IDs from Stripe Dashboard
    products: {
        basic: process.env.STRIPE_PRODUCT_BASIC!,
        professional: process.env.STRIPE_PRODUCT_PROFESSIONAL!,
        enterprise: process.env.STRIPE_PRODUCT_ENTERPRISE!,
    },

    // URLs
    urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/plans/checkout/success`,
        cancel: `${process.env.NEXT_PUBLIC_APP_URL}/plans/checkout`,
        portal_return: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    },

    // Webhook secret
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}

/**
 * Get price ID by plan code
 */
export function getStripePriceId(planCode: string): string {
    switch (planCode) {
        case 'basic':
            return stripeConfig.prices.basic_monthly
        case 'professional':
            return stripeConfig.prices.professional_lifetime
        case 'enterprise':
            return stripeConfig.prices.enterprise_lifetime
        default:
            throw new Error(`Invalid plan code: ${planCode}`)
    }
}