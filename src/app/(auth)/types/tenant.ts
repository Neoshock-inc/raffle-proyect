// src/types/tenant.ts
export interface Tenant {
  id: string
  name: string
  slug: string
  layout: string
  created_at: string
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