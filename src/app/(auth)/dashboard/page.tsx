'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics } from '../services/metricsService';
import DashboardMetricCard from '../components/DashboardMetricCard';
import { DollarSign, Hash, Trophy, PieChart } from 'lucide-react';
import PaymentMethodGaugeMini from '../components/PaymentMethodGauge';

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
    } | null>(null)

    useEffect(() => {
        getDashboardMetrics().then(setMetrics).catch(console.error)
    }, [])

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
                {/* Visualización de Facturas */}
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center text-gray-500">
                    {/* IDEA: Gráfico de barras con total de facturas por día o por estado */}
                    Gráfico de barras: Facturas por día/estado
                </div>

                {/* Visualización de Números Bendecidos */}
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center text-gray-500">
                    {/* IDEA: Tabla o gráfico de dispersión de números bendecidos con filtro por premio menor */}
                    Tabla o gráfico de dispersión: Números bendecidos
                </div>

                {/* Visualización de Ganadores */}
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center text-gray-500">
                    {/* IDEA: Gráfico de pastel con distribución de ganadores por sorteo */}
                    Gráfico de pastel: Ganadores por sorteo
                </div>

                {/* Visualización de Rifas Entrantes */}
                <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center text-gray-500">
                    {/* IDEA: Timeline o gráfico de columnas: entradas recientes a rifas */}
                    Gráfico de columnas: Entradas recientes a rifas
                </div>
            </div>
        </div>
    )
}
