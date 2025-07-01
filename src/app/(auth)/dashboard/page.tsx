'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics, getAllDashboardData } from '../services/metricsService';
import DashboardMetricCard from '../components/DashboardMetricCard';
import { DollarSign, Hash, Trophy, PieChart } from 'lucide-react';
import PaymentMethodGaugeMini from '../components/PaymentMethodGauge';
import SalesBarChart from '../components/SalesBarChart';
import WinnersPieChart from '../components/WinnersPieChart';
import RecentEntriesColumnChart from '../components/RecentEntriesColumnChart';
import EcuadorMapChart from '../components/SalesByProvinceMap';

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
        winnersBySorteo: any[]
        recentEntries: any[]
        salesByProvince: any[]
    } | null>(null);

    useEffect(() => {
        getDashboardMetrics().then(setMetrics).catch(console.error);
        getAllDashboardData()
            .then((data) =>
                setGraphsData({
                    salesByDay: data.salesByDay,
                    winnersBySorteo: data.winnersBySorteo,
                    recentEntries: data.recentEntries,
                    salesByProvince: data.salesByProvince,
                })
            )
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            {metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardMetricCard
                        icon={<DollarSign />}
                        title="Total Ventas"
                        value={`$${metrics.totalSales.toFixed(2)}`}
                    />
                    <DashboardMetricCard
                        icon={<Hash />}
                        title="Números Vendidos"
                        value={metrics.totalNumbersSold}
                    />
                    <DashboardMetricCard
                        icon={<Trophy />}
                        title="Ganadores"
                        value={metrics.totalWinners}
                    />
                    <DashboardMetricCard
                        icon={<PieChart />}
                        title="Método de Pago"
                        value={
                            <PaymentMethodGaugeMini
                                transferPercentage={metrics.transferPercentage}
                                stripePercentage={metrics.stripePercentage}
                            />
                        }
                    />
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

            {/* Dashboard Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Ventas por día */}
                <div className="bg-white rounded-lg shadow p-6 h-80">
                    {graphsData ? (
                        <SalesBarChart data={graphsData.salesByDay} />
                    ) : (
                        <div className="text-gray-400 text-center h-full flex items-center justify-center">
                            Cargando gráfico de ventas...
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6 h-96">
                    <EcuadorMapChart salesByProvince={graphsData?.salesByProvince || []} />
                </div>

                {/* Ganadores por sorteo */}
                <div className="bg-white rounded-lg shadow p-6 h-80">
                    {graphsData ? (
                        <WinnersPieChart data={graphsData.winnersBySorteo} />
                    ) : (
                        <div className="text-gray-400 text-center h-full flex items-center justify-center">
                            Cargando gráfico de ganadores...
                        </div>
                    )}
                </div>

                {/* Entradas recientes a rifas */}
                <div className="bg-white rounded-lg shadow p-6 h-80">
                    {graphsData ? (
                        <RecentEntriesColumnChart data={graphsData.recentEntries} />
                    ) : (
                        <div className="text-gray-400 text-center h-full flex items-center justify-center">
                            Cargando gráfico de entradas...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
