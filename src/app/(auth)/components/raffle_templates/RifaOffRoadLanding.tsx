import { useState, useEffect } from 'react';

// Tipos TypeScript para Next.js
interface Package {
    id: string;
    name: string;
    badge_text?: string;
    current_offer?: boolean;
}

interface EnhancedTicketOption {
    originalAmount: number;
    price: number;
    package: Package;
}

interface Testimonial {
    id: number;
    name: string;
    city: string;
    message: string;
    rating: number;
    avatar: string;
    prize: string;
}

interface Winner {
    id: number;
    name: string;
    city: string;
    prize: string;
    date: string;
    image: string;
}

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

// Simulación del servicio de token
const createPurchaseToken = async (originalAmount: number, price: number): Promise<string> => {
    // Simula llamada a API
    await new Promise(resolve => setTimeout(resolve, 500));
    return `token_${originalAmount}_${price}_${Date.now()}`;
};

// Imágenes del carrusel
const carouselImages = [
    {
        url: "https://forstseile24.de/cdn/shop/collections/offroad-4x4-offroadbedarf-offroad-zubehor-454268.jpg?v=1710798176",
        alt: "Rifa 4x4 Off-Road"
    },
    {
        url: "https://static0.topspeedimages.com/wordpress/wp-content/uploads/2023/09/resize_jp023_329wr.jpg",
        alt: "Aventura Extrema"
    },
    {
        url: "https://hips.hearstapps.com/hmg-prod/images/080120dpt-go-wrangler-01-1598553131.jpg",
        alt: "Jeep Wrangler Off-Road"
    }
];


// Datos de prueba - Testimonios
const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Carlos Mendoza",
        city: "Quito",
        message: "¡No podía creer cuando me llamaron! Gané una camioneta increíble con solo 5 números. El proceso fue súper transparente y confiable.",
        rating: 5,
        avatar: "👨‍💼",
        prize: "Toyota Hilux 2023"
    },
    {
        id: 2,
        name: "María González",
        city: "Guayaquil",
        message: "Participé con 10 números y aunque no gané el premio mayor, gané $2000 en efectivo. Definitivamente volveré a participar.",
        rating: 5,
        avatar: "👩‍💼",
        prize: "Premio en efectivo"
    },
    {
        id: 3,
        name: "Roberto Silva",
        city: "Cuenca",
        message: "La transmisión en vivo me dio total confianza. Vi todo el sorteo desde mi casa y el proceso fue 100% transparente.",
        rating: 5,
        avatar: "👨‍🔧",
        prize: "Motocicleta Yamaha"
    },
    {
        id: 4,
        name: "Ana López",
        city: "Manta",
        message: "Excelente organización. El sorteo se realizó exactamente como prometieron y los premios se entregaron inmediatamente.",
        rating: 5,
        avatar: "👩‍⚕️",
        prize: "iPhone 14 Pro"
    }
];

// Datos de ganadores anteriores
const previousWinners: Winner[] = [
    {
        id: 1,
        name: "Luis Rodríguez",
        city: "Ambato",
        prize: "Chevrolet D-Max 2023",
        date: "15 Julio 2024",
        image: "🚛"
    },
    {
        id: 2,
        name: "Patricia Vega",
        city: "Riobamba",
        prize: "Nissan Frontier 2023",
        date: "22 Mayo 2024",
        image: "🚙"
    },
    {
        id: 3,
        name: "Diego Morales",
        city: "Loja",
        prize: "Ford Ranger 2023",
        date: "8 Marzo 2024",
        image: "🛻"
    }
];

