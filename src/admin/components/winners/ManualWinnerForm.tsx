import React, { useState, useEffect } from 'react'
import { Search, Trophy } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'

interface ManualWinnerFormProps {
    isOpen: boolean
    onClose: () => void
    raffles: Array<{
        id: string
        title: string
        draw_date: string
        status: string
    }>
    onSubmit: (raffleId: string, number: string) => void
    loading: boolean
}

export function ManualWinnerForm({
    isOpen,
    onClose,
    raffles,
    onSubmit,
    loading
}: ManualWinnerFormProps) {
    const [selectedRaffle, setSelectedRaffle] = useState('')
    const [winnerNumber, setWinnerNumber] = useState('')
    const [availableNumbers, setAvailableNumbers] = useState<Array<{
        id: string
        number: string
        participant_name: string
        participant_email: string
        is_winner: boolean
    }>>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingNumbers, setLoadingNumbers] = useState(false)

    // Resetear formulario cuando se abre
    useEffect(() => {
        if (isOpen) {
            setSelectedRaffle('')
            setWinnerNumber('')
            setAvailableNumbers([])
            setSearchTerm('')
        }
    }, [isOpen])

    // Cargar números disponibles cuando se selecciona una rifa
    useEffect(() => {
        if (selectedRaffle) {
            loadRaffleNumbers(selectedRaffle)
        } else {
            setAvailableNumbers([])
        }
    }, [selectedRaffle])

    const loadRaffleNumbers = async (raffleId: string) => {
        setLoadingNumbers(true)
        try {
            const { getRaffleEntries } = await import('../../services/winnersService')
            const entries = await getRaffleEntries(raffleId)
            setAvailableNumbers(entries)
        } catch (error) {
            console.error('Error loading raffle numbers:', error)
        } finally {
            setLoadingNumbers(false)
        }
    }

    const filteredNumbers = availableNumbers.filter(entry =>
        !entry.is_winner && (
            entry.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.participant_email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedRaffle && winnerNumber) {
            onSubmit(selectedRaffle, winnerNumber)
        }
    }

    const selectNumber = (number: string) => {
        setWinnerNumber(number)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Seleccionar Ganador Manual"
            titleIcon={<Trophy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
            size="2xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => { if (selectedRaffle && winnerNumber) onSubmit(selectedRaffle, winnerNumber) }}
                        disabled={!selectedRaffle || !winnerNumber}
                        loading={loading}
                    >
                        Confirmar Ganador
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selección de Rifa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seleccionar Rifa
                    </label>
                    <select
                        title='Seleccionar Rifa'
                        value={selectedRaffle}
                        onChange={(e) => setSelectedRaffle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-200"
                        required
                    >
                        <option value="">Seleccione una rifa...</option>
                        {raffles.map((raffle) => (
                            <option key={raffle.id} value={raffle.id}>
                                {raffle.title} - {new Date(raffle.draw_date).toLocaleDateString('es-ES')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Números Disponibles */}
                {selectedRaffle && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Números Disponibles
                        </label>

                        {/* Buscador */}
                        <div className="mb-4">
                            <Input
                                icon={<Search className="h-4 w-4" />}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por número o participante..."
                            />
                        </div>

                        {/* Lista de números */}
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-64 overflow-y-auto">
                            {loadingNumbers ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    Cargando números...
                                </div>
                            ) : filteredNumbers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    {availableNumbers.length === 0
                                        ? 'No hay números disponibles en esta rifa'
                                        : 'No se encontraron números con ese criterio de búsqueda'
                                    }
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredNumbers.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className={cn(
                                                'p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
                                                winnerNumber === entry.number && 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500'
                                            )}
                                            onClick={() => selectNumber(entry.number)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full font-bold text-sm">
                                                        {entry.number}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                            {entry.participant_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {entry.participant_email}
                                                        </div>
                                                    </div>
                                                </div>
                                                {winnerNumber === entry.number && (
                                                    <div className="text-indigo-600 dark:text-indigo-400">
                                                        <Trophy className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Número Ganador Seleccionado */}
                {winnerNumber && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Número Ganador Seleccionado:</h4>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            {winnerNumber}
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    )
}
