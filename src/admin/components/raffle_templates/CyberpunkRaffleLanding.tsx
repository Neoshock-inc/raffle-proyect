import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Trophy, Users, Clock, Star, ArrowRight } from 'lucide-react';

// Interfaces
interface CarouselSlide {
    id: number;
    title: string;
    subtitle: string;
    price: string;
    image: string;
    gradient: string;
}

interface ActiveRaffle {
    id: number;
    name: string;
    participants: number;
    maxTickets: number;
    price: number;
}

interface Testimonial {
    id: number;
    name: string;
    prize: string;
    message: string;
    avatar: string;
    rating: number;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CyberpunkProps {
    previewMode?: boolean;
    device?: 'desktop' | 'tablet' | 'mobile';
    [key: string]: unknown;
}

const CyberpunkRaffleLanding: React.FC<CyberpunkProps> = ({ previewMode = false, device = 'desktop' }) => {
    const isMobile = device === 'mobile';
    const isTablet = device === 'tablet';
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 5, hours: 12, minutes: 30, seconds: 45 });
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

    // Datos del carrusel
    const carouselSlides: CarouselSlide[] = [
        {
            id: 1,
            title: "iPhone 15 Pro Max",
            subtitle: "Premio Principal",
            price: "$1,200",
            image: "https://http2.mlstatic.com/D_Q_NP_924631-MLA71783367058_092023-O.webp",
            gradient: "from-purple-600 via-pink-600 to-red-600"
        },
        {
            id: 2,
            title: "Tesla Model Y",
            subtitle: "Gran Premio",
            price: "$45,000",
            image: "https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg",
            gradient: "from-blue-600 via-cyan-600 to-teal-600"
        },
        {
            id: 3,
            title: "Gaming Setup",
            subtitle: "Para Gamers",
            price: "$3,500",
            image: "https://www.bestcell.com.ec/img/cotiza-pc-gamer-oficina.webp",
            gradient: "from-green-600 via-emerald-600 to-blue-600"
        }
    ];

    const activeRaffles: ActiveRaffle[] = [
        { id: 1, name: "iPhone 15 Pro", participants: 1250, maxTickets: 2000, price: 25 },
        { id: 2, name: "PlayStation 5", participants: 850, maxTickets: 1500, price: 15 },
        { id: 3, name: "MacBook Pro M3", participants: 650, maxTickets: 1000, price: 35 },
        { id: 4, name: "Samsung Galaxy S24", participants: 920, maxTickets: 1200, price: 20 }
    ];

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "María González",
            prize: "iPhone 14 Pro",
            message: "¡No lo podía creer! Participé con solo $20 y gané mi iPhone soñado. ¡CyberRifas es increíble!",
            avatar: "https://www.shutterstock.com/image-photo/portrait-smiling-young-woman-600nw-1850821510.jpg",
            rating: 5
        },
        {
            id: 2,
            name: "Carlos Mendoza",
            prize: "Tesla Model 3",
            message: "Después de años comprando boletos, finalmente gané algo grande. ¡Mi Tesla ya está en casa!",
            avatar: "https://www.shutterstock.com/image-photo/smiling-cheerful-young-adult-african-600nw-1850821510.jpg",
            rating: 5
        },
        {
            id: 3,
            name: "Ana Rodríguez",
            prize: "MacBook Pro",
            message: "Perfecta para mi trabajo. La plataforma es súper fácil de usar y totalmente confiable.",
            avatar: "https://www.shutterstock.com/image-photo/portrait-smiling-young-woman-600nw-1850821510.jpg",
            rating: 5
        },
        {
            id: 4,
            name: "Diego Silva",
            prize: "Gaming Setup",
            message: "Mi setup gamer completo por solo $45. ¡Ahora soy streamer gracias a CyberRifas!",
            avatar: "https://www.shutterstock.com/image-photo/smiling-cheerful-young-adult-african-600nw-1850821510.jpg",
            rating: 5
        }
    ];

    const availableNumbers: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
    const soldNumbers: number[] = [7, 13, 22, 31, 45, 58, 67, 73, 89, 94];

    // Carrusel automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % carouselSlides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [carouselSlides.length]);

    // Testimonios automáticos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev: number) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    // Contador regresivo
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev: TimeLeft) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = (): void => {
        setCurrentSlide((prev: number) => (prev + 1) % carouselSlides.length);
    };

    const prevSlide = (): void => {
        setCurrentSlide((prev: number) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    };

    const toggleNumber = (number: number): void => {
        if (soldNumbers.includes(number)) return;

        setSelectedNumbers((prev: number[]) =>
            prev.includes(number)
                ? prev.filter((n: number) => n !== number)
                : [...prev, number]
        );
    };

    const filteredRaffles: ActiveRaffle[] = activeRaffles.filter((raffle: ActiveRaffle) =>
        raffle.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Efectos de fondo */}
            <div className={`${previewMode ? 'absolute' : 'fixed'} inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20`}></div>

            {/* Header */}
            <header className="relative z-10 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            CYBER<span className="text-pink-500">RIFAS</span>
                        </div>
                        <nav className={`${isMobile ? 'hidden' : 'hidden md:flex'} space-x-8`}>
                            <a href="#" className="hover:text-cyan-400 transition-colors">Inicio</a>
                            <a href="#rifas" className="hover:text-cyan-400 transition-colors">Rifas Activas</a>
                            <a href="#numeros" className="hover:text-cyan-400 transition-colors">Comprar Números</a>
                            <a href="#testimonios" className="hover:text-cyan-400 transition-colors">Testimonios</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a>
                        </nav>
                        <button className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2 rounded-full hover:from-pink-500 hover:to-purple-500 transition-all transform hover:scale-105">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section con Carrusel */}
            <section className="relative z-10 pt-20 pb-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className={`${isMobile ? 'text-4xl' : isTablet ? 'text-6xl' : 'text-6xl md:text-8xl'} font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                            GANA EN GRANDE
                        </h1>
                        <p className={`${isMobile ? 'text-base' : 'text-xl md:text-2xl'} text-gray-300 max-w-3xl mx-auto`}>
                            Participa en las rifas más emocionantes del futuro. Premios increíbles, probabilidades justas.
                        </p>
                    </div>

                    {/* Carrusel */}
                    <div className="relative max-w-4xl mx-auto">
                        <div className="relative h-96 overflow-hidden rounded-3xl border-2 border-cyan-500/50">
                            {carouselSlides.map((slide: CarouselSlide, index: number) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-transform duration-700 ease-in-out ${index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                                        }`}
                                >
                                    <div className={`h-full bg-gradient-to-br ${slide.gradient} relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/30"></div>
                                        <div className="relative z-10 h-full flex items-center justify-between px-12">
                                            <div className="text-left">
                                                <p className="text-cyan-300 text-lg mb-2">{slide.subtitle}</p>
                                                <h3 className="text-5xl font-bold mb-4">{slide.title}</h3>
                                                <p className="text-3xl font-bold text-yellow-400">{slide.price}</p>
                                                <button className="mt-6 bg-white/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all">
                                                    Participar Ahora
                                                </button>
                                            </div>
                                            <div className="text-9xl opacity-80">
                                                <img src={slide.image} alt={slide.title} className="h-48 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles del carrusel */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-3 rounded-full border border-cyan-500/50 hover:bg-black/70 transition-all"
                        >
                            <ChevronLeft className="w-6 h-6 text-cyan-400" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md p-3 rounded-full border border-cyan-500/50 hover:bg-black/70 transition-all"
                        >
                            <ChevronRight className="w-6 h-6 text-cyan-400" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                            {carouselSlides.map((_, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-cyan-400' : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contador Regresivo */}
            <section className="relative z-10 py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl border border-purple-500/30 p-8 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8 text-cyan-400">
                            ⚡ RIFA ESPECIAL TERMINA EN ⚡
                        </h2>
                        <div className="flex justify-center space-x-8">
                            {Object.entries(timeLeft).map(([unit, value]: [string, number]) => (
                                <div key={unit} className="text-center">
                                    <div className="bg-black/50 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 min-w-20">
                                        <div className="text-3xl font-bold text-yellow-400">{value.toString().padStart(2, '0')}</div>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-2 capitalize">{unit}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Barra de Búsqueda */}
            <section className="relative z-10 py-8 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-md">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar rifas por producto..."
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/70 backdrop-blur-md border-2 border-cyan-500/30 rounded-full px-6 py-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="text-cyan-400">🔍</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rifas Activas */}
            <section id="rifas" className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        RIFAS ACTIVAS
                    </h2>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
                        {filteredRaffles.map((raffle: ActiveRaffle) => (
                            <div key={raffle.id} className="bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 hover:border-pink-500/50 transition-all duration-300 group hover:transform hover:scale-105">
                                <div className="text-center mb-4">
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors">{raffle.name}</h3>
                                    <div className="text-3xl mb-3">🏆</div>
                                    <div className="text-2xl font-bold text-yellow-400">${raffle.price}</div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Participantes</span>
                                        <span>{raffle.participants}/{raffle.maxTickets}</span>
                                    </div>
                                    <div className="bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${(raffle.participants / raffle.maxTickets) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all group-hover:shadow-lg group-hover:shadow-purple-500/25">
                                    Participar Ahora
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sección de Números a Comprar */}
            <section id="numeros" className="relative z-10 py-20 bg-gradient-to-b from-gray-900/30 to-black/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        SELECCIONA TUS NÚMEROS DE LA SUERTE
                    </h2>

                    <div className="max-w-6xl mx-auto">
                        <div className="bg-black/60 backdrop-blur-md rounded-3xl border border-yellow-500/30 p-8">
                            <div className={`grid ${isMobile ? 'grid-cols-5 gap-2' : 'grid-cols-10 gap-3'} mb-8`}>
                                {availableNumbers.map((number: number) => {
                                    const isSelected: boolean = selectedNumbers.includes(number);
                                    const isSold: boolean = soldNumbers.includes(number);

                                    return (
                                        <button
                                            key={number}
                                            onClick={() => toggleNumber(number)}
                                            disabled={isSold}
                                            className={`
                        aspect-square rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-110
                        ${isSold
                                                    ? 'bg-red-900/50 text-red-400 cursor-not-allowed border border-red-500/30'
                                                    : isSelected
                                                        ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 border-2 border-cyan-400'
                                                        : 'bg-gray-800/70 text-gray-300 hover:bg-gradient-to-br hover:from-cyan-600/30 hover:to-purple-600/30 border border-gray-600'
                                                }
                      `}
                                        >
                                            {number.toString().padStart(2, '0')}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">Números Seleccionados: {selectedNumbers.length}</h3>
                                    <p className="text-gray-300">Total a pagar: <span className="text-yellow-400 font-bold text-xl">${selectedNumbers.length * 25}</span></p>
                                    {selectedNumbers.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-400">Tus números: </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedNumbers.sort((a: number, b: number) => a - b).map((num: number) => (
                                                    <span key={num} className="bg-cyan-600/30 text-cyan-300 px-2 py-1 rounded text-sm">
                                                        {num.toString().padStart(2, '0')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    disabled={selectedNumbers.length === 0}
                                    className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${selectedNumbers.length > 0
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white transform hover:scale-105 shadow-lg shadow-green-500/25'
                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedNumbers.length > 0 ? 'Comprar Números' : 'Selecciona Números'}
                                </button>
                            </div>

                            <div className="mt-6 grid md:grid-cols-3 gap-4 text-center text-sm">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 bg-gray-800 border border-gray-600 rounded"></div>
                                    <span className="text-gray-400">Disponible</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded"></div>
                                    <span className="text-gray-400">Seleccionado</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 bg-red-900/50 border border-red-500/30 rounded"></div>
                                    <span className="text-gray-400">Vendido</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonios */}
            <section id="testimonios" className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        HISTORIAS DE GANADORES
                    </h2>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl border-2 border-green-500/30 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md">
                            {testimonials.map((testimonial: Testimonial, index: number) => (
                                <div
                                    key={testimonial.id}
                                    className={`p-8 transition-transform duration-700 ease-in-out ${index === currentTestimonial ? 'translate-x-0' : index < currentTestimonial ? '-translate-x-full' : 'translate-x-full'
                                        } ${index !== currentTestimonial ? 'absolute inset-0' : ''}`}
                                >
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">
                                            <img src={testimonial.avatar} alt={testimonial.name} className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-green-400 mb-2">{testimonial.name}</h3>
                                        <p className="text-yellow-400 font-semibold mb-4">Ganó: {testimonial.prize}</p>

                                        <div className="flex justify-center mb-4">
                                            {[...Array(testimonial.rating)].map((_, i: number) => (
                                                <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                            ))}
                                        </div>

                                        <blockquote className="text-lg text-gray-300 italic max-w-2xl mx-auto">
                                            "{testimonial.message}"
                                        </blockquote>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-6 space-x-2">
                            {testimonials.map((_, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-green-400' : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-8`}>
                        <div className="text-center">
                            <div className="bg-gradient-to-b from-cyan-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-cyan-400 mb-2">$2.5M+</h3>
                            <p className="text-gray-400">En Premios Entregados</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gradient-to-b from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-purple-400 mb-2">50K+</h3>
                            <p className="text-gray-400">Participantes Activos</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gradient-to-b from-pink-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-pink-400 mb-2">15,000+</h3>
                            <p className="text-gray-400">Ganadores Felices</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-red-900/80 backdrop-blur-md rounded-3xl border border-purple-500/50 p-12 text-center">
                        <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent`}>
                            ¿LISTO PARA GANAR?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Únete a miles de participantes y convierte tus sueños en realidad. El próximo ganador podrías ser tú.
                        </p>
                        <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                            Comenzar Ahora <ArrowRight className="inline ml-2 w-6 h-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-black/90 border-t border-cyan-500/30 py-12">
                <div className="container mx-auto px-4">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-4'} gap-8`}>
                        <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                CYBER<span className="text-pink-500">RIFAS</span>
                            </div>
                            <p className="text-gray-400">La plataforma de rifas más segura y emocionante del futuro.</p>
                        </div>
                        <div>
                            <h4 className="text-cyan-400 font-bold mb-4">Rifas</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Activas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Próximamente</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Finalizadas</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-cyan-400 font-bold mb-4">Síguenos</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 CyberRifas. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CyberpunkRaffleLanding;