
// 📁 types/tenant.ts (Actualizado)
export interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  layout: string
  status: 'active' | 'suspended' | 'deleted'
  plan: 'basic' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
  deleted_at?: string
  owner_name?: string
  owner_email?: string
  owner_phone?: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  tenant_id: string | null
  role: {
    name: string
    description: string | null
  }
  tenant?: Tenant
}

export interface PaymentConfig {
  id: string
  tenant_id: string
  provider: 'stripe' | 'paypal' | 'bank_account'
  public_key: string
  secret_key: string
  extra?: {
    // Para PayPal
    client_id?: string
    client_secret?: string
    sandbox?: boolean
    // Para cuenta bancaria
    bank_name?: string
    account_number?: string
    account_holder?: string
    routing_number?: string
    swift_code?: string
    // Configuraciones adicionales
    webhook_url?: string
    currency?: string
  }
  created_at: string
}

export interface EmailConfig {
  id: string
  tenant_id: string
  provider: 'resend' | 'smtp'
  username?: string
  password?: string
  host?: string
  port?: number
  api_key?: string // Para Resend
  from_email?: string
  from_name?: string
  created_at: string
}

export interface TenantDetails {
  id: string
  name: string
  slug: string
  layout: string
  created_at: string
  status: string | null
  plan: 'basic' | 'pro' | 'enterprise'
  description?: string
  tenant_domains: Array<{
    domain: string
    verified: boolean
    created_at: string
  }>
  user_roles: Array<{
    id: string
    user_id: string
    role_id: string
    roles: {
      name: string
      description: string
    }
  }>
  user_count: number
  raffle_count: number
  entry_count: number
  payment_configs?: PaymentConfig[]
  email_configs?: EmailConfig[]
}

export interface BasicRaffle {
  id: string
  title: string
  status: string
  draw_date: string
  total_numbers: number
  price: number
  created_at: string
}