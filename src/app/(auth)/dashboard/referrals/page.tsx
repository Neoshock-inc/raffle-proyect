// src/app/(auth)/dashboard/referidos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Copy, ExternalLink, Hash } from 'lucide-react'
import { toast } from 'sonner'
import {
    getReferidos,
    deleteReferido,
    toggleReferidoStatus,
    Referido
} from '@/admin/services/referidoService'
import { buildReferralLink } from '@/admin/utils/tenantUrl'
import ReferidoModal from '@/admin/components/ReferidoModal'
import ReferidoAssignmentsModal from '@/admin/components/ReferidoAssignmentsModal'
import { Button, Badge } from '@/admin/components/ui'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

export default function ReferidosPage() {
    const { tenantCountry } = useTenantContext()
    const [referidos, setReferidos] = useState<Referido[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingReferido, setEditingReferido] = useState<Referido | null>(null)
    const [assignmentsReferido, setAssignmentsReferido] = useState<Referido | null>(null)

    useEffect(() => {
        loadReferidos()
    }, [])

    const loadReferidos = async () => {
        try {
            setLoading(true)
            const data = await getReferidos()
            setReferidos(data)
        }
        catch (error) {
            toast.error('Error al cargar los referidos')
        }
        finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingReferido(null)
        setModalOpen(true)
    }

    const handleEdit = (referido: Referido) => {
        setEditingReferido(referido)
        setModalOpen(true)
    }

    const handleDelete = async (referido: Referido) => {
        if (!confirm(`¿Estás seguro de eliminar el referido "${referido.name}"?`)) return

        try {
            await deleteReferido(referido.id)
            toast.success('Referido eliminado correctamente')
            loadReferidos()
        } catch (error) {
            console.log('Error deleting referido:', error)
            toast.error('Error al eliminar referido')
        }
    }

    const handleToggleActive = async (referido: Referido) => {
        try {
            if (!confirm(`¿Estás seguro de ${referido.is_active ? 'desactivar' : 'activar'} el referido "${referido.name}"?`)) return
            await toggleReferidoStatus(referido.id, referido.is_active)
            toast.success(`Referido "${referido.name}" ${referido.is_active ? 'desactivado' : 'activado'} correctamente`)
            loadReferidos()
        } catch (error) {
            console.log('Error toggling referido status:', error)
            toast.error('Error al cambiar estado del referido')
        }
    }

    const copyReferralLink = async (code: string) => {
        try {
            const link = await buildReferralLink(code)
            await navigator.clipboard.writeText(link)
            toast.success('Enlace copiado al portapapeles')
        } catch (error) {
            console.error('Error copying referral link:', error)
            toast.error('Error al copiar enlace')
        }
    }

    const openReferralLink = async (code: string) => {
        try {
            const link = await buildReferralLink(code)
            window.open(link, '_blank')
        } catch (error) {
            console.error('Error opening referral link:', error)
            toast.error('Error al abrir enlace')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-96 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Referidos</h2>
                    <p className="text-gray-600 dark:text-gray-400">Administra tus códigos de referidos y ve su rendimiento</p>
                </div>
                <Button
                    onClick={handleCreate}
                    icon={<Plus className="h-4 w-4" />}
                >
                    Nuevo Referido
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{referidos.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Referidos</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-2xl font-bold text-green-600">
                        {formatTenantCurrency(referidos.reduce((sum, r) => sum + (r.total_sales || 0), 0), tenantCountry)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-2xl font-bold text-blue-600">
                        {referidos.reduce((sum, r) => sum + (r.total_participants || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Participantes</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-2xl font-bold text-purple-600">
                        {formatTenantCurrency(referidos.reduce((sum, r) => sum + (r.total_commission || 0), 0), tenantCountry)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Comisión Total</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Referido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Participantes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ventas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Comisión
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {referidos.map((referido) => (
                                <tr key={referido.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {referido.name}
                                            </div>
                                            {referido.email && (
                                                <div className="text-sm text-gray-500">
                                                    {referido.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                {referido.referral_code}
                                            </span>
                                            <button
                                                onClick={() => copyReferralLink(referido.referral_code)}
                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                                                title="Copiar enlace"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openReferralLink(referido.referral_code)}
                                                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                                                title="Abrir enlace"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {referido.total_participants || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(referido.total_sales || 0, tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(referido.total_commission || 0, tenantCountry)}
                                        <div className="text-xs text-gray-500">
                                            ({(referido.commission_rate * 100).toFixed(1)}%)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleToggleActive(referido)}>
                                            <Badge variant={referido.is_active ? 'success' : 'danger'}>
                                                {referido.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setAssignmentsReferido(referido)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                title="Ver numeros asignados"
                                            >
                                                <Hash className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(referido)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(referido)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {referidos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500">No hay referidos registrados</div>
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-indigo-600 hover:text-[#600000] font-medium"
                        >
                            Crear tu primer referido
                        </button>
                    </div>
                )}
            </div>

            {/* Modal crear/editar */}
            <ReferidoModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                referido={editingReferido}
                onSuccess={() => {
                    setModalOpen(false)
                    loadReferidos()
                }}
            />

            {/* Modal asignaciones */}
            {assignmentsReferido && (
                <ReferidoAssignmentsModal
                    isOpen={!!assignmentsReferido}
                    onClose={() => setAssignmentsReferido(null)}
                    referido={assignmentsReferido}
                />
            )}
        </div>
    )
}