// FAQ
const faqs: FAQ[] = [
    {
        id: 1,
        question: "¿Cómo funciona el sorteo?",
        answer: "Comprás tus números, el día del sorteo transmitimos en vivo por Instagram y Facebook. Utilizamos un sistema de balotas numeradas completamente transparente."
    },
    {
        id: 2,
        question: "¿Qué pasa si no se venden todos los números?",
        answer: "El sorteo se realiza garantizado. Si no se venden todos los números, igual realizamos el sorteo con los números vendidos."
    },
    {
        id: 3,
        question: "¿Cómo recibo mi premio?",
        answer: "Te contactamos inmediatamente después del sorteo. Los premios se entregan personalmente con todos los documentos legales correspondientes."
    },
    {
        id: 4,
        question: "¿Los sorteos están supervisados?",
        answer: "Sí, todos nuestros sorteos están supervisados por un notario público y transmitidos en vivo para garantizar total transparencia."
    },
    {
        id: 5,
        question: "¿Puedo comprar desde cualquier ciudad?",
        answer: "¡Por supuesto! Aceptamos participantes de todo Ecuador. Los premios se entregan en la ciudad del ganador."
    }
];

// Componente Carrusel
function ImageCarousel() {
    const [currentImage, setCurrentImage] = useState(0);
    const [imageErrors, setImageErrors] = useState<boolean[]>(new Array(carouselImages.length).fill(false));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % carouselImages.length);
        }, 4000); // Cambia cada 4 segundos

        return () => clearInterval(timer);
    }, []);

    const handleImageError = (index: number) => {
        setImageErrors(prev => {
            const newErrors = [...prev];
            newErrors[index] = true;
            return newErrors;
        });
    };

    return (
        <div className="absolute inset-0 overflow-hidden">
            {carouselImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {!imageErrors[index] ? (
                        <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(index)}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        // Fallback visual cuando la imagen no carga
                        <div className="w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="text-9xl mb-4">🚙</div>
                                <h3 className="text-4xl font-black">4X4 OFF-ROAD</h3>
                                <p className="text-xl">Aventura Extrema</p>
                            </div>
                        </div>
                    )}
                    {/* Overlay oscuro para mejorar legibilidad del texto */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            ))}

            {/* Indicadores del carrusel */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                {carouselImages.map((_, index) => (
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

// Componente TicketCard
function TicketCard({ option, referralCode }: { option: EnhancedTicketOption; referralCode: string | null }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const token = await createPurchaseToken(option.originalAmount, option.price);
            const checkoutUrl = referralCode
                ? `/checkout?token=${token}&ref=${encodeURIComponent(referralCode)}`
                : `/checkout?token=${token}`;
            alert(`Redirigiendo a: ${checkoutUrl}`);
        } catch (error) {
            alert('Error al procesar la compra. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const pkg = option.package;
    const isBestSeller = pkg.name?.toLowerCase().includes('más vendido') || option.originalAmount === 10;
    const isLimitedOffer = pkg.current_offer || pkg.name?.toLowerCase().includes('oferta limitada');
    const isMegaPack = option.originalAmount === 100;

    const getBorderStyle = () => {
        if (isMegaPack) return 'border-2 border-yellow-400 shadow-2xl shadow-yellow-500/50';
        if (isBestSeller) return 'border-2 border-green-400 shadow-lg shadow-green-500/30';
        if (isLimitedOffer) return 'border border-gray-700 shadow-lg shadow-red-500/30';
        return 'border border-gray-700 shadow-lg';
    };

    const getButtonStyle = () => {
        if (isMegaPack) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 font-extrabold animate-pulse';
        if (isBestSeller) return 'bg-green-500 text-white hover:bg-green-400 font-black animate-pulse';
        if (isLimitedOffer) return 'bg-red-500 text-white hover:bg-red-400 font-black animate-pulse';
        return 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold';
    };

    return (
        <div
            className={`relative w-full max-w-[300px] h-48 sm:h-56 mx-auto rounded-xl cursor-pointer transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] hover:shadow-xl'} bg-gray-900 ${getBorderStyle()}`}
            onClick={handleClick}
        >
            {isBestSeller && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-black px-1 py-1 rounded-full shadow-lg animate-bounce min-w-[180px] text-center z-10">
                    ★ MÁS VENDIDO ★
                </div>
            )}

            {!isBestSeller && isLimitedOffer && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm font-black px-1 py-1 rounded-full shadow-lg animate-bounce min-w-[200px] text-center z-10">
                    🔥 OFERTA LIMITADA 🔥
                </div>
            )}

            {isMegaPack && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black text-base font-extrabold px-8 py-2 rounded-full shadow-2xl animate-bounce min-w-[220px] text-center tracking-wider uppercase border border-yellow-300 z-10">
                    🚀 MEGA PACK 🚀
                </div>
            )}

            <div className="h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center relative z-10">
                <div className="text-white font-black text-lg sm:text-xl mb-3 sm:mb-4 tracking-wide">
                    X{option.originalAmount} NÚMEROS
                </div>

                <div className={`text-3xl sm:text-4xl font-black mb-4 sm:mb-6 ${isBestSeller ? 'text-green-400' : 'text-yellow-500'}`}>
                    ${option.price}
                </div>

                <button
                    className={`${getButtonStyle()} text-sm sm:text-base py-2 px-6 sm:px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                    disabled={loading}
                >
                    {loading ? 'PROCESANDO...' : 'COMPRAR'}
                </button>
            </div>
        </div>
    );
}

// Componente Contador
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({
        days: 2,
        hours: 23,
        minutes: 45,
        seconds: 30
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
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

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex gap-4 justify-center text-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-2xl sm:text-3xl font-black text-yellow-300">{value.toString().padStart(2, '0')}</div>
                    <div className="text-xs uppercase tracking-wider">{unit}</div>
                </div>
            ))}
        </div>
    );
}

// Datos de prueba
const ticketOptions: EnhancedTicketOption[] = [
    {
        originalAmount: 5,
        price: 25,
        package: { id: '1', name: 'Básico' }
    },
    {
        originalAmount: 10,
        price: 45,
        package: { id: '2', name: 'Más Vendido', badge_text: 'más vendido' }
    },
    {
        originalAmount: 25,
        price: 100,
        package: { id: '3', name: 'Oferta Limitada', current_offer: true }
    },
    {
        originalAmount: 50,
        price: 180,
        package: { id: '4', name: 'Premium' }
    },
    {
        originalAmount: 100,
        price: 320,
        package: { id: '5', name: 'Mega Pack' }
    }
];

export default function RifaLanding() {
    const [referralCode] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            {/* Header Hero con Carrusel */}
            <header className="relative overflow-hidden h-screen text-white">
                {/* Carrusel de imágenes de fondo */}
                <ImageCarousel />

                {/* Contenido sobre las imágenes */}
                <div className="relative z-20 h-full flex items-center justify-center">
                    <div className="max-w-6xl mx-auto text-center px-4">
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl">
                            RIFA 4X4
                            <span className="block text-yellow-300 animate-pulse">EXTREMA</span>
                        </h1>
                        <p className="text-xl sm:text-3xl font-bold mb-8 opacity-90 drop-shadow-lg">
                            ¡Gana el 4x4 de tus sueños! 🔥 Sorteo 100% garantizado
                        </p>

                        <div className="mb-8">
                            <CountdownTimer />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                            <div className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30">
                                <span className="font-black text-2xl">Premio: $50,000 USD</span>
                            </div>
                            <div className="bg-green-500 text-white px-8 py-4 rounded-full font-black text-xl animate-pulse">
                                ✅ Sorteo Supervisado
                            </div>
                        </div>

                        <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl">
                            🎯 ¡PARTICIPAR AHORA!
                        </button>
                    </div>
                </div>

                {/* Gradiente en la parte inferior para transición */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-800 to-transparent z-10"></div>
            </header>

            {/* Estadísticas */}
            <section className="py-16 px-4 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl sm:text-5xl font-black text-yellow-400 mb-2">847</div>
                            <div className="text-sm sm:text-base text-gray-300">Ganadores Felices</div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-black text-green-400 mb-2">$2.1M</div>
                            <div className="text-sm sm:text-base text-gray-300">En Premios Entregados</div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-black text-blue-400 mb-2">156</div>
                            <div className="text-sm sm:text-base text-gray-300">Rifas Realizadas</div>
                        </div>
                        <div>
                            <div className="text-4xl sm:text-5xl font-black text-red-400 mb-2">100%</div>
                            <div className="text-sm sm:text-base text-gray-300">Transparencia</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premio Principal */}
            <section className="py-20 px-4 bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-16">
                        🏆 PREMIO PRINCIPAL
                    </h2>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-white">
                            <h3 className="text-3xl sm:text-5xl font-black mb-8 text-yellow-400">
                                Ford Ranger Raptor 2024
                            </h3>
                            <div className="space-y-4 text-xl">
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Motor V6 EcoBoost Twin-Turbo de 392 HP</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Suspensión Fox Racing Shox</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Tracción 4WD permanente</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Sistema SYNC 4A de 12 pulgadas</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Llantas BF Goodrich All-Terrain</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-green-400 mr-4 text-2xl">✓</span>
                                    <span>Documentos legales incluidos</span>
                                </div>
                            </div>
                            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl">
                                <p className="text-2xl font-black">
                                    💰 Valor comercial: $50,000 USD
                                </p>
                                <p className="text-lg mt-2">¡Completamente nuevo y equipado!</p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-2xl">
                                <div className="bg-gray-800 rounded-xl p-12 text-center">
                                    <div className="text-9xl mb-6">
                                        <img
                                            src="https://live.dealer-asset.co/images/br1166/news/ford-colombia-ranger-nueva-generacion.jpg?s=1024"
                                            alt="Ford Ranger Raptor 2024"
                                            width={300}
                                            height={300}
                                            className="mx-auto"
                                        />
                                    </div>
                                    <h4 className="text-white font-black text-2xl mb-4">
                                        Ford Ranger Raptor 2024
                                    </h4>
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full font-black text-lg">
                                        ¡COMPLETAMENTE NUEVO!
                                    </div>
                                    <div className="mt-6 text-gray-300">
                                        <p className="text-sm">📍 Entrega en tu ciudad</p>
                                        <p className="text-sm">📋 Documentos al día</p>
                                        <p className="text-sm">🛡️ Garantía oficial</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Paquetes de Números */}
            <section className="py-20 px-4 bg-black">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-8">
                        🎯 ELIGE TU PAQUETE
                    </h2>
                    <p className="text-2xl text-gray-300 text-center mb-16">
                        Más números = más oportunidades de ganar
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16">
                        {ticketOptions.map((option) => (
                            <TicketCard
                                key={option.package.id}
                                option={option}
                                referralCode={referralCode}
                            />
                        ))}
                    </div>

                    {/* Garantías */}
                    <div className="grid md:grid-cols-3 gap-8 text-center text-white">
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-400 transition-colors">
                            <div className="text-5xl mb-6">🔒</div>
                            <h3 className="font-black text-2xl mb-4">100% Seguro</h3>
                            <p className="text-gray-300 text-lg">Pagos protegidos con certificación SSL. Tu dinero está seguro.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-400 transition-colors">
                            <div className="text-5xl mb-6">⚡</div>
                            <h3 className="font-black text-2xl mb-4">Sorteo Garantizado</h3>
                            <p className="text-gray-300 text-lg">Se realiza con o sin venta total. Tu participación está asegurada.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-red-400 transition-colors">
                            <div className="text-5xl mb-6">📱</div>
                            <h3 className="font-black text-2xl mb-4">Transmisión Live</h3>
                            <p className="text-gray-300 text-lg">Sorteo en vivo por Instagram y Facebook. Transparencia total.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonios */}
            <section className="py-20 px-4 bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-16">
                        💬 TESTIMONIOS REALES
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-400 transition-colors">
                                <div className="flex items-center mb-6">
                                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                                    <div>
                                        <h4 className="text-white font-black text-xl">{testimonial.name}</h4>
                                        <p className="text-gray-400">{testimonial.city}</p>
                                        <p className="text-yellow-400 text-sm font-bold">Ganó: {testimonial.prize}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                    ))}
                                </div>
                                <p className="text-gray-300 text-lg leading-relaxed italic">
                                    "{testimonial.message}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ganadores Anteriores */}
            <section className="py-20 px-4 bg-black">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-16">
                        🏆 GANADORES ANTERIORES
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {previousWinners.map((winner) => (
                            <div key={winner.id} className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-400 transition-colors">
                                <div className="text-6xl mb-4">{winner.image}</div>
                                <h4 className="text-white font-black text-2xl mb-2">{winner.name}</h4>
                                <p className="text-gray-400 mb-2">{winner.city}</p>
                                <p className="text-yellow-400 font-bold text-lg mb-2">{winner.prize}</p>
                                <p className="text-green-400 font-bold">{winner.date}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12">
                        <p className="text-gray-300 text-xl">
                            <span className="text-yellow-400 font-black">¡Tu podrías ser el próximo!</span> 🎯
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-gray-900">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-16">
                        ❓ PREGUNTAS FRECUENTES
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <button
                                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-700 transition-colors"
                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                >
                                    <h3 className="text-white font-bold text-xl">{faq.question}</h3>
                                    <span className="text-yellow-400 text-2xl">
                                        {expandedFaq === faq.id ? '−' : '+'}
                                    </span>
                                </button>
                                {expandedFaq === faq.id && (
                                    <div className="p-6 pt-0">
                                        <p className="text-gray-300 text-lg leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Final */}
            <section className="py-20 px-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl sm:text-6xl font-black mb-8">
                        ⏰ ¡NO PIERDAS ESTA OPORTUNIDAD!
                    </h2>
                    <p className="text-2xl mb-8 opacity-90">
                        El sorteo se acerca y los números se están agotando
                    </p>
                    <div className="mb-8">
                        <CountdownTimer />
                    </div>
                    <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-2xl px-16 py-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl">
                        🚀 ¡COMPRAR NÚMEROS AHORA!
                    </button>
                    <p className="text-lg mt-6 opacity-75">
                        Únete a los cientos de ganadores que ya confiaron en nosotros
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-700 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-gray-400">
                        <div>
                            <h3 className="text-2xl font-black text-white mb-6">🏎️ RIFA 4X4 EXTREMA</h3>
                            <p className="text-lg mb-4">El sorteo de 4x4 más confiable y transparente de Ecuador</p>
                            <div className="flex space-x-4">
                                <span className="text-2xl">📸</span>
                                <span className="text-2xl">📘</span>
                                <span className="text-2xl">📱</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-xl">Contacto</h4>
                            <div className="space-y-2 text-lg">
                                <p>📱 +593 99 XXX XXXX</p>
                                <p>✉️ info@rifa4x4.com</p>
                                <p>🕐 Lun - Dom: 8AM - 10PM</p>
                                <p>📍 Quito, Ecuador</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-xl">Síguenos</h4>
                            <div className="space-y-2 text-lg">
                                <p>📸 @rifa4x4extrema</p>
                                <p>📘 /rifa4x4extrema</p>
                                <p>📺 YouTube: Rifa4x4</p>
                                <p>🐦 @rifa4x4ec</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-xl">Sorteo</h4>
                            <div className="space-y-2 text-lg">
                                <p className="text-yellow-400 font-bold">📅 15 Sept 2025</p>
                                <p>🕐 8:00 PM (ECT)</p>
                                <p>📍 Live Instagram</p>
                                <p>👨‍⚖️ Con Notario</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-center md:text-left mb-4 md:mb-0">
                                &copy; 2025 Rifa 4X4 Extrema. Todos los derechos reservados.
                            </p>
                            <div className="flex space-x-6 text-sm">
                                <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
                                <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                                <a href="#" className="hover:text-white transition-colors">Soporte</a>
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                                🛡️ Sorteo autorizado y supervisado por notario público |
                                🏛️ Registro de la Superintendencia de Compañías |
                                ✅ 100% Legal y Transparente
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Botón flotante de WhatsApp */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="bg-green-500 hover:bg-green-400 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce">
                    <span className="text-2xl">💬</span>
                </button>
            </div>
        </div>
    );
}