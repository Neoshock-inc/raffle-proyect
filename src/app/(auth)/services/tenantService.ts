import { createClient } from '@supabase/supabase-js'
import { Tenant, UserRole } from '../types/tenant'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const tenantService = {
  // Obtener roles y tenants del usuario
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role_id,
        tenant_id,
        role:role_id (
          name,
          description
        ),
        tenant:tenant_id (
          id,
          name,
          slug,
          layout,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data as unknown as UserRole[]
  },

  // Obtener todos los tenants (solo para admins)
  async getAllTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Tenant[]
  },

  // Verificar si el usuario es admin (tiene rol admin sin tenant_id)
  async isUserAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role:role_id (
          name
        ),
        tenant_id
      `)
      .eq('user_id', userId)

    if (error) return false

    // Es admin si tiene rol 'admin' Y tenant_id es null
    return data.some((userRole: any) => 
      userRole.role?.name === 'admin' && userRole.tenant_id === null
    )
  },

  // Obtener tenant del usuario customer
  async getUserTenant(userId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        tenant:tenant_id (
          id,
          name,
          slug,
          layout,
          created_at
        )
      `)
      .eq('user_id', userId)
      .not('tenant_id', 'is', null)
      .single()

    if (error) return null
    return (data as any)?.tenant || null
  }
}
