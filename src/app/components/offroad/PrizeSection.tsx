// src/components/offroad/PrizeSection.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface PrizeSectionProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

export function PrizeSection({ raffleData, tenantConfig }: PrizeSectionProps) {
    // Usar el premio principal desde la base de datos
    const mainPrize = raffleData.mainPrize?.prize;
    const mainPrizeSpecs = raffleData.mainPrize?.specifications || [];
    const mainPrizeImages = raffleData.mainPrize?.images || [];

    // Fallback si no hay premio principal configurado
    if (!mainPrize) {
        const fallbackValue = raffleData.price * raffleData.total_numbers;
        return (
            <section className="py-20 px-4 bg-gray-900">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
                        🏆 PREMIO PRINCIPAL
                    </h2>
                    <div className="bg-gray-800 p-8 rounded-xl">
                        <h3 className="text-3xl font-black text-yellow-400 mb-4">
                            {raffleData.title}
                        </h3>
                        <p className="text-2xl text-white">
                            Valor: ${fallbackValue.toLocaleString()} USD
                        </p>
                        <p className="text-gray-300 mt-4">
                            Información detallada del premio próximamente disponible.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Obtener imagen principal del premio
    const mainImage = mainPrizeImages.find(img => img.is_featured)?.image_url ||
        mainPrizeImages[0]?.image_url ||
        mainPrize.image_url ||
        raffleData.banner_url ||
        raffleData.images?.[0];

    return (
        <section id="prize-section" className="py-20 px-4 bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-16">
                    🏆 PREMIO PRINCIPAL
                </h2>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Información del Premio */}
                    <div className="text-white">
                        <h3 className="text-3xl sm:text-5xl font-black mb-8 text-yellow-400">
                            {mainPrize.title}
                        </h3>

                        {/* Especificaciones del premio desde la BD */}
                        <div className="space-y-4 text-xl">
                            {mainPrizeSpecs.map((spec, index) => (
                                <div key={spec.id} className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>
                                        <strong>{spec.specification_name}:</strong> {spec.specification_value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Descripción del premio */}
                        {mainPrize.description && (
                            <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                                <h4 className="text-xl font-bold mb-4 text-yellow-400">Descripción</h4>
                                <p className="text-gray-300 leading-relaxed">
                                    {mainPrize.description}
                                </p>
                            </div>
                        )}

                        {/* Valor del premio */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl">
                            <p className="text-2xl font-black">
                                💰 Valor comercial: {mainPrize.currency} {mainPrize.value.toLocaleString()}
                            </p>
                            {mainPrize.quantity > 1 && (
                                <p className="text-lg mt-1">
                                    Cantidad: {mainPrize.quantity} {mainPrize.quantity === 1 ? 'unidad' : 'unidades'}
                                </p>
                            )}
                            <p className="text-lg mt-2">
                                {mainPrize.is_cash ? '¡Premio en efectivo!' : '¡Completamente nuevo y equipado!'}
                            </p>
                        </div>

                        {/* Información de entrega */}
                        {mainPrize.delivery_method && (
                            <div className="mt-6 p-4 bg-blue-900/50 rounded-lg border border-blue-700">
                                <h5 className="text-lg font-bold text-blue-300 mb-2">📦 Entrega</h5>
                                <p className="text-blue-100">{mainPrize.delivery_method}</p>
                            </div>
                        )}

                        {/* Términos y condiciones */}
                        {mainPrize.terms_and_conditions && (
                            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                                <h5 className="text-lg font-bold text-gray-300 mb-2">📋 Términos</h5>
                                <p className="text-gray-400 text-sm">{mainPrize.terms_and_conditions}</p>
                            </div>
                        )}

                        {/* Información adicional del sorteo */}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-yellow-400 font-bold">📅 Fecha del Sorteo</div>
                                <div className="text-white">
                                    {new Date(raffleData.draw_date).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-yellow-400 font-bold">🎟️ Precio por Número</div>
                                <div className="text-white text-xl font-bold">${raffleData.price}</div>
                            </div>
                        </div>
                    </div>

                    {/* Imagen del Premio */}
                    <div className="relative">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-2xl">
                            <div className="bg-gray-800 rounded-xl p-8 text-center">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={mainPrize.title}
                                        className="w-full h-64 object-cover rounded-lg mb-6"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                            (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "block");
                                        }}
                                    />
                                ) : null}

                                {/* Fallback si no hay imagen */}
                                <div
                                    className="text-9xl mb-6"
                                    style={{ display: mainImage ? 'none' : 'block' }}
                                >
                                    {mainPrize.is_cash ? '💰' : '🏆'}
                                </div>

                                <h4 className="text-white font-black text-2xl mb-4">
                                    {mainPrize.title}
                                </h4>

                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full font-black text-lg mb-6">
                                    {mainPrize.is_cash ? '¡PREMIO EN EFECTIVO!' : '¡COMPLETAMENTE NUEVO!'}
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-gray-300 text-sm">
                                    <div className="flex items-center justify-center">
                                        <span className="mr-2">📍</span>
                                        <span>{mainPrize.delivery_method || 'Entrega en tu ciudad'}</span>
                                    </div>
                                    {!mainPrize.is_cash && (
                                        <>
                                            <div className="flex items-center justify-center">
                                                <span className="mr-2">📋</span>
                                                <span>Documentos al día</span>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="mr-2">🛡️</span>
                                                <span>Garantía oficial</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Badge de valor flotante */}
                        <div className="absolute -top-4 -right-4 bg-red-600 text-white px-4 py-2 rounded-full font-black text-lg transform rotate-12 shadow-lg">
                            {mainPrize.currency} {mainPrize.value.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Premios secundarios si existen */}
                {raffleData.secondaryPrizes.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-3xl font-black text-white text-center mb-8">
                            🥈 PREMIOS ADICIONALES
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {raffleData.secondaryPrizes.map((prizeComplete, index) => (
                                <div key={prizeComplete.prize.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="text-yellow-400 font-bold text-lg mb-2">
                                        {prizeComplete.prize.title}
                                    </h4>
                                    <p className="text-white font-black text-xl mb-2">
                                        {prizeComplete.prize.currency} {prizeComplete.prize.value.toLocaleString()}
                                    </p>
                                    {prizeComplete.prize.description && (
                                        <p className="text-gray-300 text-sm">
                                            {prizeComplete.prize.description}
                                        </p>
                                    )}
                                    {prizeComplete.prize.quantity > 1 && (
                                        <p className="text-green-400 text-sm mt-1">
                                            {prizeComplete.prize.quantity} ganadores
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Premios bendecidos si existen */}
                {raffleData.blessedPrizes.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-3xl font-black text-white text-center mb-8">
                            ✨ NÚMEROS BENDECIDOS
                        </h3>
                        <div className="bg-gradient-to-r from-purple-800 to-blue-800 p-8 rounded-xl">
                            {raffleData.blessedPrizes.map((prizeComplete, index) => (
                                <div key={prizeComplete.prize.id} className="text-center">
                                    <h4 className="text-yellow-300 font-black text-2xl mb-4">
                                        {prizeComplete.prize.title}
                                    </h4>
                                    <p className="text-white text-3xl font-black mb-4">
                                        {prizeComplete.prize.currency} {prizeComplete.prize.value.toLocaleString()}
                                    </p>
                                    {prizeComplete.prize.description && (
                                        <p className="text-purple-200 text-lg mb-4">
                                            {prizeComplete.prize.description}
                                        </p>
                                    )}
                                    {prizeComplete.prize.quantity > 1 && (
                                        <p className="text-green-300 font-bold">
                                            {prizeComplete.prize.quantity} números bendecidos disponibles
                                        </p>
                                    )}
                                </div>
                            ))}
                            {raffleData.blessedNumbers.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-white mb-4">Números bendecidos activos:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {raffleData.blessedNumbers.map((number, index) => (
                                            <span
                                                key={index}
                                                className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold"
                                            >
                                                {number}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Galería de imágenes adicionales del premio principal */}
                {mainPrizeImages.length > 1 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-black text-white text-center mb-8">
                            📸 Galería de Imágenes
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mainPrizeImages.slice(1, 5).map((image, index) => (
                                <div key={image.id} className="relative group">
                                    <img
                                        src={image.image_url}
                                        alt={image.alt_text || `${mainPrize.title} - Imagen ${index + 2}`}
                                        className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">Ver más</span>
                                    </div>
                                    {image.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-lg">
                                            {image.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}