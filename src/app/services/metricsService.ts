// services/metricsService.ts
import { supabase } from '@/app/lib/supabase';

export interface DashboardMetrics {
    activeRaffles: number;
    monthlyRevenue: number;
    totalParticipants: number;
    successRate: number;
    totalTenants: number;
    topRaffles: ActiveRaffle[];
}

export interface ActiveRaffle {
    id: string;
    title: string;
    participants: number;
    progress: number;
    endDate: string;
    totalPrice: number;
    bannerUrl?: string;
    status: string;
    totalNumbers: number;
    soldNumbers: number;
}

export interface MonthlyRevenueData {
    month: string;
    revenue: number;
    raffles: number;
}

export class MetricsService {

    /**
     * Obtiene todas las métricas del dashboard
     */
    static async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const [
                activeRafflesCount,
                monthlyRevenue,
                totalParticipants,
                totalTenants,
                topRaffles
            ] = await Promise.all([
                this.getActiveRafflesCount(),
                this.getMonthlyRevenue(),
                this.getTotalParticipants(),
                this.getTotalTenants(),
                this.getTopActiveRaffles()
            ]);

            // Calcular tasa de éxito basada en rifas completadas
            const successRate = await this.getSuccessRate();

            return {
                activeRaffles: activeRafflesCount,
                monthlyRevenue,
                totalParticipants,
                successRate,
                totalTenants,
                topRaffles
            };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw error;
        }
    }

    /**
     * Obtiene el número de rifas activas
     */
    static async getActiveRafflesCount(): Promise<number> {
        const { count, error } = await supabase
            .from('raffles')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .in('status', ['active', 'published']);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Obtiene los ingresos del mes actual
     */
    static async getMonthlyRevenue(): Promise<number> {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data, error } = await supabase
            .from('invoices')
            .select('total_price')
            .eq('status', 'completed')
            .gte('created_at', firstDay.toISOString())
            .lte('created_at', lastDay.toISOString());

        if (error) throw error;

        return data?.reduce((sum, invoice) => sum + (invoice.total_price || 0), 0) || 0;
    }

    /**
     * Obtiene el total de participantes únicos
     */
    static async getTotalParticipants(): Promise<number> {
        const { count, error } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    }

    /**
     * Obtiene el total de tenants/clientes
     */
    static async getTotalTenants(): Promise<number> {
        const { count, error } = await supabase
            .from('tenants')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (error) throw error;
        return count || 0;
    }

    /**
     * Calcula la tasa de éxito de las rifas
     */
    static async getSuccessRate(): Promise<number> {
        // 1️⃣ Obtener rifas completadas (que ya pasaron su fecha de sorteo)
        const { data: completedRaffles, error: completedError } = await supabase
            .from('raffles')
            .select('id')
            .lt('draw_date', new Date().toISOString());

        if (completedError) throw completedError;

        // 2️⃣ Obtener los IDs de rifas que tuvieron al menos una venta
        const { data: raffleEntries, error: entriesError } = await supabase
            .from('raffle_entries')
            .select('raffle_id')
            .not('raffle_id', 'is', null);

        if (entriesError) throw entriesError;

        const soldRaffleIds = raffleEntries?.map(e => e.raffle_id) || [];

        // 3️⃣ Filtrar solo las rifas completadas que tuvieron ventas
        const successfulRaffles = (completedRaffles || []).filter(r =>
            soldRaffleIds.includes(r.id)
        );

        // 4️⃣ Calcular tasa de éxito
        const completed = completedRaffles?.length || 0;
        const successful = successfulRaffles?.length || 0;

        return completed > 0 ? (successful / completed) * 100 : 0;
    }


    /**
     * Obtiene las rifas más populares/activas
     */
    static async getTopActiveRaffles(limit: number = 6): Promise<ActiveRaffle[]> {
        // Obtener rifas activas con sus datos
        const { data: raffles, error: rafflesError } = await supabase
            .from('raffles')
            .select(`
        id,
        title,
        price,
        total_numbers,
        draw_date,
        banner_url,
        status
      `)
            .eq('is_active', true)
            .in('status', ['active', 'published'])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (rafflesError) throw rafflesError;

        // Para cada rifa, obtener el número de participantes y entradas vendidas
        const rafflesWithStats = await Promise.all(
            (raffles || []).map(async (raffle) => {
                // Contar participantes únicos
                const { count: participantsCount } = await supabase
                    .from('raffle_entries')
                    .select('participant_id', { count: 'exact', head: true })
                    .eq('raffle_id', raffle.id);

                // Contar números vendidos
                const { count: soldNumbers } = await supabase
                    .from('raffle_entries')
                    .select('*', { count: 'exact', head: true })
                    .eq('raffle_id', raffle.id)
                    .eq('payment_status', 'paid');

                const progress = raffle.total_numbers > 0
                    ? Math.round(((soldNumbers || 0) / raffle.total_numbers) * 100)
                    : 0;

                return {
                    id: raffle.id,
                    title: raffle.title || 'Sin título',
                    participants: participantsCount || 0,
                    progress,
                    endDate: raffle.draw_date || '',
                    totalPrice: raffle.price || 0,
                    bannerUrl: raffle.banner_url,
                    status: raffle.status || 'draft',
                    totalNumbers: raffle.total_numbers || 0,
                    soldNumbers: soldNumbers || 0
                };
            })
        );

        // Ordenar por número de participantes (más populares primero)
        return rafflesWithStats.sort((a, b) => b.participants - a.participants);
    }

    /**
     * Obtiene datos de ingresos por mes para gráficos
     */
    static async getMonthlyRevenueData(months: number = 12): Promise<MonthlyRevenueData[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const { data, error } = await supabase
            .from('invoices')
            .select(`
        total_price,
        created_at
      `)
            .eq('status', 'paid')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Agrupar por mes
        const monthlyData: { [key: string]: { revenue: number; raffles: number } } = {};

        data?.forEach(invoice => {
            const date = new Date(invoice.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { revenue: 0, raffles: 0 };
            }

            monthlyData[monthKey].revenue += invoice.total_price || 0;
            monthlyData[monthKey].raffles += 1;
        });

        // Convertir a array y llenar meses faltantes
        const result: MonthlyRevenueData[] = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            result.push({
                month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                revenue: monthlyData[monthKey]?.revenue || 0,
                raffles: monthlyData[monthKey]?.raffles || 0
            });
        }

        return result;
    }

    /**
     * Suscripción en tiempo real a cambios en las métricas
     */
    static subscribeToMetricsUpdates(callback: (metrics: Partial<DashboardMetrics>) => void) {
        // Suscribirse a cambios en rifas
        const rafflesSubscription = supabase
            .channel('raffles-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'raffles' },
                () => {
                    // Recalcular métricas cuando hay cambios en rifas
                    this.getDashboardMetrics().then(callback);
                }
            )
            .subscribe();

        // Suscribirse a cambios en entradas de rifas
        const entriesSubscription = supabase
            .channel('entries-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'raffle_entries' },
                () => {
                    // Recalcular métricas cuando hay nuevas entradas
                    this.getDashboardMetrics().then(callback);
                }
            )
            .subscribe();

        // Suscribirse a cambios en facturas
        const invoicesSubscription = supabase
            .channel('invoices-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                () => {
                    // Recalcular ingresos cuando hay cambios en facturas
                    this.getMonthlyRevenue().then(revenue => {
                        callback({ monthlyRevenue: revenue });
                    });
                }
            )
            .subscribe();

        // Función para cancelar todas las suscripciones
        return () => {
            supabase.removeChannel(rafflesSubscription);
            supabase.removeChannel(entriesSubscription);
            supabase.removeChannel(invoicesSubscription);
        };
    }

    /**
     * Obtiene estadísticas de un tenant específico
     */
    static async getTenantMetrics(tenantId: string): Promise<Partial<DashboardMetrics>> {
        try {
            const [activeRaffles, monthlyRevenue, participants] = await Promise.all([
                this.getTenantActiveRaffles(tenantId),
                this.getTenantMonthlyRevenue(tenantId),
                this.getTenantParticipants(tenantId)
            ]);

            return {
                activeRaffles,
                monthlyRevenue,
                totalParticipants: participants
            };
        } catch (error) {
            console.error('Error fetching tenant metrics:', error);
            throw error;
        }
    }

    private static async getTenantActiveRaffles(tenantId: string): Promise<number> {
        const { count, error } = await supabase
            .from('raffles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        if (error) throw error;
        return count || 0;
    }

    private static async getTenantMonthlyRevenue(tenantId: string): Promise<number> {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data, error } = await supabase
            .from('invoices')
            .select('total_price')
            .eq('tenant_id', tenantId)
            .eq('status', 'paid')
            .gte('created_at', firstDay.toISOString())
            .lte('created_at', lastDay.toISOString());

        if (error) throw error;
        return data?.reduce((sum, invoice) => sum + (invoice.total_price || 0), 0) || 0;
    }

    private static async getTenantParticipants(tenantId: string): Promise<number> {
        const { count, error } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (error) throw error;
        return count || 0;
    }
}