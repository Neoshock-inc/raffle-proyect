'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    Users, DollarSign, TrendingUp, UserCheck, Copy, ArrowRight, Loader2
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useAmbassadorTeam } from '@/admin/hooks/useAmbassadorTeam'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

const COLORS = ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F']

export default function AmbassadorDashboardPage() {
    const { tenantCountry } = useTenantContext()
    const { ambassadorCode, stats, team, loading } = useAmbassadorTeam()
    const [copySuccess, setCopySuccess] = useState(false)

    const copyCode = async () => {
        if (!ambassadorCode) return
        try {
            await navigator.clipboard.writeText(ambassadorCode)
            setCopySuccess(true)
            toast.success('Codigo copiado al portapapeles')
            setTimeout(() => setCopySuccess(false), 2000)
        } catch {
            toast.error('Error al copiar codigo')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando panel de embajador...</p>
                </div>
            </div>
        )
    }

    const statCards = [
        {
            title: 'Equipo',
            value: stats?.teamSize ?? 0,
            icon: Users,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            title: 'Ventas Totales',
            value: formatTenantCurrency(stats?.totalSales ?? 0, tenantCountry),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/30',
        },
        {
            title: 'Comision Personal',
            value: formatTenantCurrency(stats?.totalPersonalCommission ?? 0, tenantCountry),
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            title: 'Comision Equipo',
            value: formatTenantCurrency(stats?.totalTeamCommission ?? 0, tenantCountry),
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            title: 'Total Comisiones',
            value: formatTenantCurrency(stats?.totalCombinedCommission ?? 0, tenantCountry),
            icon: DollarSign,
            color: 'text-amber-700',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            title: 'Participantes',
            value: stats?.totalParticipants ?? 0,
            icon: UserCheck,
            color: 'text-teal-600',
            bg: 'bg-teal-100 dark:bg-teal-900/30',
        },
    ]

    const quickLinks = [
        { label: 'Mi Equipo', href: '/dashboard/ambassador/team', description: 'Gestiona tus referidos' },
        { label: 'Numeros', href: '/dashboard/ambassador/numbers', description: 'Numeros asignados' },
        { label: 'Ventas', href: '/dashboard/ambassador/sales', description: 'Historial de ventas' },
        { label: 'Comisiones', href: '/dashboard/ambassador/commissions', description: 'Desglose de comisiones' },
    ]

    const topReferrals = [...team]
        .sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0))
        .slice(0, 5)
        .map((r) => ({
            name: r.name.length > 12 ? r.name.substring(0, 12) + '...' : r.name,
            ventas: r.total_sales || 0,
        }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Panel de Embajador</h2>
                        <p className="text-amber-100">
                            Bienvenido a tu centro de gestion como embajador
                        </p>
                    </div>
                    {ambassadorCode && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <label className="block text-sm font-medium text-amber-100 mb-2">
                                Tu codigo de embajador:
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-bold bg-white/20 px-4 py-2 rounded">
                                    {ambassadorCode}
                                </span>
                                <button
                                    onClick={copyCode}
                                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors"
                                    title="Copiar codigo"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                                {copySuccess && (
                                    <span className="text-green-200 text-sm">Copiado</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${card.bg} mr-4`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {card.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {card.title}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors">
                                    {link.label}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {link.description}
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Top Referrals Chart */}
            {topReferrals.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Top Referidos por Ventas
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topReferrals} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <RechartsTooltip
                                formatter={(value: number) => [formatTenantCurrency(value, tenantCountry), 'Ventas']}
                            />
                            <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                                {topReferrals.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {topReferrals.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        Aun no tienes referidos en tu equipo
                    </p>
                    <Link
                        href="/dashboard/ambassador/team"
                        className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium"
                    >
                        Agregar tu primer referido
                    </Link>
                </div>
            )}
        </div>
    )
}
