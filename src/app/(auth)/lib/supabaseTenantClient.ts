// lib/supabaseTenantClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Contexto de tenant global
let currentTenantId: string | null = null;
let isAdminUser: boolean = false;

// Tablas que requieren filtro de tenant
const TENANT_FILTERED_TABLES = [
    'invoices',
    'participants',
    'raffles',
    'referrals',
    'user_roles',
    'email_configs',
    'payment_configs',
    'raffle_entries'
];

// Tablas que NO deben ser filtradas (globales o de sistema)
const GLOBAL_TABLES = [
    'features',
    'roles',
    'tenants',
    'tenant_domains',
    'raffle_categories',
    'raffle_themes',
    'raffle_icons',
    'theme_config'
];

class TenantSupabaseClient {
    private client: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.client = createClient(supabaseUrl, supabaseKey);
    }

    // Método para establecer el contexto de tenant
    setTenantContext(tenantId: string | null, isAdmin: boolean = false) {
        currentTenantId = tenantId;
        isAdminUser = isAdmin;
        console.log('🔧 Tenant context updated:', { tenantId, isAdmin });
    }

    // Método para obtener el contexto actual
    getTenantContext() {
        return { tenantId: currentTenantId, isAdmin: isAdminUser };
    }

    // Interceptor para el método from()
    from(table: string) {
        const query = this.client.from(table);

        // Si la tabla es global, no aplicar filtros
        if (GLOBAL_TABLES.includes(table)) {
            return query;
        }

        // Si es admin y NO tiene tenant seleccionado, no filtrar (vista global)
        if (isAdminUser && !currentTenantId) {
            console.log(`📊 Admin global view for table: ${table}`);
            return query;
        }

        // Si la tabla debe ser filtrada por tenant
        if (TENANT_FILTERED_TABLES.includes(table)) {
            // Para raffle_entries, filtrar por raffle.tenant_id a través de join
            if (table === 'raffle_entries') {
                return this.createTenantFilteredRaffleEntriesQuery(query);
            }

            // Para el resto de tablas, filtrar directamente por tenant_id
            if (currentTenantId) {
                console.log(`🔍 Applying tenant filter for ${table}, tenant: ${currentTenantId}`);
                return this.createTenantFilteredQuery(query, table);
            }
        }

        return query;
    }

    private createTenantFilteredQuery(query: any, table: string) {
        // Crear un proxy que intercepte las operaciones
        return new Proxy(query, {
            get: (target, prop) => {
                const value = target[prop];

                if (typeof value === 'function') {
                    return (...args: any[]) => {
                        const result = value.apply(target, args);

                        // Si es una operación de lectura (select), aplicar filtro de tenant
                        if (prop === 'select' && currentTenantId) {
                            console.log(`🎯 Adding tenant filter to ${table}.select: ${currentTenantId}`);
                            return result.eq('tenant_id', currentTenantId);
                        }

                        // Si es una operación de inserción, agregar tenant_id automáticamente
                        if (prop === 'insert' && currentTenantId && args[0]) {
                            const data = Array.isArray(args[0]) ? args[0] : [args[0]];
                            const dataWithTenant = data.map(item => ({
                                ...item,
                                tenant_id: currentTenantId
                            }));
                            console.log(`➕ Adding tenant_id to insert in ${table}`);
                            return target.insert(Array.isArray(args[0]) ? dataWithTenant : dataWithTenant[0]);
                        }

                        // Si es una operación de actualización/eliminación, aplicar filtro de tenant
                        if ((prop === 'update' || prop === 'delete') && currentTenantId) {
                            console.log(`✏️ Adding tenant filter to ${table}.${prop}: ${currentTenantId}`);
                            return result.eq('tenant_id', currentTenantId);
                        }

                        return result;
                    };
                }

                return value;
            }
        });
    }

    private createTenantFilteredRaffleEntriesQuery(query: any) {
        // Solo aplicar filtro si tenemos un tenant específico
        if (!currentTenantId) {
            return query;
        }

        return new Proxy(query, {
            get: (target, prop) => {
                const value = target[prop];

                if (typeof value === 'function') {
                    return (...args: any[]) => {
                        // Para operaciones de lectura, hacer join con raffles y filtrar por tenant
                        if (prop === 'select' && currentTenantId) {
                            console.log(`🎯 Adding raffle tenant filter to raffle_entries: ${currentTenantId}`);
                            const [selectStr, options] = args;
                            const newSelect = (selectStr || '*').includes('raffles')
                                ? selectStr
                                : `${selectStr || '*'}, raffles!inner(tenant_id)`;

                            return target
                                .select(newSelect, options) // 👈 importante: pasar también options
                                .eq('raffles.tenant_id', currentTenantId);
                        }

                        const result = value.apply(target, args);
                        return result;
                    };
                }

                return value;
            }
        });
    }

    // Proxy para otros métodos del cliente
    get auth() {
        return this.client.auth;
    }

    get storage() {
        return this.client.storage;
    }

    rpc(fn: string, args?: any) {
        // Para RPCs, agregar el tenant context como parámetro
        const enhancedArgs = currentTenantId ?
            { ...args, p_tenant_id: currentTenantId } :
            args;

        console.log(`🔧 Calling RPC ${fn} with context:`, enhancedArgs);
        return this.client.rpc(fn, enhancedArgs);
    }

    // Método directo para queries sin filtros (para casos especiales)
    directQuery(table: string) {
        console.log(`🚫 Direct query (no filters) for table: ${table}`);
        return this.client.from(table);
    }
}

// Crear instancia del cliente con tenant
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = new TenantSupabaseClient(supabaseUrl, supabaseKey);

// También exportar el cliente original para casos especiales
export const supabaseOriginal = createClient(supabaseUrl, supabaseKey);

// Supabase with service role for server-side operations
export const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);