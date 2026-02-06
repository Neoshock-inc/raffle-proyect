'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PrizeWheel from '@/components/PrizeWheel';

interface AssignedNumber {
    number: string;
    is_blessed: boolean;
    is_minor_prize: boolean;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuccessClient() {
    const [winningNumbers, setWinningNumbers] = useState<AssignedNumber[]>([]);
    const [allNumbers, setAllNumbers] = useState<AssignedNumber[]>([]);
    const [showRoulette, setShowRoulette] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Estados específicos para PayPhone
    const [isPayPhone, setIsPayPhone] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);

    const params = useSearchParams();
    const participantId = params.get('participantId');
    const provider = params.get('provider');
    const orderNumber = params.get('orderNumber');
    const email = params.get('email');
    const amount = params.get('amount');

    // Configuración del slider
    const getNumbersPerSlide = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 12;
            if (window.innerWidth < 1024) return 15;
            return 20;
        }
        return 20;
    };

    const [numbersPerSlide, setNumbersPerSlide] = useState(getNumbersPerSlide());
    const totalSlides = Math.ceil(allNumbers.length / numbersPerSlide);

    useEffect(() => {
        const handleResize = () => {
            setNumbersPerSlide(getNumbersPerSlide());
            setCurrentSlide(0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Función para cargar números asignados
    const loadAssignedNumbers = async (participantIdToUse: string) => {
        try {
            setIsLoadingNumbers(true);
            const response = await fetch(`/api/assigned-numbers?participantId=${participantIdToUse}`);
            const data = await response.json();

            const all: AssignedNumber[] = data.numbers || [];
            setAllNumbers(all);
            const winners = all.filter(n => n.is_blessed);
            setWinningNumbers(winners);

            const boughtMajorProduct = true;
            if (boughtMajorProduct) setShowRoulette(false);
        } catch (error) {
            console.error('Error cargando números:', error);
        } finally {
            setIsLoadingNumbers(false);
        }
    };

    // Effect para PayPal (método existente)
    useEffect(() => {
        if (participantId && provider !== 'payphone') {
            loadAssignedNumbers(participantId);
        }
    }, [participantId, provider]);

    // Effect para PayPhone con Realtime
    useEffect(() => {
        if (provider === 'payphone' && orderNumber) {
            setIsPayPhone(true);

            // 1. Verificar estado actual de la factura
            const checkInvoiceStatus = async () => {
                try {
                    const { data: invoice, error } = await supabase
                        .from('invoices')
                        .select('status, participant_id')
                        .eq('order_number', orderNumber)
                        .single();

                    if (error) {
                        console.error('Error consultando factura:', error);
                        return;
                    }

                    if (invoice) {
                        setPaymentStatus(invoice.status);

                        // Si ya está completado, cargar números inmediatamente
                        if (invoice.status === 'completed' && invoice.participant_id) {
                            await loadAssignedNumbers(invoice.participant_id.toString());
                        }
                    }
                } catch (error) {
                    console.error('Error verificando estado:', error);
                }
            };

            checkInvoiceStatus();

            // 2. Suscribirse a cambios en tiempo real
            const channel = supabase
                .channel(`invoice-${orderNumber}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'invoices',
                        filter: `order_number=eq.${orderNumber}`
                    },
                    async (payload) => {
                        console.log('📡 Cambio detectado en factura:', payload);

                        const newStatus = payload.new.status;
                        const oldStatus = payload.old?.status;

                        setPaymentStatus(newStatus);

                        // Si cambió a completed y antes no lo estaba
                        if (newStatus === 'completed' && oldStatus !== 'completed') {
                            console.log('✅ Pago confirmado, cargando números...');

                            // Esperar un momento para asegurar que los números ya fueron generados
                            setTimeout(async () => {
                                if (payload.new.participant_id) {
                                    await loadAssignedNumbers(payload.new.participant_id.toString());
                                }
                            }, 1000);
                        } else if (newStatus === 'failed') {
                            console.log('❌ Pago rechazado');
                        }
                    }
                )
                .subscribe();

            // Cleanup: desuscribirse al desmontar
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [provider, orderNumber]);

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

    // Renderizado condicional para PayPhone en estado pendiente
    if (isPayPhone && paymentStatus === 'pending') {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                    {/* Animación de espera */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-8 border-indigo-200 rounded-full"></div>
                            <div className="w-24 h-24 border-8 border-indigo-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Esperando confirmación
                    </h1>

                    {/* Mensaje */}
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
                        <p className="text-center text-gray-700 mb-3">
                            📱 Abre tu app <strong>PayPhone</strong> para aprobar el pago
                        </p>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>• Tienes <strong>5 minutos</strong> para confirmar</p>
                            <p>• Esta página se actualizará automáticamente</p>
                            <p>• No cierres esta ventana</p>
                        </div>
                    </div>

                    {/* Información de la orden */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Orden:</span>
                            <span className="font-semibold text-gray-800">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-semibold text-gray-800">{email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Boletos:</span>
                            <span className="font-semibold text-gray-800">{amount}</span>
                        </div>
                    </div>

                    {/* Indicador de conexión en tiempo real */}
                    <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Escuchando cambios en tiempo real</span>
                    </div>
                </div>
            </main>
        );
    }

    // Renderizado para pago fallido
    if (isPayPhone && paymentStatus === 'failed') {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-red-50 to-orange-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Pago no completado</h1>
                    <p className="text-gray-600 mb-6">
                        El pago fue rechazado o cancelado. Por favor, intenta nuevamente.
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-900 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Volver al inicio
                    </a>
                </div>
            </main>
        );
    }

    // Renderizado cuando se están cargando los números
    if (isLoadingNumbers) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800">Generando tus números...</h2>
                    <p className="text-gray-600 mt-2">Esto puede tardar unos segundos</p>
                </div>
            </main>
        );
    }

    // Renderizado normal (PayPal o PayPhone completado)
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-green-600 text-center px-2">
                ¡Pago realizado con éxito! ✅
            </h1>

            {/* Mensaje específico para PayPhone */}
            {isPayPhone && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-center text-green-800 font-semibold">
                        🎉 Tu pago con PayPhone ha sido confirmado
                    </p>
                </div>
            )}

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