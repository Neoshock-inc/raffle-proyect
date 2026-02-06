// src/components/offroad/TestimonialsSection.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/types/template';

interface TestimonialsSectionProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

export function TestimonialsSection({ raffleData, tenantConfig }: TestimonialsSectionProps) {
    // Usar testimonios de raffleData o fallback a testimonios por defecto
    const testimonials = raffleData.testimonials && raffleData.testimonials.length > 0
        ? raffleData.testimonials
        : [
            {
                id: 1,
                name: "Carlos Mendoza",
                location: "Quito",
                comment: "No podía creer cuando me llamaron. Gané una camioneta increíble con solo 5 números. El proceso fue súper transparente y confiable.",
                rating: 5,
                avatar: "https://plus.unsplash.com/premium_photo-1679888488670-4b4bf8e05bfc?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: raffleData.price * raffleData.total_numbers * 0.1
            },
            {
                id: 2,
                name: "María González",
                location: "Guayaquil",
                comment: "Participé con 10 números y aunque no gané el premio mayor, gané $2000 en efectivo. Definitivamente volveré a participar.",
                rating: 5,
                avatar: "https://plus.unsplash.com/premium_photo-1690086519096-0594592709d3?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: 2000
            },
            {
                id: 3,
                name: "Roberto Silva",
                location: "Cuenca",
                comment: "La transmisión en vivo me dio total confianza. Vi todo el sorteo desde mi casa y el proceso fue 100% transparente.",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: 5000
            },
            {
                id: 4,
                name: "Ana López",
                location: "Manta",
                comment: "Excelente organización. El sorteo se realizó exactamente como prometieron y los premios se entregaron inmediatamente.",
                rating: 5,
                avatar: "https://plus.unsplash.com/premium_photo-1670884441012-c5cf195c062a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: 1500
            }
        ];

    return (
        <section className="py-10 px-4 bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-16">
                    💬 TESTIMONIOS REALES
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-400 transition-colors"
                        >
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                    {testimonial.avatar ? (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-full h-full bg-gray-600 flex items-center justify-center text-2xl"
                                        style={{ display: testimonial.avatar ? 'none' : 'flex' }}
                                    >
                                        👤
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-xl">{testimonial.name}</h4>
                                    <p className="text-gray-400">{testimonial.location}</p>
                                    {testimonial.prize_value && (
                                        <p className="text-yellow-400 text-sm font-bold">
                                            Ganó: ${testimonial.prize_value.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                ))}
                            </div>

                            <p className="text-gray-300 text-lg leading-relaxed italic">
                                "{testimonial.comment}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Llamada a la acción para testimonios */}
                <div className="mt-16 text-center">
                    <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-black text-white mb-4">
                            ¿Quieres ser el próximo testimonio?
                        </h3>
                        <p className="text-gray-300 text-lg mb-6">
                            Únete a los cientos de ganadores que ya confiaron en nosotros
                        </p>
                        <button
                            onClick={() => {
                                const packagesSection = document.getElementById('packages-section');
                                packagesSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                        >
                            ¡PARTICIPAR AHORA!
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}