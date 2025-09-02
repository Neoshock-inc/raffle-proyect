export interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  layout: string
  status: 'active' | 'suspended' | 'deleted'
  plan: 'free' | 'pro' | 'enterprise'
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