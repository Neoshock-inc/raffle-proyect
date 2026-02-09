// src/app/participants/page.tsx - MIGRACIÓN MULTI-TENANT
'use client'
import React, { useState, useCallback } from 'react'
import { Users, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { Button, Input } from '@/admin/components/ui'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Pagination } from '@/admin/components/participants/Pagination'
import { ParticipantDetails } from '@/admin/components/participants/ParticipantDetails'
import { ParticipantForm } from '@/admin/components/participants/ParticipantForm'
import { ParticipantTable } from '@/admin/components/participants/ParticipantTable'
import { useParticipants } from '@/admin/hooks/useParticipants'
import { ParticipantWithStats } from '@/admin/services/participantsService'

export default function ParticipantesPage() {
    const [search, setSearch] = useState('')
    const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithStats | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)

    const {
        paginatedParticipants,
        filteredParticipants,
        pagination,
        setPage,
        loading,
        error,
        creating,
        updating,
        deleting,
        createNew,
        updateExisting,
        deleteExisting,
        refreshData
    } = useParticipants(search)

    const handleCreateNew = useCallback(() => {
        setSelectedParticipant(null)
        setFormOpen(true)
    }, [])

    const handleEdit = useCallback((participant: ParticipantWithStats) => {
        setSelectedParticipant(participant)
        setFormOpen(true)
    }, [])

    const handleDelete = useCallback((id: string) => {
        setParticipantToDelete(id)
        setConfirmOpen(true)
    }, [])

    const handleViewDetails = useCallback((participant: ParticipantWithStats) => {
        setSelectedParticipant(participant)
        setDetailsOpen(true)
    }, [])

    const confirmDelete = async () => {
        if (participantToDelete) {
            try {
                await deleteExisting(participantToDelete)
                setConfirmOpen(false)
                setParticipantToDelete(null)
            } catch (error) {
                console.error('Error deleting participant:', error)
            }
        }
    }

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedParticipant) {
                // CAMBIO: Usar nueva signature sin el ID separado
                await updateExisting(selectedParticipant.id, data)
            } else {
                await createNew(data)
            }
            setFormOpen(false)
            setSelectedParticipant(null)
        } catch (error) {
            console.error('Error saving participant:', error)
            throw error
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white p-2 rounded-full">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Participantes</h2>
                        <p className="text-gray-600 dark:text-gray-400">Gestión de participantes y estadísticas</p>
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
                        onClick={handleCreateNew}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Nuevo Participante
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Participantes</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{filteredParticipants.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Con Compras</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {filteredParticipants.filter(p => p.total_numbers > 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Users className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Con Facturas Pendientes</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {filteredParticipants.filter(p => p.pending_invoices > 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Totales</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                ${filteredParticipants.reduce((sum, p) => sum + p.total_amount_spent, 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Search */}
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="max-w-md"
            />

            {/* Table */}
            <ParticipantTable
                participants={paginatedParticipants}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
            />

            {/* Pagination */}
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
            />

            {/* Modals */}
            <ParticipantForm
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false)
                    setSelectedParticipant(null)
                }}
                onSubmit={handleFormSubmit}
                participant={selectedParticipant}
                loading={creating || updating}
            />

            <ParticipantDetails
                isOpen={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false)
                    setSelectedParticipant(null)
                }}
                participant={selectedParticipant}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false)
                    setParticipantToDelete(null)
                }}
                onConfirm={confirmDelete}
                title="Eliminar Participante"
                message="¿Estás seguro de que quieres eliminar este participante? Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    )
}