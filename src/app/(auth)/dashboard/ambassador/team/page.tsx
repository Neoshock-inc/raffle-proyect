'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    Plus, Edit, Trash2, Users, UserCheck, DollarSign, Loader2, RefreshCw, X
} from 'lucide-react'
import { useAmbassadorTeam } from '@/admin/hooks/useAmbassadorTeam'
import {
    createReferido,
    updateReferido,
    deleteReferido,
    toggleReferidoStatus,
} from '@/admin/services/referidoService'
import type { ReferidoInput } from '@/admin/services/referidoService'
import { Badge } from '@/admin/components/ui'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

interface TeamMember {
    id: string
    name: string
    referral_code: string
    email?: string
    phone?: string
    is_active: boolean
    commission_rate: number
    total_sales?: number
    total_participants?: number
    total_commission?: number
}

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    referral_code: '',
    commission_rate: 10,
    is_active: true,
}

export default function AmbassadorTeamPage() {
    const { tenantCountry } = useTenantContext()
    const { userId, team, stats, loading, refreshData } = useAmbassadorTeam()
    const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [formData, setFormData] = useState(emptyForm)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    // Load ambassador ID from user ID
    useEffect(() => {
        if (userId) {
            import('@supabase/supabase-js').then(({ createClient }) => {
                const sb = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )
                sb.from('ambassadors')
                    .select('id')
                    .eq('user_id', userId)
                    .single()
                    .then(({ data }) => {
                        if (data) setAmbassadorId(data.id)
                    })
            })
        }
    }, [userId])

    const openCreate = () => {
        setEditingMember(null)
        setFormData(emptyForm)
        setFormErrors({})
        setModalOpen(true)
    }

    const openEdit = (member: TeamMember) => {
        setEditingMember(member)
        setFormData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            referral_code: member.referral_code || '',
            commission_rate: (member.commission_rate || 0.1) * 100,
            is_active: member.is_active ?? true,
        })
        setFormErrors({})
        setModalOpen(true)
    }

    const generateCode = () => {
        const name = formData.name.trim()
        if (!name) {
            toast.error('Ingresa un nombre primero')
            return
        }
        const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 5)
        const randomPart = Array.from({ length: 10 }, () =>
            Math.random().toString(36)[2].toUpperCase()
        ).join('')
        const code = (cleanName + randomPart).substring(0, 20)
        setFormData((prev) => ({ ...prev, referral_code: code }))
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = 'El nombre es obligatorio'
        else if (formData.name.length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres'
        else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/i.test(formData.name)) errors.name = 'Solo letras y espacios'

        if (!formData.referral_code.trim()) errors.referral_code = 'El codigo es obligatorio'
        else if (formData.referral_code.length < 3) errors.referral_code = 'Minimo 3 caracteres'

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email no valido'
        if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) errors.phone = 'Telefono no valido'
        if (formData.commission_rate < 0 || formData.commission_rate > 100) errors.commission_rate = 'Entre 0% y 100%'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        if (!ambassadorId) {
            toast.error('No se pudo identificar tu cuenta de embajador')
            return
        }

        setSaving(true)
        try {
            const input: ReferidoInput = {
                name: formData.name.trim(),
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                referral_code: formData.referral_code.toUpperCase(),
                commission_rate: formData.commission_rate / 100,
                is_active: formData.is_active,
                ambassador_id: ambassadorId,
            }

            if (editingMember) {
                await updateReferido(editingMember.id, input)
                toast.success('Referido actualizado correctamente')
            } else {
                await createReferido(input)
                toast.success('Referido creado correctamente')
            }

            setModalOpen(false)
            refreshData()
        } catch (error: any) {
            if (error.message === 'duplicate_referral_code') {
                setFormErrors({ referral_code: 'Este codigo ya existe' })
            } else if (error.message === 'email_already_exists') {
                setFormErrors({ email: 'Este email ya esta registrado' })
            } else {
                toast.error(error.message || 'Error al guardar referido')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (member: TeamMember) => {
        if (!confirm(`Estas seguro de eliminar a "${member.name}"?`)) return
        try {
            await deleteReferido(member.id)
            toast.success('Referido eliminado correctamente')
            refreshData()
        } catch {
            toast.error('Error al eliminar referido')
        }
    }

    const handleToggleStatus = async (member: TeamMember) => {
        if (!confirm(`Deseas ${member.is_active ? 'desactivar' : 'activar'} a "${member.name}"?`)) return
        try {
            await toggleReferidoStatus(member.id, member.is_active)
            toast.success(`Referido "${member.name}" ${member.is_active ? 'desactivado' : 'activado'}`)
            refreshData()
        } catch {
            toast.error('Error al cambiar estado')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando equipo...</p>
                </div>
            </div>
        )
    }

    const activeCount = team.filter((m: TeamMember) => m.is_active).length
    const totalTeamSales = team.reduce((sum: number, m: TeamMember) => sum + (m.total_sales || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Equipo</h2>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona los referidos de tu equipo</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refreshData()}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Actualizar
                    </button>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Nuevo Referido
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 mr-4">
                            <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{team.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Referidos</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 mr-4">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-4">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(totalTeamSales, tenantCountry)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Ventas Equipo</div>
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
                                {['Nombre', 'Codigo', 'Email', 'Ventas', 'Participantes', 'Comision', 'Estado', 'Acciones'].map((h) => (
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
                            {team.map((member: TeamMember) => (
                                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {member.name}
                                        </div>
                                        {member.phone && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{member.phone}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                            {member.referral_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {member.email || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(member.total_sales || 0, tenantCountry)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {member.total_participants || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {formatTenantCurrency(member.total_commission || 0, tenantCountry)}
                                        <div className="text-xs text-gray-500">
                                            ({((member.commission_rate || 0) * 100).toFixed(1)}%)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleToggleStatus(member)}>
                                            <Badge variant={member.is_active ? 'success' : 'danger'}>
                                                {member.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEdit(member)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member)}
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

                {team.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay referidos en tu equipo</p>
                        <button
                            onClick={openCreate}
                            className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Agregar tu primer referido
                        </button>
                    </div>
                )}
            </div>

            {/* Inline Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setModalOpen(false)} />
                        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {editingMember ? 'Editar Referido' : 'Nuevo Referido'}
                                </h3>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Nombre del referido"
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="email@ejemplo.com"
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Telefono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="+593 99 999 9999"
                                    />
                                    {formErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phone}</p>
                                    )}
                                </div>

                                {/* Referral Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Codigo de Referido <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <input
                                            type="text"
                                            value={formData.referral_code}
                                            onChange={(e) =>
                                                setFormData((p) => ({ ...p, referral_code: e.target.value.toUpperCase() }))
                                            }
                                            className={`w-full px-3 py-2 border rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${formErrors.referral_code ? 'border-red-300' : 'border-gray-300'}`}
                                            placeholder="CODIGO2025"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCode}
                                            className="inline-flex items-center px-4 py-2 border border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-medium text-sm bg-white dark:bg-gray-700 rounded-r-lg hover:bg-amber-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            Generar
                                        </button>
                                    </div>
                                    {formErrors.referral_code && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.referral_code}</p>
                                    )}
                                </div>

                                {/* Commission Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Comision (%)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        value={formData.commission_rate}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, commission_rate: parseFloat(e.target.value) || 0 }))
                                        }
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${formErrors.commission_rate ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {formErrors.commission_rate && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.commission_rate}</p>
                                    )}
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Referido activo
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {editingMember ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
