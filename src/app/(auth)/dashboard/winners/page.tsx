'use client'
import React, { useState, useCallback } from 'react'
import { Trophy, Plus, RefreshCw, AlertCircle, Shuffle, Target, TrendingUp } from 'lucide-react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Pagination } from '../../components/participants/Pagination'
import { WinnerDetails } from '../../components/winners/WinnerDetails'
import { WinnersTable } from '../../components/winners/WinnersTable'
import { LuckySlotMachine } from '../../components/winners/LuckySlotMachine'
import { ManualWinnerForm } from '../../components/winners/ManualWinnerForm'
import { useWinners } from '../../hooks/useWinners'
import { WinnerWithDetails } from '../../services/winnersService'
import { getRaffleEntries } from '../../services/winnersService'

export default function WinnersPage() {
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
                    <div className="bg-sky-700 text-white p-2 rounded-full">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ganadores</h2>
                        <p className="text-gray-600">Gestión de ganadores y sorteos</p>
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
                        onClick={() => setManualFormOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Target className="h-4 w-4" />
                        Selección Manual
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Ganadores</p>
                            <p className="text-2xl font-semibold text-gray-900">{filteredWinners.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Premios Entregados</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {filteredWinners.filter(w => w.payment_status === 'PAID').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Rifas Activas</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {raffles.filter(r => r.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Valor Total Premios</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                ${filteredWinners.reduce((sum, w) => sum + (w.invoice_details?.total_price || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error.message}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por participante, email o número..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                        />
                    </div>

                    {/* Raffle Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Rifa
                        </label>
                        <select
                            title='Filtrar por Rifa'
                            value={raffleFilter}
                            onChange={(e) => setRaffleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                        >
                            <option value="">Todas las rifas</option>
                            {raffles.map((raffle) => (
                                <option key={raffle.id} value={raffle.id}>
                                    {raffle.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Raffle Selection for Wheel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rifa para Sorteo
                        </label>
                        <div className="flex gap-2">
                            <select
                                title='Seleccionar Rifa para Ruleta'
                                value={selectedRaffleForWheel}
                                onChange={(e) => setSelectedRaffleForWheel(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                            >
                                <option value="">Seleccionar rifa...</option>
                                {raffles.map((raffle) => (
                                    <option key={raffle.id} value={raffle.id}>
                                        {raffle.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {selectedRaffleForWheel && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleOpenWheel}
                            disabled={loading || !selectedRaffleForWheel}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
                        >
                            <Shuffle className="h-4 w-4" />
                            Maquina de la Suerte
                        </button>

                        <button
                            onClick={handleSelectRandomWinner}
                            disabled={updating || !selectedRaffleForWheel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            {updating ? 'Seleccionando...' : 'Ganador Aleatorio'}
                        </button>
                    </div>
                )}
            </div>

            {/* Selected Raffle Info */}
            {selectedRaffle && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-1">
                        Rifa Seleccionada: {selectedRaffle.title}
                    </h3>
                    <p className="text-sm text-blue-700">
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