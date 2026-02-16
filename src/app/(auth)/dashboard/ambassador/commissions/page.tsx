'use client'

import { useMemo } from 'react'
import {
    DollarSign, Users, TrendingUp, Loader2, PiggyBank
} from 'lucide-react'
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAmbassadorTeam } from '@/admin/hooks/useAmbassadorTeam'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

const PIE_COLORS = ['#F59E0B', '#8B5CF6']

interface TeamMember {
    id: string
    name: string
    referral_code: string
    commission_rate: number
    total_sales?: number
    total_participants?: number
    total_commission?: number
}

export default function AmbassadorCommissionsPage() {
    const { tenantCountry } = useTenantContext()
    const { stats, team, loading } = useAmbassadorTeam()

    const commissionRows = useMemo(() => {
        return team.map((member: TeamMember) => {
            const sales = member.total_sales || 0
            const rate = member.commission_rate || 0
            const earnings = sales * rate
            return {
                id: member.id,
                name: member.name,
                referral_code: member.referral_code,
                sales,
                rate,
                earnings,
            }
        })
    }, [team])

    const pieData = useMemo(() => {
        const personal = stats?.totalPersonalCommission ?? 0
        const teamComm = stats?.totalTeamCommission ?? 0
        return [
            { name: 'Comision Personal', value: personal },
            { name: 'Comision Equipo', value: teamComm },
        ]
    }, [stats])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando comisiones...</p>
                </div>
            </div>
        )
    }

    const personalCommission = stats?.totalPersonalCommission ?? 0
    const teamCommission = stats?.totalTeamCommission ?? 0
    const totalCommission = stats?.totalCombinedCommission ?? 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Desglose de Comisiones</h2>
                <p className="text-gray-600 dark:text-gray-400">Visualiza tus ganancias personales y por equipo</p>
            </div>

            {/* Commission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-4">
                            <DollarSign className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(personalCommission, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Comision Personal</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-4">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(teamCommission, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Comision Equipo</div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm p-5 text-white">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-white/20 mr-4">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {formatTenantCurrency(totalCommission, tenantCountry)}
                            </div>
                            <div className="text-sm text-amber-100">Total Combinado</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Distribucion de Comisiones
                    </h3>
                    {totalCommission > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={50}
                                    label={({ name, value }) =>
                                        `${name}: ${formatTenantCurrency(value, tenantCountry)}`
                                    }
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: number) => formatTenantCurrency(value, tenantCountry)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                            <PiggyBank className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Aun no hay comisiones para mostrar
                            </p>
                        </div>
                    )}
                </div>

                {/* Summary Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Resumen por Tipo
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-amber-500 mr-3" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Comision Personal</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(personalCommission, tenantCountry)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-3" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Comision Equipo</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(teamCommission, tenantCountry)}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-900/10 dark:to-purple-900/10 rounded-lg">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
                                <span className="text-xl font-bold text-amber-600">
                                    {formatTenantCurrency(totalCommission, tenantCountry)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Detalle por Referido
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Referido', 'Codigo', 'Ventas', 'Tu %', 'Tus Ganancias'].map((h) => (
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
                            {commissionRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                            {row.referral_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(row.sales, tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded text-xs font-semibold">
                                            {(row.rate * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                        {formatTenantCurrency(row.earnings, tenantCountry)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {commissionRows.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                        Total
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(
                                            commissionRows.reduce((sum, r) => sum + r.sales, 0),
                                            tenantCountry
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">-</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                                        {formatTenantCurrency(
                                            commissionRows.reduce((sum, r) => sum + r.earnings, 0),
                                            tenantCountry
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {commissionRows.length === 0 && (
                    <div className="text-center py-12">
                        <PiggyBank className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Sin comisiones aun
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            Las comisiones se generan cuando tu equipo realiza ventas
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
