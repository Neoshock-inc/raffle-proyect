'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDashboardMetrics, getAllDashboardData } from '../services/metricsService';
import { useTenantContext } from '../contexts/TenantContext';
import { DollarSign, Hash, Trophy, PieChart, TrendingUp, Calendar, MapPin, RefreshCw } from 'lucide-react';
import PaymentMethodGaugeMini from '../components/PaymentMethodGauge';
import SalesLineChart from '../components/SalesLineChart';
import RecentEntriesColumnChart from '../components/RecentEntriesColumnChart';
import EcuadorMapChart from '../components/SalesByProvinceMap';
import SalesByPaymentMethodBarChart from '../components/SalesByPaymentMethodBarChart';

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

    // Función para cargar los datos del dashboard
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

            // Agregar un pequeño delay para asegurar que el contexto se haya propagado
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

    // Cargar datos cuando cambie el tenant o se inicialice el contexto
    useEffect(() => {
        console.log('🔄 Dashboard effect triggered:', {
            tenantLoading,
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin
        });

        if (!tenantLoading) {
            loadDashboardData(true); // Forzar refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, loadDashboardData]); // CLAVE: Observar currentTenant?.id

    // Función manual de refresh
    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        loadDashboardData(true);
    };

    if (tenantLoading) {
        return (
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="space-y-2 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600">Cargando configuración de tenant...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header con debug info */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>

                    {/* Botón de refresh manual */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleManualRefresh}
                            disabled={dataLoading}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>

                        {/* Indicador de estado */}
                        {dataLoading && (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <span className="text-sm text-gray-600">Cargando...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            {metrics && !dataLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${metrics.totalSales.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Números Vendidos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics.totalNumbersSold.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                                </p>
                            </div>
                            <Hash className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Ganadores</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics.totalWinners}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                                </p>
                            </div>
                            <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Método de Pago</p>
                                <div className="mt-2">
                                    <PaymentMethodGaugeMini
                                        transferPercentage={metrics.transferPercentage}
                                        stripePercentage={metrics.stripePercentage}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentTenant ? `Solo ${currentTenant.name}` : 'Todos los tenants'}
                                </p>
                            </div>
                            <PieChart className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { id: 'sales', label: 'Ventas Diarias', icon: TrendingUp },
                    { id: 'payment', label: 'Métodos de Pago', icon: PieChart },
                    { id: 'entries', label: 'Entradas Recientes', icon: Calendar },
                    { id: 'map', label: 'Mapa de Ventas', icon: MapPin }
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedChart(id)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${selectedChart === id
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                            }`}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Dashboard Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ventas por día */}
                <div className={`bg-white rounded-lg shadow p-6 h-96 transition-all ${selectedChart === 'sales' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                            Ventas Diarias (Últimos 30 días)
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {currentTenant ? currentTenant.name : 'Global'}
                        </span>
                    </h3>
                    {graphsData && !dataLoading ? (
                        <div className="h-80">
                            <SalesLineChart data={graphsData.salesByDay} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-80 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p>Cargando gráfico de ventas...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mapa de Ecuador */}
                <div className={`bg-white rounded-lg shadow p-6 h-96 transition-all ${selectedChart === 'map' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-red-500" />
                            Distribución de Ventas por Región
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {currentTenant ? currentTenant.name : 'Global'}
                        </span>
                    </h3>
                    {graphsData && !dataLoading ? (
                        <div className="h-80">
                            <EcuadorMapChart salesList={graphsData.salesByProvince} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-80 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                                <p>Cargando mapa de ventas por provincia...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ventas por método de pago */}
                <div className={`bg-white rounded-lg shadow p-6 h-96 transition-all ${selectedChart === 'payment' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                            Ventas por Método de Pago
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {currentTenant ? currentTenant.name : 'Global'}
                        </span>
                    </h3>
                    {graphsData && !dataLoading ? (
                        <div className="h-80">
                            <SalesByPaymentMethodBarChart data={graphsData.salesByPaymentMethod} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-80 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                <p>Cargando gráfico de métodos de pago...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Entradas recientes a rifas */}
                <div className={`bg-white rounded-lg shadow p-6 h-96 transition-all ${selectedChart === 'entries' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                            Entradas Recientes (Últimas 24h)
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {currentTenant ? currentTenant.name : 'Global'}
                        </span>
                    </h3>
                    {graphsData && !dataLoading ? (
                        <div className="h-80">
                            <RecentEntriesColumnChart data={graphsData.recentEntries} />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center h-80 flex items-center justify-center">
                            <div className="space-y-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                                <p>Cargando gráfico de entradas...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats con información de contexto */}
            {metrics && graphsData && !dataLoading && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Resumen de Actividad</h3>
                        <div className="text-xs text-gray-500">
                            Actualizado: {lastRefresh.toLocaleString()}
                            {currentTenant && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {currentTenant.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Conversión</p>
                            <p className="text-xl font-bold text-blue-600">{metrics.conversionRate.toFixed(1)}%</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Transferencias</p>
                            <p className="text-xl font-bold text-green-600">${metrics.transferSales.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Stripe</p>
                            <p className="text-xl font-bold text-purple-600">${metrics.stripeSales.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600">Entradas Totales</p>
                            <p className="text-xl font-bold text-yellow-600">
                                {graphsData.recentEntries.reduce((sum: number, item: any) => sum + (item.entradas || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}