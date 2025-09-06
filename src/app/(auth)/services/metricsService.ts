// src/app/services/metricsService.ts

import { supabase } from "../lib/supabaseTenantClient";

// Cache simple en memoria para evitar consultas repetitivas
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCacheKey(operation: string, params?: any): string {
    const { tenantId } = supabase.getTenantContext();
    return `${tenantId || 'global'}_${operation}_${JSON.stringify(params || {})}`;
}

function getFromCache<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log(`🎯 Cache hit for ${key}`);
        return cached.data;
    }
    return null;
}

function setCache<T>(key: string, data: T, ttlMinutes: number = 5): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000
    });
}

// Función optimizada para obtener métricas básicas con agregaciones SQL
export async function getDashboardMetrics() {
    try {
        console.log('📊 Getting dashboard metrics...');
        const cacheKey = getCacheKey('dashboard_metrics');
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context:', { tenantId, isAdmin });

        // Usar agregaciones SQL en lugar de traer todos los datos
        const [invoiceMetrics, entryMetrics] = await Promise.all([
            // Métricas de facturas con agregación SQL
            supabase
                .from('invoices')
                .select(`
                    status,
                    payment_method,
                    total_price::numeric
                `)
                .eq('status', 'completed'),

            // Solo contar entradas, no traer todos los datos
            supabase
                .from('raffle_entries')
                .select('*', { count: 'exact' })
        ]);

        if (invoiceMetrics.error) throw invoiceMetrics.error;
        if (entryMetrics.error) throw entryMetrics.error;

        const invoices = invoiceMetrics.data || [];

        // Cálculos optimizados
        const totalSales = invoices.reduce((sum: any, inv: any) => sum + (inv.total_price || 0), 0);
        const totalNumbersSold = entryMetrics.data.length;

        console.log('Total Sales:', totalSales);
        console.log('Total Numbers Sold:', totalNumbersSold);

        // Contar ganadores con una consulta específica
        const { count: winnersCount } = await supabase
            .from('raffle_entries')
            .select('*', { count: 'exact', head: true })
            .eq('is_winner', true);

        const totalWinners = winnersCount || 0;

        const conversionRate = invoices.length > 0 ? +(totalSales / invoices.length).toFixed(2) : 0;

        // Calcular ventas por método de pago
        const paymentMethodSales = invoices.reduce((acc: any, inv: any) => {
            const method = inv.payment_method || 'unknown';
            acc[method] = (acc[method] || 0) + (inv.total_price || 0);
            return acc;
        }, {} as Record<string, number>);

        const transferSales = paymentMethodSales.bank_transfer || 0;
        const stripeSales = paymentMethodSales.stripe || 0;
        const totalMethodSales = transferSales + stripeSales;

        const transferPercentage = totalMethodSales > 0 ? +(transferSales / totalMethodSales * 100).toFixed(1) : 0;
        const stripePercentage = totalMethodSales > 0 ? +(stripeSales / totalMethodSales * 100).toFixed(1) : 0;

        const result = {
            totalSales,
            totalNumbersSold,
            totalWinners,
            conversionRate,
            transferSales,
            stripeSales,
            transferPercentage,
            stripePercentage,
        };

        setCache(cacheKey, result, 3); // Cache por 3 minutos
        console.log('✅ Dashboard metrics calculated:', result);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo métricas del dashboard:', error);
        throw error;
    }
}

// Función optimizada para ventas por día usando agregación SQL
export async function getSalesByDay(days: number = 30) {
    try {
        console.log('📈 Getting sales by day...');
        const cacheKey = getCacheKey('sales_by_day', { days });
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Usar función SQL para agrupar por día directamente en la BD
        const { data, error } = await supabase.rpc('get_sales_by_day', {
            start_date: startDate.toISOString(),
            days_count: days
        });

        if (error) {
            console.warn('⚠️ RPC not available, falling back to client-side aggregation');

            // Fallback: consulta optimizada con agregación en cliente
            const { data: invoices, error: invoiceError } = await supabase
                .from('invoices')
                .select('created_at, total_price::numeric')
                .gte('created_at', startDate.toISOString())
                .eq('status', 'completed')
                .order('created_at', { ascending: true });

            if (invoiceError) throw invoiceError;

            // Agrupar por día de manera optimizada
            const salesByDay = (invoices || []).reduce((acc: any, invoice: any) => {
                const date = new Date(invoice.created_at).toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = { date, ventas: 0, facturas: 0 };
                }
                acc[date].ventas += invoice.total_price || 0;
                acc[date].facturas += 1;
                return acc;
            }, {} as Record<string, { date: string; ventas: number; facturas: number }>);

            const result = Object.values(salesByDay);
            setCache(cacheKey, result, 5);
            return result;
        }

        setCache(cacheKey, data || [], 5);
        console.log('✅ Sales by day calculated:', data?.length);
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo ventas por día:', error);
        throw error;
    }
}

