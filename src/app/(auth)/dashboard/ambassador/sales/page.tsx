'use client'

import { useState, useMemo } from 'react'
import {
    DollarSign, CheckCircle, Clock, Search, Loader2, ShoppingCart
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useAmbassadorTeam } from '@/admin/hooks/useAmbassadorTeam'
import { Badge } from '@/admin/components/ui'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

const COLORS = ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#451A03', '#FBBF24', '#FCD34D']

interface Participant {
    id: string
    full_name: string
    email: string
    total_price: string | number
    status: string
    created_at: string
    referral_id?: string
    referrals?: {
        name: string
        referral_code: string
    }
}

export default function AmbassadorSalesPage() {
    const { tenantCountry } = useTenantContext()
    const { participants, stats, team, loading } = useAmbassadorTeam()
    const [filterText, setFilterText] = useState('')

    const filteredParticipants = useMemo(() => {
        if (!filterText.trim()) return participants
        const lower = filterText.toLowerCase()
        return participants.filter((p: Participant) => {
            const referralName = p.referrals?.name?.toLowerCase() || ''
            const participantName = p.full_name?.toLowerCase() || ''
            const email = p.email?.toLowerCase() || ''
            return referralName.includes(lower) || participantName.includes(lower) || email.includes(lower)
        })
    }, [participants, filterText])

    const salesByReferral = useMemo(() => {
        const map = new Map<string, number>()
        participants.forEach((p: Participant) => {
            const name = p.referrals?.name || 'Sin referido'
            const amount = parseFloat(String(p.total_price)) || 0
            map.set(name, (map.get(name) || 0) + amount)
        })
        return Array.from(map.entries())
            .map(([name, total]) => ({
                name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                ventas: total,
            }))
            .sort((a, b) => b.ventas - a.ventas)
            .slice(0, 8)
    }, [participants])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando ventas del equipo...</p>
                </div>
            </div>
        )
    }

    const totalSales = stats?.totalSales ?? 0
    const completedCount = stats?.completedCount ?? 0
    const pendingCount = stats?.pendingCount ?? 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ventas del Equipo</h2>
                <p className="text-gray-600 dark:text-gray-400">Seguimiento de todas las ventas generadas por tu equipo</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-4">
                            <DollarSign className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(totalSales, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Ventas</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 mr-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedCount}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mr-4">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingCount}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre de participante, email o referido..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Historial de Ventas
                        {filterText && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({filteredParticipants.length} resultado{filteredParticipants.length !== 1 ? 's' : ''})
                            </span>
                        )}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Participante', 'Email', 'Monto', 'Estado', 'Referido', 'Fecha'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredParticipants.map((p: Participant) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {p.full_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {p.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(parseFloat(String(p.total_price)) || 0, tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant={
                                                p.status === 'completed' || p.status === 'paid'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        >
                                            {p.status === 'completed' || p.status === 'paid' ? 'Completada' : 'Pendiente'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {p.referrals ? (
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {p.referrals.name}
                                                </div>
                                                <div className="text-xs font-mono text-gray-400">
                                                    {p.referrals.referral_code}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredParticipants.length === 0 && (
                    <div className="text-center py-12">
                        <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {filterText ? 'Sin resultados' : 'Sin ventas registradas'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filterText
                                ? 'Intenta con otro termino de busqueda'
                                : 'Las ventas de tu equipo apareceran aqui'}
                        </p>
                    </div>
                )}
            </div>

            {/* Sales by Referral Chart */}
            {salesByReferral.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Ventas por Referido
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByReferral} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <RechartsTooltip
                                formatter={(value: number) => [formatTenantCurrency(value, tenantCountry), 'Ventas']}
                            />
                            <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                                {salesByReferral.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
