'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Layers, Plus, Trash2, Hash } from 'lucide-react'
import { useNumberPools } from '@/admin/hooks/useNumberPools'
import { Button, Input } from '@/admin/components/ui'
import { ConfirmDialog } from '@/admin/components/ui/ConfirmDialog'
import { Badge } from '@/admin/components/ui/Badge'
import DashboardMetricCard from '@/admin/components/DashboardMetricCard'
import { toast } from 'sonner'

export default function PoolManagementPage() {
    const router = useRouter()
    const { pools, loading: loadingPools, createPool, deletePool } = useNumberPools()

    const [newPoolName, setNewPoolName] = useState('')
    const [newPoolNumbers, setNewPoolNumbers] = useState(9999)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleCreatePool = async () => {
        if (!newPoolName.trim()) {
            toast.error('Ingresa un nombre para el pool')
            return
        }
        setCreating(true)
        try {
            await createPool({ name: newPoolName, total_numbers: newPoolNumbers })
            setShowCreateForm(false)
            setNewPoolName('')
            setNewPoolNumbers(9999)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al crear pool')
        } finally {
            setCreating(false)
        }
    }

    const handleDeletePool = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await deletePool(deleteTarget)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al eliminar pool')
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/dashboard/raffles')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm">Volver a Rifas</span>
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 dark:bg-indigo-600 text-white p-2 rounded-full">
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pool de Numeros</h2>
                        <p className="text-gray-600 dark:text-gray-400">Define el universo de numeros para tus rifas</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    icon={<Plus className="h-4 w-4" />}
                    variant={showCreateForm ? 'secondary' : 'primary'}
                >
                    {showCreateForm ? 'Cancelar' : 'Nuevo Pool'}
                </Button>
            </div>

            {showCreateForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Crear nuevo pool</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Nombre del pool"
                            placeholder="Ej: Pool Febrero 2026"
                            value={newPoolName}
                            onChange={(e) => setNewPoolName(e.target.value)}
                        />
                        <Input
                            label="Total de numeros"
                            type="number"
                            placeholder="9999"
                            value={newPoolNumbers}
                            onChange={(e) => setNewPoolNumbers(Number(e.target.value))}
                        />
                        <div className="flex items-end">
                            <Button onClick={handleCreatePool} loading={creating} className="w-full">
                                Crear Pool
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                    El pool define el universo de numeros (ej: 1 al 9999). La asignacion de rangos a referidos se hace desde el detalle de cada rifa, en el tab de Numeros.
                </p>
            </div>

            {loadingPools ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
            ) : pools.length > 0 ? (
                <div className="space-y-4">
                    {pools.map(pool => (
                        <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                                        <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{pool.name}</h3>
                                            <Badge variant={pool.status === 'active' ? 'success' : 'neutral'}>
                                                {pool.status === 'active' ? 'Activo' : pool.status === 'archived' ? 'Archivado' : 'Completado'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            {pool.total_numbers.toLocaleString()} numeros
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteTarget(pool.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    title="Eliminar pool"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !showCreateForm && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <Layers className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hay pools creados</p>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            icon={<Plus className="h-4 w-4" />}
                            className="mt-4"
                        >
                            Crear primer pool
                        </Button>
                    </div>
                )
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeletePool}
                title="Eliminar pool"
                message="Se eliminara el pool. Las rifas vinculadas a este pool perderan su referencia."
                confirmText="Eliminar"
                variant="danger"
                loading={deleting}
            />
        </div>
    )
}
