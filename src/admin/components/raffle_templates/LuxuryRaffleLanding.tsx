import React, { useState, useEffect } from 'react';
import { Star, Shield, Users, Trophy, Gift, CheckCircle, ArrowRight, Phone, Mail, MapPin, Crown, Gem, Diamond } from 'lucide-react';

// Tipos TypeScript
interface Product {
    id: number;
    name: string;
    image: string;
    originalPrice: number;
    ticketPrice: number;
    totalTickets: number;
    soldTickets: number;
    endDate: string;
    featured?: boolean;
    category: 'watches' | 'jewelry' | 'accessories' | 'luxury';
}

interface SpecialOffer {
    id: number;
    numbers: number[];
    discount: number;
    label: string;
    color: string;
    icon: React.ReactNode;
}

interface Testimonial {
    id: number;
    name: string;
    location: string;
    product: string;
    comment: string;
    rating: number;
    avatar: string;
    prize_value: number;
}

// Componente de barra de progreso dorada
const ProgressBar: React.FC<{ current: number; total: number; className?: string }> = ({
    current,
    total,
    className = ''
}) => {
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div className={`w-full bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full h-3 overflow-hidden shadow-inner ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

// Componente de producto de lujo
const LuxuryProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const progressPercentage = (product.soldTickets / product.totalTickets) * 100;
    const remainingTickets = product.totalTickets - product.soldTickets;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'watches': return '⌚';
            case 'jewelry': return '💎';
            case 'accessories': return '👑';
            default: return '✨';
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 border-2 border-amber-200/50 hover:border-amber-300 relative group">
            {product.featured && (
                <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-center py-3 font-bold text-sm tracking-wide">
                    ✨ EDICIÓN LIMITADA ✨
                </div>
            )}

            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {getCategoryIcon(product.category)} {product.category}
            </div>

            <div className="relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-lg font-bold border border-amber-400/50">
                    ${product.originalPrice.toLocaleString()}
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h3>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-amber-700 uppercase tracking-wide">Progreso de Venta</span>
                        <span className="text-sm font-bold text-gray-900 bg-amber-100 px-3 py-1 rounded-full">
                            {product.soldTickets}/{product.totalTickets}
                        </span>
                    </div>
                    <ProgressBar current={product.soldTickets} total={product.totalTickets} />
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                        Solo quedan {remainingTickets} oportunidades
                    </p>
                </div>

                <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-200">
                    <div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                            ${product.ticketPrice}
                        </p>
                        <p className="text-sm text-amber-700 font-medium">por número de la suerte</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-amber-700 font-medium">Gran Sorteo</p>
                        <p className="text-lg font-bold text-gray-900">
                            {new Date(product.endDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <button className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 text-lg">
                    <Crown className="w-6 h-6" />
                    <span>Participar Ahora</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Componente de ofertas VIP
const VIPOfferCard: React.FC<{ offer: SpecialOffer }> = ({ offer }) => {
    return (
        <div className={`${offer.color} rounded-3xl p-8 text-white transform hover:scale-105 transition-all duration-500 shadow-2xl border border-amber-300/30 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
            <div className="relative z-10">
                <div className="text-center">
                    <div className="text-6xl mb-4">{offer.icon}</div>
                    <div className="text-4xl font-bold mb-2">{offer.discount}% OFF</div>
                    <div className="text-xl font-semibold mb-4 tracking-wide">{offer.label}</div>
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {offer.numbers.map((num, index) => (
                            <span key={index} className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                                {num}+ números
                            </span>
                        ))}
                    </div>
                    <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-2xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Obtener Descuento VIP
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente de testimonio premium
const PremiumTestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
    return (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-8 shadow-2xl border border-amber-200/50 transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
            <div className="relative z-10">
                <div className="flex items-start space-x-6 mb-4">
                    <div className="relative">
                        <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-amber-300 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-1 rounded-full">
                            <Crown className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-xl text-gray-900">{testimonial.name}</h4>
                            <span className="text-amber-600 font-medium">• {testimonial.location}</span>
                        </div>

                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <blockquote className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                    "{testimonial.comment}"
                </blockquote>

                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-2xl border border-amber-200">
                    <p className="font-bold text-amber-800">🏆 Premio Ganado: {testimonial.product}</p>
                    <p className="text-amber-700 font-medium">Valor: ${testimonial.prize_value.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

// Componente principal
interface LuxuryProps {
    previewMode?: boolean;
    device?: 'desktop' | 'tablet' | 'mobile';
    [key: string]: unknown;
}

const LuxuryRaffleLanding: React.FC<LuxuryProps> = ({ previewMode = false, device = 'desktop' }) => {
    const isMobile = device === 'mobile';
    const isTablet = device === 'tablet';
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0, hours: 0, minutes: 0, seconds: 0
    });

    // Productos de lujo
    const luxuryProducts: Product[] = [
        {
            id: 1,
            name: "Rolex Submariner Date Oro Amarillo",
            image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400&h=300&fit=crop",
            originalPrice: 45000,
            ticketPrice: 150,
            totalTickets: 200,
            soldTickets: 156,
            endDate: "2024-12-31",
            featured: true,
            category: 'watches'
        },
        {
            id: 2,
            name: "Collar Diamantes Cartier 5ct",
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
            originalPrice: 85000,
            ticketPrice: 250,
            totalTickets: 300,
            soldTickets: 187,
            endDate: "2024-12-28",
            category: 'jewelry'
        },
        {
            id: 3,
            name: "Hermès Birkin Bag Cocodrilo",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
            originalPrice: 120000,
            ticketPrice: 400,
            totalTickets: 250,
            soldTickets: 98,
            endDate: "2025-01-05",
            category: 'accessories'
        }
    ];

    const vipOffers: SpecialOffer[] = [
        {
            id: 1,
            numbers: [5, 10],
            discount: 20,
            label: "Paquete Elegante",
            color: "bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700",
            icon: <Gem />
        },
        {
            id: 2,
            numbers: [15, 25],
            discount: 35,
            label: "Paquete Premium",
            color: "bg-gradient-to-br from-purple-600 via-pink-500 to-red-600",
            icon: <Crown />
        },
        {
            id: 3,
            numbers: [50],
            discount: 50,
            label: "Paquete Diamante",
            color: "bg-gradient-to-br from-gray-800 via-gray-700 to-black",
            icon: <Diamond />
        }
    ];

    const premiumTestimonials: Testimonial[] = [
        {
            id: 1,
            name: "Isabella Rodríguez",
            location: "Marbella, España",
            product: "Rolex Daytona Oro Rosa",
            comment: "Jamás pensé que podría permitirme un Rolex. Con solo 8 números gané este hermoso reloj. El proceso fue impecable y la entrega en persona fue una experiencia única.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=100&h=100&fit=crop&crop=face",
            prize_value: 65000
        },
        {
            id: 2,
            name: "Alessandro Martínez",
            location: "Madrid, España",
            product: "Anillo Cartier Diamantes",
            comment: "La transparencia del sorteo en vivo y la autenticidad del premio me sorprendió. Mi esposa no podía creer que fuera real. Servicio de primera clase.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            prize_value: 35000
        },
        {
            id: 3,
            name: "Victoria Sánchez",
            location: "Barcelona, España",
            product: "Bolso Hermès Kelly",
            comment: "Después de años soñando con un Hermès, finalmente es mío. El certificado de autenticidad y el empaque original me confirmaron que es 100% genuino.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            prize_value: 95000
        }
    ];

    // Contador regresivo
    useEffect(() => {
        const targetDate = new Date("2024-12-31T23:59:59").getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
            {/* Header Premium */}
            <header className={`bg-white/90 backdrop-blur-md ${previewMode ? 'relative' : 'sticky top-0'} z-10 border-b-2 border-amber-200/50 shadow-lg`}>
                <div className="container mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg border border-amber-300">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                                    LuxuryDreams
                                </h1>
                                <p className="text-xs text-amber-700 font-medium uppercase tracking-widest">Premium Luxury Raffles</p>
                            </div>
                        </div>
                        <nav className={`${isMobile ? 'hidden' : 'hidden md:flex'} space-x-8`}>
                            <a href="#productos" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
                                Colección
                            </a>
                            <a href="#ofertas" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
                                Ofertas VIP
                            </a>
                            <a href="#testimonios" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
                                Ganadores
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section Premium */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-yellow-100/30" />
                <div className="absolute top-20 left-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
                                ✨ Rifas de Lujo Premium ✨
                            </span>
                        </div>

                        <h2 className={`${isMobile ? 'text-4xl' : isTablet ? 'text-5xl' : 'text-6xl md:text-7xl'} font-bold mb-8 leading-tight`}>
                            <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
                                Vive el Lujo
                            </span>
                            <br />
                            <span className="text-gray-800">Que Mereces</span>
                        </h2>

                        <p className="text-2xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
                            Participa en nuestras rifas exclusivas de productos de lujo auténticos.
                            <br />
                            <strong className="text-amber-700">Rolex, Cartier, Hermès</strong> y las marcas más prestigiosas del mundo.
                        </p>

                        {/* Contador regresivo premium */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 mb-12 inline-block border-2 border-amber-200/50">
                            <p className="text-2xl font-bold text-amber-800 mb-6 flex items-center justify-center space-x-2">
                                <Trophy className="w-8 h-8" />
                                <span>Próximo Gran Sorteo en:</span>
                            </p>
                            <div className="grid grid-cols-4 gap-6 text-center">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
                                        <div className="text-4xl font-bold">{value}</div>
                                        <div className="text-sm uppercase tracking-wide font-medium mt-2">
                                            {unit === 'days' ? 'Días' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <button className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white font-bold py-5 px-10 rounded-2xl hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-xl">
                                Explorar Colección Premium
                            </button>
                            <div className="flex items-center space-x-6 text-gray-700">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                    <span className="font-semibold">Autenticidad Garantizada</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="w-6 h-6 text-amber-600" />
                                    <span className="font-semibold">+5,000 ganadores VIP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Productos de Lujo Section */}
            <section id="productos" className="py-24 px-6 bg-gradient-to-br from-white to-amber-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
                            👑 Colección Exclusiva
                        </span>
                        <h3 className="text-5xl font-bold text-gray-900 mb-6">Productos de Lujo Auténticos</h3>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Cada producto viene con certificado de autenticidad, empaque original y garantía internacional
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-10`}>
                        {luxuryProducts.map((product) => (
                            <LuxuryProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Ofertas VIP Section */}
            <section id="ofertas" className="py-24 px-6 bg-gradient-to-br from-amber-100/30 to-yellow-100/30">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
                            💎 Ofertas Exclusivas VIP
                        </span>
                        <h3 className="text-5xl font-bold text-gray-900 mb-6">Descuentos Premium</h3>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Mientras más números compres, mayor será tu descuento y tus posibilidades de ganar
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-8 max-w-6xl mx-auto`}>
                        {vipOffers.map((offer) => (
                            <VIPOfferCard key={offer.id} offer={offer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonios Premium Section */}
            <section id="testimonios" className="py-24 px-6 bg-gradient-to-br from-white to-amber-50/30">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
                            🏆 Historias de Éxito
                        </span>
                        <h3 className="text-5xl font-bold text-gray-900 mb-6">Sueños de Lujo Cumplidos</h3>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Nuestros ganadores comparten sus experiencias con productos auténticos de las mejores marcas
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-10`}>
                        {premiumTestimonials.map((testimonial) => (
                            <PremiumTestimonialCard key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </div>

                    <div className="text-center mt-16">
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 max-w-4xl mx-auto border border-amber-200/50 shadow-xl">
                            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-8 text-center`}>
                                <div className="flex flex-col items-center">
                                    <Trophy className="w-12 h-12 text-amber-600 mb-4" />
                                    <div className="text-3xl font-bold text-gray-900 mb-2">€15M+</div>
                                    <div className="text-amber-700 font-semibold">en premios entregados</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                                    <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
                                    <div className="text-amber-700 font-semibold">productos auténticos</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Shield className="w-12 h-12 text-blue-600 mb-4" />
                                    <div className="text-3xl font-bold text-gray-900 mb-2">5,247</div>
                                    <div className="text-amber-700 font-semibold">ganadores felices</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Premium */}
            <section className="py-24 px-6 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

                <div className="container mx-auto text-center text-white relative z-10">
                    <Crown className="w-20 h-20 mx-auto mb-8 text-yellow-200" />
                    <h3 className="text-5xl font-bold mb-8">Tu Momento de Lujo Ha Llegado</h3>
                    <p className="text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
                        No esperes más para vivir la experiencia de poseer los productos más exclusivos del mundo.
                        <br />
                        <strong>Rolex, Cartier, Hermès</strong> y mucho más te esperan.
                    </p>
                    <button className="bg-white text-amber-700 font-bold py-6 px-16 rounded-2xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-2xl text-2xl border-4 border-amber-300">
                        Comenzar Mi Sueño de Lujo
                    </button>
                </div>
            </section>

            {/* Footer Premium */}
            <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-20 px-6">
                <div className="container mx-auto">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} gap-12`}>
                        <div>
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-bold">LuxuryDreams</h4>
                                    <p className="text-amber-400 font-medium uppercase tracking-widest text-sm">Premium Luxury Raffles</p>
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-6">
                                La plataforma de rifas de lujo más exclusiva y confiable del mundo.
                                Productos auténticos, sorteos transparentes, sueños cumplidos desde 2019.
                            </p>
                            <div className="flex space-x-4">
                                <div className="bg-amber-600/20 p-3 rounded-xl">
                                    <Shield className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="bg-amber-600/20 p-3 rounded-xl">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="bg-amber-600/20 p-3 rounded-xl">
                                    <Crown className="w-6 h-6 text-amber-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-xl font-bold mb-6 text-amber-300">Colección Premium</h5>
                            <ul className="space-y-3 text-gray-300">
                                <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                    <span>⌚</span><span>Relojes de Lujo</span>
                                </a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                    <span>💎</span><span>Joyería Exclusiva</span>
                                </a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                    <span>👜</span><span>Bolsos de Diseñador</span>
                                </a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                                    <span>👑</span><span>Accesorios Premium</span>
                                </a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="text-xl font-bold mb-6 text-amber-300">Servicios VIP</h5>
                            <ul className="space-y-3 text-gray-300">
                                <li><a href="#" className="hover:text-amber-300 transition-colors">Sorteos en Vivo</a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors">Certificados de Autenticidad</a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors">Entrega Personalizada</a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors">Seguro Premium</a></li>
                                <li><a href="#" className="hover:text-amber-300 transition-colors">Soporte 24/7</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="text-xl font-bold mb-6 text-amber-300">Contacto Exclusivo</h5>
                            <div className="space-y-4 text-gray-300">
                                <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                    <Mail className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <p className="font-semibold">Email VIP</p>
                                        <p className="text-sm">vip@luxurydreams.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                    <Phone className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <p className="font-semibold">Línea Premium</p>
                                        <p className="text-sm">+34 900 123 456</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 bg-amber-600/10 p-4 rounded-xl">
                                    <MapPin className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <p className="font-semibold">Showroom</p>
                                        <p className="text-sm">Serrano 123, Madrid</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-amber-600/30 mt-16 pt-12">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                            <div className="text-center md:text-left">
                                <p className="text-gray-300 text-lg">&copy; 2024 LuxuryDreams. Todos los derechos reservados.</p>
                                <p className="mt-2 text-sm text-amber-400">
                                    Rolex®, Cartier®, Hermès® son marcas registradas de sus respectivos propietarios.
                                </p>
                            </div>

                            <div className="flex space-x-6">
                                <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                    <div className="text-2xl font-bold text-amber-300">A+</div>
                                    <div className="text-xs text-gray-400">Calificación BBB</div>
                                </div>
                                <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                    <div className="text-2xl font-bold text-amber-300">SSL</div>
                                    <div className="text-xs text-gray-400">Seguridad</div>
                                </div>
                                <div className="text-center bg-amber-600/20 px-6 py-4 rounded-2xl">
                                    <div className="text-2xl font-bold text-amber-300">24/7</div>
                                    <div className="text-xs text-gray-400">Soporte VIP</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LuxuryRaffleLanding;