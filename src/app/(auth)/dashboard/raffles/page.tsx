'use client'

import { useState } from 'react'
import { useRaffles } from '@/admin/hooks/useRaffles'
import { useNumberPools } from '@/admin/hooks/useNumberPools'
import { Plus, Ticket, Search } from 'lucide-react'
import type { RaffleStatus } from '@/admin/types/raffle'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/admin/components/ui'
import { ConfirmDialog } from '@/admin/components/ui/ConfirmDialog'
import { cn } from '@/admin/components/ui/cn'
import RaffleCard from '@/admin/components/raffle/RaffleCard'
import RaffleCardSkeleton from '@/admin/components/raffle/RaffleCardSkeleton'
import RaffleListMetrics from '@/admin/components/raffle/RaffleListMetrics'
import ActivePoolBanner from '@/admin/components/raffle/ActivePoolBanner'

const statusFilters: { label: string; value: RaffleStatus | 'all' }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Activas', value: 'active' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Pausadas', value: 'paused' },
    { label: 'Finalizadas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' },
]

export default function RafflesPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<RaffleStatus | 'all'>('all')
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const router = useRouter()

    const { pools, loading: loadingPools } = useNumberPools()
    const activePool = pools.find(p => p.status === 'active') || null

    const {
        raffles,
        loading,
        pagination,
        changePage,
        deleteRaffle,
        duplicateRaffle,
    } = useRaffles({
        filters: {
            ...(search ? { search } : {}),
            ...(statusFilter !== 'all' ? { status: [statusFilter] } : {}),
        }
    })

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await deleteRaffle(deleteTarget)
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 dark:bg-indigo-600 text-white p-2 rounded-full">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rifas</h2>
                        <p className="text-gray-600 dark:text-gray-400">Gestiona tus rifas y sorteos</p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/raffles/create')}
                    icon={<Plus className="w-4 h-4" />}
                >
                    Crear rifa
                </Button>
            </div>

            {/* Pool Banner */}
            <ActivePoolBanner pool={activePool} loading={loadingPools} />

            {/* Metrics */}
            <RaffleListMetrics raffles={raffles} loading={loading} />

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
                                statusFilter === filter.value
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar rifas..."
                    className="w-full sm:w-64"
                    icon={<Search className="h-4 w-4" />}
                />
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <RaffleCardSkeleton key={i} />
                    ))}
                </div>
            ) : raffles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {raffles.map((raffle) => (
                        <RaffleCard
                            key={raffle.id}
                            raffle={raffle}
                            onDelete={(id) => setDeleteTarget(id)}
                            onDuplicate={(r) => duplicateRaffle(r)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <Ticket className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        {search || statusFilter !== 'all'
                            ? 'No se encontraron rifas con ese criterio'
                            : 'No hay rifas creadas'}
                    </p>
                    {!search && statusFilter === 'all' && (
                        <Button
                            onClick={() => router.push('/dashboard/raffles/create')}
                            icon={<Plus className="w-4 h-4" />}
                            className="mt-4"
                        >
                            Crear tu primera rifa
                        </Button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} rifas
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => changePage(Math.max(pagination.page - 1, 1))}
                            disabled={pagination.page === 1}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Página {pagination.page} de {pagination.total_pages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => changePage(Math.min(pagination.page + 1, pagination.total_pages))}
                            disabled={pagination.page >= pagination.total_pages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Eliminar rifa"
                message="¿Estás seguro de que deseas eliminar esta rifa? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
                loading={deleting}
            />
        </div>
    )
}
