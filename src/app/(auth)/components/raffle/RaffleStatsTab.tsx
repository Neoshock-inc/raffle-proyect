'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, DollarSign, Ticket, TrendingUp, Calendar, Package, AlertTriangle } from 'lucide-react'
import { Raffle } from '../../types/raffle'
import { raffleService } from '../../services/rafflesService'
import { ticketPackagesService } from '../../services/ticketPackagesService'
import { TicketPackage, calculateFinalPrice, calculateTotalTickets } from '../../types/ticketPackage'

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
    realPackages: Array<{
        id: string
        name: string
        ticket_count: number
        price: number
        purchases: number
        revenue: number
        percentage: number
    }>
    recentEntries: Array<{
        id: string
        number: number
        participant_name: string
        purchased_at: string
    }>
}

export default function RaffleStatsTab({ raffle }: Props) {
    const [stats, setStats] = useState<RaffleStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('30d')

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                setLoading(true)
                setError(null)

                // Obtener estadísticas básicas de la rifa
                const basicStats = await raffleService.getRaffleStats(raffle.id, timeFilter)

                // Obtener los paquetes reales configurados para esta rifa
                const packages: TicketPackage[] = await ticketPackagesService.getPackagesByRaffleId(raffle.id)

                // Obtener todas las entradas para analizar por paquetes
                const entries = await raffleService.getRaffleEntries(raffle.id)

                const packageStats = packages.map(pkg => {
                    // Tickets que este paquete entrega (incluyendo promos)
                    const totalTicketsFromPackage = calculateTotalTickets(pkg)

                    // Agrupar entradas por participante
                    const participantGroups = entries.reduce((acc: Record<string, any[]>, entry: { participant_id: string }) => {
                        if (!acc[entry.participant_id]) {
                            acc[entry.participant_id] = []
                        }
                        acc[entry.participant_id].push(entry)
                        return acc
                    }, {})

                    // Contar participantes que tienen exactamente ese número de tickets
                    const purchases = (Object.values(participantGroups) as any[][])
                        .filter((participantEntries) => participantEntries.length === totalTicketsFromPackage)
                        .length

                    const finalPrice = calculateFinalPrice(pkg)
                    const revenue = purchases * finalPrice
                    const percentage =
                        basicStats.totalParticipants > 0
                            ? (purchases / basicStats.totalParticipants) * 100
                            : 0

                    return {
                        id: pkg.id,
                        name: pkg.name,
                        ticket_count: totalTicketsFromPackage,
                        price: finalPrice,
                        purchases,
                        revenue,
                        percentage,
                    }
                }).filter(pkg => pkg.purchases > 0)

                // Si no hay paquetes con ventas, crear un análisis básico
                if (packageStats.length === 0 && basicStats.totalEntries > 0) {
                    const participantGroups = entries.reduce((acc: { [x: string]: any[] }, entry: { participant_id: string | number }) => {
                        if (!acc[entry.participant_id]) {
                            acc[entry.participant_id] = []
                        }
                        acc[entry.participant_id].push(entry)
                        return acc
                    }, {} as Record<string, any[]>)

                    const singleBuyers = (Object.values(participantGroups) as any[])
                        .filter(g => g.length === 1).length

                    const multiBuyers = (Object.values(participantGroups) as any[])
                        .filter(g => g.length > 1).length


                    if (singleBuyers > 0) {
                        packageStats.push({
                            id: 'single',
                            name: 'Compra Individual',
                            ticket_count: 1,
                            price: raffle.price,
                            purchases: singleBuyers,
                            revenue: singleBuyers * raffle.price,
                            percentage: (singleBuyers / basicStats.totalParticipants) * 100
                        })
                    }

                    if (multiBuyers > 0) {
                        const avgTicketsMulti =
                            (Object.values(participantGroups) as Array<{ length: number }>)
                                .filter(g => g.length > 1)
                                .reduce((sum, g) => sum + g.length, 0) / multiBuyers

                        const revenue: any = Object.values(participantGroups)
                            .filter((g: any) => g.length > 1)
                            .reduce((sum: any, g: any) => sum + g.length * raffle.price, 0)

                        packageStats.push({
                            id: 'multi',
                            name: 'Compra Múltiple',
                            ticket_count: Math.round(avgTicketsMulti),
                            price: Math.round(avgTicketsMulti) * raffle.price,
                            purchases: multiBuyers,
                            revenue,
                            percentage: (multiBuyers / basicStats.totalParticipants) * 100
                        })
                    }
                }

                // Ordenar por ingresos
                packageStats.sort((a, b) => b.revenue - a.revenue)

                const enhancedStats: RaffleStats = {
                    ...basicStats,
                    realPackages: packageStats
                }

                setStats(enhancedStats)
            } catch (err) {
                console.error('Error fetching real stats:', err)
                setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
            } finally {
                setLoading(false)
            }
        }

        fetchRealStats()
    }, [raffle.id, timeFilter])

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

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-6 text-center text-gray-500">
                No hay datos disponibles
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
                        <span className="text-gray-500">
                            {stats.totalEntries === 0 ? 'Aún no hay ventas' : 'Vendidos de forma real'}
                        </span>
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
                        <span className="text-gray-500">participantes únicos</span>
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
                        <span className="text-gray-500">ingresos reales</span>
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

            {/* Paquetes reales */}
            {stats.realPackages.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-gray-600" />
                            <h4 className="text-md font-semibold text-gray-900">Rendimiento de Paquetes</h4>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {stats.realPackages.map((pkg, index) => (
                                <div key={pkg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-sky-100 text-sky-600 rounded-full text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                                            <p className="text-sm text-gray-600">
                                                {pkg.ticket_count} ticket{pkg.ticket_count > 1 ? 's' : ''} - {formatCurrency(pkg.price)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {pkg.purchases} compras ({formatPercentage(pkg.percentage)} de participantes)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatCurrency(pkg.revenue)}</p>
                                        <p className="text-sm text-gray-600">Ingresos</p>
                                        <p className="text-xs text-gray-500">
                                            {pkg.purchases * pkg.ticket_count} tickets vendidos
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Entradas recientes */}
            {stats.recentEntries.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-md font-semibold text-gray-900">Últimas Compras</h4>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {stats.recentEntries.slice(0, 5).map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-sky-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            #{entry.number}
                                        </div>
                                        <span className="font-medium text-gray-900">{entry.participant_name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(entry.purchased_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Proyecciones y recomendaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-gray-600" />
                            <h4 className="text-md font-semibold text-gray-900">Estado y Recomendaciones</h4>
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
                            {stats.totalEntries === 0 && (
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    Aún no hay tickets vendidos. Comienza promocionando tu rifa en redes sociales
                                </p>
                            )}
                            {stats.progressPercentage < 30 && stats.totalEntries > 0 && (
                                <p className="flex items-start gap-2">
                                    <span className="text-red-500">•</span>
                                    Considera aumentar las promociones o el marketing para acelerar las ventas
                                </p>
                            )}
                            {stats.averageTicketsPerUser < 2 && stats.totalParticipants > 0 && (
                                <p className="flex items-start gap-2">
                                    <span className="text-orange-500">•</span>
                                    Los usuarios compran pocos tickets. Promociona tus paquetes con descuentos
                                </p>
                            )}
                            {stats.entriesPerDay > 10 && (
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
                            {stats.realPackages.length > 0 && (
                                <p className="flex items-start gap-2">
                                    <span className="text-blue-500">•</span>
                                    Paquete más popular: {stats.realPackages[0]?.name} con {stats.realPackages[0]?.purchases} compras
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}