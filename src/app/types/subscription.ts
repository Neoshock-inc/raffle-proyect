// src/app/types/subscription.ts

/**
 * Types for Subscription System with Stripe
 */

// ============================================
// ENUMS
// ============================================

export enum PlanCode {
    BASIC = 'basic',
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise'
}

export enum PlanType {
    SUBSCRIPTION = 'subscription',
    ONE_TIME = 'one_time'
}

export enum BillingPeriod {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    LIFETIME = 'lifetime'
}

export enum SubscriptionStatus {
    INCOMPLETE = 'incomplete',
    ACTIVE = 'active',
    PAST_DUE = 'past_due',
    CANCELED = 'canceled',
    LIFETIME = 'lifetime' // Para pagos únicos
}

// ============================================
// DATABASE MODELS
// ============================================

/**
 * Represents a subscription plan in the database
 */
export interface SubscriptionPlan {
    id: string
    code: PlanCode
    name: string
    description: string
    type: PlanType
    price: number
    original_price?: number | null
    currency: string
    billing_period?: BillingPeriod | null

    // Stripe IDs
    stripe_product_id?: string | null
    stripe_price_id?: string | null

    // Configuration
    limits: PlanLimits
    features: PlanFeatures

    // UI/Marketing
    tenant_count_label?: string
    highlight_label?: string | null
    icon_name: 'Activity' | 'Zap' | 'Crown'
    color: 'gray' | 'blue' | 'purple'
    is_popular: boolean
    cta_text: string

    // Meta
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

/**
 * Plan limits configuration
 */
export interface PlanLimits {
    maxTickets: number      // -1 for unlimited
    maxRaffles: number      // -1 for unlimited
    maxParticipants?: number
    maxAdmins?: number
}

/**
 * Plan features configuration
 */
export interface PlanFeatures {
    // Basic
    unlimited_raffles: boolean
    basic_dashboard?: boolean
    advanced_dashboard?: boolean
    complete_dashboard?: boolean
    email_support: boolean

    // Advanced
    custom_domain: boolean
    winner_system: boolean
    referral_system: boolean
    blessed_numbers: boolean
    custom_landing: boolean

    // Premium
    priority_support: boolean
    vip_support?: boolean
    api_access?: boolean
    api_full_access?: boolean
    custom_branding?: boolean
    whatsapp_integration?: boolean

    [key: string]: boolean | undefined
}

/**
 * Tenant subscription record
 */
export interface TenantSubscription {
    id: string
    tenant_id: string
    plan_id: string

    // Stripe
    stripe_subscription_id?: string | null  // Solo para suscripciones recurrentes
    stripe_customer_id: string
    stripe_checkout_session_id?: string | null

    // Status
    status: SubscriptionStatus

    // Dates
    activated_at?: string | null
    current_period_start?: string | null
    current_period_end?: string | null
    cancel_at_period_end: boolean
    canceled_at?: string | null

    // Meta
    metadata?: Record<string, any>
    created_at: string
    updated_at: string

    // Relations
    plan?: SubscriptionPlan
}

/**
 * Subscription invoice
 */
export interface SubscriptionInvoice {
    id: string
    tenant_id: string
    subscription_id?: string | null

    // Stripe
    stripe_invoice_id?: string | null
    stripe_payment_intent_id?: string | null

    // Details
    invoice_number: string
    plan_name: string
    amount: number
    currency: string
    status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'

    // Customer data
    billing_details: BillingDetails

    // Dates
    period_start?: string | null
    period_end?: string | null
    paid_at?: string | null

    // URLs
    invoice_pdf?: string | null
    hosted_invoice_url?: string | null

    created_at: string
}

// ============================================
// CHECKOUT TYPES
// ============================================

/**
 * Data collected during checkout
 */
export interface CheckoutData {
    // Plan selection
    planCode: PlanCode

    // Customer information
    customer: CustomerData

    // Tenant information
    tenant: TenantData

