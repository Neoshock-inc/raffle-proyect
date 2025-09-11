// src/services/tenantService.ts
import { supabase } from "../lib/supabase";
import {
    Tenant,
    TenantConfig,
    TenantContactInfo,
    TenantSocialMedia,
    TenantFeatures,
    TenantFullConfig,
    Raffle
} from "../types/database";

export class TenantService {
    // Obtener tenant por slug
    static async getTenantBySlug(slug: string): Promise<Tenant | null> {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'active')
                .single();

            if (error || !data) {
                console.error('Error fetching tenant by slug:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Unexpected error in getTenantBySlug:', error);
            return null;
        }
    }

    // Obtener configuración completa del tenant
    static async getTenantFullConfig(tenantId: string): Promise<TenantFullConfig | null> {
        try {
            const [tenant, config, contactInfo, socialMedia, features] = await Promise.all([
                this.getTenantById(tenantId),
                this.getTenantConfig(tenantId),
                this.getTenantContactInfo(tenantId),
                this.getTenantSocialMedia(tenantId),
                this.getTenantFeatures(tenantId)
            ]);

            if (!tenant) {
                return null;
            }

            return {
                tenant,
                config: config || this.getDefaultConfig(tenantId),
                contact_info: contactInfo || this.getDefaultContactInfo(tenantId),
                social_media: socialMedia || this.getDefaultSocialMedia(tenantId),
                features: features || this.getDefaultFeatures(tenantId)
            };
        } catch (error) {
            console.error('Error getting tenant full config:', error);
            return null;
        }
    }

    // Obtener tenant por ID
    static async getTenantById(tenantId: string): Promise<Tenant | null> {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();

            if (error || !data) return null;
            return data;
        } catch (error) {
            console.error('Error fetching tenant by id:', error);
            return null;
        }
    }

    // Obtener configuración del tenant
    static async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
        try {
            const { data, error } = await supabase
                .from('tenant_config')
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            if (error || !data) return null;
            return data;
        } catch (error) {
            console.error('Error fetching tenant config:', error);
            return null;
        }
    }

    // Obtener información de contacto del tenant
    static async getTenantContactInfo(tenantId: string): Promise<TenantContactInfo | null> {
        try {
            const { data, error } = await supabase
                .from('tenant_contact_info')
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            if (error || !data) return null;
            return data;
        } catch (error) {
            console.error('Error fetching tenant contact info:', error);
            return null;
        }
    }

    // Obtener redes sociales del tenant
    static async getTenantSocialMedia(tenantId: string): Promise<TenantSocialMedia | null> {
        try {
            const { data, error } = await supabase
                .from('tenant_social_media')
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            if (error || !data) return null;
            return data;
        } catch (error) {
            console.error('Error fetching tenant social media:', error);
            return null;
        }
    }

    // Obtener características del tenant
    static async getTenantFeatures(tenantId: string): Promise<TenantFeatures | null> {
        try {
            const { data, error } = await supabase
                .from('tenant_features')
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            if (error || !data) return null;
            return data;
        } catch (error) {
            console.error('Error fetching tenant features:', error);
            return null;
        }
    }

    // Funciones para valores por defecto cuando no existen registros

    private static getDefaultConfig(tenantId: string): TenantConfig {
        return {
            id: '',
            tenant_id: tenantId,
            company_name: 'Mi Empresa',
            company_description: 'Sorteos transparentes y confiables',
            logo_url: undefined,
            favicon_url: undefined,
            primary_color: '#3B82F6',
            secondary_color: '#1F2937',
            accent_color: '#F59E0B',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    private static getDefaultContactInfo(tenantId: string): TenantContactInfo {
        return {
            id: '',
            tenant_id: tenantId,
            phone: undefined,
            email: undefined,
            address: undefined,
            city: undefined,
            country: undefined,
            postal_code: undefined,
            business_hours: 'Lun - Dom: 8AM - 10PM',
            support_email: undefined,
            support_phone: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    private static getDefaultSocialMedia(tenantId: string): TenantSocialMedia {
        return {
            id: '',
            tenant_id: tenantId,
            facebook_url: undefined,
            instagram_url: undefined,
            twitter_url: undefined,
            youtube_url: undefined,
            tiktok_url: undefined,
            whatsapp_number: undefined,
            telegram_url: undefined,
            linkedin_url: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    private static getDefaultFeatures(tenantId: string): TenantFeatures {
        return {
            id: '',
            tenant_id: tenantId,
            show_countdown: true,
            show_progress_bar: true,
            show_testimonials: true,
            show_blessed_numbers: false,
            enable_referrals: false,
            enable_notifications: true,
            allow_guest_checkout: true,
            max_tickets_per_purchase: 100,
            min_tickets_per_purchase: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    // Función para convertir TenantFullConfig al formato esperado por los templates
    static buildTenantConfig(fullConfig: TenantFullConfig, raffle?: Raffle) {
        const { tenant, config, contact_info, social_media, features } = fullConfig;

        return {
            // Información básica
            company_name: config.company_name || tenant.name,
            company_description: config.company_description || tenant.description,
            logo_url: config.logo_url,
            slug: tenant.slug,

            // Colores y branding
            primary_color: config.primary_color,
            secondary_color: config.secondary_color,
            accent_color: config.accent_color,

            // Información de contacto
            contact_info: {
                phone: contact_info.phone,
                email: contact_info.email,
                hours: contact_info.business_hours,
                location: `${contact_info.city || ''}${contact_info.country ? `, ${contact_info.country}` : ''}`.trim(),
                address: contact_info.address,
                support_email: contact_info.support_email,
                support_phone: contact_info.support_phone
            },

            // Redes sociales
            social_media: {
                facebook: social_media.facebook_url,
                instagram: social_media.instagram_url,
                twitter: social_media.twitter_url,
                youtube: social_media.youtube_url,
                tiktok: social_media.tiktok_url,
                whatsapp: social_media.whatsapp_number ? `https://wa.me/${social_media.whatsapp_number.replace(/\D/g, '')}` : undefined,
                telegram: social_media.telegram_url,
                linkedin: social_media.linkedin_url
            },

            // Características
            features: {
                countdown: features.show_countdown && (raffle?.show_countdown ?? true),
                progressBar: features.show_progress_bar && (raffle?.show_progress_bar ?? true),
                testimonials: features.show_testimonials,
                blessedNumbers: features.show_blessed_numbers,
                referrals: features.enable_referrals,
                notifications: features.enable_notifications,
                guestCheckout: features.allow_guest_checkout
            },

            // Configuración de tickets
            ticket_limits: {
                max_per_purchase: features.max_tickets_per_purchase,
                min_per_purchase: features.min_tickets_per_purchase,
                max_per_user: raffle?.max_tickets_per_user
            }
        };
    }

    // Crear configuración por defecto para un nuevo tenant
    static async createDefaultConfig(tenantId: string): Promise<boolean> {
        try {
            const defaultConfig = this.getDefaultConfig(tenantId);
            const defaultContactInfo = this.getDefaultContactInfo(tenantId);
            const defaultSocialMedia = this.getDefaultSocialMedia(tenantId);
            const defaultFeatures = this.getDefaultFeatures(tenantId);

            await Promise.all([
                supabase.from('tenant_config').insert(defaultConfig),
                supabase.from('tenant_contact_info').insert(defaultContactInfo),
                supabase.from('tenant_social_media').insert(defaultSocialMedia),
                supabase.from('tenant_features').insert(defaultFeatures)
            ]);

            return true;
        } catch (error) {
            console.error('Error creating default tenant config:', error);
            return false;
        }
    }
}