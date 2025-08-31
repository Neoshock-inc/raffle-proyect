import { supabase } from "../lib/supabase";
import { Tenant } from "../types/database";
import { TemplateTheme, TemplateFeatures, TenantConfig } from "../types/template";


export class TenantService {
    static async getTenantBySlug(slug: string): Promise<Tenant | null> {
        console.log('Fetching tenant by slug:', slug);
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                console.error('Error fetching tenant:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Unexpected error in getTenantBySlug:', error);
            return null;
        }
    }

    static async getTenantConfig(tenant: Tenant, primaryRaffle?: any): Promise<TenantConfig> {
        // Default theme based on tenant layout
        const defaultTheme: TemplateTheme = {
            colors: {
                primary: primaryRaffle?.primary_color || '#007bff',
                secondary: primaryRaffle?.secondary_color || '#6c757d',
                background: primaryRaffle?.background_color || '#ffffff',
                text: primaryRaffle?.text_color || '#212529',
                accent: '#ffc107'
            },
            fonts: {
                heading: 'Inter',
                body: 'Inter',
                size_base: 16
            },
            layout: {
                style: tenant.layout === 'luxury' ? 'bold' : 'modern',
                card_shadow: true,
                rounded_corners: true,
                enable_animations: true
            }
        };

        // Features based on tenant layout
        const features: TemplateFeatures = {
            countdown: primaryRaffle?.show_countdown ?? true,
            progressBar: primaryRaffle?.show_progress_bar ?? true,
            testimonials: tenant.layout === 'luxury',
            customTickets: true,
            blessedNumbers: false, // Will be set based on data availability
            carousel: tenant.layout === 'luxury',
            socialProof: tenant.layout === 'luxury'
        };

        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            layout: tenant.layout,
            features,
            theme: defaultTheme,
            branding: {
                logo: primaryRaffle?.logo_url,
                banner: primaryRaffle?.banner_url
            }
        };
    }
}