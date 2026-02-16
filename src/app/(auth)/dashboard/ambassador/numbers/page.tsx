'use client'

import { Hash, Loader2, Ticket } from 'lucide-react'
import { useAmbassadorTeam } from '@/admin/hooks/useAmbassadorTeam'
import { Badge } from '@/admin/components/ui'

interface NumberAssignment {
    id: string
    ambassador_id: string
    raffle_id: string
    range_start: number
    range_end: number
    status: 'assigned' | 'returned'
    raffle?: {
        id: string
        title: string
        raffle_type: string
        status: string
    }
}

function getRaffleStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    switch (status) {
        case 'active':
            return 'success'
        case 'draft':
            return 'warning'
        case 'completed':
        case 'finished':
            return 'neutral'
        case 'cancelled':
            return 'danger'
        default:
            return 'neutral'
    }
}

function getRaffleStatusLabel(status: string): string {
    switch (status) {
        case 'active':
            return 'Activa'
        case 'draft':
            return 'Borrador'
        case 'completed':
        case 'finished':
            return 'Finalizada'
        case 'cancelled':
            return 'Cancelada'
        default:
            return status
    }
}

function getAssignmentStatusVariant(status: string): 'success' | 'danger' {
    return status === 'assigned' ? 'success' : 'danger'
}

function getAssignmentStatusLabel(status: string): string {
    return status === 'assigned' ? 'Asignado' : 'Devuelto'
}

export default function AmbassadorNumbersPage() {
    const { numbers, loading } = useAmbassadorTeam()

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando numeros asignados...</p>
                </div>
            </div>
        )
    }

    const totalNumbers = numbers.reduce((sum: number, n: NumberAssignment) => {
        return sum + (n.range_end - n.range_start + 1)
    }, 0)

    const assignedNumbers = numbers.filter((n: NumberAssignment) => n.status === 'assigned')
    const totalAssigned = assignedNumbers.reduce((sum: number, n: NumberAssignment) => {
        return sum + (n.range_end - n.range_start + 1)
    }, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Numeros Asignados</h2>
                <p className="text-gray-600 dark:text-gray-400">Revisa los rangos de numeros asignados a tu cuenta</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-4">
                            <Hash className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalNumbers}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Numeros</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 mr-4">
                            <Ticket className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAssigned}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Numeros Activos</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-4">
                            <Hash className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{numbers.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Rangos Asignados</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {['Rifa', 'Tipo', 'Estado Rifa', 'Rango', 'Cantidad', 'Estado Asignacion'].map((h) => (
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
                            {numbers.map((assignment: NumberAssignment) => {
                                const count = assignment.range_end - assignment.range_start + 1
                                return (
                                    <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {assignment.raffle?.title || 'Rifa desconocida'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {assignment.raffle?.raffle_type || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {assignment.raffle?.status ? (
                                                <Badge variant={getRaffleStatusVariant(assignment.raffle.status)}>
                                                    {getRaffleStatusLabel(assignment.raffle.status)}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                                                {assignment.range_start} - {assignment.range_end}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={getAssignmentStatusVariant(assignment.status)}>
                                                {getAssignmentStatusLabel(assignment.status)}
                                            </Badge>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {numbers.length === 0 && (
                    <div className="text-center py-12">
                        <Hash className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                            Sin numeros asignados
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            Aun no tienes rangos de numeros asignados a tu cuenta
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
