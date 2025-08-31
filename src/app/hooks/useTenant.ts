// src/hooks/useTenant.ts
import { useState, useEffect } from 'react';
import { Tenant } from '../types/database';
import { TenantService } from '../services/tenantService';
import { TenantConfig } from '../types/template';

export interface UseTenantReturn {
    tenant: Tenant | null;
    tenantConfig: TenantConfig | null;
    loading: boolean;
    error: string | null;
}

export const useTenant = (slug: string): UseTenantReturn => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                setLoading(true);
                setError(null);

                const tenantData = await TenantService.getTenantBySlug(slug);

                if (!tenantData) {
                    setError('Tenant not found');
                    return;
                }

                setTenant(tenantData);

                // Build tenant config (will be completed when we have raffle data)
                const config = await TenantService.getTenantConfig(tenantData);
                setTenantConfig(config);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading tenant');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchTenant();
        }
    }, [slug]);

    return {
        tenant,
        tenantConfig,
        loading,
        error
    };
};