// src/app/services/tenantService.ts - ACTUALIZADO
import { supabase } from '../lib/supabaseTenantClient'
import { Tenant, UserRole } from '../types/tenant'

export interface TenantWithMetrics extends Tenant {
  primary_domain?: string;
  domain_verified?: boolean;
  user_count: number;
  raffle_count: number;
  entry_count: number;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  domain: string;
  description?: string;
  plan?: 'basic' | 'pro' | 'enterprise';
  ownerEmail: string;
  ownerName: string;
  ownerPhone?: string;
}

export interface TenantListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: 'name' | 'created_at' | 'user_count' | 'raffle_count';
  sortOrder?: 'asc' | 'desc';
}

export const tenantService = {
  // MÉTODOS EXISTENTES
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
          status,
          plan,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data as unknown as UserRole[]
  },

  async getAllTenants(): Promise<Tenant[]> {
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

  async isUserAdmin(userId: string): Promise<boolean> {
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

    return data.some((userRole: any) =>
      userRole.role?.name === 'super_admin' && userRole.tenant_id === null
    )
  },

  async getUserTenant(userId: string): Promise<Tenant | null> {
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
          status,
          plan,
          created_at
        )
      `)
      .eq('user_id', userId)
      .not('tenant_id', 'is', null)
      .single()

    if (error) return null
    return (data as any)?.tenant || null
  },

  // NUEVOS MÉTODOS PARA GESTIÓN DE TENANTS

  // Obtener métricas de un tenant específico
  async getTenantMetrics(tenantId: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const [userCountResult, raffleCountResult, entryCountResult] = await Promise.all([
        directClient
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId),
        directClient
          .from('raffles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId),
        directClient
          .from('raffle_entries')
          .select('*, raffles!inner(tenant_id)', { count: 'exact', head: true })
          .eq('raffles.tenant_id', tenantId)
      ])

      return {
        user_count: userCountResult.count || 0,
        raffle_count: raffleCountResult.count || 0,
        entry_count: entryCountResult.count || 0
      }
    } catch (error) {
      console.error('Error getting tenant metrics:', error)
      return {
        user_count: 0,
        raffle_count: 0,
        entry_count: 0
      }
    }
  },

  // Obtener lista paginada de tenants con métricas
  async getTenantsPaginated(params: TenantListParams = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params

    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Construir query base
      let query = directClient
        .from('tenants')
        .select(`
          *,
          tenant_domains!left(domain, verified)
        `, { count: 'exact' })

      // Aplicar filtros de búsqueda
      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
      }

      // Aplicar filtro de status
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      // Aplicar ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Aplicar paginación
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data: tenants, error, count } = await query

      if (error) throw error

      // Enriquecer con métricas y dominio principal
      const tenantsWithMetrics: TenantWithMetrics[] = await Promise.all(
        (tenants || []).map(async (tenant) => {
          const metrics = await this.getTenantMetrics(tenant.id)
          const primaryDomain = tenant.tenant_domains?.find((d: { verified: boolean; domain: string }) => d.verified)?.domain ||
            tenant.tenant_domains?.[0]?.domain || null
          const domainVerified = tenant.tenant_domains?.some((d: { verified: boolean }) => d.verified) || false

          return {
            ...tenant,
            primary_domain: primaryDomain,
            domain_verified: domainVerified,
            ...metrics
          } as TenantWithMetrics
        })
      )

      return {
        data: tenantsWithMetrics,
        count: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
      throw new Error('Error al obtener la lista de tenants')
    }
  },

  // Obtener tenant por ID con detalles completos
  async getTenantById(id: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data: tenant, error } = await directClient
        .from('tenants')
        .select(`
          *,
          tenant_domains(domain, verified, created_at),
          user_roles(
            id,
            user_id,
            role_id,
            roles(name, description)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const metrics = await this.getTenantMetrics(id)

      return {
        ...tenant,
        ...metrics
      }
    } catch (error) {
      console.error('Error fetching tenant by ID:', error)
      throw new Error('Error al obtener el tenant')
    }
  },

  // Crear nuevo tenant
  async createTenant(data: CreateTenantData) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // 1. Verificar que el slug no exista
      const { data: existingSlug } = await directClient
        .from('tenants')
        .select('id')
        .eq('slug', data.slug)
        .single()

      if (existingSlug) {
        throw new Error('El slug ya existe')
      }

      // 2. Crear tenant con todos los campos
      const { data: tenant, error: tenantError } = await directClient
        .from('tenants')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          layout: 'default',
          status: 'active',
          plan: data.plan || 'basic',
          owner_name: data.ownerName,
          owner_email: data.ownerEmail,
          owner_phone: data.ownerPhone || null
        })
        .select()
        .single()

      if (tenantError) throw tenantError

      // 3. Crear dominio
      const { error: domainError } = await directClient
        .from('tenant_domains')
        .insert({
          tenant_id: tenant.id,
          domain: data.domain,
          verified: false
        })

      if (domainError) {
        // Rollback: eliminar tenant si falla la creación del dominio
        await directClient.from('tenants').delete().eq('id', tenant.id)
        throw domainError
      }

      // 4. Log de auditoría
      console.log('Tenant creado exitosamente:', {
        tenant_id: tenant.id,
        action: 'tenant_created',
        details: data,
        timestamp: new Date()
      })

      return tenant
    } catch (error) {
      console.error('Error creating tenant:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error al crear el tenant')
    }
  },

  // Actualizar tenant
  async updateTenant(id: string, data: Partial<Tenant>) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data: tenant, error } = await directClient
        .from('tenants')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('Tenant actualizado:', {
        tenant_id: id,
        action: 'tenant_updated',
        changes: data,
        timestamp: new Date()
      })

      return tenant
    } catch (error) {
      console.error('Error updating tenant:', error)
      throw new Error('Error al actualizar el tenant')
    }
  },

  // Validar si un slug está disponible
  async validateSlug(slug: string, excludeTenantId?: string): Promise<boolean> {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      let query = directClient
        .from('tenants')
        .select('id')
        .eq('slug', slug)

      // Excluir tenant actual en caso de edición
      if (excludeTenantId) {
        query = query.neq('id', excludeTenantId)
      }

      const { data } = await query.single()

      return !data // true si no existe (disponible)
    } catch (error) {
      return true // Error generalmente significa que no existe
    }
  },

  // Validar si un dominio está disponible
  async validateDomain(domain: string, excludeTenantId?: string): Promise<boolean> {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      let query = directClient
        .from('tenant_domains')
        .select('tenant_id')
        .eq('domain', domain)

      // Excluir tenant actual en caso de edición
      if (excludeTenantId) {
        query = query.neq('tenant_id', excludeTenantId)
      }

      const { data } = await query.single()

      return !data // true si no existe (disponible)
    } catch (error) {
      return true // Error generalmente significa que no existe
    }
  },

  // Actualizar estado del tenant
  async updateTenantStatus(id: string, status: 'active' | 'suspended' | 'deleted') {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString()
      }
      console.log('Updating tenant status:', { tenant_id: id, new_status: status })
      // Si se está eliminando, agregar fecha de eliminación
      if (status === 'deleted') {
        updateData.deleted_at = new Date().toISOString()
      }

      const { data, error } = await directClient
        .from('tenants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('Tenant status updated:', {
        tenant_id: id,
        new_status: status,
        timestamp: new Date()
      })

      return data
    } catch (error) {
      console.error('Error updating tenant status:', error)
      throw new Error('Error al actualizar el estado del tenant')
    }
  },

  // Obtener estadísticas generales de tenants
  async getTenantStats() {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const [totalResult, activeResult, suspendedResult, planStatsResult] = await Promise.all([
        directClient
          .from('tenants')
          .select('*', { count: 'exact', head: true }),
        directClient
          .from('tenants')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        directClient
          .from('tenants')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'suspended'),
        directClient
          .from('tenants')
          .select('plan')
      ])

      const planCounts = (planStatsResult.data || []).reduce((acc: Record<string, number>, tenant: any) => {
        const plan = tenant.plan || 'basic'
        acc[plan] = (acc[plan] || 0) + 1
        return acc
      }, {})

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        suspended: suspendedResult.count || 0,
        deleted: (totalResult.count || 0) - (activeResult.count || 0) - (suspendedResult.count || 0),
        by_plan: {
          basic: planCounts.basic || 0,
          pro: planCounts.pro || 0,
          enterprise: planCounts.enterprise || 0
        }
      }
    } catch (error) {
      console.error('Error getting tenant stats:', error)
      return {
        total: 0,
        active: 0,
        suspended: 0,
        deleted: 0,
        by_plan: {
          basic: 0,
          pro: 0,
          enterprise: 0
        }
      }
    }
  }
}