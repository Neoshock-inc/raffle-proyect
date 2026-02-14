'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Badge } from '@/admin/components/ui'
import {
    getReferralStatsByUser,
    getReferralParticipantsByUser
} from '@/admin/services/referidoService'
import { authService } from '@/admin/services/authService'
import { toast } from 'sonner'
import { getReferralCode } from '@/admin/services/referralAuthService'
import { buildReferralLink } from '@/admin/utils/tenantUrl'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

const COLORS = ['#10B981', '#F59E0B']

export default function MisVentasPage() {
    const { tenantCountry } = useTenantContext()
    const [stats, setStats] = useState<any>(null)
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [referralCode, setReferralCode] = useState<string | null>(null)
    const [referralLink, setReferralLink] = useState<string>('')
    const [copySuccess, setCopySuccess] = useState<string>('')

    useEffect(() => {
        const load = async () => {
            try {
                const user = await authService.getUser()
                const uid = user.id

                // Obtener código de referido
                const code = await getReferralCode(uid)
                setReferralCode(code)

                // Si tenemos código, generar el enlace usando las utilidades multi-tenant
                if (code) {
                    try {
                        const link = await buildReferralLink(code)
                        setReferralLink(link)
                    } catch (error) {
                        console.error('Error building referral link:', error)
                        // Fallback a enlace básico
                        setReferralLink(`${window.location.origin}/?ref=${code}`)
                    }
                }

                const [s, p] = await Promise.all([
                    getReferralStatsByUser(uid),
                    getReferralParticipantsByUser(uid)
                ])
                setStats(s)
                setParticipants(p)
            } catch (e) {
                console.error(e)
                toast.error('Error cargando datos')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const copyToClipboard = async () => {
        if (!referralLink) {
            toast.error('No hay enlace para copiar')
            return
        }

        try {
            await navigator.clipboard.writeText(referralLink)
            setCopySuccess('¡Enlace copiado!')
            setTimeout(() => setCopySuccess(''), 2000)
        } catch (e) {
            toast.error('Error copiando enlace')
        }
    }

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando tus estadísticas...</p>
                </div>
            </div>
        )
    }

    const barData = [
        { name: 'Concretadas', value: stats.completedCount },
        { name: 'Pendientes', value: stats.pendingCount }
    ]

    const pieData = [
        { name: 'Tu Comisión', value: stats.totalCommission },
        { name: 'Ventas Base', value: Math.max(0, stats.totalSales - stats.totalCommission) }
    ]

    return (
        <div className="space-y-6">
            {/* Header con enlace de referido */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Mi Panel de Ventas</h2>
                        <p className="text-indigo-100">
                            {referralCode ? (
                                <>Código: <span className="font-mono font-semibold">{referralCode}</span></>
                            ) : (
                                'Cargando información...'
                            )}
                        </p>
                    </div>

                    {referralLink && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 lg:max-w-md">
                            <label className="block text-sm font-medium text-indigo-100 mb-2">
                                Tu enlace de referido:
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={referralLink}
                                    className="flex-1 bg-white/20 border border-white/30 rounded px-3 py-2 text-sm text-white placeholder-white/70 min-w-0"
                                    placeholder="Generando enlace..."
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                    Copiar
                                </button>
                            </div>
                            {copySuccess && (
                                <p className="text-green-200 text-sm mt-2">{copySuccess}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Cards de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card
                    title="Ventas Totales"
                    value={formatTenantCurrency(stats.totalSales, tenantCountry)}
                    bgColor="bg-green-500"
                    textColor="text-green-600"
                />
                <Card
                    title="Mi Comisión"
                    value={formatTenantCurrency(stats.totalCommission, tenantCountry)}
                    bgColor="bg-blue-500"
                    textColor="text-indigo-600"
                />
                <Card
                    title="Participantes"
                    value={stats.totalParticipants}
                    bgColor="bg-purple-500"
                    textColor="text-purple-600"
                />
                <Card
                    title="Ventas Completadas"
                    value={stats.completedCount}
                    bgColor="bg-orange-500"
                    textColor="text-orange-600"
                />
            </div>

            {/* Tabla de participantes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Historial de Ventas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Participante', 'Email', 'Boletos', 'Monto', 'Estado', 'Fecha'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {participants.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {p.full_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {p.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {p.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(parseFloat(p.total_price), tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={p.status === 'completed' || p.status === 'paid' ? 'success' : 'warning'}>
                                            {p.status === 'completed' || p.status === 'paid' ? 'Completada' : 'Pendiente'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {participants.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Aún no tienes Ventas</p>
                                            <p className="text-gray-500 dark:text-gray-400">¡Comparte tu enlace para comenzar a ganar comisiones!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gráficos - Solo mostrar si hay datos */}
            {participants.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartContainer title="Estado de Ventas">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer title="Distribución de Ganancias">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, value }) => `${name}: ${formatTenantCurrency(value, tenantCountry)}`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => formatTenantCurrency(Number(value), tenantCountry)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}
        </div>
    )
}

function Card({
    title,
    value,
    bgColor = "bg-gray-500",
    textColor = "text-gray-600 dark:text-gray-400"
}: {
    title: string;
    value: string | number;
    bgColor?: string;
    textColor?: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <div className={`p-2 rounded-lg ${bgColor.replace('500', '100')} mr-4`}>
                    <div className={`w-6 h-6 ${bgColor} rounded`}></div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                    <div className={`text-sm ${textColor} font-medium`}>{title}</div>
                </div>
            </div>
        </div>
    )
}

function ChartContainer({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
            {children}
        </div>
    )
}