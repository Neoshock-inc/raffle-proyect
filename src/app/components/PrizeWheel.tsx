'use client';

import { useState } from 'react';

interface Prize {
    text: string;
    color: string;
}

interface PrizeWheelProps {
    prizes?: Prize[];
    onPrizeWon?: (prize: string) => void;
    className?: string;
}

const DEFAULT_PRIZES: Prize[] = [
    { text: '$50', color: '#FF7B7B' },
    { text: '$100', color: '#FFB74D' },
    { text: '$200', color: '#4DB6AC' },
    { text: '$300', color: '#64B5F6' },
    { text: '$400', color: '#7986CB' },
    { text: '$500', color: '#BA68C8' },
    { text: '$1000', color: '#FF8A65' }
];

export default function PrizeWheel({
    prizes = DEFAULT_PRIZES,
    onPrizeWon,
    className = ""
}: PrizeWheelProps) {
    const [spinning, setSpinning] = useState(false);
    const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
    const [wheelOffset, setWheelOffset] = useState(0);

    // Duplicamos el array muchas veces para crear efecto de rueda infinita
    const extendedPrizes = Array(20).fill(prizes).flat();

    const spinWheel = () => {
        if (spinning) return;

        setSpinning(true);
        setSelectedPrize(null);

        // Elegir premio ganador aleatoriamente
        const winnerIndex = Math.floor(Math.random() * prizes.length);
        const winnerPrize = prizes[winnerIndex];

        // Calcular posición final
        const itemHeight = 120;
        const containerCenter = 160; // Centro del contenedor visible (320px / 2)

        // Posición del elemento ganador en la lista extendida (usamos el conjunto del medio para estar seguro)
        const targetItemIndex = prizes.length * 10 + winnerIndex; // Usamos el conjunto 10 (medio del array extendido)
        const targetPosition = targetItemIndex * itemHeight;

        // Posición final para centrar el elemento ganador
        const finalOffset = targetPosition - containerCenter + (itemHeight / 2);

        // Agregar vueltas extra para el efecto visual (menos vueltas para evitar problemas)
        const extraSpins = (Math.floor(Math.random() * 2) + 2) * (prizes.length * itemHeight);
        const totalOffset = finalOffset + extraSpins;

        console.log('Winner:', winnerPrize.text, 'Index:', winnerIndex);
        console.log('Target item index:', targetItemIndex, 'Target position:', targetPosition);
        console.log('Final offset:', finalOffset, 'Total offset:', totalOffset);

        setWheelOffset(totalOffset);

        setTimeout(() => {
            setSelectedPrize(winnerPrize.text);
            setSpinning(false);
            onPrizeWon?.(winnerPrize.text);
        }, 4000);
    };

    return (
        <div className={`flex flex-col items-center relative ${className}`}>
            <h2 className="text-xl font-bold text-purple-600 mb-4">¡Gira la máquina de premios!</h2>

            <div className="relative">
                {/* Contenedor principal con marco */}
                <div className="w-80 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl">

                    {/* Indicador central - flecha que apunta al premio */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="flex items-center">
                            <div className="w-0 h-0 border-l-0 border-r-[20px] border-t-[15px] border-b-[15px] border-transparent border-r-orange-400 drop-shadow-lg mr-2"></div>
                            <div className="bg-orange-400 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                GANADOR
                            </div>
                            <div className="w-0 h-0 border-r-0 border-l-[20px] border-t-[15px] border-b-[15px] border-transparent border-l-orange-400 drop-shadow-lg ml-2"></div>
                        </div>
                    </div>

                    {/* Ventana de visualización con máscara */}
                    <div className="w-full h-80 bg-black rounded-2xl overflow-hidden relative border-4 border-gray-600">
                        {/* Gradientes para efecto de desvanecimiento */}
                        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-10"></div>

                        {/* Rueda de premios */}
                        <div
                            className="flex flex-col transition-transform duration-[4000ms] ease-out"
                            style={{
                                transform: `translateY(-${wheelOffset}px)`,
                                transitionTimingFunction: spinning ? 'cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                            }}
                        >
                            {extendedPrizes.map((prize, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 h-[120px] flex items-center justify-center border-b border-gray-700 relative"
                                    style={{ backgroundColor: prize.color }}
                                >
                                    {/* Brillo del elemento */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>

                                    <div className="text-white text-2xl font-bold drop-shadow-lg relative z-10">
                                        {prize.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decoración lateral */}
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        <div className="flex flex-col space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="flex flex-col space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón de giro */}
            <button
                onClick={spinWheel}
                disabled={spinning}
                className="mt-6 relative px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl rounded-full shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎰</span>
                    <span>{spinning ? 'GIRANDO...' : '¡GIRAR!'}</span>
                    <span className="text-2xl">🎰</span>
                </div>
                {!spinning && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20 animate-pulse"></div>
                )}
            </button>

            {/* Resultado */}
            {selectedPrize && !spinning && (
                <div className="mt-8 text-center animate-bounce">
                    <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-xl border-4 border-yellow-300">
                        <p className="text-2xl font-bold mb-1">¡INCREÍBLE!</p>
                        <p className="text-xl font-semibold">¡Ganaste {selectedPrize}!</p>
                        <p className="text-sm mt-2 opacity-90">Un representante te contactará pronto</p>
                    </div>
                </div>
            )}

            {/* Efectos de confeti */}
            {selectedPrize && !spinning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-3xl animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`
                            }}
                        >
                            {['🎉', '✨', '🎊', '🌟', '💰', '🎁'][Math.floor(Math.random() * 6)]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}