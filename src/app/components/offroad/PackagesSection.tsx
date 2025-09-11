// src/components/offroad/PackagesSection.tsx
'use client';

import React, { useState } from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';
import { useTenantPurchase } from '@/app/hooks/useTenantPurchase';
import { TicketOption } from '@/app/(auth)/types/ticketPackage';

interface PackagesSectionProps {
    ticketOptions: TicketOption[];
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

interface TicketCardProps {
    option: TicketOption;
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
    tenantSlug: string;
}

function TicketCard({ option, raffleData, tenantConfig, tenantSlug }: TicketCardProps) {
    console.log('Renderizando TicketCard para opción:', option);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const { purchaseTickets, loading } = useTenantPurchase(tenantSlug, raffleData.id);

    const handlePurchase = async () => {
        try {
            await purchaseTickets(
                option.final_amount,    // Ya viene calculado del backend
                option.final_price,     // Ya viene calculado del backend
                null,                   // referralCode
                option.id
            );
        } catch (error) {
            console.error('Error al procesar la compra:', error);
        }
    };

    // Determinar el tipo de paquete basado en los datos que llegan
    const isBestSeller = option.is_featured || option.badge_text?.toLowerCase().includes('vendido');
    const isLimitedOffer = option.promotion_type === 'discount' || option.total_discount > 0;
    const isMegaPack = option.final_amount >= 100;
    const hasPromotion = option.total_discount > 0 || option.promotion_type !== 'none';

    const getBorderStyle = () => {
        if (isMegaPack) return 'border-2 border-yellow-400 shadow-2xl shadow-yellow-500/50';
        if (isBestSeller) return 'border-2 border-green-400 shadow-lg shadow-green-500/30';
        if (isLimitedOffer) return 'border border-gray-700 shadow-lg shadow-red-500/30';
        return 'border border-gray-700 shadow-lg';
    };

    const getButtonStyle = () => {
        if (isMegaPack) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 font-extrabold';
        if (isBestSeller) return 'bg-green-500 text-white hover:bg-green-400 font-black';
        if (isLimitedOffer) return 'bg-red-500 text-white hover:bg-red-400 font-black';
        return 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold';
    };

    const getBadgeText = () => {
        if (option.badge_text) return option.badge_text;
        if (isBestSeller && !option.badge_text) return '★ MÁS VENDIDO ★';
        if (isMegaPack) return '🚀 MEGA PACK 🚀';
        if (isLimitedOffer) return '🔥 OFERTA LIMITADA 🔥';
        return null;
    };

    const badgeText = getBadgeText();

    return (
        <div
            className={`relative w-full max-w-[300px] h-60 sm:h-65 mx-auto rounded-xl cursor-pointer transition-all duration-300 ${
                loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] hover:shadow-xl'
            } bg-gray-900 ${getBorderStyle()}`}
            onClick={() => setSelectedPackage(option.id)}
        >
            {/* Badge superior */}
            {badgeText && (
                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${
                    isMegaPack
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black text-base font-extrabold px-8 py-2 border border-yellow-300'
                        : isBestSeller
                            ? 'bg-green-500 text-white text-sm font-black px-1 py-1'
                            : 'bg-red-600 text-white text-sm font-black px-1 py-1'
                } rounded-full shadow-lg animate-bounce min-w-[180px] text-center z-10 tracking-wider uppercase`}>
                    {badgeText}
                </div>
            )}

            <div className="h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center relative z-10">
                {/* Nombre del paquete */}
                <div className="text-white font-black text-lg sm:text-xl mb-2 tracking-wide">
                    {option.name || `X${option.amount} NÚMEROS`}
                </div>

                {/* Información de precio - USANDO VALORES QUE YA VIENEN DEL BACKEND */}
                <div className="mb-3">
                    {option.total_discount > 0 ? (
                        <div className="space-y-1">
                            <div className="text-gray-400 line-through text-lg">
                                ${option.original_price.toFixed(2)}
                            </div>
                            <div className={`text-3xl sm:text-4xl font-black ${isBestSeller ? 'text-green-400' : 'text-yellow-500'}`}>
                                ${option.final_price.toFixed(2)}
                            </div>
                            <div className="text-red-400 text-sm font-bold">
                                Ahorras ${option.total_discount.toFixed(2)}
                            </div>
                        </div>
                    ) : (
                        <div className={`text-3xl sm:text-4xl font-black ${isBestSeller ? 'text-green-400' : 'text-yellow-500'}`}>
                            ${option.final_price.toFixed(2)}
                        </div>
                    )}
                </div>

                {/* Información adicional de la promoción */}
                {hasPromotion && option.promotion_type !== 'none' && (
                    <div className="text-yellow-300 text-sm font-bold mb-2">
                        {option.promotion_type === 'bonus' && `+${option.promotion_value} GRATIS`}
                        {option.promotion_type === 'discount' && `${option.promotion_value}% OFF`}
                        {option.promotion_type === '2x1' && '2X1'}
                        {option.promotion_type === '3x2' && '3X2'}
                    </div>
                )}

                {/* Mostrar cantidad final vs original si hay diferencia */}
                {option.final_amount !== option.amount && (
                    <div className="text-green-300 text-sm mb-2 font-bold">
                        🎁 {option.amount} + {option.final_amount - option.amount} bonus = {option.final_amount} total
                    </div>
                )}

                {/* Si no hay bonificación, mostrar claramente cuántos números obtienes */}
                {option.final_amount === option.amount && (
                    <div className="text-blue-300 text-sm mb-2">
                        Obtienes {option.final_amount} números
                    </div>
                )}

                <button
                    className={`${getButtonStyle()} text-sm sm:text-base py-2 px-6 sm:px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        loading ? 'animate-pulse' : ''
                    }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase();
                    }}
                    disabled={loading || !option.is_available}
                >
                    {loading ? 'PROCESANDO...' :
                        !option.is_available ? 'AGOTADO' :
                            selectedPackage === option.id ? '¡SELECCIONADO!' :
                                'COMPRAR'}
                </button>
            </div>
        </div>
    );
}

