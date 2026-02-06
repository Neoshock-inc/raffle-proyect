// src/utils/tenantUrl.ts
import { supabase } from "../lib/supabaseTenantClient"

export interface TenantConfig {
    id: string
    name: string
    slug: string
    status: string
    domains?: string[]
    custom_domain?: string
}

// Cache para evitar múltiples consultas
let tenantCache: TenantConfig | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const getTenantConfig = async (): Promise<TenantConfig | null> => {
    const now = Date.now()

    // Retornar cache si es válido
    if (tenantCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return tenantCache
    }

    try {
        const { tenantId } = supabase.getTenantContext()

        if (!tenantId) {
            console.warn('No tenant context available')
            return null
        }

        // Consultar tenant con sus dominios
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select(`
        id,
        name,
        slug,
        status,
        tenant_domains (
          domain,
          verified
        )
      `)
            .eq('id', tenantId)
            .eq('status', 'active')
            .single()

        if (tenantError || !tenant) {
            console.error('Error fetching tenant config:', tenantError)
            return null
        }

        // Encontrar dominio personalizado verificado
        const verifiedDomain = tenant.tenant_domains?.find((d: any) => d.verified)?.domain

        const config: TenantConfig = {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            domains: tenant.tenant_domains?.map((d: any) => d.domain) || [],
            custom_domain: verifiedDomain
        }

        // Actualizar cache
        tenantCache = config
        cacheTimestamp = now

        return config
    } catch (error) {
        console.error('Error getting tenant config:', error)
        return null
    }
}

export const getTenantBaseUrl = async (): Promise<string> => {
    const tenantConfig = await getTenantConfig()

    if (!tenantConfig) {
        // Fallback al origin actual si no hay configuración
        return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    }

    // Si tiene dominio personalizado verificado, usarlo
    if (tenantConfig.custom_domain) {
        return `https://${tenantConfig.custom_domain}`
    }

    // Si no tiene dominio personalizado, usar el slug como subdominio
    const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    if (isLocal) {
        return `http://localhost:3000/${tenantConfig.slug}`
    } else {
        return `https://${tenantConfig.slug}.app.myfortunacloud.com`
    }
}

export const buildReferralLink = async (referralCode: string): Promise<string> => {
    const baseUrl = await getTenantBaseUrl()
    return `${baseUrl}/?ref=${encodeURIComponent(referralCode)}`
}

export const clearTenantCache = () => {
    tenantCache = null
    cacheTimestamp = 0
}

// Helper para determinar si estamos en un dominio personalizado
export const isCustomDomain = (): boolean => {
    if (typeof window === 'undefined') return false

    const hostname = window.location.hostname

    // No es dominio personalizado si es localhost o subdominio de myfortunacloud.com
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false
    if (hostname.endsWith('.app.myfortunacloud.com')) return false
    if (hostname === 'app.myfortunacloud.com') return false

    return true
}

// Helper para extraer el slug del tenant desde la URL actual
export const getTenantSlugFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null

    const hostname = window.location.hostname
    const pathname = window.location.pathname

    // Si es dominio personalizado, no podemos extraer el slug de la URL
    if (isCustomDomain()) return null

    // Si es subdominio (ej: cliente-demo.app.myfortunacloud.com)
    if (hostname.endsWith('.app.myfortunacloud.com')) {
        return hostname.replace('.app.myfortunacloud.com', '')
    }

    // Si es path-based (ej: localhost:3000/cliente-demo)
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0)
    return pathSegments[0] || null
}