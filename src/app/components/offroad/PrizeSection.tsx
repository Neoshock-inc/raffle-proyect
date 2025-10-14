// src/components/offroad/PrizeSection.tsx
'use client';

import React, { useState } from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface PrizeSectionProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

interface ImageModalProps {
    images: any[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    prizeTitle: string;
}

function ImageModal({ images, currentIndex, isOpen, onClose, onNext, onPrev, prizeTitle }: ImageModalProps) {
    if (!isOpen) return null;

    const currentImage = images[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            {/* Botón cerrar */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl font-bold z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label="Cerrar galería"
            >
                ×
            </button>

            {/* Navegación anterior */}
            {images.length > 1 && (
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl font-bold bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                    aria-label="Imagen anterior"
                >
                    ‹
                </button>
            )}

            {/* Imagen principal */}
            <div className="max-w-5xl max-h-[90vh] relative">
                <img
                    src={currentImage.image_url}
                    alt={currentImage.alt_text || `${prizeTitle} - Imagen ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />

                {/* Información de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                    {currentImage.caption && (
                        <p className="text-white text-sm mb-1">{currentImage.caption}</p>
                    )}
                    <p className="text-gray-300 text-xs">
                        {currentIndex + 1} de {images.length}
                    </p>
                </div>
            </div>

            {/* Navegación siguiente */}
            {images.length > 1 && (
                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 text-4xl font-bold bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                    aria-label="Imagen siguiente"
                >
                    ›
                </button>
            )}

            {/* Miniaturas de navegación */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 rounded-lg p-2">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            onClick={() => {
                                // Esta funcionalidad se puede implementar pasando un callback desde el componente padre
                            }}
                            className={`w-12 h-12 rounded overflow-hidden transition-opacity ${index === currentIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                                }`}
                        >
                            <img
                                src={img.image_url}
                                alt={`Miniatura ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PrizeSection({ raffleData, tenantConfig }: PrizeSectionProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Usar el premio principal desde la base de datos
    const mainPrize = raffleData.mainPrize?.prize;
    const mainPrizeSpecs = raffleData.mainPrize?.specifications || [];
    const mainPrizeImages = raffleData.mainPrize?.images || [];

    // Funciones para manejar el modal
    const openModal = (index: number) => {
        setCurrentImageIndex(index);
        setModalOpen(true);
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentImageIndex(0);
        // Restaurar scroll del body
        document.body.style.overflow = 'unset';
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % mainPrizeImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + mainPrizeImages.length) % mainPrizeImages.length);
    };

    // Manejar teclas del teclado
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!modalOpen) return;

            switch (e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [modalOpen]);

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

                        {/* Términos y condiciones */}
                        {mainPrize.terms_and_conditions && (
                            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                                <h5 className="text-lg font-bold text-gray-300 mb-2">📋 Términos</h5>
                                <p className="text-gray-400 text-sm"><strong>Importante:</strong> {mainPrize.terms_and_conditions}</p>
                            </div>
                        )}

                        {/* Información adicional del sorteo */}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-yellow-400 font-bold">📅 Fecha de lanzamiento</div>
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
                                <div className="text-yellow-400 font-bold">🎟️ Precio por Boleto</div>
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
                                        className="w-full h-64 object-cover rounded-lg mb-6 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => openModal(0)}
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {raffleData.blessedPrizes.map((prizeComplete) => (
                                <div
                                    key={prizeComplete.prize.id}
                                    className="bg-gradient-to-r from-purple-800 to-blue-800 p-6 rounded-xl border border-purple-600 text-center"
                                >
                                    <h4 className="text-yellow-300 font-black text-2xl mb-3">
                                        {prizeComplete.prize.title}
                                    </h4>

                                    <p className="text-white text-3xl font-black mb-3">
                                        {prizeComplete.prize.currency}{" "}
                                        {prizeComplete.prize.value.toLocaleString()}
                                    </p>

                                    {prizeComplete.prize.description && (
                                        <p className="text-purple-200 text-sm mb-3">
                                            {prizeComplete.prize.description}
                                        </p>
                                    )}

                                    {prizeComplete.prize.quantity > 1 && (
                                        <p className="text-green-300 font-bold text-sm">
                                            {prizeComplete.prize.quantity} números bendecidos disponibles
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {raffleData.blessedNumbers.length > 0 && (
                            <div className="mt-10 text-center">
                                <p className="text-white mb-4 text-lg font-semibold">
                                    Números bendecidos activos:
                                </p>
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
                )}

                {/* Galería de imágenes adicionales del premio principal */}
                {mainPrizeImages.length > 1 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-black text-white text-center mb-8">
                            📸 Galería de Imágenes
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mainPrizeImages.slice(1, 5).map((image, index) => (
                                <div
                                    key={image.id}
                                    className="relative group cursor-pointer"
                                    onClick={() => openModal(index + 1)}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={image.alt_text || `${mainPrize.title} - Imagen ${index + 2}`}
                                        className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center pointer-events-none">
                                        <div className="text-white font-bold flex items-center space-x-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                            <span>Ampliar</span>
                                        </div>
                                    </div>
                                    {image.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            {image.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mostrar más imágenes si hay más de 4 */}
                        {mainPrizeImages.length > 5 && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={() => openModal(1)}
                                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Ver todas las imágenes ({mainPrizeImages.length})
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal de Galería */}
                <ImageModal
                    images={mainPrizeImages}
                    currentIndex={currentImageIndex}
                    isOpen={modalOpen}
                    onClose={closeModal}
                    onNext={nextImage}
                    onPrev={prevImage}
                    prizeTitle={mainPrize.title}
                />
            </div>
        </section>
    );
}