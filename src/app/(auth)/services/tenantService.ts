// src/app/services/tenantService.ts - CORREGIDO
import { supabase } from '../lib/supabaseTenantClient' // Usar el cliente con interceptor
import { Tenant, UserRole } from '../types/tenant'

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
    // Para esta consulta necesitamos usar el cliente sin filtros
    // porque queremos TODOS los tenants sin importar el contexto actual
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await directClient
      .from('tenants')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Tenant[]
  },

  // Verificar si el usuario es admin (tiene rol admin sin tenant_id)
  async isUserAdmin(userId: string): Promise<boolean> {
    // Para esta consulta también necesitamos el cliente directo
    // porque necesitamos verificar roles sin filtros de tenant
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await directClient
      .from('user_roles')
      .select(`
        role:role_id (
          name
        ),
        tenant_id
      `)
      .eq('user_id', userId)

    if (error) return false

    // Es admin si tiene rol 'super_admin' Y tenant_id es null
    return data.some((userRole: any) =>
      userRole.role?.name === 'super_admin' && userRole.tenant_id === null
    )
  },

  // Obtener tenant del usuario customer
  async getUserTenant(userId: string): Promise<Tenant | null> {
    // También usar cliente directo para esta consulta de configuración inicial
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await directClient
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