import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiSuccess, apiError } from '../../_shared/responses';
import { withErrorHandler } from '../../_shared/withErrorHandler';

type Tenant = {
    slug: string;
    name: string;
    status: string;
};

type TenantDomain = {
    domain: string;
    verified: boolean;
    tenants: Tenant | null;
};

async function handler(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return apiError('Domain parameter is required', 400);
    }

    const { data, error } = await supabase
        .from('tenant_domains')
        .select(`
            domain,
            verified,
            tenants (
                slug,
                name,
                status
            )
        `)
        .eq('domain', domain)
        .eq('verified', true)
        .single<TenantDomain>();

    if (error || !data || !data.tenants) {
        return apiError('Domain not found', 404);
    }

    if (data.tenants.status !== 'active') {
        return apiError('Tenant not active', 403);
    }

    return apiSuccess({
        slug: data.tenants.slug,
        name: data.tenants.name,
        domain: data.domain,
    });
}

export const GET = withErrorHandler(handler, 'tenant/by-domain');
