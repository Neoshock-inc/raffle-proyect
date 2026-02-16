'use client'

import { useState, useEffect } from 'react'
import { Hash, Ticket } from 'lucide-react'
import { authService } from '@/admin/services/authService'
import { numberPoolService } from '@/admin/services/numberPoolService'
import { Badge } from '@/admin/components/ui/Badge'
import { createClient } from '@supabase/supabase-js'

type AssignmentWithRaffle = {
    id: string
    raffle_id: string
    referral_id: string
    range_start: number
    range_end: number
    status: string
    assigned_at: string
    raffle?: { id: string; title: string; raffle_type: string; status: string }
}

const raffleTypeLabels: Record<string, string> = {
    daily_am: 'Diaria AM',
    daily_pm: 'Diaria PM',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
    active: 'success',
    draft: 'warning',
    paused: 'info',
    completed: 'neutral',
    cancelled: 'danger',
}

export default function MyNumbersPage() {
    const [assignments, setAssignments] = useState<AssignmentWithRaffle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const user = await authService.getUser()
                if (!user) return

                // Get referral ID for this user
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )
                const { data: referral } = await supabase
                    .from('referrals')
                    .select('id')
                    .eq('referrer_user_id', user.id)
                    .single()

                if (!referral) return

                const data = await numberPoolService.getAssignmentsByReferral(referral.id)
                setAssignments(data)
            } catch (error) {
                console.error('Error loading numbers:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const totalNumbers = assignments.reduce((sum, a) => sum + (a.range_end - a.range_start + 1), 0)
    const uniqueRaffles = new Set(assignments.map(a => a.raffle_id)).size

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Hash className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Números</h1>
                </div>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Hash className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Números</h1>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rifas Asignadas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{uniqueRaffles}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                            <Hash className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Números</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalNumbers.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            {assignments.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Hash className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Sin asignaciones</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aún no tienes números asignados en ninguna rifa
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rifa</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rango</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                            {a.raffle?.title || 'Rifa eliminada'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                            {a.raffle?.raffle_type ? raffleTypeLabels[a.raffle.raffle_type] || a.raffle.raffle_type : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {a.raffle?.status && (
                                                <Badge variant={statusVariantMap[a.raffle.status] || 'neutral'}>
                                                    {a.raffle.status}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">
                                            {String(a.range_start).padStart(4, '0')} - {String(a.range_end).padStart(4, '0')}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                            {(a.range_end - a.range_start + 1).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
