'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PrizeWheel from '../components/PrizeWheel';

interface AssignedNumber {
    number: string;
    is_blessed: boolean;
    is_minor_prize: boolean;
}

export default function SuccessClient() {
    const [winningNumbers, setWinningNumbers] = useState<AssignedNumber[]>([]);
    const [allNumbers, setAllNumbers] = useState<AssignedNumber[]>([]);
    const [showRoulette, setShowRoulette] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const params = useSearchParams();
    const participantId = params.get('participantId');

    // Configuración del slider
    const numbersPerSlide = 20;
    const totalSlides = Math.ceil(allNumbers.length / numbersPerSlide);

    useEffect(() => {
        if (participantId) {
            fetch(`/api/assigned-numbers?participantId=${participantId}`)
                .then(res => res.json())
                .then(data => {
                    const all: AssignedNumber[] = data.numbers || [];
                    setAllNumbers(all);
                    const winners = all.filter(n => n.is_blessed);
                    setWinningNumbers(winners);

                    // Simulación: si compró el producto mayor, mostramos la ruleta
                    const boughtMajorProduct = true;
                    if (boughtMajorProduct) setShowRoulette(false);
                });
        }
    }, [participantId]);

    const handlePrizeWon = (prize: string) => {
        console.log('Premio ganado:', prize);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const getCurrentSlideNumbers = () => {
        const start = currentSlide * numbersPerSlide;
        const end = start + numbersPerSlide;
        return allNumbers.slice(start, end);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-green-600">¡Pago realizado con éxito! ✅</h1>

            {winningNumbers.length > 0 && (
                <div className="mb-8 text-center">
                    <p className="mb-4 text-lg">🎉 ¡Felicidades! Has ganado con los siguientes números:</p>
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {winningNumbers.map((num, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                <div className="relative bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg text-center font-bold">
                                    <div className="text-xl">{num.number}</div>
                                    <div className="text-xs mt-1">
                                        {num.is_minor_prize ? 'Premio Menor' : 'Premio Mayor'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-700 max-w-md mb-6">
                        Un representante se pondrá en contacto contigo dentro de las próximas <strong>48 horas</strong>.
                    </p>
                </div>
            )}

            {/* Componente de ruleta separado */}
            {showRoulette && (
                <div className="mb-8">
                    <PrizeWheel onPrizeWon={handlePrizeWon} />
                </div>
            )}

            {/* Slider de números asignados mejorado */}
            {allNumbers.length > 0 && (
                <div className="mb-8 w-full max-w-4xl">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tus Números Asignados</h2>
                        <p className="text-gray-600">Total: {allNumbers.length} números</p>
                    </div>

                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
                        {/* Fondo decorativo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>

                        {/* Header del slider */}
                        <div className="relative z-10 flex justify-between items-center mb-4">
                            <div className="text-sm text-gray-600">
                                Página {currentSlide + 1} de {totalSlides}
                            </div>
                            <div className="text-sm text-gray-600">
                                Mostrando {getCurrentSlideNumbers().length} de {allNumbers.length}
                            </div>
                        </div>

                        {/* Contenedor del slider */}
                        <div className="relative z-10 overflow-hidden rounded-xl">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {Array.from({ length: totalSlides }, (_, slideIndex) => {
                                    const slideNumbers = allNumbers.slice(
                                        slideIndex * numbersPerSlide,
                                        (slideIndex + 1) * numbersPerSlide
                                    );

                                    return (
                                        <div key={slideIndex} className="w-full flex-shrink-0">
                                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-3 p-4">
                                                {slideNumbers.map((num, idx) => (
                                                    <div
                                                        key={`${slideIndex}-${idx}`}
                                                        className={`
                                                            relative group cursor-pointer transform transition-all duration-300 hover:scale-110
                                                            ${num.is_blessed
                                                                ? 'hover:rotate-12'
                                                                : 'hover:rotate-6'
                                                            }
                                                        `}
                                                    >
                                                        {/* Efecto de glow para números ganadores */}
                                                        {num.is_blessed && (
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                                        )}

                                                        <div className={`
                                                            relative px-3 py-4 rounded-lg text-center shadow-lg font-bold text-lg transition-all duration-300
                                                            ${num.is_blessed
                                                                ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-300 border-2 border-green-300'
                                                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 border border-gray-300'
                                                            }
                                                        `}>
                                                            <div className="relative z-10">
                                                                {num.number}
                                                                {num.is_blessed && (
                                                                    <div className="absolute -top-1 -right-1 text-yellow-300 text-xs">
                                                                        🏆
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Efecto de brillo */}
                                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                                                        </div>

                                                        {/* Tooltip para números ganadores */}
                                                        {num.is_blessed && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                                                                {num.is_minor_prize ? 'Premio Menor' : 'Premio Mayor'}
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Controles del slider */}
                        {totalSlides > 1 && (
                            <div className="relative z-10 flex justify-between items-center mt-6">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span>Anterior</span>
                                </button>

                                <button
                                    onClick={nextSlide}
                                    disabled={currentSlide === totalSlides - 1}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    <span>Siguiente</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Estadísticas */}
                        <div className="relative z-10 mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-center space-x-8 text-sm">
                                <div className="text-center">
                                    <div className="font-bold text-xl text-gray-800">{allNumbers.length}</div>
                                    <div className="text-gray-600">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-xl text-green-600">{winningNumbers.length}</div>
                                    <div className="text-gray-600">Ganadores</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-xl text-blue-600">{allNumbers.length - winningNumbers.length}</div>
                                    <div className="text-gray-600">Regulares</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-sm text-gray-700 max-w-md mb-6">
                También recibirás un correo electrónico con los detalles de tu compra.
            </p>

            <a href="/" className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-900 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Volver al inicio
            </a>
        </main>
    );
}