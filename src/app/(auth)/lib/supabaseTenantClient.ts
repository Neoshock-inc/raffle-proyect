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
    'raffle_entries' // Aunque no aparece tenant_id en el esquema, asumo que lo tiene via raffle_id
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
    }

    // Método para obtener el contexto actual
    getTenantContext() {
        return { tenantId: currentTenantId, isAdmin: isAdminUser };
    }

    // Interceptor para el método from()
    from(table: string) {
        const query = this.client.from(table);

        // Si es admin y no tiene tenant seleccionado, no filtrar
        if (isAdminUser && !currentTenantId) {
            return query;
        }

        // Si la tabla debe ser filtrada por tenant y tenemos un tenant
        if (TENANT_FILTERED_TABLES.includes(table) && currentTenantId) {
            // Para raffle_entries, filtrar por raffle.tenant_id a través de join
            if (table === 'raffle_entries') {
                return this.createTenantFilteredRaffleEntriesQuery(query);
            }

            // Para el resto de tablas, filtrar directamente por tenant_id
            return this.createTenantFilteredQuery(query, table);
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
                            return result.eq('tenant_id', currentTenantId);
                        }

                        // Si es una operación de inserción, agregar tenant_id automáticamente
                        if (prop === 'insert' && currentTenantId && args[0]) {
                            const data = Array.isArray(args[0]) ? args[0] : [args[0]];
                            const dataWithTenant = data.map(item => ({
                                ...item,
                                tenant_id: currentTenantId
                            }));
                            return target.insert(Array.isArray(args[0]) ? dataWithTenant : dataWithTenant[0]);
                        }

                        // Si es una operación de actualización/eliminación, aplicar filtro de tenant
                        if ((prop === 'update' || prop === 'delete') && currentTenantId) {
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
        // Para raffle_entries, necesitamos filtrar a través del raffle
        return new Proxy(query, {
            get: (target, prop) => {
                const value = target[prop];

                if (typeof value === 'function') {
                    return (...args: any[]) => {
                        const result = value.apply(target, args);

                        // Para operaciones de lectura, hacer join con raffles y filtrar por tenant
                        if (prop === 'select' && currentTenantId) {
                            // Necesitamos ajustar el select para incluir el join con raffles
                            const selectStr = args[0] || '*';
                            const newSelect = `${selectStr}, raffles!inner(tenant_id)`;
                            return target.select(newSelect).eq('raffles.tenant_id', currentTenantId);
                        }

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
        const enhancedArgs = currentTenantId ?
            { ...args, p_tenant_id: currentTenantId } : // <-- aquí cambiamos el nombre
            args;

        return this.client.rpc(fn, enhancedArgs);
    }

}

// Crear instancia del cliente con tenant
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = new TenantSupabaseClient(supabaseUrl, supabaseKey);

// También exportar el cliente original para casos especiales
export const supabaseOriginal = createClient(supabaseUrl, supabaseKey);