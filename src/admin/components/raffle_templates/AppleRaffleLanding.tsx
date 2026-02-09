import React, { useState, useEffect } from 'react';
import { Star, Shield, Users, Trophy, Gift, CheckCircle, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';

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
}

interface SpecialOffer {
    id: number;
    numbers: number[];
    discount: number;
    label: string;
    color: string;
}

interface Testimonial {
    id: number;
    name: string;
    location: string;
    product: string;
    comment: string;
    rating: number;
    avatar: string;
}

// Componente de barra de progreso
const ProgressBar: React.FC<{ current: number; total: number; className?: string }> = ({
    current,
    total,
    className = ''
}) => {
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

// Componente de producto
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const progressPercentage = (product.soldTickets / product.totalTickets) * 100;
    const remainingTickets = product.totalTickets - product.soldTickets;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 border border-gray-100">
            {product.featured && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 font-semibold text-sm">
                    🔥 MÁS POPULAR
                </div>
            )}

            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${product.originalPrice.toLocaleString()}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progreso</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {product.soldTickets}/{product.totalTickets} vendidos
                        </span>
                    </div>
                    <ProgressBar current={product.soldTickets} total={product.totalTickets} />
                    <p className="text-xs text-gray-500 mt-1">
                        {remainingTickets} números disponibles
                    </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">${product.ticketPrice}</p>
                        <p className="text-sm text-gray-500">por número</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Sorteo</p>
                        <p className="text-sm font-semibold">{new Date(product.endDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span>Comprar Números</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Componente de ofertas especiales
const SpecialOfferCard: React.FC<{ offer: SpecialOffer }> = ({ offer }) => {
    return (
        <div className={`${offer.color} rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg`}>
            <div className="text-center">
                <div className="text-3xl font-bold mb-2">{offer.discount}% OFF</div>
                <div className="text-lg font-semibold mb-3">{offer.label}</div>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {offer.numbers.map((num, index) => (
                        <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                            {num}+ números
                        </span>
                    ))}
                </div>
                <button className="bg-white text-gray-900 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                    Aprovechar Oferta
                </button>
            </div>
        </div>
    );
};

// Componente de testimonio
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-start space-x-4">
                <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <span className="text-sm text-gray-500">• {testimonial.location}</span>
                    </div>

                    <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>

                    <p className="text-gray-700 mb-2 italic">"{testimonial.comment}"</p>
                    <p className="text-sm font-medium text-blue-600">Ganó: {testimonial.product}</p>
                </div>
            </div>
        </div>
    );
};

// Componente principal
interface AppleProps {
    previewMode?: boolean;
    device?: 'desktop' | 'tablet' | 'mobile';
    [key: string]: unknown;
}

