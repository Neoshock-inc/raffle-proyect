// src/app/services/metricsService.ts

import { supabase } from "../lib/supabaseTenantClient";

// Utilidad para paginar y obtener todos los registros
async function fetchAllRecords(table: string, select: string, additionalFilters?: any) {
    const limit = 1000;
    let from = 0;
    let allData: any[] = [];

    while (true) {
        let query = supabase
            .from(table)
            .select(select)
            .range(from, from + limit - 1);

        // Aplicar filtros adicionales si se proporcionan
        if (additionalFilters) {
            Object.entries(additionalFilters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }

        const { data, error } = await query;

        if (error) {
            console.error(`❌ Error fetching from ${table}:`, error);
            throw new Error(`Error al cargar datos de ${table}: ${error.message}`);
        }

        if (!data) {
            console.warn(`⚠️ No data returned from ${table}`);
            break;
        }

        allData = allData.concat(data);

        if (data.length < limit) break;

        from += limit;
    }

    console.log(`✅ Fetched ${allData.length} records from ${table}`);
    return allData;
}

// Función principal para métricas del dashboard
export async function getDashboardMetrics() {
    try {
        console.log('📊 Getting dashboard metrics...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context:', { tenantId, isAdmin });

        // Para invoices y raffle_entries, el filtro de tenant se aplica automáticamente
        const [invoices, entries] = await Promise.all([
            fetchAllRecords('invoices', 'total_price, status, payment_method'),
            fetchAllRecords('raffle_entries', 'is_winner')
        ]);

        console.log('📄 Data fetched:', {
            invoicesCount: invoices.length,
            entriesCount: entries.length
        });

        const completedInvoices = invoices.filter((i) => i.status === 'completed');

        const totalSales = completedInvoices.reduce(
            (sum, inv) => sum + parseFloat(inv.total_price || '0'),
            0
        );

        const totalNumbersSold = entries.length;
        const totalWinners = entries.filter((e) => e.is_winner).length;

        const conversionRate = invoices.length > 0
            ? +(totalSales / invoices.length).toFixed(2)
            : 0;

        const transferSales = completedInvoices
            .filter((i) => i.payment_method === 'bank_transfer')
            .reduce((sum, inv) => sum + parseFloat(inv.total_price || '0'), 0);

        const stripeSales = completedInvoices
            .filter((i) => i.payment_method === 'stripe')
            .reduce((sum, inv) => sum + parseFloat(inv.total_price || '0'), 0);

        const totalMethodSales = transferSales + stripeSales;
        const transferPercentage = totalMethodSales > 0
            ? +(transferSales / totalMethodSales * 100).toFixed(1)
            : 0;
        const stripePercentage = totalMethodSales > 0
            ? +(stripeSales / totalMethodSales * 100).toFixed(1)
            : 0;

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

        console.log('✅ Dashboard metrics calculated:', result);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo métricas del dashboard:', error);
        throw error;
    }
}

// Función para obtener ventas por día (últimos 30 días)
export async function getSalesByDay(days: number = 30) {
    try {
        console.log('📈 Getting sales by day...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('invoices')
            .select('created_at, total_price, status')
            .gte('created_at', startDate.toISOString())
            .eq('status', 'completed')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Error in getSalesByDay:', error);
            throw error;
        }

        if (!data) {
            console.warn('⚠️ No data returned from getSalesByDay');
            return [];
        }

        // Agrupar por día
        const salesByDay = data.reduce((acc: { [date: string]: { date: string; ventas: number; facturas: number } }, invoice: { created_at: string | number | Date; total_price: string; }) => {
            const date = new Date(invoice.created_at).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, ventas: 0, facturas: 0 };
            }
            acc[date].ventas += parseFloat(invoice.total_price || '0');
            acc[date].facturas += 1;
            return acc;
        }, {} as { [date: string]: { date: string; ventas: number; facturas: number } });

        const result = Object.values(salesByDay);
        console.log('✅ Sales by day calculated:', result.length);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo ventas por día:', error);
        throw error;
    }
}

export async function getSalesByPaymentMethod() {
    try {
        console.log('💳 Getting sales by payment method...');

        // En lugar de usar RPC, hacer la consulta directamente
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('payment_method, total_price')
            .eq('status', 'completed');

        if (error) {
            console.error('❌ Error in getSalesByPaymentMethod:', error);
            throw error;
        }

        if (!invoices) {
            console.warn('⚠️ No invoices data returned');
            return [];
        }

        // Agrupar por método de pago
        const groupedSales = invoices.reduce((acc: { [method: string]: number }, invoice: { payment_method: string; total_price: any; }) => {
            const method = invoice.payment_method || 'unknown';
            acc[method] = (acc[method] || 0) + parseFloat(invoice.total_price || '0');
            return acc;
        }, {});

        const result = Object.entries(groupedSales).map(([payment_method, total]) => ({
            payment_method,
            total: (total as number).toFixed(2)
        }));

        console.log('✅ Sales by payment method calculated:', result);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo ventas por método de pago:', error);
        throw error;
    }
}

