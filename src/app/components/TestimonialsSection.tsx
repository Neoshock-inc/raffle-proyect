// components/TestimonialsSection.tsx
'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
    id: number;
    name: string;
    verified: boolean;
    date: string;
    rating: number;
    comment: string;
    image: string;
    prize?: string;
}

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si es mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Datos estáticos de testimonios
    const testimonials: Testimonial[] = [
        {
            id: 7,
            name: "Emily R.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡El mejor sorteo en el que he participado! El premio es increíble y el servicio excepcional.",
            image: "/images/testimonials/IMG_8583.jpeg"
        },
        {
            id: 8,
            name: "Michael T.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "Participar fue muy fácil y rápido. ¡Ya estoy esperando el próximo sorteo!",
            image: "/images/testimonials/IMG_8584.jpeg"
        },
        {
            id: 1,
            name: "Alex G.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡Increíble! Gané el carro de mis sueños. El proceso fue súper fácil y transparente. Recomiendo 100% participar.",
            image: "/images/testimonials/IMG_8577.jpeg",
        },
        {
            id: 2,
            name: "Rassul N.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "Excelente producto! No necesité mucho para hacer la diferencia. Definitivamente estaré participando en más sorteos.",
            image: "/images/testimonials/IMG_8578.jpeg"
        },
        {
            id: 3,
            name: "Chris W.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "La experiencia fue cómoda y el diseño genial. Me gustó tanto que compré números para mi jefe también. ¡El 2xl quedó perfecto!",
            image: "/images/testimonials/IMG_8579.jpeg"
        },
        {
            id: 4,
            name: "Jeferson A.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡Me encantó! El premio es espectacular y el proceso de compra muy sencillo. Definitivamente participaré en más sorteos.",
            image: "/images/testimonials/IMG_8580.jpeg"
        },
        {
            id: 5,
            name: "Roberto C.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡Increíble! Gané el carro de mis sueños. El proceso fue súper fácil y transparente. Recomiendo 100% participar.",
            image: "/images/testimonials/IMG_8581.jpeg"
        },
        {
            id: 6,
            name: "Jared B.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "Tengo una moto negra para cada día de la semana, ¡y ahora también para los respaldos! Calidad premium.",
            image: "/images/testimonials/IMG_8582.jpeg",
        },
        {
            id: 9,
            name: "Leonardo S.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡Me encantó! El premio es espectacular y el proceso de compra muy sencillo.",
            image: "/images/testimonials/IMG_8586.jpeg"
        },
        {
            id: 10,
            name: "David M.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "Una experiencia única. El premio superó mis expectativas. ¡Gracias por todo!",
            image: "/images/testimonials/IMG_8589.jpeg"
        },
        {
            id: 11,
            name: "Victoria P.",
            verified: true,
            date: "4/8/2025",
            rating: 5,
            comment: "¡Increíble! Gané el carro de mis sueños. El proceso fue súper fácil y transparente. Recomiendo 100% participar.",
            image: "/images/testimonials/WINER.jpg",
            prize: "Yamaha MT03"
        },
    ];

    // Calcular items por página según el dispositivo
    const itemsPerPage = isMobile ? 1 : 3;
    const totalPages = Math.ceil(testimonials.length / itemsPerPage);

    // Reset index cuando cambia el tamaño de pantalla
    useEffect(() => {
        if (currentIndex >= totalPages) {
            setCurrentIndex(0);
        }
    }, [totalPages, currentIndex]);

    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex >= totalPages - 1 ? 0 : prevIndex + 1
        );
    };

    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex <= 0 ? totalPages - 1 : prevIndex - 1
        );
    };

    const getVisibleTestimonials = () => {
        const start = currentIndex * itemsPerPage;
        const end = start + itemsPerPage;
        return testimonials.slice(start, end);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
            />
        ));
    };

    return (
        <section className="w-full max-w-6xl mx-auto py-3 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#fa8d3b] to-orange-600 mb-2 text-center">
                    ¡Más de $250,000 en premios ya entregados!
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-4">
                    El próximo ganador eres tú
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex">
                        {renderStars(5)}
                    </div>
                    <span className="text-sm text-gray-600">22,328 Reviews</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex justify-center gap-6 text-sm text-gray-600">
                    <span className="border-b-2 border-[#fa8d3b] pb-1">Product reviews</span>
                    <span>Store reviews</span>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="relative">
                {/* Navigation Buttons - Solo mostrar en desktop */}
                {!isMobile && totalPages > 1 && (
                    <>
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Testimonio anterior"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>

                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                            aria-label="Siguiente testimonio"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-600" />
                        </button>
                    </>
                )}

                {/* Testimonials Container */}
                <div className={`${isMobile ? 'px-4' : 'overflow-hidden px-12'}`}>
                    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
                        {(isMobile ? testimonials : getVisibleTestimonials()).map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.01] border border-gray-200 max-w-sm mx-auto md:max-w-none"
                            >
                                {/* Imagen testimonial */}
                                <div className="h-100 md:h-64 w-full relative">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover object-center"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Contenido */}
                                <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-800">{testimonial.name}</div>
                                        {testimonial.verified && (
                                            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                                                <span className="text-xl">✔</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">{testimonial.date}</div>

                                    {/* Estrellas */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < testimonial.rating ? 'text-blue-500 fill-current' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Premio */}
                                    {testimonial.prize && (
                                        <div className="inline-block bg-gradient-to-r from-[#fa8d3b] to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold w-fit">
                                            🏆 Ganador: {testimonial.prize}
                                        </div>
                                    )}

                                    {/* Comentario */}
                                    <p className="text-sm text-gray-700 leading-relaxed flex-1">
                                        {testimonial.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots Indicator - Solo mostrar en desktop */}
                {!isMobile && totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-[#fa8d3b]' : 'bg-gray-300'
                                    }`}
                                aria-label={`Ir al testimonio ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}