'use client'

import { useState, useEffect } from 'react'
import { Hash, Ticket } from 'lucide-react'
import { numberPoolService } from '@/admin/services/numberPoolService'
import type { Referido } from '@/admin/services/referidoService'
import type { RaffleNumberAssignment } from '@/types/database'
import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { toast } from 'sonner'

type AssignmentWithRaffle = RaffleNumberAssignment & {
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

interface Props {
    isOpen: boolean
    onClose: () => void
    referido: Referido
}

export default function ReferidoAssignmentsModal({ isOpen, onClose, referido }: Props) {
    const [assignments, setAssignments] = useState<AssignmentWithRaffle[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && referido) {
            setLoading(true)
            numberPoolService.getAssignmentsByReferral(referido.id)
                .then(setAssignments)
                .catch(() => toast.error('Error al cargar asignaciones'))
                .finally(() => setLoading(false))
        }
    }, [isOpen, referido])

    const totalNumbers = assignments.reduce((sum, a) => sum + (a.range_end - a.range_start + 1), 0)
    const uniqueRaffles = new Set(assignments.map(a => a.raffle_id)).size

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Asignaciones de ${referido.name}`}
            size="lg"
        >
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-2">
                        <Ticket className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            {uniqueRaffles} {uniqueRaffles === 1 ? 'rifa' : 'rifas'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg px-3 py-2">
                        <Hash className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {totalNumbers.toLocaleString()} numeros asignados
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-12">
                        <Hash className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No tiene asignaciones de numeros en ninguna rifa
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
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
                                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                                            {a.raffle?.title || 'Rifa eliminada'}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                            {a.raffle?.raffle_type ? raffleTypeLabels[a.raffle.raffle_type] || a.raffle.raffle_type : '-'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {a.raffle?.status && (
                                                <Badge variant={statusVariantMap[a.raffle.status] || 'neutral'}>
                                                    {a.raffle.status}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">
                                            {String(a.range_start).padStart(4, '0')} - {String(a.range_end).padStart(4, '0')}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                            {(a.range_end - a.range_start + 1).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    )
}
