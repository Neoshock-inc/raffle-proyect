// src/app/services/tenantService.ts - ACTUALIZADO
import { supabase, supabaseService } from '../lib/supabaseTenantClient'
import { Tenant, UserRole } from '../types/tenant'
import { resolveCountryCode } from '@/constants/countries'
import type { CountryCode } from '@/constants/countries'

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
  template?: string;
  description?: string;
  plan?: 'basic' | 'professional' | 'enterprise';
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

    try {
      // 1. Verificar que el slug no exista
      const { data: existingSlug } = await supabaseService
        .from('tenants')
        .select('id')
        .eq('slug', data.slug)
        .single()

      if (existingSlug) {
        throw new Error('El slug ya existe')
      }

      // 2. Crear usuario administrador primero
      // 2. Invitar usuario administrador primero (solo email)
      const { data: authUser, error: authError } = await supabaseService.auth.admin.inviteUserByEmail(
        data.ownerEmail
      )

      if (authError) throw authError

      // 2b. Actualizar metadata y password del usuario invitado
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!' // Generar password temporal
      const { error: updateError } = await supabaseService.auth.admin.updateUserById(authUser.user.id, {
        password: tempPassword,
        user_metadata: {
          name: data.ownerName,
          phone: data.ownerPhone,
          role: 'tenant_admin'
        }
      })

      if (updateError) {
        // Rollback: eliminar usuario si falla la actualización
        await supabaseService.auth.admin.deleteUser(authUser.user.id)
        throw updateError
      }

      if (authError) throw authError

      // 3. Crear tenant con todos los campos
      const { data: tenant, error: tenantError } = await supabaseService
        .from('tenants')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          layout: data.template || 'default',
          status: 'active',
          plan: data.plan || 'basic',
          owner_name: data.ownerName,
          owner_email: data.ownerEmail,
          owner_phone: data.ownerPhone || null
        })
        .select()
        .single()

      if (tenantError) {
        // Rollback: eliminar usuario si falla la creación del tenant
        await supabaseService.auth.admin.deleteUser(authUser.user.id)
        throw tenantError
      }

      // 4. Crear dominio (solo si no es plan basic)
      if (data.domain) {
        const { error: domainError } = await supabaseService
          .from('tenant_domains')
          .insert({
            tenant_id: tenant.id,
            domain: data.domain,
            verified: false
          })

        if (domainError) {
          // Rollback: eliminar tenant y usuario
          await supabaseService.from('tenants').delete().eq('id', tenant.id)
          await supabaseService.auth.admin.deleteUser(authUser.user.id)
          throw domainError
        }
      }

      return {
        ...tenant,
        user: authUser.user
      }

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

    try {
      const { data: tenant, error } = await supabaseService
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
          professional: planCounts.professional || 0,
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
          professional: 0,
          enterprise: 0
        }
      }
    }
  },
  // ====== PAÍS DEL TENANT ======

  async getTenantCountry(tenantId: string): Promise<CountryCode> {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await directClient
        .from('tenant_contact_info')
        .select('country')
        .eq('tenant_id', tenantId)
        .single()

      if (error || !data) return 'EC'
      return resolveCountryCode(data.country)
    } catch {
      return 'EC'
    }
  },

  // ====== CONFIGURACIONES DE PAGO ======

  async getPaymentConfigs(tenantId: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await directClient
        .from('payment_configs')
        .select('*')
        .eq('tenant_id', tenantId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payment configs:', error)
      return []
    }
  },

  async upsertPaymentConfig(configData: {
    tenant_id: string
    provider: string
    public_key: string
    secret_key: string
    extra?: any
  }) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Verificar si ya existe una configuración para este tenant y proveedor
      const { data: existing } = await directClient
        .from('payment_configs')
        .select('id')
        .eq('tenant_id', configData.tenant_id)
        .eq('provider', configData.provider)
        .single()

      if (existing) {
        // Actualizar configuración existente
        const { data, error } = await directClient
          .from('payment_configs')
          .update({
            public_key: configData.public_key,
            secret_key: configData.secret_key,
            extra: configData.extra || null
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error

        console.log('Payment config updated:', {
          tenant_id: configData.tenant_id,
          provider: configData.provider,
          action: 'updated'
        })

        return data
      } else {
        // Crear nueva configuración
        const { data, error } = await directClient
          .from('payment_configs')
          .insert({
            tenant_id: configData.tenant_id,
            provider: configData.provider,
            public_key: configData.public_key,
            secret_key: configData.secret_key,
            extra: configData.extra || null
          })
          .select()
          .single()

        if (error) throw error

        console.log('Payment config created:', {
          tenant_id: configData.tenant_id,
          provider: configData.provider,
          action: 'created'
        })

        return data
      }
    } catch (error) {
      console.error('Error upserting payment config:', error)
      throw new Error('Error al guardar la configuración de pago')
    }
  },

  async deletePaymentConfig(tenantId: string, provider: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await directClient
        .from('payment_configs')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('provider', provider)

      if (error) throw error

      console.log('Payment config deleted:', {
        tenant_id: tenantId,
        provider: provider,
        action: 'deleted'
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting payment config:', error)
      throw new Error('Error al eliminar la configuración de pago')
    }
  },

  // ====== CONFIGURACIONES DE EMAIL ======

  async getEmailConfigs(tenantId: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await directClient
        .from('email_configs')
        .select('*')
        .eq('tenant_id', tenantId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching email configs:', error)
      return []
    }
  },

  // ====== CONFIGURACIONES DE EMAIL - VERSIÓN CORREGIDA ======

  // Y también simplificar el upsertEmailConfig en el servicio:
  async upsertEmailConfig(configData: {
    tenant_id: string
    provider: string
    username?: string
    password?: string
    host?: string
    port?: number
    from_name?: string
  }) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Verificar si ya existe
      const { data: existing } = await directClient
        .from('email_configs')
        .select('id')
        .eq('tenant_id', configData.tenant_id)
        .eq('provider', configData.provider)
        .single()

      const emailConfigData = {
        tenant_id: configData.tenant_id,
        provider: configData.provider,
        username: configData.username || '',
        password: configData.password || '',
        host: configData.host || 'api.resend.com',
        port: configData.port || 443,
        from_name: configData.from_name
      }

      if (existing) {
        const { data, error } = await directClient
          .from('email_configs')
          .update(emailConfigData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        const { data, error } = await directClient
          .from('email_configs')
          .insert(emailConfigData)
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error upserting email config:', error)
      throw new Error('Error al guardar la configuración de email')
    }
  },

  // Método helper para obtener configuración de email de un tenant
  async getEmailConfigForTenant(tenantId: string, provider: string = 'resend') {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data, error } = await directClient
        .from('email_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('provider', provider)
        .single()

      if (error) throw error

      // Adaptar los datos según el proveedor
      if (provider === 'resend') {
        return {
          api_key: data.password, // La API key está en el campo password
          from_email: data.username, // El from_email está en username
          from_name: data.from_name || '',
          provider: data.provider
        }
      }

      return data
    } catch (error) {
      console.error('Error getting email config for tenant:', error)
      return null
    }
  },

  async deleteEmailConfig(tenantId: string, provider: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await directClient
        .from('email_configs')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('provider', provider)

      if (error) throw error

      console.log('Email config deleted:', {
        tenant_id: tenantId,
        provider: provider,
        action: 'deleted'
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting email config:', error)
      throw new Error('Error al eliminar la configuración de email')
    }
  },

  // ====== TESTING DE CONFIGURACIONES - ACTUALIZADO ======
  async testConfiguration(tenantId: string, type: 'payment' | 'email', provider: string) {
    try {
      console.log('Testing configuration:', { tenantId, type, provider })

      // Obtener la configuración según el tipo
      let config: any = null

      if (type === 'payment') {
        const paymentConfigs = await this.getPaymentConfigs(tenantId)

        // Manejar casos especiales para cuentas bancarias con ID específico
        if (provider.startsWith('bank_account_')) {
          const accountId = provider.replace('bank_account_', '')
          config = paymentConfigs.find(c => c.provider === 'bank_account' && c.id === accountId)
        } else {
          config = paymentConfigs.find(c => c.provider === provider)
        }
      } else if (type === 'email') {
        const emailConfigs = await this.getEmailConfigs(tenantId)
        config = emailConfigs.find(c => c.provider === provider)
      }

      if (!config) {
        throw new Error('Configuración no encontrada')
      }

      // Validaciones específicas por proveedor
      if (type === 'payment') {
        if (provider === 'stripe') {
          if (!config.public_key || !config.secret_key) {
            throw new Error('Faltan las claves de Stripe')
          }
          if (!config.public_key.startsWith('pk_')) {
            throw new Error('La clave pública de Stripe debe comenzar con pk_')
          }
          if (!config.secret_key.startsWith('sk_')) {
            throw new Error('La clave secreta de Stripe debe comenzar con sk_')
          }
        } else if (provider === 'paypal') {
          if (!config.extra?.client_id || !config.extra?.client_secret) {
            throw new Error('Faltan las credenciales de PayPal')
          }
        } else if (provider.startsWith('bank_account')) {
          // Validación para cuentas bancarias individuales
          if (!config.extra?.bank_name || !config.extra?.account_number || !config.extra?.account_holder) {
            throw new Error('Faltan datos bancarios requeridos')
          }

          // Validaciones adicionales para cuentas bancarias
          if (config.extra.account_number.length < 8) {
            throw new Error('El número de cuenta debe tener al menos 8 dígitos')
          }

          if (config.extra.routing_number && config.extra.routing_number.length !== 9) {
            throw new Error('El routing number debe tener exactamente 9 dígitos')
          }

          if (config.extra.swift_code && config.extra.swift_code.length < 8) {
            throw new Error('El código SWIFT debe tener al menos 8 caracteres')
          }
        }
      } else if (type === 'email') {
        if (provider === 'resend') {
          // ACTUALIZADO: La API key está en el campo password
          if (!config.password) {
            throw new Error('Falta la API key de Resend')
          }
          if (!config.password.startsWith('re_')) {
            throw new Error('La API key de Resend debe comenzar con re_')
          }

          // ACTUALIZADO: El email remitente está en el campo username
          if (!config.username) {
            throw new Error('Falta el email remitente')
          }

          // Validar formato de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(config.username)) {
            throw new Error('El formato del email remitente no es válido')
          }

          // Validaciones adicionales para Resend
          if (config.password.length < 20) {
            throw new Error('La API key de Resend parece ser muy corta')
          }

          // Validar que el host sea correcto (opcional)
          if (config.host && config.host !== 'api.resend.com') {
            console.warn('Host no estándar para Resend:', config.host)
          }

          // Validar puerto (opcional)
          if (config.port && config.port !== 443) {
            console.warn('Puerto no estándar para Resend:', config.port)
          }
        }
      }

      // Simulación de latencia de red
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Preparar mensaje de éxito específico
      let successMessage = `Configuración de ${provider} válida`

      if (type === 'email' && provider === 'resend') {
        successMessage = `Configuración de Resend válida - Email: ${config.username}`
      } else if (provider.startsWith('bank_account')) {
        successMessage = `Cuenta bancaria válida - ${config.extra?.bank_name}`
      }

      // Por ahora retornamos éxito si pasa las validaciones básicas
      return {
        success: true,
        message: successMessage,
        tested_at: new Date().toISOString(),
        details: type === 'email' && provider === 'resend' ? {
          api_key_prefix: config.password.substring(0, 10) + '...',
          from_email: config.username,
          from_name: config.from_name || 'Sin nombre configurado'
        } : undefined
      }

    } catch (error) {
      console.error('Error testing configuration:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al probar la configuración',
        tested_at: new Date().toISOString()
      }
    }
  },

  async upsertBankAccount(accountData: {
    id?: string
    tenant_id: string
    bank_name: string
    account_number: string
    account_holder: string
    routing_number?: string
    swift_code?: string
  }) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const configData = {
        tenant_id: accountData.tenant_id,
        provider: 'bank_account',
        public_key: 'N/A', // Campo requerido pero no aplica
        secret_key: 'N/A',
        extra: {
          bank_name: accountData.bank_name,
          account_number: accountData.account_number,
          account_holder: accountData.account_holder,
          routing_number: accountData.routing_number || '',
          swift_code: accountData.swift_code || ''
        }
      }

      if (accountData.id) {
        // Actualizar cuenta existente
        const { data, error } = await directClient
          .from('payment_configs')
          .update({
            public_key: configData.public_key,
            secret_key: configData.secret_key,
            extra: configData.extra
          })
          .eq('id', accountData.id)
          .select()
          .single()

        if (error) throw error

        console.log('Bank account updated:', {
          tenant_id: accountData.tenant_id,
          account_id: accountData.id,
          action: 'updated'
        })

        return data
      } else {
        // Crear nueva cuenta
        const { data, error } = await directClient
          .from('payment_configs')
          .insert(configData)
          .select()
          .single()

        if (error) throw error

        console.log('Bank account created:', {
          tenant_id: accountData.tenant_id,
          account_id: data.id,
          action: 'created'
        })

        return data
      }
    } catch (error) {
      console.error('Error upserting bank account:', error)
      throw new Error('Error al guardar la cuenta bancaria')
    }
  },

  async deleteBankAccount(tenantId: string, accountId: string) {
    const { createClient } = await import('@supabase/supabase-js')
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await directClient
        .from('payment_configs')
        .delete()
        .eq('id', accountId)
        .eq('tenant_id', tenantId)
        .eq('provider', 'bank_account')

      if (error) throw error

      console.log('Bank account deleted:', {
        tenant_id: tenantId,
        account_id: accountId,
        action: 'deleted'
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting bank account:', error)
      throw new Error('Error al eliminar la cuenta bancaria')
    }
  },
}