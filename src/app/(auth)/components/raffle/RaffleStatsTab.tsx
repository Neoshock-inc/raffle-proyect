'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, DollarSign, Ticket, TrendingUp, Calendar, Package, AlertTriangle } from 'lucide-react'
import { Raffle } from '../../types/raffle'

interface Props {
    raffle: Raffle
}

interface RaffleStats {
    totalEntries: number
    totalParticipants: number
    totalRevenue: number
    averageTicketsPerUser: number
    conversionRate: number
    progressPercentage: number
    daysRemaining: number
    entriesPerDay: number
    popularPackages: Array<{
        id: string
        name: string
        purchases: number
        revenue: number
    }>
}

export default function RaffleStatsTab({ raffle }: Props) {
    const [stats, setStats] = useState<RaffleStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d')

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)

                // Simular delay de carga
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Datos simulados basados en la rifa
                const simulatedEntries = Math.floor(Math.random() * (raffle.total_numbers * 0.3)) + 50
                const simulatedParticipants = Math.floor(simulatedEntries * 0.7)

                const mockStats: RaffleStats = {
                    totalEntries: simulatedEntries,
                    totalParticipants: simulatedParticipants,
                    totalRevenue: raffle.price * simulatedEntries,
                    averageTicketsPerUser: simulatedEntries / simulatedParticipants,
                    conversionRate: Math.random() * 20 + 5, // 5-25%
                    progressPercentage: (simulatedEntries / raffle.total_numbers) * 100,
                    daysRemaining: Math.max(0, Math.ceil((new Date(raffle.draw_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
                    entriesPerDay: Math.floor(simulatedEntries / 30) + Math.floor(Math.random() * 20),
                    popularPackages: [
                        { id: '1', name: 'Paquete Básico', purchases: Math.floor(simulatedParticipants * 0.6), revenue: raffle.price * simulatedEntries * 0.4 },
                        { id: '2', name: 'Paquete Premium', purchases: Math.floor(simulatedParticipants * 0.3), revenue: raffle.price * simulatedEntries * 0.35 },
                        { id: '3', name: 'Mega Pack', purchases: Math.floor(simulatedParticipants * 0.1), revenue: raffle.price * simulatedEntries * 0.25 }
                    ]
                }
                setStats(mockStats)
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [raffle, timeFilter])

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
                        ))}
                    </div>
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-6 text-center text-gray-500">
                Error al cargar las estadísticas
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`
    }

    const getProgressColor = () => {
        if (stats.progressPercentage >= 80) return 'bg-green-500'
        if (stats.progressPercentage >= 50) return 'bg-yellow-500'
        if (stats.progressPercentage >= 25) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const getStatusLabel = () => {
        if (stats.progressPercentage >= 80) return { label: 'Excelente', color: 'text-green-600' }
        if (stats.progressPercentage >= 50) return { label: 'Bueno', color: 'text-yellow-600' }
        if (stats.progressPercentage >= 25) return { label: 'Regular', color: 'text-orange-600' }
        return { label: 'Necesita impulso', color: 'text-red-600' }
    }

    const projectedFinalEntries = stats.totalEntries + (stats.entriesPerDay * stats.daysRemaining)
    const projectedRevenue = stats.totalRevenue + (stats.entriesPerDay * stats.daysRemaining * raffle.price)
    const projectedProgress = Math.min((projectedFinalEntries / raffle.total_numbers) * 100, 100)

    const statusInfo = getStatusLabel()

    return (
        <div className="p-6 space-y-6">
            {/* Header con filtros */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Estadísticas de la Rifa</h3>
                </div>
                <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as '7d' | '30d' | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                >
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="all">Todo el tiempo</option>
                </select>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tickets Vendidos</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalEntries.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Ticket className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-green-600">↗ +12.5%</span>
                        <span className="text-gray-500 ml-1">vs período anterior</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Participantes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-green-600">↗ +8.2%</span>
                        <span className="text-gray-500 ml-1">nuevos usuarios</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ingresos</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <DollarSign className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-green-600">↗ +15.3%</span>
                        <span className="text-gray-500 ml-1">vs objetivo</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Progreso</p>
                            <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.progressPercentage)}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                                style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de tiempo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Días Restantes</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.daysRemaining} días</p>
                    <p className="text-xs text-gray-500">Hasta el sorteo</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Promedio Diario</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.entriesPerDay}</p>
                    <p className="text-xs text-gray-500">Tickets por día</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Promedio por Usuario</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.averageTicketsPerUser.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Tickets por usuario</p>
                </div>
            </div>

            {/* Paquetes más populares */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-600" />
                        <h4 className="text-md font-semibold text-gray-900">Paquetes Más Populares</h4>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {stats.popularPackages.map((pkg, index) => (
                            <div key={pkg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-sky-100 text-sky-600 rounded-full text-sm font-semibold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                                        <p className="text-sm text-gray-600">{pkg.purchases} compras</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(pkg.revenue)}</p>
                                    <p className="text-sm text-gray-600">Ingresos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Análisis de rendimiento */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900">Análisis de Rendimiento</h4>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tasa de Conversión</span>
                            <span className="font-semibold text-gray-900">{formatPercentage(stats.conversionRate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tickets por Participante</span>
                            <span className="font-semibold text-gray-900">{stats.averageTicketsPerUser.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor Promedio por Compra</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(stats.totalRevenue / stats.totalParticipants)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Velocidad de Venta</span>
                            <span className="font-semibold text-gray-900">{stats.entriesPerDay}/día</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900">Proyecciones</h4>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tickets Estimados al Final</span>
                            <span className="font-semibold text-gray-900">
                                {Math.round(projectedFinalEntries).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ingresos Proyectados</span>
                            <span className="font-semibold text-gray-900">
                                {formatCurrency(projectedRevenue)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progreso Esperado</span>
                            <span className="font-semibold text-gray-900">
                                {formatPercentage(projectedProgress)}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Estado Esperado</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${projectedProgress >= 80
                                        ? 'bg-green-100 text-green-800'
                                        : projectedProgress >= 50
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {projectedProgress >= 80
                                        ? 'Excelente'
                                        : projectedProgress >= 50
                                            ? 'Bueno'
                                            : 'Necesita impulso'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado actual y recomendaciones */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-gray-600" />
                        <h4 className="text-md font-semibold text-gray-900">Estado Actual y Recomendaciones</h4>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-gray-600">Estado actual:</span>
                        <span className={`font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                            ({formatPercentage(stats.progressPercentage)} completado)
                        </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                        <h5 className="font-medium text-gray-900">Recomendaciones:</h5>
                        {stats.progressPercentage < 30 && (
                            <p className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                Considera aumentar las promociones o el marketing boost para acelerar las ventas
                            </p>
                        )}
                        {stats.averageTicketsPerUser < 2 && (
                            <p className="flex items-start gap-2">
                                <span className="text-orange-500">•</span>
                                Los usuarios compran pocos tickets. Prueba paquetes con descuentos o promociones 2x1
                            </p>
                        )}
                        {stats.daysRemaining < 7 && stats.progressPercentage < 70 && (
                            <p className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                Quedan pocos días y el progreso es bajo. Considera una campaña de último momento
                            </p>
                        )}
                        {stats.entriesPerDay > 50 && (
                            <p className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                Excelente velocidad de venta. Mantén el momentum actual
                            </p>
                        )}
                        {stats.progressPercentage >= 80 && (
                            <p className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                ¡Felicitaciones! Tu rifa está teniendo un excelente rendimiento
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}