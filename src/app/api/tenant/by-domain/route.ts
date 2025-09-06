import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Tipos
type Tenant = {
    slug: string;
    name: string;
    status: string;
};

type TenantDomain = {
    domain: string;
    verified: boolean;
    tenants: Tenant | null; // 👈 un dominio pertenece a un único tenant
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');

        if (!domain) {
            return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
        }

        // Buscar en tenant_domains con join a tenants
        const { data, error } = await supabase
            .from('tenant_domains')
            .select(
                `
        domain,
        verified,
        tenants (
          slug,
          name,
          status
        )
      `
            )
            .eq('domain', domain)
            .eq('verified', true)
            .single<TenantDomain>();

        if (error || !data || !data.tenants) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        if (data.tenants.status !== 'active') {
            return NextResponse.json({ error: 'Tenant not active' }, { status: 403 });
        }

        return NextResponse.json({
            slug: data.tenants.slug,
            name: data.tenants.name,
            domain: data.domain,
        });
    } catch (error) {
        console.error('Error in by-domain API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