// Función optimizada para ventas por método de pago
export async function getSalesByPaymentMethod() {
    try {
        console.log('💳 Getting sales by payment method...');
        const cacheKey = getCacheKey('sales_by_payment_method');
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        // Usar agregación SQL directamente
        const { data, error } = await supabase.rpc('get_sales_by_payment_method');

        if (error) {
            console.warn('⚠️ RPC not available, falling back to optimized query');

            // Fallback optimizado: solo traer campos necesarios
            const { data: invoices, error: invoiceError } = await supabase
                .from('invoices')
                .select('payment_method, total_price::numeric')
                .eq('status', 'completed');

            if (invoiceError) throw invoiceError;

            const groupedSales = (invoices || []).reduce((acc: any, invoice: any) => {
                const method = invoice.payment_method || 'unknown';
                acc[method] = (acc[method] || 0) + (invoice.total_price || 0);
                return acc;
            }, {} as Record<string, number>);

            const result = Object.entries(groupedSales).map(([payment_method, total]) => ({
                payment_method,
                total: (total as number).toFixed(2)
            }));


            setCache(cacheKey, result, 5);
            return result;
        }

        setCache(cacheKey, data || [], 5);
        console.log('✅ Sales by payment method calculated:', data?.length);
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo ventas por método de pago:', error);
        throw error;
    }
}

