import React, { useState, useRef, useEffect } from 'react'
import { X, Play, Trophy, RefreshCw } from 'lucide-react'

interface LuckySlotMachineProps {
    isOpen: boolean
    onClose: () => void
    entries: Array<{
        is_winner: any
        id: string
        number: string
        participant_name: string
        participant_email: string
        full_name?: string
        phone?: string
        city?: string
        province?: string
    }>
    onWinnerSelected: (winner: any) => void
    raffleTitle: string
    loading: boolean
}

export function LuckySlotMachine({
    isOpen,
    onClose,
    entries,
    onWinnerSelected,
    raffleTitle,
    loading
}: LuckySlotMachineProps) {
    const [isSpinning, setIsSpinning] = useState(false)
    const [selectedWinner, setSelectedWinner] = useState<any>(null)
    const [showResult, setShowResult] = useState(false)
    const [currentNumbers, setCurrentNumbers] = useState<string[]>(['', '', '', ''])
    const [finalNumber, setFinalNumber] = useState('')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Filtrar solo entradas que no sean ganadoras
    const availableEntries = entries.filter(entry => !entry.is_winner)

    // Función para generar un número aleatorio de 4 dígitos
    const generateRandomNumber = () => {
        return Math.floor(Math.random() * 10).toString()
    }

    // Función para animar los números
    const animateSlots = () => {
        if (availableEntries.length === 0) return

        setIsSpinning(true)
        setShowResult(false)
        setSelectedWinner(null)
        setFinalNumber('')

        // Seleccionar ganador aleatorio
        const randomIndex = Math.floor(Math.random() * availableEntries.length)
        const winner = availableEntries[randomIndex]
        const winnerNumber = winner.number.padStart(4, '0')
        
        setFinalNumber(winnerNumber)

        let phase = 0 // 0: spinning all, 1-4: stopping each digit
        let spinCount = 0
        const maxSpins = 50 // Total spins before starting to stop digits

        intervalRef.current = setInterval(() => {
            spinCount++

            if (spinCount < maxSpins) {
                // Fase inicial: todos los números giran
                setCurrentNumbers([
                    generateRandomNumber(),
                    generateRandomNumber(),
                    generateRandomNumber(),
                    generateRandomNumber()
                ])
            } else {
                // Comenzar a detener dígitos uno por uno
                const digitToStop = Math.floor((spinCount - maxSpins) / 8) // Cada 8 iteraciones detiene un dígito
                
                setCurrentNumbers(prev => prev.map((num, index) => {
                    if (index <= digitToStop) {
                        return winnerNumber[index]
                    }
                    return generateRandomNumber()
                }))

                // Si todos los dígitos están detenidos
                if (digitToStop >= 3) {
                    setTimeout(() => {
                        setSelectedWinner(winner)
                        setShowResult(true)
                        setIsSpinning(false)
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current)
                        }
                    }, 500)
                }
            }
        }, 100)
    }

    const confirmWinner = () => {
        if (selectedWinner) {
            onWinnerSelected(selectedWinner)
            setShowResult(false)
            setSelectedWinner(null)
            onClose()
        }
    }

    const resetSlots = () => {
        setCurrentNumbers(['', '', '', ''])
        setSelectedWinner(null)
        setShowResult(false)
        setIsSpinning(false)
        setFinalNumber('')
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (isOpen && !isSpinning) {
            setCurrentNumbers(['', '', '', ''])
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6" />
                                <div>
                                    <h3 className="text-xl font-semibold">🎰 Máquina de la Suerte</h3>
                                    <p className="text-yellow-100">{raffleTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-yellow-200 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {availableEntries.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No hay números disponibles
                                </h3>
                                <p className="text-gray-600">
                                    Todos los números ya han sido seleccionados como ganadores o no hay números pagados.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                {/* Info */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                        Números Disponibles: {availableEntries.length}
                                    </h4>
                                    <p className="text-gray-600">
                                        Haz clic en "Jugar" para seleccionar un ganador aleatoriamente
                                    </p>
                                </div>

                                {/* Slot Machine */}
                                <div className="flex justify-center mb-8">
                                    <div className="bg-gradient-to-b from-red-600 to-red-800 p-8 rounded-2xl shadow-2xl border-4 border-yellow-400">
                                        {/* Machine Display */}
                                        <div className="bg-black p-6 rounded-xl mb-6 border-4 border-gray-300 shadow-inner">
                                            <div className="flex justify-center gap-2 mb-4">
                                                {currentNumbers.map((number, index) => (
                                                    <div
                                                        key={index}
                                                        className={`
                                                            w-20 h-24 bg-white rounded-lg flex items-center justify-center
                                                            border-2 shadow-inner text-4xl font-bold
                                                            ${isSpinning ? 'animate-pulse border-yellow-400 text-yellow-600' : 'border-gray-300 text-gray-800'}
                                                            ${!isSpinning && number && 'bg-green-100 border-green-400 text-green-800'}
                                                        `}
                                                    >
                                                        <span className="select-none">
                                                            {number || '?'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Status Display */}
                                            <div className="text-center">
                                                <div className={`
                                                    text-lg font-semibold px-4 py-2 rounded-full inline-block
                                                    ${isSpinning 
                                                        ? 'bg-yellow-400 text-yellow-900 animate-pulse' 
                                                        : 'bg-gray-200 text-gray-700'
                                                    }
                                                `}>
                                                    {isSpinning ? '🎰 GIRANDO...' : '🎯 LISTO PARA JUGAR'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Machine Details */}
                                        <div className="flex justify-center gap-4 text-white text-sm">
                                            <div className="bg-red-700 px-3 py-1 rounded-full">💰 JACKPOT</div>
                                            <div className="bg-red-700 px-3 py-1 rounded-full">🍀 SUERTE</div>
                                            <div className="bg-red-700 px-3 py-1 rounded-full">🏆 PREMIO</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex justify-center gap-4 mb-6">
                                    <button
                                        onClick={animateSlots}
                                        disabled={isSpinning || availableEntries.length === 0}
                                        className={`
                                            flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                                            transition-all duration-200 transform
                                            ${isSpinning 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg'
                                            }
                                            text-white disabled:opacity-50
                                        `}
                                    >
                                        <Play className="h-6 w-6" />
                                        {isSpinning ? '🎰 Girando...' : '🎰 ¡JUGAR!'}
                                    </button>

                                    <button
                                        onClick={resetSlots}
                                        disabled={isSpinning}
                                        className="flex items-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 font-semibold"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                        Reset
                                    </button>
                                </div>

                                {/* Result */}
                                {showResult && selectedWinner && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-4 border-yellow-400 rounded-xl p-6 shadow-xl">
                                        <div className="flex items-center justify-center mb-4 animate-bounce">
                                            <Trophy className="h-12 w-12 text-yellow-600 mr-3" />
                                            <h3 className="text-3xl font-bold text-yellow-800">🎉 ¡GANADOR! 🎉</h3>
                                        </div>

                                        <div className="text-center mb-6">
                                            <div className="text-6xl font-bold text-red-600 mb-4 animate-pulse">
                                                {selectedWinner.number}
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 mb-2">
                                                {selectedWinner.participant_name}
                                            </div>
                                            <div className="text-lg text-gray-700 mb-3">
                                                📧 {selectedWinner.participant_email}
                                            </div>
                                            {selectedWinner.full_name && selectedWinner.full_name !== selectedWinner.participant_name && (
                                                <div className="text-sm text-gray-600 mb-2">
                                                    📄 Nombre en factura: {selectedWinner.full_name}
                                                </div>
                                            )}
                                            {selectedWinner.phone && (
                                                <div className="text-sm text-gray-600 mb-2">
                                                    📱 Teléfono: {selectedWinner.phone}
                                                </div>
                                            )}
                                            {selectedWinner.city && (
                                                <div className="text-sm text-gray-600">
                                                    📍 {selectedWinner.city}{selectedWinner.province && `, ${selectedWinner.province}`}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={confirmWinner}
                                                disabled={loading}
                                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
                                            >
                                                {loading ? '⏳ Confirmando...' : '✅ Confirmar Ganador'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowResult(false)
                                                    setSelectedWinner(null)
                                                    setCurrentNumbers(['', '', '', ''])
                                                }}
                                                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                                            >
                                                🔄 Jugar de Nuevo
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}