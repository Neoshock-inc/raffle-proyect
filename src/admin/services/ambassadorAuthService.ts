import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AmbassadorInfo {
    id: string
    name: string
    email: string
    ambassador_code: string
    tenant_id: string
    is_active: boolean
}

export interface TenantInfo {
    id: string
    name: string
    slug: string
    company_name?: string
    logo_url?: string
    primary_color?: string
    domain?: string
}

export const validateAmbassadorById = async (ambassadorId: string): Promise<{ ambassador: AmbassadorInfo; tenant: TenantInfo }> => {
    const { data, error } = await supabase
        .from('ambassadors')
        .select(`
            id,
            name,
            email,
            ambassador_code,
            tenant_id,
            is_active,
            user_id,
            tenants!inner (
                id,
                name,
                slug,
                tenant_config (
                    company_name,
                    logo_url,
                    primary_color
                ),
                tenant_domains (
                    domain,
                    verified
                )
            )
        `)
        .eq('id', ambassadorId)
        .eq('is_active', true)
        .single()

    if (error) {
        console.error('Error validating ambassador:', error)
        throw new Error('Error validando el embajador')
    }

    if (!data) {
        throw new Error('Embajador no encontrado o inactivo')
    }

    if (data.user_id) {
        throw new Error('Este embajador ya tiene un usuario registrado')
    }

    const tenantData = Array.isArray(data.tenants) ? data.tenants[0] : data.tenants
    const config = Array.isArray(tenantData.tenant_config)
        ? tenantData.tenant_config[0]
        : tenantData.tenant_config || {}

    const verifiedDomain = tenantData.tenant_domains?.find((d: any) => d.verified)
    const primaryDomain = verifiedDomain?.domain || tenantData.tenant_domains?.[0]?.domain

    const ambassadorInfo: AmbassadorInfo = {
        id: data.id,
        name: data.name,
        email: data.email,
        ambassador_code: data.ambassador_code,
        tenant_id: data.tenant_id,
        is_active: data.is_active,
    }

    const tenantInfo: TenantInfo = {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug,
        company_name: config.company_name || tenantData.name,
        logo_url: config.logo_url,
        primary_color: config.primary_color || '#3B82F6',
        domain: primaryDomain,
    }

    return { ambassador: ambassadorInfo, tenant: tenantInfo }
}

export const registerAmbassadorUser = async (email: string, password: string, tenantId?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: undefined,
            data: tenantId ? { tenant_id: tenantId } : undefined
        }
    })

    if (error) {
        console.error('Error registering ambassador user:', error)
        throw new Error('Error al registrar el usuario: ' + error.message)
    }

    if (!data.user) {
        throw new Error('No se pudo crear el usuario')
    }

    const { error: confirmError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
    )

    if (confirmError) {
        console.warn('No se pudo auto-verificar al usuario:', confirmError)
    }

    // Get the ambassador role ID
    const { data: ambassadorRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'ambassador')
        .single()

    if (ambassadorRole) {
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
                user_id: data.user.id,
                role_id: ambassadorRole.id,
                tenant_id: tenantId,
                created_at: new Date().toISOString()
            }])

        if (roleError) {
            console.error('Error creating user role:', roleError)
            console.warn('Usuario creado pero sin rol asignado.')
        }
    }

    return data.user
}

export const linkUserToAmbassador = async (ambassadorId: string, userId: string) => {
    const { error } = await supabase
        .from('ambassadors')
        .update({ user_id: userId })
        .eq('id', ambassadorId)

    if (error) {
        console.error('Error linking user to ambassador:', error)
        throw new Error('Error al vincular usuario al embajador')
    }
}

export const isUserAmbassador = async (userId: string) => {
    const { data, error } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw new Error('Error validando embajador')

    return Boolean(data)
}

export const getAmbassadorCode = async (userId: string) => {
    const { data, error } = await supabase
        .from('ambassadors')
        .select('ambassador_code')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw new Error('Error obteniendo código de embajador')

    return data?.ambassador_code || null
}
