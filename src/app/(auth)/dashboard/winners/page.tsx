'use client'
import React, { useState, useCallback } from 'react'
import { Trophy, Plus, RefreshCw, AlertCircle, Shuffle, Target, TrendingUp } from 'lucide-react'
import { Button, Input, Select } from '@/admin/components/ui'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Pagination } from '@/admin/components/participants/Pagination'
import { WinnerDetails } from '@/admin/components/winners/WinnerDetails'
import { WinnersTable } from '@/admin/components/winners/WinnersTable'
import { LuckySlotMachine } from '@/admin/components/winners/LuckySlotMachine'
import { ManualWinnerForm } from '@/admin/components/winners/ManualWinnerForm'
import { useWinners } from '@/admin/hooks/useWinners'
import { WinnerWithDetails } from '@/admin/services/winnersService'
import { getRaffleEntries } from '@/admin/services/winnersService'
import { useTenantContext } from '@/admin/contexts/TenantContext'
import { formatTenantCurrency } from '@/admin/utils/currency'

export default function WinnersPage() {
    const { tenantCountry } = useTenantContext()
    const [search, setSearch] = useState('')
    const [raffleFilter, setRaffleFilter] = useState('')
    const [selectedWinner, setSelectedWinner] = useState<WinnerWithDetails | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [winnerToRemove, setWinnerToRemove] = useState<string | null>(null)
    const [wheelOpen, setWheelOpen] = useState(false)
    const [manualFormOpen, setManualFormOpen] = useState(false)
    const [wheelEntries, setWheelEntries] = useState<any[]>([])
    const [selectedRaffleForWheel, setSelectedRaffleForWheel] = useState('')

    const {
        winners,
        filteredWinners,
        raffles,
        pagination,
        setPage,
        loading,
        error,
        updating,
        unmarkWinner,
        selectRandom,
        markAsWinner,
        refreshData
    } = useWinners(search, raffleFilter)

    const handleViewDetails = useCallback((winner: WinnerWithDetails) => {
        setSelectedWinner(winner)
        setDetailsOpen(true)
    }, [])

    const handleRemoveWinner = useCallback((winnerId: string) => {
        setWinnerToRemove(winnerId)
        setConfirmOpen(true)
    }, [])

    const confirmRemoveWinner = async () => {
        if (winnerToRemove) {
            try {
                await unmarkWinner(winnerToRemove)
                setConfirmOpen(false)
                setWinnerToRemove(null)
            } catch (error) {
                console.error('Error removing winner:', error)
            }
        }
    }

    const handleOpenWheel = async () => {
        if (!selectedRaffleForWheel) {
            alert('Por favor selecciona una rifa primero')
            return
        }

        try {
            const entries = await getRaffleEntries(selectedRaffleForWheel)
            const availableEntries = entries.filter((entry: any) => !entry.is_winner)

            if (availableEntries.length === 0) {
                alert('No hay números disponibles para esta rifa')
                return
            }

            setWheelEntries(availableEntries)
            setWheelOpen(true)
        } catch (error) {
            console.error('Error loading raffle entries:', error)
            alert('Error al cargar los números de la rifa')
        }
    }

    const handleWheelWinnerSelected = async (winner: any) => {
        try {
            await markAsWinner(winner.id)
            setWheelOpen(false)
            setWheelEntries([])
        } catch (error) {
            console.error('Error marking winner:', error)
            alert('Error al marcar el ganador')
        }
    }

    const handleManualWinnerSubmit = async (raffleId: string, number: string) => {
        try {
            // Encontrar la entrada por número
            const entries = await getRaffleEntries(raffleId)
            const entry = entries.find((e: any) => e.number === number && !e.is_winner)

            if (!entry) {
                alert('Número no encontrado o ya es ganador')
                return
            }

            await markAsWinner(entry.id)
            setManualFormOpen(false)
        } catch (error) {
            console.error('Error setting manual winner:', error)
            alert('Error al establecer el ganador manual')
        }
    }

    const handleSelectRandomWinner = async () => {
        if (!selectedRaffleForWheel) {
            alert('Por favor selecciona una rifa primero')
            return
        }

        try {
            await selectRandom(selectedRaffleForWheel)
            alert('¡Ganador seleccionado exitosamente!')
        } catch (error) {
            console.error('Error selecting random winner:', error)
            alert(error instanceof Error ? error.message : 'Error al seleccionar ganador aleatorio')
        }
    }

    const selectedRaffle = raffles.find(r => r.id === raffleFilter)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white p-2 rounded-full">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ganadores</h2>
                        <p className="text-gray-600 dark:text-gray-400">Gestión de ganadores y sorteos</p>
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
                        onClick={() => setManualFormOpen(true)}
                        icon={<Target className="h-4 w-4" />}
                    >
                        Selección Manual
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ganadores</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{filteredWinners.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premios Entregados</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {filteredWinners.filter(w => w.payment_status === 'PAID').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rifas Activas</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {raffles.filter(r => r.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total Premios</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                {formatTenantCurrency(filteredWinners.reduce((sum, w) => sum + (w.invoice_details?.total_price || 0), 0), tenantCountry)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-400">{error.message}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <Input
                        label="Buscar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por participante, email o número..."
                    />

                    {/* Raffle Filter */}
                    <Select
                        label="Filtrar por Rifa"
                        title="Filtrar por Rifa"
                        value={raffleFilter}
                        onChange={(e) => setRaffleFilter(e.target.value)}
                    >
                        <option value="">Todas las rifas</option>
                        {raffles.map((raffle) => (
                            <option key={raffle.id} value={raffle.id}>
                                {raffle.title}
                            </option>
                        ))}
                    </Select>

                    {/* Raffle Selection for Wheel */}
                    <Select
                        label="Rifa para Sorteo"
                        title="Seleccionar Rifa para Ruleta"
                        value={selectedRaffleForWheel}
                        onChange={(e) => setSelectedRaffleForWheel(e.target.value)}
                    >
                        <option value="">Seleccionar rifa...</option>
                        {raffles.map((raffle) => (
                            <option key={raffle.id} value={raffle.id}>
                                {raffle.title}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Action Buttons */}
                {selectedRaffleForWheel && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={handleOpenWheel}
                            disabled={loading || !selectedRaffleForWheel}
                            icon={<Shuffle className="h-4 w-4" />}
                        >
                            Maquina de la Suerte
                        </Button>

                        <Button
                            variant="success"
                            onClick={handleSelectRandomWinner}
                            disabled={updating || !selectedRaffleForWheel}
                            icon={<Plus className="h-4 w-4" />}
                        >
                            {updating ? 'Seleccionando...' : 'Ganador Aleatorio'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Selected Raffle Info */}
            {selectedRaffle && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                        Rifa Seleccionada: {selectedRaffle.title}
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400">
                        Fecha de sorteo: {new Date(selectedRaffle.draw_date).toLocaleDateString('es-ES')} •
                        Estado: {selectedRaffle.status}
                    </p>
                </div>
            )}

            {/* Table */}
            <WinnersTable
                winners={winners}
                loading={loading}
                onViewDetails={handleViewDetails}
                onRemoveWinner={handleRemoveWinner}
                updating={updating}
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
            <WinnerDetails
                isOpen={detailsOpen}
                onClose={() => {
                    setDetailsOpen(false)
                    setSelectedWinner(null)
                }}
                winner={selectedWinner}
            />

            <LuckySlotMachine
                isOpen={wheelOpen}
                onClose={() => {
                    setWheelOpen(false)
                    setWheelEntries([])
                }}
                entries={wheelEntries}
                onWinnerSelected={handleWheelWinnerSelected}
                raffleTitle={raffles.find(r => r.id === selectedRaffleForWheel)?.title || ''}
                loading={updating}
            />

            <ManualWinnerForm
                isOpen={manualFormOpen}
                onClose={() => setManualFormOpen(false)}
                raffles={raffles}
                onSubmit={handleManualWinnerSubmit}
                loading={updating}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false)
                    setWinnerToRemove(null)
                }}
                onConfirm={confirmRemoveWinner}
                title="Remover Ganador"
                message="¿Estás seguro de que quieres remover a este participante como ganador? Esta acción se puede revertir."
                confirmText="Sí, remover"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    )
}