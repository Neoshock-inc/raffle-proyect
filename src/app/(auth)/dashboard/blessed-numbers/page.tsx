// src/app/blessed-numbers/page.tsx - MIGRACIÓN MULTI-TENANT
'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Plus, Trash2, RefreshCw, AlertCircle, User, Trophy } from 'lucide-react'
import { ITEMS_PER_PAGE, useBlessedNumbers } from '@/admin/hooks/useBlessedNumbers'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'

export default function BlessedNumbersPage() {
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<'claim' | 'delete'>('claim')
    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [assignFormOpen, setAssignFormOpen] = useState(false)
    const [createFormData, setCreateFormData] = useState({
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
        raffles,
        selectedRaffleId,
        selectedRaffle,
        changeRaffle,
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
                    <div className="bg-sky-700 text-white p-2 rounded-full">
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
                        disabled={!selectedRaffle || creating}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        Crear Números
                    </button>
                </div>
            </div>

            {/* Selector de Rifas y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Selector de Rifa */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Rifa
                    </label>
                    <div className="flex gap-2">
                        <select
                            title='Seleccionar Rifa'
                            value={selectedRaffleId}
                            onChange={(e) => changeRaffle(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                            disabled={loading || raffles.length === 0}
                        >
                            {raffles.length === 0 ? (
                                <option value="">No hay rifas disponibles</option>
                            ) : (
                                raffles.map((raffle) => (
                                    <option key={raffle.id} value={raffle.id}>
                                        {raffle.title} - {new Date(raffle.draw_date).toLocaleDateString()}
                                        {raffle.is_active && ' (Activa)'}
                                    </option>
                                ))
                            )}
                        </select>
                        <Trophy className="h-5 w-5 text-sky-700 self-center" />
                    </div>
                </div>

                {/* Búsqueda */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por número, nombre o email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                    />
                </div>
            </div>

            {/* Información de la Rifa Seleccionada */}
            {selectedRaffle && (
                <div className={`border rounded-lg p-4 ${selectedRaffle.is_active
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`font-semibold ${selectedRaffle.is_active ? 'text-green-800' : 'text-gray-800'
                                }`}>
                                {selectedRaffle.is_active ? 'Rifa Activa' : 'Rifa'}
                            </h3>
                            <p className={selectedRaffle.is_active ? 'text-green-700' : 'text-gray-700'}>
                                {selectedRaffle.title}
                            </p>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Fecha de sorteo:</span> {new Date(selectedRaffle.draw_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Total de números:</span> {selectedRaffle.total_numbers.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Números bendecidos:</span> {filteredBlessed.length}
                                </p>
                            </div>
                        </div>
                        {selectedRaffle.is_active && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                ACTIVA
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Mensaje si no hay rifa seleccionada */}
            {!selectedRaffleId && raffles.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">Por favor selecciona una rifa para ver los números bendecidos</p>
                </div>
            )}

            {/* Table */}
            {selectedRaffleId && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Premio</th>
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
                                                    title='Marcar como reclamado'
                                                    type="checkbox"
                                                    checked={item.is_claimed}
                                                    onChange={() => handleToggleClaimed(item.id)}
                                                    className="h-4 w-4 text-sky-700 border-gray-300 rounded focus:ring-sky-700"
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
                                            No se encontraron números bendecidos para esta rifa
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {selectedRaffleId && filteredBlessed.length > ITEMS_PER_PAGE && (
                <div className="flex justify-end items-center space-x-2 mt-2">
                    <button
                        onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <span className="px-2">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(pagination.page + 1, pagination.totalPages))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Create Form Modal */}
            {createFormOpen && selectedRaffle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Crear Números Bendecidos</h3>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800 font-medium">Rifa: {selectedRaffle.title}</p>
                            <p className="text-xs text-blue-700">Se crearán números para esta rifa</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad de números a crear
                                </label>
                                <input
                                    title="Cantidad de números a crear"
                                    placeholder="Ingrese la cantidad"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={createFormData.quantity}
                                    onChange={(e) => setCreateFormData(prev => ({
                                        ...prev,
                                        quantity: parseInt(e.target.value) || 1
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-700 focus:border-sky-700"
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
                                    className="h-4 w-4 text-sky-700 border-gray-300 rounded focus:ring-sky-700"
                                />
                                <label htmlFor="is_minor_prize" className="ml-2 text-sm text-gray-700">
                                    ¿Son premios menores?
                                </label>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
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
                                className="px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
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
                                    title="Seleccionar participante"
                                    value={assignFormData.participantId}
                                    onChange={(e) => setAssignFormData(prev => ({
                                        ...prev,
                                        participantId: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-700 focus:border-sky-700"
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
                                className="px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000]"
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