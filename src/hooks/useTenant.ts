// src/hooks/useTenant.ts
import { Tenant } from '@/types/database';
import { TenantService } from '@/services/tenantService';
import { TenantConfig } from '@/types/template';
import { useAsyncData } from './shared';

export interface UseTenantReturn {
    tenant: Tenant | null;
    tenantConfig: TenantConfig | null;
    loading: boolean;
    error: string | null;
}

interface TenantResult {
    tenant: Tenant;
    tenantConfig: TenantConfig | null;
}

export const useTenant = (slug: string): UseTenantReturn => {
    const { data, loading, error } = useAsyncData<TenantResult>(
        async () => {
            const tenantData = await TenantService.getTenantBySlug(slug);
            if (!tenantData) {
                throw new Error('Tenant not found');
            }
            const config = await TenantService.getTenantConfig(tenantData.id);
            return { tenant: tenantData, tenantConfig: config as TenantConfig | null };
        },
        [slug],
        { enabled: !!slug }
    );

    return {
        tenant: data?.tenant ?? null,
        tenantConfig: data?.tenantConfig ?? null,
        loading,
        error,
    };
};
