// src/app/services/metricsService.ts
import { supabase } from '../../lib/supabase';

// Utilidad para paginar y obtener todos los registros
async function fetchAllRecords(table: string, select: string, filters?: string) {
    const limit = 1000;
    let from = 0;
    let allData: any[] = [];

    while (true) {
        let query = supabase
            .from(table)
            .select(select)
            .range(from, from + limit - 1);

        if (filters) {
            // Aplicar filtros si se proporcionan
            query = query.filter(filters.split('=')[0], 'eq', filters.split('=')[1]);
        }

        const { data, error } = await query;

        if (error) throw new Error(`Error al cargar datos de ${table}: ${error.message}`);

        allData = allData.concat(data);

        if (data.length < limit) break;

        from += limit;
    }

    return allData;
}

// Función principal para métricas del dashboard
export async function getDashboardMetrics() {
    try {
        const invoices = await fetchAllRecords('invoices', 'total_price, status, payment_method');
        const entries = await fetchAllRecords('raffle_entries', 'is_winner');

        const completedInvoices = invoices.filter((i) => i.status === 'completed');

        const totalSales = completedInvoices.reduce(
            (sum, inv) => sum + parseFloat(inv.total_price),
            0
        );

        const totalNumbersSold = entries.length;
        const totalWinners = entries.filter((e) => e.is_winner).length;

        const conversionRate = invoices.length > 0
            ? +(totalSales / invoices.length).toFixed(2)
            : 0;

        const transferSales = completedInvoices
            .filter((i) => i.payment_method === 'TRANSFER')
            .reduce((sum, inv) => sum + parseFloat(inv.total_price), 0);

        const stripeSales = completedInvoices
            .filter((i) => i.payment_method === 'STRIPE')
            .reduce((sum, inv) => sum + parseFloat(inv.total_price), 0);

        const totalMethodSales = transferSales + stripeSales;
        const transferPercentage = totalMethodSales > 0
            ? +(transferSales / totalMethodSales * 100).toFixed(1)
            : 0;
        const stripePercentage = totalMethodSales > 0
            ? +(stripeSales / totalMethodSales * 100).toFixed(1)
            : 0;

        return {
            totalSales,
            totalNumbersSold,
            totalWinners,
            conversionRate,
            transferSales,
            stripeSales,
            transferPercentage,
            stripePercentage,
        };
    } catch (error) {
        console.error('Error obteniendo métricas del dashboard:', error);
        throw error;
    }
}

// Función para obtener ventas por día (últimos 30 días)
export async function getSalesByDay(days: number = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('invoices')
            .select('created_at, total_price, status')
            .gte('created_at', startDate.toISOString())
            .eq('status', 'completed')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Agrupar por día
        const salesByDay = data.reduce((acc: { [date: string]: { date: string; ventas: number; facturas: number } }, invoice) => {
            const date = new Date(invoice.created_at).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, ventas: 0, facturas: 0 };
            }
            acc[date].ventas += parseFloat(invoice.total_price);
            acc[date].facturas += 1;
            return acc;
        }, {} as { [date: string]: { date: string; ventas: number; facturas: number } });

        return Object.values(salesByDay);
    } catch (error) {
        console.error('Error obteniendo ventas por día:', error);
        throw error;
    }
}

// Función para obtener ventas por método de pago
export async function getSalesByPaymentMethod() {
    const { data, error } = await supabase
        .from('invoices')
        .select('payment_method, total_price');

    if (error) throw error;

    const grouped: { [key: string]: number } = {};

    for (const row of data) {
        const method = row.payment_method || 'desconocido';
        const total = parseFloat(row.total_price) || 0;
        grouped[method] = (grouped[method] || 0) + total;
    }

    console.log('Ventas por método de pago:', grouped);
    return Object.entries(grouped).map(([payment_method, total]) => ({
        payment_method,
        total: parseFloat(total.toFixed(2)),
    }));
}

// Función para obtener entradas recientes a rifas (últimas 24 horas)
export async function getRecentEntries() {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data, error } = await supabase
            .from('raffle_entries')
            .select('purchased_at')
            .gte('purchased_at', yesterday.toISOString())
            .order('purchased_at', { ascending: true });

        if (error) throw error;

        // Agrupar por hora
        const entriesByHour = data.reduce((acc: { [key: string]: { hora: string; entradas: number } }, entry) => {
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

        return Object.values(entriesByHour);
    } catch (error) {
        console.error('Error obteniendo entradas recientes:', error);
        throw error;
    }
}

// Función para obtener ventas por provincia
export async function getSalesByProvince() {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('province, total_price, city')
            .eq('status', 'completed');

        if (error) throw error;

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
        const salesByProvince = data.reduce((acc: { [province: string]: { provincia: string; ventas: number; lat: number; lng: number; ciudad: string } }, invoice) => {
            const province = invoice.province as keyof typeof provincesCoordinates;
            if (!acc[province]) {
                acc[province] = {
                    provincia: province,
                    ventas: 0,
                    ...(provincesCoordinates[province] || { lat: 0, lng: 0, ciudad: province })
                };
            }
            acc[province].ventas += parseFloat(invoice.total_price);
            return acc;
        }, {});

        console.log('Ventas por provincia:', salesByProvince);
        return Object.values(salesByProvince)
            .filter(item => item.ventas > 0)
            .sort((a, b) => b.ventas - a.ventas);
    } catch (error) {
        console.error('Error obteniendo ventas por provincia:', error);
        throw error;
    }
}
// Función para obtener todos los datos del dashboard
export async function getAllDashboardData() {
    try {
        const [
            metrics,
            salesByDay,
            salesByPaymentMethod, // ✅ debe venir aquí
            recentEntries,
            salesByProvince
        ] = await Promise.all([
            getDashboardMetrics(),
            getSalesByDay(),
            getSalesByPaymentMethod(), // ✅ aquí mismo
            getRecentEntries(),
            getSalesByProvince()
        ]);

        return {
            metrics,
            salesByDay,
            salesByPaymentMethod, // ✅ asignado bien
            recentEntries,
            salesByProvince
        };
    } catch (error) {
        console.error('Error obteniendo todos los datos del dashboard:', error);
        throw error;
    }
}

// Función para obtener estadísticas de referidos
export async function getReferralStats() {
    try {
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select('id, name, commission_rate, is_active');

        if (referralsError) throw referralsError;

        // Obtener ventas por referido
        const referralStats = await Promise.all(
            referrals.map(async (referral) => {
                const { data: invoices, error } = await supabase
                    .from('invoices')
                    .select('total_price')
                    .eq('referral_id', referral.id)
                    .eq('status', 'completed');

                if (error) throw error;

                const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_price), 0);
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

        return referralStats.sort((a, b) => b.totalSales - a.totalSales);
    } catch (error) {
        console.error('Error obteniendo estadísticas de referidos:', error);
        throw error;
    }
}