// Función para obtener entradas recientes a rifas (última semana)
export async function getRecentEntries() {
    try {
        console.log('🎫 Getting recent entries...');
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const { data, error } = await supabase
            .from('raffle_entries')
            .select('purchased_at')
            .gte('purchased_at', lastWeek.toISOString())
            .order('purchased_at', { ascending: true });

        if (error) {
            console.error('❌ Error in getRecentEntries:', error);
            throw error;
        }

        if (!data) {
            console.warn('⚠️ No entries data returned');
            return [];
        }

        // Agrupar por hora
        const entriesByHour = data.reduce((acc: { [key: string]: { hora: string; entradas: number } }, entry: { purchased_at: string | number | Date; }) => {
            const hour = new Date(entry.purchased_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            if (!acc[hour]) {
                acc[hour] = { hora: hour, entradas: 0 };
            }
            acc[hour].entradas += 1;
            return acc;
        }, {});

        const result = Object.values(entriesByHour);
        console.log('✅ Recent entries calculated:', result.length);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo entradas recientes:', error);
        throw error;
    }
}

// Función para obtener ventas por provincia
export async function getSalesByProvince() {
    try {
        console.log('🌎 Getting sales by province...');

        const { data, error } = await supabase
            .from('invoices')
            .select('province, total_price, city')
            .eq('status', 'completed');

        if (error) {
            console.error('❌ Error in getSalesByProvince:', error);
            throw error;
        }

        if (!data) {
            console.warn('⚠️ No province data returned');
            return [];
        }

        // Mapeo de coordenadas aproximadas de provincias ecuatorianas
        const provincesCoordinates = {
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
        };

        // Agrupar ventas por provincia
        const salesByProvince = data.reduce((acc: { [province: string]: { provincia: string; ventas: number; lat: number; lng: number; ciudad: string } }, invoice: { province: string; total_price: string; }) => {
            const province = invoice.province as keyof typeof provincesCoordinates;
            if (!acc[province]) {
                acc[province] = {
                    provincia: province,
                    ventas: 0,
                    ...(provincesCoordinates[province] || { lat: 0, lng: 0, ciudad: province })
                };
            }
            acc[province].ventas += parseFloat(invoice.total_price || '0');
            return acc;
        }, {});

        const result = Object.values(salesByProvince)
            .filter((item) => (item as { ventas: number }).ventas > 0)
            .sort((a, b) => (b as { ventas: number }).ventas - (a as { ventas: number }).ventas);

        console.log('✅ Sales by province calculated:', result.length);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo ventas por provincia:', error);
        throw error;
    }
}

// Función para obtener todos los datos del dashboard
export async function getAllDashboardData() {
    try {
        console.log('🚀 Starting getAllDashboardData...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context in getAllDashboardData:', { tenantId, isAdmin });

        const [
            metrics,
            salesByDay,
            salesByPaymentMethod,
            recentEntries,
            salesByProvince
        ] = await Promise.all([
            getDashboardMetrics(),
            getSalesByDay(),
            getSalesByPaymentMethod(),
            getRecentEntries(),
            getSalesByProvince()
        ]);

        const result = {
            metrics,
            salesByDay,
            salesByPaymentMethod,
            recentEntries,
            salesByProvince
        };

        console.log('✅ All dashboard data collected successfully');
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo todos los datos del dashboard:', error);
        throw error;
    }
}

// Función para obtener estadísticas de referidos
export async function getReferralStats() {
    try {
        console.log('👥 Getting referral stats...');

        const referrals = await fetchAllRecords('referrals', 'id, name, commission_rate, is_active');

        // Obtener ventas por referido
        const referralStats = await Promise.all(
            referrals.map(async (referral: { id: any; commission_rate: string; name: any; is_active: any; }) => {
                const invoices = await fetchAllRecords(
                    'invoices',
                    'total_price',
                    { referral_id: referral.id, status: 'completed' }
                );

                const totalSales = invoices.reduce((sum: number, inv: { total_price: string; }) =>
                    sum + parseFloat(inv.total_price || '0'), 0);
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
            })
        );

        const result = referralStats.sort((a, b) => b.totalSales - a.totalSales);
        console.log('✅ Referral stats calculated:', result.length);
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas de referidos:', error);
        throw error;
    }
}