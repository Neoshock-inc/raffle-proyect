// src/components/offroad/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface HeroSectionProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

interface ImageCarouselProps {
    images: string[];
    title: string;
}

function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentImage, setCurrentImage] = useState(0);
    const [imageErrors, setImageErrors] = useState<boolean[]>(new Array(images.length).fill(false));

    // Imágenes de fallback para el tema offroad
    const fallbackImages = [
        "https://planner5d.com/blog/content/images/2022/05/vinicius-amnx-amano-17NCG_wOkMY-unsplash.jpg",
        "https://planner5d.com/blog/content/images/2022/05/andre-francois-mckenzie-sZ5CteK2r6E-unsplash.jpg",
        "https://planner5d.com/blog/content/images/2022/06/spacejoy-k2pumSRYYss-unsplash.jpg"
    ];

    const displayImages = images.length > 0 ? images : fallbackImages;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % displayImages.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [displayImages.length]);

    const handleImageError = (index: number) => {
        setImageErrors(prev => {
            const newErrors = [...prev];
            newErrors[index] = true;
            return newErrors;
        });
    };

    return (
        <div className="absolute inset-0 overflow-hidden">
            {displayImages.map((imageUrl, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {!imageErrors[index] ? (
                        <img
                            src={imageUrl}
                            alt={`${title} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(index)}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="text-9xl mb-4">🚙</div>
                                <h3 className="text-4xl font-black">4X4 OFF-ROAD</h3>
                                <p className="text-xl">Aventura Extrema</p>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            ))}

            {/* Indicadores del carrusel */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImage
                                ? 'bg-white scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                        onClick={() => setCurrentImage(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

function CountdownTimer({ endDate }: { endDate: string }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const end = new Date(endDate).getTime();
            const difference = end - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex gap-4 justify-center text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-300">
                        {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs uppercase tracking-wider">
                        {unit === 'days' ? 'días' :
                            unit === 'hours' ? 'hrs' :
                                unit === 'minutes' ? 'min' : 'seg'}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function HeroSection({ raffleData, tenantConfig }: HeroSectionProps) {
    const scrollToPackages = () => {
        const packagesSection = document.getElementById('packages-section');
        packagesSection?.scrollIntoView({ behavior: 'smooth' });
    };

    // Calcular el valor total del premio
    const prizeValue = raffleData.price * raffleData.total_numbers;

    return (
        <header className="relative overflow-hidden h-screen text-white">
            {/* Carrusel de imágenes de fondo */}
            <ImageCarousel
                images={raffleData.images || []}
                title={raffleData.title}
            />

            {/* Contenido sobre las imágenes */}
            <div className="relative z-20 h-full flex items-center justify-center">
                <div className="max-w-6xl mx-auto text-center px-4">
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl">
                        {raffleData.title.split(' ').map((word, index, array) => (
                            <span key={index} className={index === array.length - 1 ? "block text-yellow-300 animate-pulse" : ""}>
                                {word}{index < array.length - 1 ? ' ' : ''}
                            </span>
                        ))}
                    </h1>

                    <p className="text-xl sm:text-3xl font-bold mb-8 opacity-90 drop-shadow-lg">
                        {raffleData.description}
                    </p>

                    {/* Contador regresivo */}
                    {tenantConfig.features.countdown && raffleData.draw_date && (
                        <div className="mb-8">
                            <CountdownTimer endDate={raffleData.draw_date} />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                        <div className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30">
                            <span className="font-black text-2xl">
                                Premio: ${prizeValue.toLocaleString()} USD
                            </span>
                        </div>
                        <div className="bg-green-500 text-white px-8 py-4 rounded-full font-black text-xl animate-pulse">
                            ✅ Sorteo Supervisado
                        </div>
                    </div>

                    {/* Progreso si está habilitado */}
                    {/* {tenantConfig.features.progressBar && (
                        <div className="mb-3 max-w-[100%] mx-auto">
                            <div className="bg-black/30 backdrop-blur-sm rounded-full px-6 py-4 max-w-lg mx-auto">
                                <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                                        style={{ width: `${Math.min(raffleData.progress || 0, 100)}%` }}
                                    />
                                </div>
                                <div className="text-center mt-2 font-bold">
                                    {Math.round(raffleData.progress || 0)}% vendido
                                </div>
                            </div>
                        </div>
                    )} */}

                    <button
                        onClick={scrollToPackages}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                        ¡PARTICIPAR AHORA!
                    </button>
                </div>
            </div>

            {/* Gradiente en la parte inferior para transición */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800 to-transparent z-10"></div>
        </header>
    );
}