export function PackagesSection({ ticketOptions, raffleData, tenantConfig }: PackagesSectionProps) {
    // Filtrar solo los paquetes disponibles
    const availableOptions = ticketOptions.filter(option => option.is_available);

    if (availableOptions.length === 0) {
        return (
            <section className="py-20 px-4 bg-black">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
                        Paquetes Temporalmente Agotados
                    </h2>
                    <p className="text-xl text-gray-300">
                        Todos nuestros paquetes están agotados. ¡Mantente atento para nuevas ofertas!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="packages-section" className="py-20 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-8">
                    🎯 ELIGE TU PAQUETE
                </h2>
                <p className="text-2xl text-gray-300 text-center mb-16">
                    Más números = más oportunidades de ganar
                </p>

                {/* Grid de paquetes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-16">
                    {availableOptions.map((option) => (
                        <TicketCard
                            key={option.id}
                            option={option}
                            raffleData={raffleData}
                            tenantConfig={tenantConfig}
                            tenantSlug={tenantConfig.slug}
                        />
                    ))}
                </div>

                {/* Garantías */}
                <div className="grid md:grid-cols-3 gap-8 text-center text-white">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-400 transition-colors">
                        <div className="text-5xl mb-6">🔒</div>
                        <h3 className="font-black text-2xl mb-4">100% Seguro</h3>
                        <p className="text-gray-300 text-lg">
                            Pagos protegidos con certificación SSL. Tu dinero está seguro.
                        </p>
                    </div>
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-400 transition-colors">
                        <div className="text-5xl mb-6">⚡</div>
                        <h3 className="font-black text-2xl mb-4">Sorteo Garantizado</h3>
                        <p className="text-gray-300 text-lg">
                            Se realiza con o sin venta total. Tu participación está asegurada.
                        </p>
                    </div>
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-red-400 transition-colors">
                        <div className="text-5xl mb-6">📱</div>
                        <h3 className="font-black text-2xl mb-4">Transmisión Live</h3>
                        <p className="text-gray-300 text-lg">
                            Sorteo en vivo por Instagram y Facebook. Transparencia total.
                        </p>
                    </div>
                </div>

                {/* Información adicional del sorteo */}
                <div className="mt-16 text-center">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-black text-white mb-4">📋 Información del Sorteo</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-gray-300">
                                    <span className="text-yellow-400 font-bold">📅 Fecha:</span> {
                                        new Date(raffleData.draw_date).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                    }
                                </p>
                                <p className="text-gray-300">
                                    <span className="text-yellow-400 font-bold">🎟️ Total números:</span> {raffleData.total_numbers.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-300">
                                    <span className="text-yellow-400 font-bold">✅ Vendidos:</span> {raffleData.soldTickets.toLocaleString()}
                                </p>
                                <p className="text-gray-300">
                                    <span className="text-yellow-400 font-bold">💰 Precio por número:</span> ${raffleData.price}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}