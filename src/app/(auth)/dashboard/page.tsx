'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics, getAllDashboardData } from '../services/metricsService';
import { DollarSign, Hash, Trophy, PieChart, TrendingUp, Users, Calendar, MapPin } from 'lucide-react';
import PaymentMethodGaugeMini from '../components/PaymentMethodGauge';
import SalesLineChart from '../components/SalesLineChart';
import RecentEntriesColumnChart from '../components/RecentEntriesColumnChart';
import EcuadorMapChart from '../components/SalesByProvinceMap';
import SalesByPaymentMethodBarChart from '../components/SalesByPaymentMethodBarChart';

export default function DashboardPage() {
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

    useEffect(() => {
        getDashboardMetrics().then(setMetrics).catch(console.error);
        getAllDashboardData()
            .then((data) => {
                console.log('Dashboard data:', data);
                setGraphsData({
                    salesByDay: data.salesByDay,
                    recentEntries: data.recentEntries,
                    salesByProvince: data.salesByProvince,
                    salesByPaymentMethod: data.salesByPaymentMethod
                });
            }
            )
            .catch(console.error);

    }, []);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Analytics</h1>
                <p className="text-gray-600">Visualización de métricas y estadísticas del sistema</p>
            </div>

            {/* Metrics Cards */}
            {metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${metrics.totalSales.toFixed(2)}
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
                    { id: 'payment', label: 'Métodos de Pago', icon: PieChart }, // ✅ este es el nuevo
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                        Ventas Diarias (Últimos 30 días)
                    </h3>
                    {graphsData ? (
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-500" />
                        Distribución de Ventas por Región
                    </h3>
                    {graphsData ? (
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
                <div
                    className={`bg-white rounded-lg shadow p-6 h-96 transition-all ${selectedChart === 'payment' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        }`}
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                        Ventas por Método de Pago
                    </h3>
                    {graphsData ? (
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                        Entradas Recientes (Últimas 24h)
                    </h3>
                    {graphsData ? (
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

            {/* Summary Stats */}
            {metrics && graphsData && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
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