// src/app/lib/utils/planAdapter.ts

import { Activity, Zap, Crown, type LucideIcon } from 'lucide-react'
import type { SubscriptionPlan } from '@/app/types/subscription'
import type { PlanMarketing } from '@/app/types/landing'

/**
 * Map icon names to Lucide components
 */
const ICON_MAP: Record<string, LucideIcon> = {
    'Activity': Activity,
    'Zap': Zap,
    'Crown': Crown,
}

/**
 * Convert a database subscription plan to marketing format for UI
 */
export function dbPlanToMarketing(dbPlan: SubscriptionPlan): PlanMarketing {
    // Format price display
    const priceDisplay = `$${dbPlan.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

    // Format period display
    let periodDisplay = ''
    switch (dbPlan.billing_period) {
        case 'monthly':
            periodDisplay = '/mes'
            break
        case 'yearly':
            periodDisplay = '/año'
            break
        case 'lifetime':
            periodDisplay = 'pago único'
            break
        default:
            periodDisplay = dbPlan.type === 'one_time' ? 'pago único' : ''
    }

    // Format original price if exists
    const originalPriceDisplay = dbPlan.original_price
        ? `$${dbPlan.original_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        : null

    // Convert features from snake_case to readable format
    const features: Record<string, boolean> = {}

    // Map database features to UI display text
    const featureMapping: Record<string, string> = {
        // Basic features
        'unlimited_raffles': 'Rifas ilimitadas',
        'unlimited_tickets': 'Boletos ilimitados',
        'basic_dashboard': 'Dashboard básico',
        'advanced_dashboard': 'Dashboard avanzado',
        'complete_dashboard': 'Dashboard completo',
        'email_support': 'Soporte por email',
        'priority_support': 'Soporte prioritario',
        'vip_support': 'Soporte VIP 24/7',

        // Advanced features
        'custom_domain': 'Dominio personalizado',
        'winner_system': 'Sistema de ganadores',
        'referral_system': 'Sistema de referidos',
        'blessed_numbers': 'Números bendecidos',
        'custom_landing': 'Landing customizable',

        // API & Integrations
        'api_access': 'API acceso',
        'api_full_access': 'API acceso completo',
        'custom_branding': 'Branding personalizado',
        'whatsapp_integration': 'Integración WhatsApp',
    }

    // Add limit-based features
    if (dbPlan.limits.maxTickets === -1) {
        features['Boletos ilimitados'] = true
    } else {
        features[`Hasta ${dbPlan.limits.maxTickets.toLocaleString()} boletos`] = true
    }

    // Convert all other features
    for (const [key, value] of Object.entries(dbPlan.features)) {
        const displayKey = featureMapping[key] || key
        features[displayKey] = Boolean(value)
    }

    // Get the correct icon
    const iconComponent = ICON_MAP[dbPlan.icon_name] || Activity

    return {
        id: dbPlan.code,
        code: dbPlan.code,
        name: dbPlan.name,
        price: priceDisplay,
        period: periodDisplay,
        originalPrice: originalPriceDisplay,
        description: dbPlan.description || '',
        features,
        tenantCount: dbPlan.tenant_count_label || '',
        color: dbPlan.color as 'gray' | 'blue' | 'purple',
        icon: iconComponent,
        icon_name: dbPlan.icon_name,
        popular: dbPlan.is_popular,
        is_popular: dbPlan.is_popular,
        is_featured: dbPlan.is_popular, // Use same as popular
        cta: dbPlan.cta_text,
        cta_text: dbPlan.cta_text,
        highlight: dbPlan.highlight_label ?? null,
        highlight_label: dbPlan.highlight_label,
    }
}

/**
 * Convert array of database plans to marketing format
 */
export function dbPlansToMarketing(dbPlans: SubscriptionPlan[]): PlanMarketing[] {
    return dbPlans
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(dbPlanToMarketing)
}

/**
 * Get plan type display
 */
export function getPlanTypeDisplay(type: 'subscription' | 'one_time'): string {
    return type === 'subscription' ? 'Suscripción' : 'Pago único'
}