// components/TemporalOfferBar.tsx
import { useCountdown } from '../hooks/useCountdown';
import { EnhancedTicketOption } from '../types/ticketPackages';

interface TemporalOfferBarProps {
    ticketOptions: EnhancedTicketOption[];
    isVisible: boolean;
}

export function TemporalOfferBar({ ticketOptions, isVisible }: TemporalOfferBarProps) {
    // Buscar cualquier opción que tenga una oferta activa para obtener las fechas
    const activeOffer = ticketOptions.find(option =>
        option.package.current_offer &&
        option.package.current_offer.is_active
    )?.package.current_offer;

    // SIEMPRE llamar el hook, incluso si no hay oferta activa
    // Pasamos una fecha por defecto si no hay oferta activa
    const defaultEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas desde ahora
    const countdown = useCountdown(activeOffer?.end_date || defaultEndDate);

    // Si no es visible, no hay oferta activa o ya expiró, no mostrar la barra
    if (!isVisible || !activeOffer || countdown === 'Expirado') {
        return null;
    }

    return (
        <div className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-4 mb-6 relative overflow-hidden rounded-lg shadow-lg">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 animate-pulse opacity-50"></div>

            {/* Patrón de puntos de fondo */}
            <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                    backgroundSize: '15px 15px'
                }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Texto de la oferta */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl animate-bounce">🔥</span>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg md:text-xl font-black uppercase">
                                    ¡OFERTA 2X1 POR TIEMPO LIMITADO!
                                </h3>
                                <p className="text-sm md:text-base opacity-90">
                                    Compra 1 y llévate 2 - Solo por 24 horas
                                </p>
                            </div>
                            <span className="text-2xl animate-bounce">🎁</span>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                                La oferta termina en:
                            </p>
                            <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                                <span className="font-mono text-3xl md:text-2xl font-bold tracking-wider">
                                    {countdown}
                                </span>
                            </div>
                        </div>

                        {/* Botón CTA opcional */}
                        <div className="hidden md:block">
                            <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold uppercase tracking-wide hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                ¡Aprovecha Ya!
                            </button>
                        </div>
                    </div>
                </div>

                {/* Versión móvil del botón CTA */}
                <div className="md:hidden mt-4 text-center">
                    <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg">
                        ¡Aprovecha Ya!
                    </button>
                </div>
            </div>

            {/* Barra de progreso animada (opcional) */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
                <div
                    className="h-full bg-white/40 animate-pulse"
                    style={{
                        width: '70%', // Puedes calcular el porcentaje basado en tiempo restante
                        transition: 'width 1s ease-in-out'
                    }}
                ></div>
            </div>
        </div>
    );
}