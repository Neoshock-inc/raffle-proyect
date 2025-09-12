// src/components/offroad/MyNumbersSection.tsx
'use client';

import React, { useState } from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';
import { supabase } from '@/app/lib/supabase';

interface TicketPurchase {
    id: string;
    email: string;
    numbers: {
        number: number;
        isWinner: boolean;
    }[];
    paymentStatus: string;
    purchaseDate: string;
}

interface MyNumbersSectionProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

export function MyNumbersSection({ raffleData, tenantConfig }: MyNumbersSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userTickets, setUserTickets] = useState<TicketPurchase[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Función para obtener tickets del usuario (adaptada al componente)
    const getUserTickets = async (userEmail: string): Promise<TicketPurchase[]> => {
        try {
            const { data: participant, error: participantError } = await supabase
                .from('participants')
                .select('id')
                .ilike('email', userEmail)
                .eq('tenant_id', tenantConfig.id)
                .maybeSingle();

            console.log(userEmail);
            console.log(participant);

            if (!participant) {
                throw new Error('No se encontró ningún participante con este email en este sorteo');
            }

            if (participantError) {
                console.error('Error fetching participant:', participantError);
                throw new Error('No se encontró ningún participante con este email en este sorteo');
            }

            const participantId = participant.id;
            const PAGE_SIZE = 1000;
            let from = 0;
            let to = PAGE_SIZE - 1;
            let allEntries: any[] = [];

            while (true) {
                const { data, error } = await supabase
                    .from('raffle_entries')
                    .select(`
            id,
            raffle_id,
            is_winner,
            number,
            payment_status,
            purchased_at
          `)
                    .eq('participant_id', participantId)
                    .eq('raffle_id', raffleData.id) // Filtrar por el sorteo actual
                    .range(from, to)
                    .order('purchased_at', { ascending: false });

                if (error) {
                    console.error('Error fetching raffle entries:', error);
                    throw new Error(error.message);
                }

                allEntries = allEntries.concat(data);

                if (data.length < PAGE_SIZE) break;
                from += PAGE_SIZE;
                to += PAGE_SIZE;
            }

            const purchaseGroups: { [key: string]: TicketPurchase } = {};

            allEntries.forEach(entry => {
                const key = `${entry.raffle_id}_${entry.payment_status}_${entry.purchased_at.split('T')[0]}`;

                if (!purchaseGroups[key]) {
                    purchaseGroups[key] = {
                        id: entry.id,
                        email: userEmail,
                        numbers: [],
                        paymentStatus: entry.payment_status,
                        purchaseDate: entry.purchased_at
                    };
                }

                purchaseGroups[key].numbers.push({
                    number: entry.number,
                    isWinner: entry.is_winner === true
                });
            });

            return Object.values(purchaseGroups);
        } catch (error) {
            console.error('Error in getUserTickets:', error);
            throw error;
        }
    };

    const handleSearch = async () => {
        if (!email.trim()) {
            setError('Por favor ingresa tu email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tickets = await getUserTickets(email.trim());
            setUserTickets(tickets);
            setCurrentSlide(0);

            if (tickets.length === 0) {
                setError('No se encontraron números para este email en este sorteo');
            }
        } catch (err: any) {
            setError(err.message || 'Error al buscar tus números');
            setUserTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setEmail('');
        setError('');
        setUserTickets([]);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEmail('');
        setError('');
        setUserTickets([]);
        setCurrentSlide(0);
    };

    // Obtener todos los números del usuario
    const allNumbers = userTickets.flatMap(ticket => ticket.numbers);

    // Dividir números en slides de máximo 25
    const NUMBERS_PER_SLIDE = 25;
    const numberSlides = [];
    for (let i = 0; i < allNumbers.length; i += NUMBERS_PER_SLIDE) {
        numberSlides.push(allNumbers.slice(i, i + NUMBERS_PER_SLIDE));
    }

    const nextSlide = () => {
        if (currentSlide < numberSlides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return { text: 'Pagado', color: 'text-green-400' };
            case 'pending':
                return { text: 'Pendiente', color: 'text-yellow-400' };
            case 'failed':
                return { text: 'Fallido', color: 'text-red-400' };
            default:
                return { text: status, color: 'text-gray-400' };
        }
    };

    return (
        <>
            {/* Sección principal */}
            <section className="py-20 px-4 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-8">
                        🔍 CONSULTA TUS NÚMEROS
                    </h2>
                    <p className="text-xl text-gray-300 mb-12">
                        Ingresa tu email para ver todos los números que has comprado en este sorteo
                    </p>

                    <button
                        onClick={openModal}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-4 px-12 rounded-full text-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        🎟️ VER MIS NÚMEROS
                    </button>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700">
                        {/* Botón cerrar */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold z-10"
                        >
                            ×
                        </button>

                        {/* Título */}
                        <h3 className="text-3xl font-black text-white mb-8 text-center">
                            🎟️ Mis Números del Sorteo
                        </h3>

                        {/* Buscador */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ingresa tu email..."
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                                >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Resultados */}
                        {userTickets.length > 0 && (
                            <div>
                                
                                {/* Compras por fecha */}
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-white mb-4">📅 Historial de Compras</h4>
                                    <div className="space-y-2">
                                        {userTickets.map((ticket, index) => {
                                            const statusInfo = getPaymentStatusText(ticket.paymentStatus);
                                            return (
                                                <div key={index} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <span className="text-white font-semibold">
                                                            {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
                                                        </span>
                                                        <span className="text-gray-400 ml-2">
                                                            ({ticket.numbers.length} números)
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Slider de números */}
                                {numberSlides.length > 0 && (
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-4">
                                            🎯 Tus Números
                                            {numberSlides.length > 1 && (
                                                <span className="text-sm text-gray-400 ml-2">
                                                    (Página {currentSlide + 1} de {numberSlides.length})
                                                </span>
                                            )}
                                        </h4>

                                        <div className="relative">
                                            {/* Números actuales */}
                                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-6">
                                                {numberSlides[currentSlide]?.map((numberInfo, index) => (
                                                    <div
                                                        key={index}
                                                        className={`
                              w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm
                              ${numberInfo.isWinner
                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse'
                                                                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                                            }
                            `}
                                                    >
                                                        {numberInfo.number}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Controles de navegación */}
                                            {numberSlides.length > 1 && (
                                                <div className="flex justify-center items-center gap-4">
                                                    <button
                                                        onClick={prevSlide}
                                                        disabled={currentSlide === 0}
                                                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                                                    >
                                                        ← Anterior
                                                    </button>

                                                    <div className="flex gap-2">
                                                        {numberSlides.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setCurrentSlide(index)}
                                                                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-orange-500' : 'bg-gray-600'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>

                                                    <button
                                                        onClick={nextSlide}
                                                        disabled={currentSlide === numberSlides.length - 1}
                                                        className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                                                    >
                                                        Siguiente →
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Leyenda */}
                                        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-600 rounded"></div>
                                                <span className="text-gray-300">Número normal</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded animate-pulse"></div>
                                                <span className="text-gray-300">Número ganador</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}