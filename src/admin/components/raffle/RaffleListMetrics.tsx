import { Ticket, PlayCircle, DollarSign, TrendingUp } from 'lucide-react'
import type { Raffle } from '@/admin/types/raffle'
import DashboardMetricCard from '@/admin/components/DashboardMetricCard'

interface RaffleListMetricsProps {
    raffles: Raffle[]
    loading: boolean
}

export default function RaffleListMetrics({ raffles, loading }: RaffleListMetricsProps) {
    const totalRaffles = raffles.length
    const activeRaffles = raffles.filter(r => r.status === 'active').length
    const estimatedSales = raffles.reduce((sum, r) => sum + (r.price * r.total_numbers), 0)
    const avgProgress = totalRaffles > 0
        ? 0 // TODO: calculate from actual sold numbers
        : 0

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 p-6 animate-pulse">
                        <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardMetricCard
                icon={<Ticket className="h-5 w-5" />}
                title="Total Rifas"
                value={totalRaffles}
            />
            <DashboardMetricCard
                icon={<PlayCircle className="h-5 w-5" />}
                title="Activas"
                value={activeRaffles}
                iconBgColor="bg-green-50 dark:bg-green-900/30"
                iconColor="text-green-500"
            />
            <DashboardMetricCard
                icon={<DollarSign className="h-5 w-5" />}
                title="Ventas Estimadas"
                value={`$${estimatedSales.toLocaleString()}`}
                iconBgColor="bg-amber-50 dark:bg-amber-900/30"
                iconColor="text-amber-500"
            />
            <DashboardMetricCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Progreso Promedio"
                value={`${avgProgress.toFixed(0)}%`}
                iconBgColor="bg-purple-50 dark:bg-purple-900/30"
                iconColor="text-purple-500"
            />
        </div>
    )
}
