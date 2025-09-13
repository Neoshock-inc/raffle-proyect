// services/referralAuthService.ts - VERSIÓN MULTI-TENANT
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ReferralInfo {
    id: string
    name: string
    email: string
    referral_code: string
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

// Validar referido por ID y traer información del tenant
export const validateReferralById = async (referralId: string): Promise<{ referral: ReferralInfo; tenant: TenantInfo }> => {
    const { data, error } = await supabase
        .from('referrals')
        .select(`
            id,
            name,
            email,
            referral_code,
            tenant_id,
            is_active,
            referrer_user_id,
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
        .eq('id', referralId)
        .eq('is_active', true)
        .single()

    if (error) {
        console.error('Error validating referral:', error)
        throw new Error('Error validando el referido')
    }

    if (!data) {
        throw new Error('Referido no encontrado o inactivo')
    }

    // Verificar si ya tiene un usuario asignado
    if (data.referrer_user_id) {
        throw new Error('Este referido ya tiene un usuario registrado')
    }

    // Normalizar tenant_config
    const tenantData = Array.isArray(data.tenants) ? data.tenants[0] : data.tenants
    const config = Array.isArray(tenantData.tenant_config)
        ? tenantData.tenant_config[0]
        : tenantData.tenant_config || {}

    // Buscar dominio verificado
    const verifiedDomain = tenantData.tenant_domains?.find((d: any) => d.verified)
    const primaryDomain = verifiedDomain?.domain || tenantData.tenant_domains?.[0]?.domain

    const referralInfo: ReferralInfo = {
        id: data.id,
        name: data.name,
        email: data.email,
        referral_code: data.referral_code,
        tenant_id: data.tenant_id,
        is_active: data.is_active
    }

    const tenantInfo: TenantInfo = {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug,
        company_name: config.company_name || tenantData.name,
        logo_url: config.logo_url,
        primary_color: config.primary_color || '#3B82F6',
        domain: primaryDomain
    }

    return { referral: referralInfo, tenant: tenantInfo }
}

// Función legacy para mantener compatibilidad (ahora usa referralId internamente)
export const validateReferralEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('email', email)
        .maybeSingle()

    if (error) throw new Error('Error validando el correo')
    if (!data) throw new Error('Este correo no está registrado como referido')

    return data
}

export const registerReferredUser = async (email: string, password: string, tenantId?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // Auto-verificar el usuario
            emailRedirectTo: undefined,
            // Agregar metadatos del tenant si está disponible
            data: tenantId ? { tenant_id: tenantId } : undefined
        }
    })

    if (error) {
        console.error('Error registering user:', error)
        throw new Error('Error al registrar el usuario: ' + error.message)
    }

    if (!data.user) {
        throw new Error('No se pudo crear el usuario')
    }

    // Auto-verificar el usuario manualmente
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
    )

    if (confirmError) {
        console.warn('No se pudo auto-verificar al usuario:', confirmError)
        // No lanzar error aquí, continuar con la creación del rol
    }

    // Crear el registro en user_roles con rol de referido
    const REFERIDO_ROLE_ID = '8c231b37-2c23-42c0-9577-4e6ea2934cec'

    const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
            {
                user_id: data.user.id,
                role_id: REFERIDO_ROLE_ID,
                tenant_id: tenantId,
                created_at: new Date().toISOString()
            }
        ])

    if (roleError) {
        console.error('Error creating user role:', roleError)
        // No fallar el registro completo por esto, solo logear el error
        console.warn('Usuario creado pero sin rol asignado. Se puede corregir manualmente.')
    }

    return data.user
}

export const linkUserToReferral = async (referralId: string, userId: string) => {
    const { error } = await supabase
        .from('referrals')
        .update({ referrer_user_id: userId })
        .eq('id', referralId)

    if (error) {
        console.error('Error linking user to referral:', error)
        throw new Error('Error al vincular usuario al referido')
    }
}

// Funciones legacy para mantener compatibilidad
export const linkUserToReferralByEmail = async (email: string, userId: string) => {
    const { error } = await supabase
        .from('referrals')
        .update({ referrer_user_id: userId })
        .eq('email', email)

    if (error) throw new Error('Error al vincular usuario al referido')
}

export const isUserReferred = async (userId: string) => {
    const { data, error } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_user_id', userId)
        .maybeSingle()

    if (error) throw new Error('Error validando referido')

    return Boolean(data)
}

export const getReferralCode = async (userId: string) => {
    const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_user_id', userId)
        .maybeSingle()

    if (error) throw new Error('Error obteniendo código de referido')

    return data?.referral_code || null
}