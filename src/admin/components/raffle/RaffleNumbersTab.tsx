'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Hash, User, ChevronLeft, ChevronRight, AlertCircle, Layers, Plus, Trash2 } from 'lucide-react'
import type { Raffle } from '@/admin/types/raffle'
import type { RaffleNumberStatus } from '@/types/database'
import { useRaffleNumbers, useRaffleAssignments } from '@/admin/hooks/useNumberPools'
import { getReferidos, type Referido } from '@/admin/services/referidoService'
import { Button, Input, Select } from '@/admin/components/ui'
import { ConfirmDialog } from '@/admin/components/ui/ConfirmDialog'
import { Badge } from '@/admin/components/ui/Badge'
import { cn } from '@/admin/components/ui/cn'
import DashboardMetricCard from '@/admin/components/DashboardMetricCard'
import { toast } from 'sonner'

interface RaffleNumbersTabProps {
    raffle: Raffle
}

const GRID_PAGE_SIZE = 500

function padNumber(n: number, total: number): string {
    return String(n).padStart(String(total).length, '0')
}

function findAssignment(num: number, statuses: RaffleNumberStatus[]): RaffleNumberStatus | null {
    for (const s of statuses) {
        if (num >= s.range_start && num <= s.range_end) return s
    }
    return null
}

