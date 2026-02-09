// src/app/blessed-numbers/page.tsx - MIGRACIÓN MULTI-TENANT
'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Plus, Trash2, RefreshCw, AlertCircle, User, Trophy } from 'lucide-react'
import { ITEMS_PER_PAGE, useBlessedNumbers } from '@/admin/hooks/useBlessedNumbers'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Modal, Input, Select, Checkbox, Button, Badge } from '@/admin/components/ui'

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
                    <div className="bg-indigo-700 text-white p-2 rounded-full">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Números Bendecidos</h2>
                        <p className="text-gray-600 dark:text-gray-400">Control de premios asignados y ganadores</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={refreshData}
                        disabled={loading}
                        icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                    >
                        Actualizar
                    </Button>

                    <Button
                        onClick={() => setCreateFormOpen(true)}
                        disabled={!selectedRaffle || creating}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Crear Números
                    </Button>
                </div>
            </div>

            {/* Selector de Rifas y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Select
                        label="Seleccionar Rifa"
                        value={selectedRaffleId}
                        onChange={(e) => changeRaffle(e.target.value)}
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
                    </Select>
                </div>

                <div className="flex-1">
                    <Input
                        label="Buscar"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por número, nombre o email"
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Fecha de sorteo:</span> {new Date(selectedRaffle.draw_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Total de números:</span> {selectedRaffle.total_numbers.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Números bendecidos:</span> {filteredBlessed.length}
                                </p>
                            </div>
                        </div>
                        {selectedRaffle.is_active && (
                            <Badge variant="success">ACTIVA</Badge>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Número</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Participante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo de Premio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reclamado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    {item.name || (
                                                        <span className="text-gray-400 italic">Sin asignar</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{item.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={item.is_minor_prize ? 'warning' : 'success'}>
                                                    {item.is_minor_prize ? 'Premio Menor' : 'Premio Mayor'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    title='Marcar como reclamado'
                                                    type="checkbox"
                                                    checked={item.is_claimed}
                                                    onChange={() => handleToggleClaimed(item.id)}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                        disabled={pagination.page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="px-2">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(Math.min(pagination.page + 1, pagination.totalPages))}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}

            {/* Create Form Modal */}
            <Modal
                isOpen={createFormOpen && !!selectedRaffle}
                onClose={() => setCreateFormOpen(false)}
                title="Crear Números Bendecidos"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCreateFormOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateNew}
                            disabled={creating || !createFormData.quantity || createFormData.quantity < 1}
                            loading={creating}
                        >
                            {creating ? 'Creando...' : `Crear ${createFormData.quantity} números`}
                        </Button>
                    </>
                }
            >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-medium">Rifa: {selectedRaffle?.title}</p>
                    <p className="text-xs text-blue-700">Se crearán números para esta rifa</p>
                </div>

                <div className="space-y-4">
                    <Input
                        label="Cantidad de números a crear"
                        type="number"
                        min={1}
                        max={100}
                        placeholder="Ingrese la cantidad"
                        value={createFormData.quantity}
                        onChange={(e) => setCreateFormData(prev => ({
                            ...prev,
                            quantity: parseInt(e.target.value) || 1
                        }))}
                    />

                    <Checkbox
                        label="¿Son premios menores?"
                        checked={createFormData.is_minor_prize}
                        onChange={(e) => setCreateFormData(prev => ({
                            ...prev,
                            is_minor_prize: e.target.checked
                        }))}
                    />

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                            Se crearán {createFormData.quantity} números aleatorios como{' '}
                            <strong>{createFormData.is_minor_prize ? 'premios menores' : 'premios mayores'}</strong>.
                            Los participantes se asignarán después.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Assign Participant Modal */}
            <Modal
                isOpen={assignFormOpen}
                onClose={() => setAssignFormOpen(false)}
                title="Asignar Participante"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAssignFormOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAssignSubmit}>
                            Asignar
                        </Button>
                    </>
                }
            >
                <Select
                    label="Seleccionar participante"
                    value={assignFormData.participantId}
                    onChange={(e) => setAssignFormData(prev => ({
                        ...prev,
                        participantId: e.target.value
                    }))}
                >
                    <option value="">Sin asignar</option>
                    {participants.map((participant) => (
                        <option key={participant.id} value={participant.id}>
                            {participant.name} ({participant.email})
                        </option>
                    ))}
                </Select>
            </Modal>

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
