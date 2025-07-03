'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Plus, Trash2, RefreshCw, AlertCircle, User, Edit } from 'lucide-react'
import { ITEMS_PER_PAGE, useBlessedNumbers } from '../../hooks/useBlessedNumbers'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CreateBlessedNumberData } from '../../services/blessedService'

export default function BlessedNumbersPage() {
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<'claim' | 'delete'>('claim')
    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [assignFormOpen, setAssignFormOpen] = useState(false)
    const [createFormData, setCreateFormData] = useState<CreateBlessedNumberData>({
        is_minor_prize: false,
        quantity: 1
    })
    const [assignFormData, setAssignFormData] = useState({
        numberId: '',
        participantId: ''
    })

    const {
        paginatedBlessed,
        filteredBlessed,
        pagination,
        setPage,
        toggleClaimed,
        loading,
        error,
        activeRaffle,
        creating,
        deleting,
        createNew,
        deleteNumber,
        assignParticipant,
        participants,
        refreshData
    } = useBlessedNumbers(search)

    const handleToggleClaimed = useCallback((id: string) => {
        setSelectedId(id)
        setConfirmAction('claim')
        setConfirmOpen(true)
    }, [])

    const handleDeleteNumber = useCallback((id: string) => {
        setSelectedId(id)
        setConfirmAction('delete')
        setConfirmOpen(true)
    }, [])

    const handleAssignParticipant = useCallback((id: string) => {
        setAssignFormData({ numberId: id, participantId: '' })
        setAssignFormOpen(true)
    }, [])

    const confirmToggle = async () => {
        if (selectedId) {
            if (confirmAction === 'claim') {
                await toggleClaimed(selectedId)
            } else if (confirmAction === 'delete') {
                await deleteNumber(selectedId)
            }
        }
        setConfirmOpen(false)
        setSelectedId(null)
    }

    const handleCreateNew = async () => {
        try {
            await createNew(createFormData)
            setCreateFormOpen(false)
            setCreateFormData({
                is_minor_prize: false,
                quantity: 1
            })
        } catch (error) {
            console.error('Error creating blessed numbers:', error)
        }
    }

    const handleAssignSubmit = async () => {
        try {
            await assignParticipant(
                assignFormData.numberId,
                assignFormData.participantId || null
            )
            setAssignFormOpen(false)
            setAssignFormData({ numberId: '', participantId: '' })
        } catch (error) {
            console.error('Error assigning participant:', error)
        }
    }

    const getConfirmMessage = () => {
        if (confirmAction === 'claim') {
            return "¿Estás seguro de marcar este número como reclamado/no reclamado?"
        } else {
            return "¿Estás seguro de eliminar este número bendecido? Esta acción no se puede deshacer."
        }
    }

    const getConfirmTitle = () => {
        if (confirmAction === 'claim') {
            return "Cambiar estado de premio"
        } else {
            return "Eliminar número bendecido"
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-[#800000] text-white p-2 rounded-full">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Números Bendecidos</h2>
                        <p className="text-gray-600">Control de premios asignados y ganadores</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>

                    <button
                        onClick={() => setCreateFormOpen(true)}
                        disabled={!activeRaffle || creating}
                        className="flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Crear Números
                    </button>
                </div>
            </div>

            {/* Active Raffle Info */}
            {activeRaffle && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800">Rifa Activa</h3>
                    <p className="text-green-700">{activeRaffle.title}</p>
                    <p className="text-sm text-green-600">
                        Fecha: {new Date(activeRaffle.draw_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-600">
                        Total de números: {activeRaffle.total_numbers}
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error.message}</p>
                </div>
            )}

            {/* Search */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, nombre o email"
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#800000] focus:border-[#800000] transition"
            />

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premio Menor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reclamado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(6)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedBlessed.length > 0 ? (
                                paginatedBlessed.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {item.name || (
                                                    <span className="text-gray-400 italic">Sin asignar</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.is_minor_prize
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {item.is_minor_prize ? 'Premio Menor' : 'Premio Mayor'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                placeholder='Reclamado'
                                                type="checkbox"
                                                checked={item.is_claimed}
                                                onChange={() => handleToggleClaimed(item.id)}
                                                className="h-4 w-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000]"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAssignParticipant(item.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Asignar participante"
                                                >
                                                    <User className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNumber(item.id)}
                                                    disabled={deleting}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    title="Eliminar número"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredBlessed.length > ITEMS_PER_PAGE && (
                <div className="flex justify-end items-center space-x-2 mt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <span className="px-2">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Create Form Modal */}
            {createFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Crear Números Bendecidos</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad de números a crear
                                </label>
                                <input
                                    placeholder='Cantidad de números'
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={createFormData.quantity}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        quantity: parseInt(e.target.value) || 1
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#800000] focus:border-[#800000]"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_minor_prize"
                                    checked={createFormData.is_minor_prize}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        is_minor_prize: e.target.checked
                                    }))}
                                    className="h-4 w-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000]"
                                />
                                <label htmlFor="is_minor_prize" className="ml-2 text-sm text-gray-700">
                                    ¿Son premios menores?
                                </label>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    Se crearán {createFormData.quantity} números aleatorios como{' '}
                                    <strong>{createFormData.is_minor_prize ? 'premios menores' : 'premios mayores'}</strong>.
                                    Los participantes se asignarán después.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setCreateFormOpen(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateNew}
                                disabled={creating || !createFormData.quantity || createFormData.quantity < 1}
                                className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
                            >
                                {creating ? 'Creando...' : `Crear ${createFormData.quantity} números`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Participant Modal */}
            {assignFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Asignar Participante</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar participante
                                </label>
                                <select
                                    title='Seleccionar participante'
                                    value={assignFormData.participantId}
                                    onChange={(e) => setAssignFormData(prev => ({
                                        ...prev,
                                        participantId: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#800000] focus:border-[#800000]"
                                >
                                    <option value="">Sin asignar</option>
                                    {participants.map((participant) => (
                                        <option key={participant.id} value={participant.id}>
                                            {participant.name} ({participant.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setAssignFormOpen(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAssignSubmit}
                                className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#900000]"
                            >
                                Asignar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmToggle}
                message={getConfirmMessage()}
                title={getConfirmTitle()}
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    )
}