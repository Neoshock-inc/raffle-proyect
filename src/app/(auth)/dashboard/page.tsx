'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDashboardMetrics, getAllDashboardData } from '@/admin/services/metricsService';
import { useTenantContext } from '@/admin/contexts/TenantContext';
import { DollarSign, Hash, Trophy, PieChart, TrendingUp, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/admin/components/ui';
import DashboardMetricCard from '@/admin/components/DashboardMetricCard';
import PaymentMethodGaugeMini from '@/admin/components/PaymentMethodGauge';
import SalesLineChart from '@/admin/components/SalesLineChart';
import RecentEntriesColumnChart from '@/admin/components/RecentEntriesColumnChart';
import dynamic from 'next/dynamic';

const EcuadorMapChart = dynamic(
    () => import('@/admin/components/SalesByProvinceMap'),
    { ssr: false, loading: () => (
        <div className="text-gray-400 text-center h-[400px] flex items-center justify-center">
            <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="text-sm">Cargando mapa...</p>
            </div>
        </div>
    )}
);
import SalesByPaymentMethodBarChart from '@/admin/components/SalesByPaymentMethodBarChart';

const SUMMARY_COLORS = {
    indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        text: 'text-indigo-600 dark:text-indigo-400',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    violet: {
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        text: 'text-violet-600 dark:text-violet-400',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-600 dark:text-amber-400',
    },
} as const;

export default function DashboardPage() {
    const { isAdmin, currentTenant, loading: tenantLoading } = useTenantContext();

    const [metrics, setMetrics] = useState<{
        totalSales: number
        totalNumbersSold: number
        totalWinners: number
        conversionRate: number
        transferSales: number
        stripeSales: number
        transferPercentage: number
        stripePercentage: number
    } | null>(null);

    const [graphsData, setGraphsData] = useState<{
        salesByDay: any[]
        salesByPaymentMethod: any[]
        recentEntries: any[]
        salesByProvince: any[]
    } | null>(null);

    const [selectedChart, setSelectedChart] = useState('sales');
    const [dataLoading, setDataLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const loadDashboardData = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return;

        setDataLoading(true);
        try {
            const context = isAdmin
                ? (currentTenant ? `tenant: ${currentTenant.name}` : 'Global View')
                : `tenant: ${currentTenant?.name || 'Unknown'}`;

            console.log(`📊 [${forceRefresh ? 'FORCE ' : ''}RELOAD] Dashboard data for ${context}`);
            console.log('🎯 Current tenant context:', {
                tenantId: currentTenant?.id,
                tenantName: currentTenant?.name,
                isAdmin,
                timestamp: new Date().toISOString()
            });

            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const [metricsData, dashboardData] = await Promise.all([
                getDashboardMetrics(),
                getAllDashboardData()
            ]);

            console.log('📈 Loaded metrics:', metricsData);
            console.log('📊 Loaded dashboard data:', {
                salesByDay: dashboardData.salesByDay?.length,
                recentEntries: dashboardData.recentEntries?.length,
                salesByProvince: dashboardData.salesByProvince?.length,
                salesByPaymentMethod: dashboardData.salesByPaymentMethod?.length
            });

            setMetrics(metricsData);
            setGraphsData({
                salesByDay: dashboardData.salesByDay,
                recentEntries: dashboardData.recentEntries,
                salesByProvince: dashboardData.salesByProvince,
                salesByPaymentMethod: dashboardData.salesByPaymentMethod
            });
            setLastRefresh(new Date());

        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
        } finally {
            setDataLoading(false);
        }
    }, [currentTenant, isAdmin, tenantLoading]);

    useEffect(() => {
        console.log('🔄 Dashboard effect triggered:', {
            tenantLoading,
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin
        });

        if (!tenantLoading) {
            loadDashboardData(true);
        }
    }, [currentTenant?.id, tenantLoading, loadDashboardData]);

    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        loadDashboardData(true);
    };

    if (tenantLoading) {
        return (
            <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="space-y-2 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="text-gray-600 dark:text-gray-400">Cargando configuración de tenant...</p>
                    </div>
                </div>
            </div>
        );
    }

    const tenantLabel = currentTenant ? currentTenant.name : 'Global';

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {tenantLabel} &middot; Actualizado {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="secondary"
                        onClick={handleManualRefresh}
                        disabled={dataLoading}
                        className="rounded-xl"
                        icon={<RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />}
                    >
                        Actualizar
                    </Button>
                    {dataLoading && (
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Cargando...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Metric Cards */}
            {metrics && !dataLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <DashboardMetricCard
                        icon={<DollarSign className="w-5 h-5" />}
                        title="Total Ventas"
                        value={`$${metrics.totalSales.toFixed(2)}`}
                        subtitle={currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                        iconBgColor="bg-emerald-50 dark:bg-emerald-900/30"
                        iconColor="text-emerald-500"
                    />
                    <DashboardMetricCard
                        icon={<Hash className="w-5 h-5" />}
                        title="Números Vendidos"
                        value={metrics.totalNumbersSold.toLocaleString()}
                        subtitle={currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                        iconBgColor="bg-indigo-50 dark:bg-indigo-900/30"
                        iconColor="text-indigo-500"
                    />
                    <DashboardMetricCard
                        icon={<Trophy className="w-5 h-5" />}
                        title="Total Ganadores"
                        value={metrics.totalWinners}
                        subtitle={currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                        iconBgColor="bg-amber-50 dark:bg-amber-900/30"
                        iconColor="text-amber-500"
                    />
                    <DashboardMetricCard
                        icon={<PieChart className="w-5 h-5" />}
                        title="Tasa de Conversión"
                        value={`${metrics.conversionRate.toFixed(1)}%`}
                        subtitle={currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                        iconBgColor="bg-violet-50 dark:bg-violet-900/30"
                        iconColor="text-violet-500"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 animate-pulse">
                            <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart Navigation */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'sales', label: 'Ventas Diarias', icon: TrendingUp },
                    { id: 'payment', label: 'Métodos de Pago', icon: PieChart },
                    { id: 'entries', label: 'Entradas Recientes', icon: Calendar },
                    { id: 'map', label: 'Mapa de Ventas', icon: MapPin }
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedChart(id)}
                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedChart === id
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                            }`}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Dashboard Visualizations — 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Ventas por día — spans 2 cols */}
                <div className={`lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 h-72 transition-all ${selectedChart === 'sales' ? 'ring-2 ring-indigo-500/50 shadow-md' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ventas Diarias</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Últimos 30 días</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                            {tenantLabel}
                        </span>
                    </div>
                    {graphsData && !dataLoading ? (
                        <div className="h-48">
                            <SalesLineChart data={graphsData.salesByDay} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-48 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="text-sm">Cargando gráfico de ventas...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Donut — 1 col */}
                <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 h-72 transition-all ${selectedChart === 'payment' ? 'ring-2 ring-indigo-500/50 shadow-md' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Método de Pago</h3>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                            {tenantLabel}
                        </span>
                    </div>
                    {metrics && !dataLoading ? (
                        <PaymentMethodGaugeMini
                            transferPercentage={metrics.transferPercentage}
                            stripePercentage={metrics.stripePercentage}
                        />
                    ) : (
                        <div className="text-gray-400 text-center h-48 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="text-sm">Cargando...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mapa de Ecuador — spans 2 cols */}
                <div className={`lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 h-[450px] transition-all ${selectedChart === 'map' ? 'ring-2 ring-indigo-500/50 shadow-md' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Distribución de Ventas</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Por región</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                            {tenantLabel}
                        </span>
                    </div>
                    {graphsData && !dataLoading ? (
                        <div className="h-[400px]">
                            <EcuadorMapChart salesList={graphsData.salesByProvince} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-[400px] flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="text-sm">Cargando mapa...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Entradas recientes — 1 col */}
                <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 h-[450px] transition-all ${selectedChart === 'entries' ? 'ring-2 ring-indigo-500/50 shadow-md' : ''
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Entradas</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Últimas 24h</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                            {tenantLabel}
                        </span>
                    </div>
                    {graphsData && !dataLoading ? (
                        <div className="h-[400px]">
                            <RecentEntriesColumnChart data={graphsData.recentEntries} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-60 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="text-sm">Cargando...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ventas por Método de Pago — full width */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 h-72 transition-all ${selectedChart === 'payment' ? 'ring-2 ring-indigo-500/50 shadow-md' : ''
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ventas por Método de Pago</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Distribución de ingresos</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                        {tenantLabel}
                    </span>
                </div>
                {graphsData && !dataLoading ? (
                    <div className="h-48">
                        <SalesByPaymentMethodBarChart data={graphsData.salesByPaymentMethod} />
                    </div>
                ) : (
                    <div className="text-gray-400 text-center h-48 flex items-center justify-center">
                        <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                            <p className="text-sm">Cargando gráfico de métodos de pago...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {metrics && graphsData && !dataLoading && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Resumen de Actividad</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Actualizado: {lastRefresh.toLocaleString()}</span>
                            {currentTenant && (
                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                                    {currentTenant.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className={`p-4 ${SUMMARY_COLORS.indigo.bg} rounded-xl`}>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Conversión</p>
                            <p className={`text-xl font-bold ${SUMMARY_COLORS.indigo.text}`}>{metrics.conversionRate.toFixed(1)}%</p>
                        </div>
                        <div className={`p-4 ${SUMMARY_COLORS.emerald.bg} rounded-xl`}>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transferencias</p>
                            <p className={`text-xl font-bold ${SUMMARY_COLORS.emerald.text}`}>${metrics.transferSales.toFixed(2)}</p>
                        </div>
                        <div className={`p-4 ${SUMMARY_COLORS.violet.bg} rounded-xl`}>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Stripe</p>
                            <p className={`text-xl font-bold ${SUMMARY_COLORS.violet.text}`}>${metrics.stripeSales.toFixed(2)}</p>
                        </div>
                        <div className={`p-4 ${SUMMARY_COLORS.amber.bg} rounded-xl`}>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Entradas Totales</p>
                            <p className={`text-xl font-bold ${SUMMARY_COLORS.amber.text}`}>
                                {graphsData.recentEntries.reduce((sum: number, item: any) => sum + (item.entradas || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
