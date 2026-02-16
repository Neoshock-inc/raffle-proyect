// src/app/(auth)/dashboard/ambassadors/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Crown, Users, DollarSign, TrendingUp, Hash, Pencil, Trash2, Eye, EyeOff, Copy, ExternalLink, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
    getAmbassadors,
    deleteAmbassador,
    toggleAmbassadorStatus,
    setTenantContext,
} from '@/admin/services/ambassadorService'
import type { Ambassador } from '@/admin/types/ambassador'
import { buildReferralLink } from '@/admin/utils/tenantUrl'
import AmbassadorModal from '@/admin/components/AmbassadorModal'
import AmbassadorAssignmentsModal from '@/admin/components/AmbassadorAssignmentsModal'
import AmbassadorTeamModal from '@/admin/components/AmbassadorTeamModal'
import { Button, Badge } from '@/admin/components/ui'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

export default function AmbassadorsPage() {
    const { currentTenant, tenantCountry } = useTenantContext()
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(null)
    const [assignmentsAmbassador, setAssignmentsAmbassador] = useState<Ambassador | null>(null)
    const [teamAmbassador, setTeamAmbassador] = useState<Ambassador | null>(null)

    useEffect(() => {
        if (currentTenant) {
            setTenantContext(currentTenant.id, true)
            loadAmbassadors()
        }
    }, [currentTenant])

    const loadAmbassadors = async () => {
        try {
            setLoading(true)
            const data = await getAmbassadors()
            setAmbassadors(data)
        } catch (error) {
            toast.error('Error al cargar los embajadores')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingAmbassador(null)
        setModalOpen(true)
    }

    const handleEdit = (ambassador: Ambassador) => {
        setEditingAmbassador(ambassador)
        setModalOpen(true)
    }

    const handleDelete = async (ambassador: Ambassador) => {
        if (!confirm(`¿Estás seguro de eliminar el embajador "${ambassador.name}"?`)) return

        try {
            await deleteAmbassador(ambassador.id)
            toast.success('Embajador eliminado correctamente')
            loadAmbassadors()
        } catch (error) {
            console.log('Error deleting ambassador:', error)
            toast.error('Error al eliminar embajador')
        }
    }

    const handleToggleActive = async (ambassador: Ambassador) => {
        try {
            if (!confirm(`¿Estás seguro de ${ambassador.is_active ? 'desactivar' : 'activar'} el embajador "${ambassador.name}"?`)) return
            await toggleAmbassadorStatus(ambassador.id, ambassador.is_active)
            toast.success(`Embajador "${ambassador.name}" ${ambassador.is_active ? 'desactivado' : 'activado'} correctamente`)
            loadAmbassadors()
        } catch (error) {
            console.log('Error toggling ambassador status:', error)
            toast.error('Error al cambiar estado del embajador')
        }
    }

    const copyAmbassadorLink = async (code: string) => {
        try {
            const link = await buildReferralLink(code)
            await navigator.clipboard.writeText(link)
            toast.success('Enlace copiado al portapapeles')
        } catch (error) {
            console.error('Error copying ambassador link:', error)
            toast.error('Error al copiar enlace')
        }
    }

    const openAmbassadorLink = async (code: string) => {
        try {
            const link = await buildReferralLink(code)
            window.open(link, '_blank')
        } catch (error) {
            console.error('Error opening ambassador link:', error)
            toast.error('Error al abrir enlace')
        }
    }

    // Computed stats
    const totalAmbassadors = ambassadors.length
    const totalTeamSales = ambassadors.reduce((sum, a) => sum + (a.total_team_sales || 0), 0)
    const totalTeamMembers = ambassadors.reduce((sum, a) => sum + (a.team_count || 0), 0)
    const totalCommissions = ambassadors.reduce(
        (sum, a) => sum + (a.total_personal_commission || 0) + (a.total_team_commission || 0),
        0
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-24"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-96 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAmbassadors}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Embajadores</div>
                        </div>
                        <Crown className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-600">
                                {formatTenantCurrency(totalTeamSales, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Ventas Equipo Total</div>
                        </div>
                        <DollarSign className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-600">{totalTeamMembers}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Miembros Equipo Total</div>
                        </div>
                        <Users className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-600">
                                {formatTenantCurrency(totalCommissions, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Comisiones Totales</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Embajadores</h2>
                    <p className="text-gray-600 dark:text-gray-400">Administra tus embajadores, equipos y comisiones</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="secondary"
                        onClick={loadAmbassadors}
                        icon={<RefreshCw className="h-4 w-4" />}
                    >
                        Actualizar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Nuevo Embajador
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Equipo
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
                            {ambassadors.map((ambassador) => (
                                <tr key={ambassador.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {ambassador.name}
                                            </div>
                                            {ambassador.email && (
                                                <div className="text-sm text-gray-500">
                                                    {ambassador.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-mono bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                                                {ambassador.ambassador_code}
                                            </span>
                                            <button
                                                onClick={() => copyAmbassadorLink(ambassador.ambassador_code)}
                                                className="text-gray-400 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                                                title="Copiar enlace"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openAmbassadorLink(ambassador.ambassador_code)}
                                                className="text-gray-400 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                                                title="Abrir enlace"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-amber-500" />
                                            {ambassador.team_count || 0} referidos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(ambassador.total_team_sales || 0, tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <div>
                                            {formatTenantCurrency(
                                                (ambassador.total_personal_commission || 0) + (ambassador.total_team_commission || 0),
                                                tenantCountry
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Personal: {(ambassador.commission_rate * 100).toFixed(1)}% | Equipo: {(ambassador.team_commission_rate * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleToggleActive(ambassador)}>
                                            <Badge variant={ambassador.is_active ? 'success' : 'danger'}>
                                                {ambassador.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setTeamAmbassador(ambassador)}
                                                className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                                                title="Ver equipo"
                                            >
                                                <Users className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setAssignmentsAmbassador(ambassador)}
                                                className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                                                title="Ver números asignados"
                                            >
                                                <Hash className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(ambassador)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Editar"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => copyAmbassadorLink(ambassador.ambassador_code)}
                                                className="text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                                                title="Copiar enlace"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(ambassador)}
                                                className="text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                                                title={ambassador.is_active ? 'Desactivar' : 'Activar'}
                                            >
                                                {ambassador.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ambassador)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

                {ambassadors.length === 0 && (
                    <div className="text-center py-12">
                        <Crown className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <div className="text-gray-500 dark:text-gray-400">No hay embajadores registrados</div>
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                        >
                            Crear tu primer embajador
                        </button>
                    </div>
                )}
            </div>

            {/* Modal crear/editar */}
            <AmbassadorModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                ambassador={editingAmbassador}
                onSuccess={() => {
                    setModalOpen(false)
                    loadAmbassadors()
                }}
            />

            {/* Modal asignaciones */}
            {assignmentsAmbassador && (
                <AmbassadorAssignmentsModal
                    isOpen={!!assignmentsAmbassador}
                    onClose={() => setAssignmentsAmbassador(null)}
                    ambassador={assignmentsAmbassador}
                />
            )}

            {/* Modal equipo */}
            {teamAmbassador && (
                <AmbassadorTeamModal
                    isOpen={!!teamAmbassador}
                    onClose={() => setTeamAmbassador(null)}
                    ambassador={teamAmbassador}
                />
            )}
        </div>
    )
}