export default function RaffleNumbersTab({ raffle }: RaffleNumbersTabProps) {
    const {
        numberStatus,
        soldNumbers,
        loading,
        totalAssigned,
        totalSold,
        gridRange,
        fetchSoldInRange,
        refetch: refetchStatus,
    } = useRaffleNumbers(raffle.id)

    const {
        assignments,
        loading: loadingAssignments,
        createAssignment,
        deleteAssignment,
    } = useRaffleAssignments(raffle.id)

    const [referrals, setReferrals] = useState<Referido[]>([])
    const [loadingReferrals, setLoadingReferrals] = useState(false)

    const [newReferralId, setNewReferralId] = useState('')
    const [newRangeStart, setNewRangeStart] = useState('')
    const [newRangeEnd, setNewRangeEnd] = useState('')
    const [assigning, setAssigning] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [page, setPage] = useState(1)

    useEffect(() => {
        setLoadingReferrals(true)
        getReferidos()
            .then(setReferrals)
            .catch(() => toast.error('Error al cargar referidos'))
            .finally(() => setLoadingReferrals(false))
    }, [])

    const totalNumbers = raffle.total_numbers
    const totalPages = Math.ceil(totalNumbers / GRID_PAGE_SIZE)
    const availableCount = totalNumbers - totalAssigned

    const currentStart = (page - 1) * GRID_PAGE_SIZE + 1
    const currentEnd = Math.min(page * GRID_PAGE_SIZE, totalNumbers)

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
        const start = (newPage - 1) * GRID_PAGE_SIZE + 1
        const end = Math.min(newPage * GRID_PAGE_SIZE, totalNumbers)
        fetchSoldInRange(start, end)
    }, [totalNumbers, fetchSoldInRange])

    const soldSet = useMemo(() => new Set(soldNumbers), [soldNumbers])

    const noPool = !raffle.pool_id

    const handleAssign = async () => {
        if (!newReferralId || !newRangeStart || !newRangeEnd) {
            toast.error('Completa todos los campos')
            return
        }
        const start = parseInt(newRangeStart)
        const end = parseInt(newRangeEnd)
        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
            toast.error('Rango invalido')
            return
        }
        if (end > totalNumbers) {
            toast.error(`El rango no puede superar ${totalNumbers}`)
            return
        }
        setAssigning(true)
        try {
            await createAssignment({
                raffle_id: raffle.id,
                referral_id: newReferralId,
                range_start: start,
                range_end: end,
            })
            setNewReferralId('')
            setNewRangeStart('')
            setNewRangeEnd('')
            refetchStatus()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al asignar rango')
        } finally {
            setAssigning(false)
        }
    }

    const handleDeleteAssignment = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await deleteAssignment(deleteTarget)
            refetchStatus()
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const referralOptions = [
        { value: '', label: loadingReferrals ? 'Cargando...' : 'Seleccionar referido' },
        ...referrals
            .filter(r => r.is_active)
            .map(r => ({ value: r.id, label: `${r.name} (${r.referral_code})` })),
    ]

    if (noPool) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Layers className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Sin pool de numeros asignado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Esta rifa no tiene un pool de numeros vinculado. Asigna un pool desde la edicion de la rifa para ver y gestionar los numeros.
                    </p>
                </div>
            </div>
        )
    }

    if (loading && numberStatus.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardMetricCard
                    icon={<Hash className="h-5 w-5" />}
                    title="Total Numeros"
                    value={totalNumbers.toLocaleString()}
                />
                <DashboardMetricCard
                    icon={<Hash className="h-5 w-5" />}
                    title="Disponibles"
                    value={availableCount.toLocaleString()}
                    iconBgColor="bg-blue-50 dark:bg-blue-900/30"
                    iconColor="text-blue-500"
                />
                <DashboardMetricCard
                    icon={<User className="h-5 w-5" />}
                    title="Asignados"
                    value={totalAssigned.toLocaleString()}
                    iconBgColor="bg-amber-50 dark:bg-amber-900/30"
                    iconColor="text-amber-500"
                />
                <DashboardMetricCard
                    icon={<Hash className="h-5 w-5" />}
                    title="Vendidos"
                    value={totalSold.toLocaleString()}
                    iconBgColor="bg-green-50 dark:bg-green-900/30"
                    iconColor="text-green-500"
                />
            </div>

            {/* Assignment form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Asignar rango a referido</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        label="Referido"
                        options={referralOptions}
                        value={newReferralId}
                        onChange={(e) => setNewReferralId(e.target.value)}
                    />
                    <Input
                        label="Desde"
                        type="number"
                        placeholder="1"
                        value={newRangeStart}
                        onChange={(e) => setNewRangeStart(e.target.value)}
                    />
                    <Input
                        label="Hasta"
                        type="number"
                        placeholder={String(totalNumbers)}
                        value={newRangeEnd}
                        onChange={(e) => setNewRangeEnd(e.target.value)}
                    />
                    <div className="flex items-end">
                        <Button
                            onClick={handleAssign}
                            loading={assigning}
                            disabled={!newReferralId || !newRangeStart || !newRangeEnd}
                            className="w-full"
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Asignar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Assignments table */}
            {assignments.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Referido</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Codigo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rango</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vendidos</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Progreso</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {numberStatus.map((s, i) => {
                                const pct = s.total_in_range > 0
                                    ? (Number(s.sold_in_range) / s.total_in_range) * 100
                                    : 0
                                const assignment = assignments.find(a =>
                                    a.range_start === s.range_start && a.range_end === s.range_end && a.referral_id === s.referral_id
                                )
                                return (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{s.referral_name}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{s.referral_code}</td>
                                        <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">
                                            {padNumber(s.range_start, totalNumbers)} - {padNumber(s.range_end, totalNumbers)}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{s.total_in_range.toLocaleString()}</td>
                                        <td className="px-4 py-2.5">
                                            <Badge variant={Number(s.sold_in_range) > 0 ? 'success' : 'neutral'}>
                                                {Number(s.sold_in_range).toLocaleString()}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-green-500"
                                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{pct.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            {assignment && (
                                                <button
                                                    onClick={() => setDeleteTarget(assignment.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                    title="Eliminar asignacion"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {assignments.length === 0 && !loadingAssignments && (
                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        No hay asignaciones de numeros para esta rifa. Usa el formulario de arriba para asignar rangos a referidos.
                    </p>
                </div>
            )}

            {/* Number grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Numeros {padNumber(currentStart, totalNumbers)} - {padNumber(currentEnd, totalNumbers)}
                    </h4>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            icon={<ChevronLeft className="h-4 w-4" />}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            icon={<ChevronRight className="h-4 w-4" />}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4 mb-3 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> Disponible
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800 inline-block" /> Asignado
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-300 dark:bg-green-800 inline-block" /> Vendido
                    </span>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-25 gap-1">
                    {Array.from({ length: currentEnd - currentStart + 1 }, (_, i) => {
                        const num = currentStart + i
                        const assignment = findAssignment(num, numberStatus)
                        const isSold = soldSet.has(num)

                        let bgClass = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        let title = 'Disponible'

                        if (isSold) {
                            bgClass = 'bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-300'
                            title = `Vendido${assignment ? ` (${assignment.referral_name})` : ''}`
                        } else if (assignment) {
                            bgClass = 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                            title = `Asignado a ${assignment.referral_name}`
                        }

                        return (
                            <div
                                key={num}
                                className={cn(
                                    'aspect-square flex items-center justify-center rounded text-[10px] font-mono leading-none',
                                    bgClass
                                )}
                                title={title}
                            >
                                {padNumber(num, totalNumbers)}
                            </div>
                        )
                    })}
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteAssignment}
                title="Eliminar asignacion"
                message="Se eliminara esta asignacion de rango. Los numeros quedaran disponibles."
                confirmText="Eliminar"
                variant="danger"
                loading={deleting}
            />
        </div>
    )
}