// Función optimizada para entradas recientes
export async function getRecentEntries() {
    try {
        console.log('🎫 Getting recent entries...');
        const cacheKey = getCacheKey('recent_entries');
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        const lastDay = new Date();
        lastDay.setDate(lastDay.getDate() - 1);

        // Usar agregación SQL si está disponible
        const { data, error } = await supabase.rpc('get_recent_entries_by_hour', {
            start_date: lastDay.toISOString()
        });

        if (error) {
            console.warn('⚠️ RPC not available, using optimized fallback');

            // Fallback: solo fecha, sin otros campos innecesarios
            const { data: entries, error: entryError } = await supabase
                .from('raffle_entries')
                .select('purchased_at')
                .gte('purchased_at', lastDay.toISOString())
                .order('purchased_at', { ascending: true })
                .limit(1000); // Limitar resultados

            if (entryError) throw entryError;

            const entriesByHour = (entries || []).reduce((acc: any, entry: any) => {
                const hour = new Date(entry.purchased_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (!acc[hour]) {
                    acc[hour] = { hora: hour, entradas: 0 };
                }
                acc[hour].entradas += 1;
                return acc;
            }, {} as Record<string, { hora: string; entradas: number }>);

            const result = Object.values(entriesByHour);
            setCache(cacheKey, result, 2); // Cache más corto para datos recientes
            return result;
        }

        setCache(cacheKey, data || [], 2);
        console.log('✅ Recent entries calculated:', data?.length);
        return data || [];
    } catch (error) {
        console.error('❌ Error obteniendo entradas recientes:', error);
        throw error;
    }
}


// Función optimizada para ventas por provincia
export async function getSalesByProvince() {
    try {
        console.log('🌎 Getting sales by province...');
        const cacheKey = getCacheKey('sales_by_province');
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        // Usar agregación SQL si está disponible
        const { data, error } = await supabase.rpc('get_sales_by_province');

        if (error) {
            console.warn('⚠️ RPC not available, using optimized fallback');
            
            // Solo traer campos necesarios
            const { data: invoices, error: invoiceError } = await supabase
                .from('invoices')
                .select('province, total_price::numeric')
                .eq('status', 'completed');

            if (invoiceError) throw invoiceError;

            // Coordenadas de provincias (movido a constante para optimización)

            const salesByProvince = (invoices || []).reduce((acc: any, invoice: any) => {
                const province = invoice.province;
                if (!province) return acc;
                
                if (!acc[province]) {
                    const coordinates = provincesCoordinates[province] || { lat: 0, lng: 0, ciudad: province };
                    acc[province] = {
                        provincia: province,
                        ventas: 0,
                        lat: coordinates.lat,
                        lng: coordinates.lng,
                        ciudad: coordinates.ciudad
                    };
                }
                acc[province].ventas += invoice.total_price || 0;
                return acc;
            }, {} as Record<string, any>);

            const result = Object.values(salesByProvince)
                .filter((item: any) => item.ventas > 0)
                .sort((a: any, b: any) => b.ventas - a.ventas);

            setCache(cacheKey, result, 10); // Cache más largo para datos geográficos
            return result;
        }

        // Procesar datos del RPC para asegurar la estructura correcta
        const processedData = (data || []).map((item: any) => ({
            provincia: item.provincia,
            ventas: parseFloat(item.ventas) || 0,
            lat: parseFloat(item.lat) || 0,
            lng: parseFloat(item.lng) || 0,
            ciudad: item.ciudad || item.provincia
        }));

        setCache(cacheKey, processedData, 10);
        console.log('✅ Sales by province calculated:', processedData);
        return processedData;
    } catch (error) {
        console.error('❌ Error obteniendo ventas por provincia:', error);
        throw error;
    }
}

// Función optimizada para datos del dashboard con carga paralela
export async function getAllDashboardData() {
    try {
        console.log('🚀 Starting getAllDashboardData...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context in getAllDashboardData:', { tenantId, isAdmin });

        // Usar Promise.allSettled para evitar que una falla cancele todo
        const results = await Promise.allSettled([
            getDashboardMetrics(),
            getSalesByDay(),
            getSalesByPaymentMethod(),
            getRecentEntries(),
            getSalesByProvince()
        ]);

        const [
            metricsResult,
            salesByDayResult,
            salesByPaymentMethodResult,
            recentEntriesResult,
            salesByProvinceResult
        ] = results;

        const result = {
            metrics: metricsResult.status === 'fulfilled' ? metricsResult.value : null,
            salesByDay: salesByDayResult.status === 'fulfilled' ? salesByDayResult.value : [],
            salesByPaymentMethod: salesByPaymentMethodResult.status === 'fulfilled' ? salesByPaymentMethodResult.value : [],
            recentEntries: recentEntriesResult.status === 'fulfilled' ? recentEntriesResult.value : [],
            salesByProvince: salesByProvinceResult.status === 'fulfilled' ? salesByProvinceResult.value : []
        };

        // Log errores sin fallar toda la operación
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const functionNames = ['metrics', 'salesByDay', 'salesByPaymentMethod', 'recentEntries', 'salesByProvince'];
                console.error(`❌ Error in ${functionNames[index]}:`, result.reason);
            }
        });

        console.log('✅ All dashboard data collected successfully');
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo todos los datos del dashboard:', error);
        throw error;
    }
}

