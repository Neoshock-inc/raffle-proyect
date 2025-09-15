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

    // Configuración del slider - adaptativo para mobile
    const getNumbersPerSlide = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 12; // Mobile: 3x4
            if (window.innerWidth < 1024) return 15; // Tablet: 3x5
            return 20; // Desktop: 4x5
        }
        return 20;
    };

    const [numbersPerSlide, setNumbersPerSlide] = useState(getNumbersPerSlide());
    const totalSlides = Math.ceil(allNumbers.length / numbersPerSlide);

    useEffect(() => {
        const handleResize = () => {
            setNumbersPerSlide(getNumbersPerSlide());
            setCurrentSlide(0); // Reset to first slide on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        <main className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-green-600 text-center px-2">¡Pago realizado con éxito! ✅</h1>

            {winningNumbers.length > 0 && (
                <div className="mb-6 sm:mb-8 text-center px-2">
                    <p className="mb-4 text-base sm:text-lg">🎉 ¡Felicidades! Has ganado con los siguientes números:</p>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {winningNumbers.map((num, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                <div className="relative bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg text-center font-bold">
                                    <div className="text-lg sm:text-xl">{num.number}</div>
                                    <div className="text-xs mt-1">
                                        {num.is_minor_prize ? 'Premio Menor' : 'Premio Mayor'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-700 max-w-md mb-4 sm:mb-6 mx-auto px-2">
                        Un representante se pondrá en contacto contigo dentro de las próximas <strong>48 horas</strong>.
                    </p>
                </div>
            )}

            {/* Componente de ruleta separado */}
            {showRoulette && (
                <div className="mb-6 sm:mb-8">
                    <PrizeWheel onPrizeWon={handlePrizeWon} />
                </div>
            )}

            {/* Slider de números asignados con diseño de boletos de lotería */}
            {allNumbers.length > 0 && (
                <div className="mb-6 sm:mb-8 w-full max-w-6xl px-2">
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Tus Números Asignados</h2>
                        <p className="text-sm sm:text-base text-gray-600">Total: {allNumbers.length} números</p>
                    </div>

                    <div className="relative bg-white rounded-2xl shadow-2xl p-3 sm:p-6 overflow-hidden">
                        {/* Fondo decorativo tipo papel de lotería */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3Cpath d='m40 0l-40 40v-40h40z'/%3E%3C/g%3E%3C/svg%3E")`
                            }}></div>
                        </div>

                        {/* Header del slider */}
                        <div className="relative z-10 flex justify-between items-center mb-3 sm:mb-4">
                            <div className="text-xs sm:text-sm text-gray-600">
                                Página {currentSlide + 1} de {totalSlides}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                                {getCurrentSlideNumbers().length} de {allNumbers.length}
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
                                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 p-2 sm:p-4">
                                                {slideNumbers.map((num, idx) => (
                                                    <div
                                                        key={`${slideIndex}-${idx}`}
                                                        className={`
                                                            relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                                                            ${num.is_blessed ? 'hover:rotate-2' : 'hover:rotate-1'}
                                                        `}
                                                    >
                                                        {/* Efecto de glow para números ganadores */}
                                                        {num.is_blessed && (
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                                        )}

                                                        {/* Diseño de boleto de lotería */}
                                                        <div className={`
                                                            relative rounded-lg overflow-hidden shadow-lg font-bold transition-all duration-300 min-h-[80px] sm:min-h-[100px]
                                                            ${num.is_blessed
                                                                ? 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 text-white shadow-green-300 border-2 border-green-300'
                                                                : 'bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-800 border-2 border-blue-200 hover:border-blue-300'
                                                            }
                                                        `}>
                                                            {/* Diseño de perforaciones superiores */}
                                                            <div className="absolute top-0 left-0 right-0 h-2 flex justify-center">
                                                                <div className="flex space-x-1 sm:space-x-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${num.is_blessed ? 'bg-green-300' : 'bg-gray-300'}`}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Líneas laterales decorativas */}
                                                            <div className={`absolute left-0 top-2 bottom-2 w-px ${num.is_blessed ? 'bg-green-300' : 'bg-gray-300'}`}></div>
                                                            <div className={`absolute right-0 top-2 bottom-2 w-px ${num.is_blessed ? 'bg-green-300' : 'bg-gray-300'}`}></div>

                                                            {/* Contenido principal del boleto */}
                                                            <div className="relative z-10 p-2 sm:p-3 flex flex-col items-center justify-center h-full pt-3 sm:pt-4">
                                                                {/* Número principal */}
                                                                
                                                                <div className={`text-lg sm:text-xl lg:text-2xl font-black mt-2 ${num.is_blessed ? 'text-shadow' : ''}`}>
                                                                    {num.number}
                                                                </div>
                                                                
                                                                {/* Indicador de premio */}
                                                                {num.is_blessed && (
                                                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1 py-0.5 rounded-full font-bold border border-yellow-500">
                                                                        🏆
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Diseño de perforaciones inferiores */}
                                                            <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-center">
                                                                <div className="flex space-x-1 sm:space-x-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${num.is_blessed ? 'bg-green-300' : 'bg-gray-300'}`}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Línea punteada central (opcional) */}
                                                            {!num.is_blessed && (
                                                                <div className="absolute top-2/3 left-2 right-2 h-px border-t border-dashed border-gray-300 transform -translate-y-1/2"></div>
                                                            )}

                                                            {/* Efecto de brillo */}
                                                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                                                        </div>

                                                        {/* Tooltip para números ganadores */}
                                                        {num.is_blessed && (
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20">
                                                                {num.is_minor_prize ? '🥉 Premio Menor' : '🥇 Premio Mayor'}
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
                            <div className="relative z-10 flex justify-between items-center mt-4 sm:mt-6 gap-4">
                                <button
                                    onClick={prevSlide}
                                    disabled={currentSlide === 0}
                                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="hidden sm:inline">Anterior</span>
                                </button>

                                <div className="text-center">
                                    <div className="flex space-x-1">
                                        {Array.from({ length: Math.min(totalSlides, 5) }, (_, i) => {
                                            let slideToShow = i;
                                            if (totalSlides > 5 && currentSlide >= 3) {
                                                slideToShow = Math.min(currentSlide - 2 + i, totalSlides - 1);
                                            }
                                            return (
                                                <button
                                                    key={slideToShow}
                                                    onClick={() => setCurrentSlide(slideToShow)}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === slideToShow
                                                            ? 'bg-blue-600 scale-125'
                                                            : 'bg-gray-300 hover:bg-gray-400'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={nextSlide}
                                    disabled={currentSlide === totalSlides - 1}
                                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">Siguiente</span>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Estadísticas */}
                        <div className="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                            <div className="flex justify-center space-x-4 sm:space-x-8 text-xs sm:text-sm">
                                <div className="text-center">
                                    <div className="font-bold text-lg sm:text-xl text-gray-800">{allNumbers.length}</div>
                                    <div className="text-gray-600">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg sm:text-xl text-green-600">{winningNumbers.length}</div>
                                    <div className="text-gray-600">Ganadores</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg sm:text-xl text-blue-600">{allNumbers.length - winningNumbers.length}</div>
                                    <div className="text-gray-600">Regulares</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-lg sm:text-xl text-purple-600">
                                        {winningNumbers.length > 0 ? ((winningNumbers.length / allNumbers.length) * 100).toFixed(1) : 0}%
                                    </div>
                                    <div className="text-gray-600">Éxito</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-xs sm:text-sm text-gray-700 max-w-md mb-4 sm:mb-6 mx-auto px-2">
                También recibirás un correo electrónico con los detalles de tu compra.
            </p>

            <a href="/" className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-900 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base">
                Volver al inicio
            </a>
        </main>
    );
}