    // Optional
    referralCode?: string
    acceptTerms: boolean
    acceptUsage: boolean
}

/**
 * Customer personal data
 */
export interface CustomerData {
    name: string
    lastName: string
    email: string
    phone: string
    address: AddressData
}

/**
 * Address information
 */
export interface AddressData {
    line1: string
    line2?: string
    city: string
    state?: string
    country: string
    postal_code?: string
}

/**
 * Tenant/Company data
 */
export interface TenantData {
    name: string
    slug: string
    domain?: string
    description?: string
}

/**
 * Billing details snapshot
 */
export interface BillingDetails {
    name: string
    email: string
    phone?: string
    address?: AddressData
    tax_id?: string
    company_name?: string
}

// ============================================
// API TYPES
// ============================================

/**
 * Request to create a checkout session
 */
export interface CreateCheckoutRequest {
    planCode: PlanCode
    customer: CustomerData
    tenant: TenantData
    referralCode?: string
    successUrl?: string
    cancelUrl?: string
}

/**
 * Response from creating a checkout session
 */
export interface CreateCheckoutResponse {
    sessionId: string
    checkoutUrl: string
    customerId: string
    type: PlanType
}

/**
 * Request to create/update a subscription
 */
export interface UpdateSubscriptionRequest {
    tenantId: string
    planCode: PlanCode
    action: 'upgrade' | 'downgrade' | 'cancel' | 'resume'
}

/**
 * Response for subscription operations
 */
export interface SubscriptionResponse {
    success: boolean
    subscription?: TenantSubscription
    message?: string
    nextBillingDate?: string
    prorationAmount?: number
}

// ============================================
// STRIPE WEBHOOK TYPES
// ============================================

/**
 * Stripe webhook event data
 */
export interface StripeWebhookEvent {
    id: string
    stripe_event_id: string
    type: string
    data: any
    processed: boolean
    processed_at?: string | null
    error?: string | null
    created_at: string
}

/**
 * Supported Stripe webhook events
 */
export enum StripeEventType {
    // Checkout
    CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
    CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',

    // Subscription
    CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
    CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
    CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
    CUSTOMER_SUBSCRIPTION_PAUSED = 'customer.subscription.paused',
    CUSTOMER_SUBSCRIPTION_RESUMED = 'customer.subscription.resumed',

    // Invoice
    INVOICE_CREATED = 'invoice.created',
    INVOICE_PAID = 'invoice.paid',
    INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
    INVOICE_UPCOMING = 'invoice.upcoming',

    // Payment
    PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
    PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
}

// ============================================
// SERVICE TYPES
// ============================================

/**
 * Subscription service methods
 */
export interface ISubscriptionService {
    // Plans
    getPlans(): Promise<SubscriptionPlan[]>
    getPlanByCode(code: PlanCode): Promise<SubscriptionPlan | null>

    // Checkout
    createCheckoutSession(data: CreateCheckoutRequest): Promise<CreateCheckoutResponse>

    // Subscriptions
    getSubscription(tenantId: string): Promise<TenantSubscription | null>
    updateSubscription(data: UpdateSubscriptionRequest): Promise<SubscriptionResponse>
    cancelSubscription(tenantId: string, immediate?: boolean): Promise<SubscriptionResponse>

    // Invoices
    getInvoices(tenantId: string): Promise<SubscriptionInvoice[]>
    getInvoice(invoiceId: string): Promise<SubscriptionInvoice | null>
    downloadInvoice(invoiceId: string): Promise<string> // Returns PDF URL

    // Portal
    createPortalSession(tenantId: string, returnUrl: string): Promise<{ url: string }>
}

// ============================================
// FRONTEND DISPLAY TYPES
// ============================================

/**
 * Plan display information for UI
 */
export interface PlanDisplay {
    plan: SubscriptionPlan
    priceDisplay: string      // "$99"
    periodDisplay: string     // "/mes" or "pago único"
    savingsDisplay?: string   // "Ahorra $399"
    featuresCount: number
    isCurrentPlan?: boolean
}

/**
 * Subscription status for UI
 */
export interface SubscriptionStatusDisplay {
    status: SubscriptionStatus
    label: string
    color: 'green' | 'yellow' | 'red' | 'gray'
    description?: string
    actionRequired?: boolean
    daysRemaining?: number
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean
    errors: Record<string, string>
}

/**
 * Plan limits check result
 */
export interface PlanLimitCheck {
    resource: keyof PlanLimits
    current: number
    limit: number
    isExceeded: boolean
    percentageUsed: number
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Generic API response
 */
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

/**
 * Pagination info
 */
export interface PaginationInfo {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    items: T[]
    pagination: PaginationInfo
}