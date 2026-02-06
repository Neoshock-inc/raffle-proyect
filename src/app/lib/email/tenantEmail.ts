// lib/email/tenantEmail.ts
// Helpers compartidos para envío de emails multi-tenant
// Usados por: api/resend y api/send-verification
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface TenantEmailConfig {
    provider: string
    api_key: string
    from_email: string
    from_name: string
    host: string
    port: number
}

export interface TenantInfo {
    name: string
    slug?: string
    company_name: string
    logo_url: string | null
    primary_color: string
    domain: string | null
}

/**
 * Obtiene la configuración de email (Resend) para un tenant
 */
export async function getEmailConfigForTenant(tenantId: string): Promise<TenantEmailConfig | null> {
    try {
        const { data, error } = await supabase
            .from('email_configs')
            .select('provider, username, password, from_name, host, port')
            .eq('tenant_id', tenantId)
            .eq('provider', 'resend')
            .single()

        if (error) {
            console.log('No email config found for tenant:', tenantId, error)
            return null
        }

        return {
            provider: data.provider,
            api_key: data.password,
            from_email: data.username,
            from_name: data.from_name || `Sistema ${tenantId}`,
            host: data.host || 'api.resend.com',
            port: data.port || 443
        }
    } catch (error) {
        console.error('Error getting email config for tenant:', error)
        return null
    }
}

/**
 * Obtiene la información de branding del tenant
 */
export async function getTenantInfo(tenantId: string): Promise<TenantInfo | null> {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select(`
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
            `)
            .eq('id', tenantId)
            .single()

        if (error || !data) {
            console.log('No tenant info found:', tenantId, error)
            return null
        }

        const config = Array.isArray(data.tenant_config)
            ? data.tenant_config[0]
            : data.tenant_config || {}

        const verifiedDomain = data.tenant_domains?.find((d: any) => d.verified)
        const primaryDomain = verifiedDomain?.domain || data.tenant_domains?.[0]?.domain

        return {
            name: data.name,
            slug: (data as any).slug,
            company_name: (config as any).company_name || data.name,
            logo_url: (config as any).logo_url || null,
            primary_color: (config as any).primary_color || '#fa8d3b',
            domain: primaryDomain || null,
        }
    } catch (error) {
        console.error('Error getting tenant info:', error)
        return null
    }
}

/**
 * Genera el header y footer HTML comunes para emails de tenant
 */
export function emailHeader(logoUrl: string, companyName: string, primaryColor: string, title?: string): string {
    return `
        <div style="background-color: ${primaryColor}; color: white; padding: 15px; text-align: center;">
            <img src="${logoUrl}" alt="${companyName} Logo" style="max-width: 150px;" />
            ${title ? `<h2 style="margin-top: 10px; color: white;">${title}</h2>` : ''}
        </div>
    `
}

export function emailFooter(companyName: string, primaryColor: string, fromEmail: string, domain?: string | null): string {
    return `
        <div style="background-color: ${primaryColor}; color: white; padding: 15px; text-align: center; font-size: 12px;">
            ${companyName} &copy; ${new Date().getFullYear()}<br/>
            ${fromEmail}
            ${domain ? ` | ${domain}` : ''}
        </div>
    `
}

/**
 * Resuelve los valores de branding con fallbacks
 */
export function resolveBranding(tenantInfo: TenantInfo | null, emailConfig: TenantEmailConfig | null) {
    const DEFAULT_LOGO = 'https://wpffdsoqmlfplhlefcwf.supabase.co/storage/v1/object/public/main/main_logo.jpeg'

    return {
        companyName: tenantInfo?.company_name || emailConfig?.from_name || 'Sistema de Rifas',
        logoUrl: tenantInfo?.logo_url || DEFAULT_LOGO,
        primaryColor: tenantInfo?.primary_color || '#fa8d3b',
        tenantDomain: tenantInfo?.domain ? `https://${tenantInfo.domain}` : 'https://app.myfortunacloud.com',
        fromEmail: emailConfig?.from_email || 'contacto@sistema.com'
    }
}
