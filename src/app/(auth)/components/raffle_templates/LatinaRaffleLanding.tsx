import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Interfaces
interface CarouselSlide {
    id: number;
    title: string;
    subtitle: string;
    price: string;
    image: string;
    gradient: string;
    location?: string;
}

interface ActiveRaffle {
    id: number;
    name: string;
    participants: number;
    maxTickets: number;
    pricePerTicket: number;
    progress: number;
    image: string;
    category: string;
}

interface NumberPackage {
    id: number;
    quantity: number;
    price: number;
    discount: number;
    popular: boolean;
    bonus?: string;
}

interface Testimonial {
    id: number;
    name: string;
    prize: string;
    message: string;
    avatar: string;
    rating: number;
    location: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const LatinaRaffleLanding: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 3, hours: 8, minutes: 45, seconds: 30 });
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

    // Datos del carrusel principal
    const carouselSlides: CarouselSlide[] = [
        {
            id: 1,
            title: "Viaje a Cancún",
            subtitle: "¡Todo Incluido!",
            price: "$5,000",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/d3/63/3e/hotel-krystal-cancun.jpg?w=1200&h=-1&s=1",
            gradient: "from-orange-400 via-red-500 to-pink-500",
            location: "México"
        },
        {
            id: 2,
            title: "Moto Yamaha",
            subtitle: "0KM Nueva",
            price: "$8,500",
            image: "https://www.yamahamotos.cl/wp-content/uploads/2025/05/MT_09_AZUL-2.jpg",
            gradient: "from-green-400 via-blue-500 to-purple-500"
        },
        {
            id: 3,
            title: "iPhone 15 Pro",
            subtitle: "Último Modelo",
            price: "$1,200",
            image: "https://http2.mlstatic.com/D_Q_NP_812116-MLA71783168214_092023-O.webp",
            gradient: "from-yellow-400 via-orange-500 to-red-500"
        },
        {
            id: 4,
            title: "$10,000 Cash",
            subtitle: "Efectivo",
            price: "$10,000",
            image: "https://cusomag.com/wp-content/uploads/2024/08/importance-of-cash-min-scaled.jpg",
            gradient: "from-green-400 via-emerald-500 to-teal-500"
        }
    ];

    // Rifas activas con progreso
    const activeRaffles: ActiveRaffle[] = [
        {
            id: 1,
            name: "Viaje a Punta Cana",
            participants: 750,
            maxTickets: 1000,
            pricePerTicket: 15,
            progress: 75,
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/d3/63/3e/hotel-krystal-cancun.jpg?w=1200&h=-1&s=1",
            category: "Viajes"
        },
        {
            id: 2,
            name: "Samsung Galaxy S24",
            participants: 420,
            maxTickets: 600,
            pricePerTicket: 20,
            progress: 70,
            image: "https://images.samsung.com/is/image/samsung/assets/latin/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titanium-gray-back-mo.jpg",
            category: "Tecnología"
        },
        {
            id: 3,
            name: "Moto Honda CB",
            participants: 890,
            maxTickets: 1200,
            pricePerTicket: 25,
            progress: 74,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2j46ksCKSs4yfuJ5OEAYDlO8xVaGaMaxwbQ&s",
            category: "Vehículos"
        },
        {
            id: 4,
            name: "PlayStation 5 + Juegos",
            participants: 340,
            maxTickets: 500,
            pricePerTicket: 18,
            progress: 68,
            image: "https://ecsonyb2c.vtexassets.com/arquivos/ids/253642/711719570875_002.jpg?v=638748821119770000",
            category: "Gaming"
        },
        {
            id: 5,
            name: "MacBook Pro M3",
            participants: 290,
            maxTickets: 400,
            pricePerTicket: 35,
            progress: 72,
            image: "https://mobilestore.ec/wp-content/uploads/2023/11/MacBook-Pro-M3-Space-Gray-Mobile-Store-Ecuador.jpg",
            category: "Tecnología"
        },
        {
            id: 6,
            name: "$5,000 Cash",
            participants: 950,
            maxTickets: 1500,
            pricePerTicket: 12,
            progress: 63,
            image: "https://cusomag.com/wp-content/uploads/2024/08/importance-of-cash-min-scaled.jpg",
            category: "Efectivo"
        }
    ];

    // Paquetes de números
    const numberPackages: NumberPackage[] = [
        {
            id: 1,
            quantity: 10,
            price: 150,
            discount: 0,
            popular: false
        },
        {
            id: 2,
            quantity: 25,
            price: 350,
            discount: 10,
            popular: true,
            bonus: "¡5 números GRATIS!"
        },
        {
            id: 3,
            quantity: 50,
            price: 650,
            discount: 18,
            popular: false,
            bonus: "¡15 números GRATIS!"
        },
        {
            id: 4,
            quantity: 100,
            price: 1200,
            discount: 25,
            popular: false,
            bonus: "¡35 números GRATIS!"
        }
    ];

    // Testimonios latinos
    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Carmen Rodríguez",
            prize: "Viaje a Miami",
            message: "¡Increíble! Mi familia y yo disfrutamos unas vacaciones de ensueño. Rifa Latina cambió mi vida. ¡Mil gracias!",
            avatar: "👩‍🦱",
            rating: 5,
            location: "Colombia"
        },
        {
            id: 2,
            name: "José Luis Martínez",
            prize: "Moto Kawasaki",
            message: "Desde niño soñaba con mi propia moto. Con solo $30 pesos conseguí mi sueño. ¡Rifa Latina es lo máximo!",
            avatar: "👨‍💼",
            rating: 5,
            location: "México"
        },
        {
            id: 3,
            name: "Isabella Santos",
            prize: "$8,000 Dólares",
            message: "Pude pagar mis estudios y ayudar a mi familia. Esta plataforma es confiable y transparente. ¡Súper recomendada!",
            avatar: "👩‍🎓",
            rating: 5,
            location: "Perú"
        },
        {
            id: 4,
            name: "Miguel Ángel Torres",
            prize: "iPhone 14 Pro",
            message: "Mi primer teléfono nuevo en años. El proceso fue súper fácil y rápido. ¡Ya compré más números para la próxima!",
            avatar: "👨‍🎨",
            rating: 5,
            location: "Argentina"
        }
    ];

    // Carrusel automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % carouselSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselSlides.length]);

    // Testimonios automáticos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev: number) => (prev + 1) % testimonials.length);
        }, 6000);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">

            {/* Header */}
            <header className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-4xl">🌴</div>
                            <div className="text-3xl font-black text-white">
                                RIFA <span className="text-yellow-300">LATINA</span>
                            </div>
                        </div>
                        <nav className="hidden md:flex space-x-8 text-white">
                            <a href="#inicio" className="hover:text-yellow-300 transition-colors font-semibold">Inicio</a>
                            <a href="#rifas" className="hover:text-yellow-300 transition-colors font-semibold">Rifas</a>
                            <a href="#paquetes" className="hover:text-yellow-300 transition-colors font-semibold">Paquetes</a>
                            <a href="#testimonios" className="hover:text-yellow-300 transition-colors font-semibold">Ganadores</a>
                        </nav>
                        <button className="bg-white text-red-500 font-bold px-6 py-3 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg">
                            Entrar
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="inicio" className="py-16 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
                            ¡GANA EN GRANDE! 🎉
                        </h1>
                        <p className="text-xl md:text-2xl text-yellow-100 max-w-3xl mx-auto mb-8">
                            Las rifas más emocionantes de Latinoamérica. Premios increíbles, precios accesibles, ¡y mucha diversión!
                        </p>
                        <div className="flex justify-center space-x-4 text-4xl mb-8">
                            <span>🏖️</span><span>🎊</span><span>🎁</span><span>💰</span><span>🏆</span>
                        </div>
                    </div>

                    {/* Carrusel Principal */}
                    <div className="relative max-w-5xl mx-auto">
                        <div className="relative h-80 overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                            {carouselSlides.map((slide: CarouselSlide, index: number) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                                        }`}
                                >
                                    <div className={`h-full bg-gradient-to-br ${slide.gradient} relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/20"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                        <div className="relative z-10 h-full flex items-center justify-between px-12">
                                            <div className="text-left text-white">
                                                <p className="text-yellow-200 text-2xl mb-2 font-semibold">{slide.subtitle}</p>
                                                <h3 className="text-5xl font-black mb-4 drop-shadow-lg">{slide.title}</h3>
                                                <p className="text-4xl font-black text-yellow-300 mb-2">{slide.price}</p>
                                                {slide.location && <p className="text-yellow-200 text-lg mb-4">📍 {slide.location}</p>}
                                                <button className="bg-white text-red-500 font-bold px-8 py-4 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg">
                                                    ¡Participar Ahora! 🎯
                                                </button>
                                            </div>
                                            <div className="text-9xl drop-shadow-2xl">
                                                <img src={slide.image} alt={slide.title} className="h-48 w-48 object-contain rounded-xl border-4 border-white bg-white/80 p-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controles del carrusel */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                        >
                            <ChevronLeft className="w-6 h-6 text-red-500" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                        >
                            <ChevronRight className="w-6 h-6 text-red-500" />
                        </button>

                        {/* Indicadores */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                            {carouselSlides.map((_, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-4 h-4 rounded-full transition-all ${index === currentSlide ? 'bg-white shadow-lg' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contador Regresivo */}
            <section className="py-12 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
                        <h2 className="text-4xl font-black text-center mb-8 text-gray-800">
                            ⏰ ¡RIFA ESPECIAL TERMINA EN! ⏰
                        </h2>
                        <div className="flex justify-center space-x-6 md:space-x-12">
                            {Object.entries(timeLeft).map(([unit, value]: [string, number]) => (
                                <div key={unit} className="text-center">
                                    <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 min-w-20">
                                        <div className="text-4xl font-black text-white">{value.toString().padStart(2, '0')}</div>
                                    </div>
                                    <div className="text-lg font-bold text-gray-700 mt-3 capitalize">{unit}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Rifas Activas */}
            <section id="rifas" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        🎁 RIFAS ACTIVAS 🎁
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-12">¡Elige tu premio favorito y participa ya!</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeRaffles.map((raffle: ActiveRaffle) => (
                            <div key={raffle.id} className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 group hover:transform hover:scale-105">

                                {/* Header de la card */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {raffle.category}
                                    </span>
                                    <div className="text-3xl">
                                        <img src={raffle.image} alt={raffle.name} className="h-16 w-16 object-contain rounded-xl border-2 border-gray-200 bg-white/80 p-1" />
                                    </div>
                                </div>

                                {/* Título y precio */}
                                <h3 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-red-500 transition-colors">
                                    {raffle.name}
                                </h3>
                                <p className="text-3xl font-black text-green-600 mb-4">${raffle.pricePerTicket}/número</p>

                                {/* Barra de progreso */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Vendidos: {raffle.participants}</span>
                                        <span>Total: {raffle.maxTickets}</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-1000 relative"
                                            style={{ width: `${raffle.progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                                        </div>
                                    </div>
                                    <p className="text-right text-sm font-bold text-green-600 mt-1">{raffle.progress}% completado</p>
                                </div>

                                {/* Botón de participar */}
                                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:from-red-400 hover:to-pink-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                                    ¡Comprar Números! 🎯
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Paquetes de Números */}
            <section id="paquetes" className="py-20 bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        📦 PAQUETES ESPECIALES 📦
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-12">¡Más números = Mayor probabilidad de ganar!</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {numberPackages.map((pkg: NumberPackage) => (
                            <div
                                key={pkg.id}
                                className={`relative bg-white rounded-3xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-4 ${pkg.popular
                                        ? 'border-yellow-400 transform scale-110 shadow-2xl'
                                        : selectedPackage === pkg.id
                                            ? 'border-red-400 transform scale-105'
                                            : 'border-gray-200 hover:border-orange-300 hover:shadow-xl'
                                    }`}
                                onClick={() => setSelectedPackage(pkg.id)}
                            >
                                {/* Badge popular */}
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                                        ¡MÁS POPULAR! ⭐
                                    </div>
                                )}

                                {/* Descuento badge */}
                                {pkg.discount > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                        -{pkg.discount}%
                                    </div>
                                )}

                                <div className="text-center">
                                    {/* Cantidad de números */}
                                    <div className="text-6xl font-black text-gray-800 mb-2">{pkg.quantity}</div>
                                    <p className="text-lg text-gray-600 mb-4">números</p>

                                    {/* Precio */}
                                    <div className="mb-4">
                                        {pkg.discount > 0 && (
                                            <p className="text-gray-400 line-through text-lg">${Math.round(pkg.price / (1 - pkg.discount / 100))}</p>
                                        )}
                                        <p className="text-4xl font-black text-green-600">${pkg.price}</p>
                                        <p className="text-sm text-gray-500">${(pkg.price / pkg.quantity).toFixed(1)} por número</p>
                                    </div>

                                    {/* Bonus */}
                                    {pkg.bonus && (
                                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-3 mb-4">
                                            <p className="text-green-700 font-bold text-sm">{pkg.bonus}</p>
                                        </div>
                                    )}

                                    {/* Botón */}
                                    <button
                                        className={`w-full font-bold py-3 rounded-xl transition-all transform hover:scale-105 ${selectedPackage === pkg.id
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                : pkg.popular
                                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400'
                                            }`}
                                    >
                                        {selectedPackage === pkg.id ? '¡Seleccionado! ✅' : '¡Elegir Paquete! 🎁'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón de compra */}
                    {selectedPackage && (
                        <div className="text-center mt-12">
                            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black px-12 py-4 rounded-full text-xl hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105 shadow-2xl">
                                💳 Proceder al Pago - ${numberPackages.find(p => p.id === selectedPackage)?.price}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonios */}
            <section id="testimonios" className="py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl font-black text-center mb-12 text-white drop-shadow-lg">
                        🏆 NUESTROS GANADORES 🏆
                    </h2>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                            {testimonials.map((testimonial: Testimonial, index: number) => (
                                <div
                                    key={testimonial.id}
                                    className={`p-10 transition-transform duration-700 ease-in-out ${index === currentTestimonial ? 'translate-x-0' : index < currentTestimonial ? '-translate-x-full' : 'translate-x-full'
                                        } ${index !== currentTestimonial ? 'absolute inset-0' : ''}`}
                                >
                                    <div className="text-center">
                                        <div className="text-8xl mb-6">{testimonial.avatar}</div>
                                        <h3 className="text-3xl font-black text-gray-800 mb-2">{testimonial.name}</h3>
                                        <p className="text-red-500 font-bold text-xl mb-2">🏆 {testimonial.prize}</p>
                                        <p className="text-gray-600 mb-4">📍 {testimonial.location}</p>

                                        <div className="flex justify-center mb-6">
                                            {[...Array(testimonial.rating)].map((_, i: number) => (
                                                <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                                            ))}
                                        </div>

                                        <blockquote className="text-xl text-gray-700 italic max-w-3xl mx-auto leading-relaxed">
                                            "{testimonial.message}"
                                        </blockquote>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8 space-x-3">
                            {testimonials.map((_, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-4 h-4 rounded-full transition-all ${index === currentTestimonial ? 'bg-white shadow-lg' : 'bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Estadísticas */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-6xl mb-4">🎁</div>
                            <h3 className="text-4xl font-black text-red-500 mb-2">$2.5M+</h3>
                            <p className="text-gray-600 text-lg">En Premios Entregados</p>
                        </div>
                        <div>
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-4xl font-black text-orange-500 mb-2">150K+</h3>
                            <p className="text-gray-600 text-lg">Participantes Felices</p>
                        </div>
                        <div>
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-4xl font-black text-green-500 mb-2">8,500+</h3>
                            <p className="text-gray-600 text-lg">Ganadores</p>
                        </div>
                        <div>
                            <div className="text-6xl mb-4">🌎</div>
                            <h3 className="text-4xl font-black text-blue-500 mb-2">20+</h3>
                            <p className="text-gray-600 text-lg">Países Participando</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-12">
                        <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                            🎉 ¡TU MOMENTO ES AHORA! 🎉
                        </h2>
                        <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
                            Únete a miles de latinos que ya cumplieron sus sueños.
                            <br />¡El próximo ganador podrías ser TÚ! 🌟
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
                            <div className="bg-green-100 border-2 border-green-400 rounded-2xl p-6 text-center">
                                <div className="text-3xl mb-2">✅</div>
                                <p className="font-bold text-green-700">100% Seguro</p>
                                <p className="text-green-600 text-sm">Pagos protegidos</p>
                            </div>
                            <div className="bg-blue-100 border-2 border-blue-400 rounded-2xl p-6 text-center">
                                <div className="text-3xl mb-2">⚡</div>
                                <p className="font-bold text-blue-700">Sorteos en Vivo</p>
                                <p className="text-blue-600 text-sm">Transparencia total</p>
                            </div>
                            <div className="bg-purple-100 border-2 border-purple-400 rounded-2xl p-6 text-center">
                                <div className="text-3xl mb-2">🎁</div>
                                <p className="font-bold text-purple-700">Premios Reales</p>
                                <p className="text-purple-600 text-sm">Entrega garantizada</p>
                            </div>
                        </div>

                        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black px-16 py-6 rounded-full text-2xl hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105 shadow-2xl">
                            🚀 ¡EMPEZAR A GANAR AHORA!
                        </button>

                        <p className="text-gray-500 text-sm mt-6">
                            * Registro gratuito • Sin comisiones ocultas • Soporte 24/7
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="text-4xl">🌴</div>
                                <div className="text-2xl font-black">
                                    RIFA <span className="text-yellow-300">LATINA</span>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                La plataforma de rifas más confiable y divertida de Latinoamérica.
                                ¡Cumple tus sueños con nosotros!
                            </p>
                        </div>

                        <div>
                            <h4 className="text-yellow-300 font-bold mb-4 text-lg">🎁 Rifas</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Activas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Próximamente</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Finalizadas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Ganadores</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-yellow-300 font-bold mb-4 text-lg">🛟 Ayuda</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">¿Cómo funciona?</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Términos y condiciones</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-yellow-300 font-bold mb-4 text-lg">📱 Síguenos</h4>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    <span className="mr-3">📘</span> Facebook
                                </a>
                                <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    <span className="mr-3">📷</span> Instagram
                                </a>
                                <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    <span className="mr-3">🐦</span> Twitter
                                </a>
                                <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    <span className="mr-3">📺</span> YouTube
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8 text-center">
                        <p className="text-gray-400">
                            &copy; 2024 Rifa Latina. Todos los derechos reservados.
                            <span className="text-yellow-300"> Hecho con ❤️ para Latinoamérica</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LatinaRaffleLanding;