const AppleRaffleLanding: React.FC<AppleProps> = ({ previewMode = false, device = 'desktop' }) => {
    const isMobile = device === 'mobile';
    const isTablet = device === 'tablet';
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0, hours: 0, minutes: 0, seconds: 0
    });

    // Productos de ejemplo
    const products: Product[] = [
        {
            id: 1,
            name: "iPhone 15 Pro Max 1TB",
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
            originalPrice: 1599,
            ticketPrice: 25,
            totalTickets: 100,
            soldTickets: 73,
            endDate: "2024-12-31",
            featured: true
        },
        {
            id: 2,
            name: "MacBook Pro 16\" M3 Max",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
            originalPrice: 3499,
            ticketPrice: 45,
            totalTickets: 150,
            soldTickets: 89,
            endDate: "2024-12-28"
        },
        {
            id: 3,
            name: "iPad Pro 12.9\" + Apple Pencil",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
            originalPrice: 1299,
            ticketPrice: 20,
            totalTickets: 80,
            soldTickets: 45,
            endDate: "2025-01-05"
        }
    ];

    const specialOffers: SpecialOffer[] = [
        {
            id: 1,
            numbers: [5, 10],
            discount: 15,
            label: "Combo Básico",
            color: "bg-gradient-to-br from-blue-500 to-blue-700"
        },
        {
            id: 2,
            numbers: [15, 20],
            discount: 25,
            label: "Combo Premium",
            color: "bg-gradient-to-br from-purple-500 to-purple-700"
        },
        {
            id: 3,
            numbers: [30],
            discount: 40,
            label: "Combo VIP",
            color: "bg-gradient-to-br from-gold-500 to-yellow-600"
        }
    ];

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "María González",
            location: "Madrid, España",
            product: "iPhone 15 Pro",
            comment: "¡No puedo creer que gané! El proceso fue súper transparente y recibí mi premio en perfectas condiciones.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Carlos Rodríguez",
            location: "Barcelona, España",
            product: "MacBook Air M3",
            comment: "Increíble experiencia. Compré solo 3 números y gané. El sorteo fue completamente justo y en vivo.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "Ana Martínez",
            location: "Valencia, España",
            product: "AirPods Pro 2",
            comment: "Servicio excelente y entrega rápida. Ya he participado en varias rifas y siempre todo perfecto.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <header className={`bg-white/80 backdrop-blur-md ${previewMode ? 'relative' : 'sticky top-0'} z-10 border-b border-gray-200`}>
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Gift className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                AppleRaffle
                            </h1>
                        </div>
                        <nav className={`${isMobile ? 'hidden' : 'hidden md:flex'} space-x-8`}>
                            <a href="#productos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Productos
                            </a>
                            <a href="#ofertas" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Ofertas
                            </a>
                            <a href="#testimonios" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Testimonios
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`${isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl md:text-6xl'} font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                            Gana los Últimos
                            <br />
                            Productos Apple
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Participa en nuestras rifas premium y llévate los dispositivos Apple más codiciados.
                            <br />
                            Sorteos transparentes, entregas garantizadas y sueños cumplidos.
                        </p>

                        {/* Contador regresivo */}
                        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 inline-block">
                            <p className="text-lg font-semibold text-gray-700 mb-4">⏰ Próximo sorteo en:</p>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-4">
                                        <div className="text-3xl font-bold">{value}</div>
                                        <div className="text-sm uppercase tracking-wide">
                                            {unit === 'days' ? 'Días' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                Ver Rifas Activas
                            </button>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">100% Seguro</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm">+10,000 ganadores</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Productos Section */}
            <section id="productos" className="py-20 px-6 bg-gray-50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Productos Disponibles</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Descubre nuestra selección premium de dispositivos Apple listos para ser tuyos
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Ofertas Especiales Section */}
            <section id="ofertas" className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Ofertas Especiales</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Compra más números y obtén descuentos increíbles
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
                        {specialOffers.map((offer) => (
                            <SpecialOfferCard key={offer.id} offer={offer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonios Section */}
            <section id="testimonios" className="py-20 px-6 bg-gray-50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Lo Que Dicen Nuestros Ganadores</h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Historias reales de personas que cumplieron su sueño Apple
                        </p>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                        {testimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <div className="flex items-center justify-center space-x-8 text-gray-600">
                            <div className="flex items-center space-x-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <span className="font-semibold">+10,000 premios entregados</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <span className="font-semibold">100% de satisfacción</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Final */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto text-center text-white">
                    <h3 className="text-4xl font-bold mb-6">¿Listo Para Ganar Tu Apple?</h3>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Únete a miles de ganadores que ya cumplieron su sueño.
                        Tu próximo dispositivo Apple te está esperando.
                    </p>
                    <button className="bg-white text-blue-600 font-bold py-4 px-12 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg">
                        Participar Ahora
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 px-6">
                <div className="container mx-auto">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} gap-8`}>
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-2xl font-bold">AppleRaffle</h4>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                La plataforma de rifas premium más confiable.
                                Cumplimos sueños tecnológicos desde 2020.
                            </p>
                        </div>

                        <div>
                            <h5 className="text-lg font-semibold mb-4">Enlaces Rápidos</h5>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Rifas Activas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Ganadores</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="text-lg font-semibold mb-4">Soporte</h5>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chat en Vivo</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="text-lg font-semibold mb-4">Contacto</h5>
                            <div className="space-y-3 text-gray-400">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5" />
                                    <span>info@appleraffle.com</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5" />
                                    <span>Madrid, España</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 AppleRaffle. Todos los derechos reservados.</p>
                        <p className="mt-2 text-sm">
                            Apple, iPhone, MacBook, iPad son marcas registradas de Apple Inc.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppleRaffleLanding;