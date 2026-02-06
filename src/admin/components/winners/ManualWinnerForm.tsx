import React, { useState, useEffect } from 'react'
import { X, Search, Trophy } from 'lucide-react'

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
            // Aquí deberías llamar a tu servicio para obtener los números de la rifa
            // Por ahora simulo la carga
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

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-sky-700 text-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6" />
                                <div>
                                    <h3 className="text-xl font-semibold">Seleccionar Ganador Manual</h3>
                                    <p className="text-red-100">Elige una rifa y selecciona el número ganador</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-red-200 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-64px-64px)]">
                        {/* Selección de Rifa */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Rifa
                            </label>
                            <select
                                title='Seleccionar Rifa'
                                value={selectedRaffle}
                                onChange={(e) => setSelectedRaffle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
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
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Números Disponibles
                                </label>

                                {/* Buscador */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por número o participante..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                                    />
                                </div>

                                {/* Lista de números */}
                                <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                                    {loadingNumbers ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Cargando números...
                                        </div>
                                    ) : filteredNumbers.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            {availableNumbers.length === 0
                                                ? 'No hay números disponibles en esta rifa'
                                                : 'No se encontraron números con ese criterio de búsqueda'
                                            }
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {filteredNumbers.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${winnerNumber === entry.number ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                        }`}
                                                    onClick={() => selectNumber(entry.number)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold text-sm">
                                                                {entry.number}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {entry.participant_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {entry.participant_email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {winnerNumber === entry.number && (
                                                            <div className="text-blue-600">
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
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <h4 className="font-medium text-yellow-800 mb-2">Número Ganador Seleccionado:</h4>
                                <div className="text-2xl font-bold text-sky-700">
                                    {winnerNumber}
                                </div>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedRaffle || !winnerNumber || loading}
                                className="px-6 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Ganador'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}