// Función optimizada para estadísticas de referidos
export async function getReferralStats() {
    try {
        console.log('👥 Getting referral stats...');
        const cacheKey = getCacheKey('referral_stats');
        const cached = getFromCache<any>(cacheKey);
        if (cached) return cached;

        // Usar JOIN en lugar de múltiples consultas
        const { data, error } = await supabase
            .from('referrals')
            .select(`
                id,
                name,
                commission_rate,
                is_active,
                invoices!referral_id (
                    total_price,
                    status
                )
            `)
            .eq('invoices.status', 'completed');

        if (error) {
            console.warn('⚠️ JOIN query failed, falling back to separate queries');

            // Fallback con consultas separadas pero optimizadas
            const { data: referrals, error: refError } = await supabase
                .from('referrals')
                .select('id, name, commission_rate, is_active');

            if (refError) throw refError;

            const referralStats = await Promise.all(
                (referrals || []).map(async (referral: any) => {
                    const { data: invoices, error: invError } = await supabase
                        .from('invoices')
                        .select('total_price::numeric')
                        .eq('referral_id', referral.id)
                        .eq('status', 'completed');

                    if (invError) {
                        console.error(`Error fetching invoices for referral ${referral.id}:`, invError);
                        return {
                            id: referral.id,
                            name: referral.name,
                            totalSales: 0,
                            totalCommission: 0,
                            commissionRate: referral.commission_rate,
                            isActive: referral.is_active,
                            salesCount: 0
                        };
                    }

                    const totalSales = (invoices || []).reduce((sum: any, inv: any) => sum + (inv.total_price || 0), 0);
                    const totalCommission = totalSales * (parseFloat(referral.commission_rate) / 100);

                    return {
                        id: referral.id,
                        name: referral.name,
                        totalSales,
                        totalCommission,
                        commissionRate: referral.commission_rate,
                        isActive: referral.is_active,
                        salesCount: invoices?.length || 0
                    };
                })
            );

            const result = referralStats.sort((a, b) => b.totalSales - a.totalSales);
            setCache(cacheKey, result, 15); // Cache más largo para referidos
            return result;
        }

        // Procesar datos del JOIN
        const referralStats = (data || []).map((referral: any) => {
            const invoices = referral.invoices || [];
            const totalSales = invoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_price) || 0), 0);
            const totalCommission = totalSales * (parseFloat(referral.commission_rate) / 100);

            return {
                id: referral.id,
                name: referral.name,
                totalSales,
                totalCommission,
                commissionRate: referral.commission_rate,
                isActive: referral.is_active,
                salesCount: invoices.length
            };
        });

        const result = referralStats.sort((a: any, b: any) => b.totalSales - a.totalSales);
        setCache(cacheKey, result, 15);
        console.log('✅ Referral stats calculated:', result.length);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas de referidos:', error);
        throw error;
    }
}

// Función para limpiar cache manualmente
export function clearCache(pattern?: string) {
    if (pattern) {
        const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(pattern));
        keysToDelete.forEach(key => cache.delete(key));
        console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
    } else {
        cache.clear();
        console.log('🧹 Cache cleared completely');
    }
}

// Función helper para coordenadas (extraída para reutilización)
const provincesCoordinates: Record<string, { lat: number; lng: number; ciudad: string }> = {
    'Guayas': { lat: -2.2, lng: -79.9, ciudad: 'Guayaquil' },
    'Pichincha': { lat: -0.2, lng: -78.5, ciudad: 'Quito' },
    'Manabí': { lat: -1.0, lng: -80.7, ciudad: 'Portoviejo' },
    'Azuay': { lat: -2.9, lng: -79.0, ciudad: 'Cuenca' },
    'Los Ríos': { lat: -1.8, lng: -79.5, ciudad: 'Babahoyo' },
    'El Oro': { lat: -3.6, lng: -79.9, ciudad: 'Machala' },
    'Esmeraldas': { lat: 0.9, lng: -79.7, ciudad: 'Esmeraldas' },
    'Santo Domingo': { lat: -0.2, lng: -79.2, ciudad: 'Santo Domingo' },
    'Loja': { lat: -4.0, lng: -79.2, ciudad: 'Loja' },
    'Imbabura': { lat: 0.4, lng: -78.1, ciudad: 'Ibarra' },
    'Tungurahua': { lat: -1.2, lng: -78.6, ciudad: 'Ambato' },
    'Chimborazo': { lat: -1.7, lng: -78.6, ciudad: 'Riobamba' },
    'Cotopaxi': { lat: -0.9, lng: -78.6, ciudad: 'Latacunga' },
    'Carchi': { lat: 0.8, lng: -77.8, ciudad: 'Tulcán' },
    'Bolívar': { lat: -1.6, lng: -79.0, ciudad: 'Guaranda' },
    'Cañar': { lat: -2.6, lng: -78.9, ciudad: 'Azogues' },
    'Sucumbíos': { lat: 0.1, lng: -76.9, ciudad: 'Nueva Loja' },
    'Orellana': { lat: -0.5, lng: -76.9, ciudad: 'Francisco de Orellana' },
    'Napo': { lat: -1.0, lng: -77.8, ciudad: 'Tena' },
    'Pastaza': { lat: -1.5, lng: -78.0, ciudad: 'Puyo' },
    'Morona Santiago': { lat: -2.3, lng: -78.1, ciudad: 'Macas' },
    'Zamora Chinchipe': { lat: -4.1, lng: -78.9, ciudad: 'Zamora' },
    'Galápagos': { lat: -0.4, lng: -90.3, ciudad: 'Puerto Ayora' },
    'Santa Elena': { lat: -2.2, lng: -80.9, ciudad: 'Santa Elena' }
}