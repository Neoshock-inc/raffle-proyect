// components/TicketCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedTicketOption } from '../types/ticketPackages';
import { createPurchaseToken } from '../services/purchaseTokenService';

interface TicketCardProps {
    option: EnhancedTicketOption;
    referralCode: string | null;
    colorScheme?: number; // 0-4 para los 5 esquemas
}

// Esquemas de colores oscuros
const colorSchemes = [
    {
        // Emerald 400
        gradient: 'from-emerald-800 to-emerald-900',
        badgeColor: 'bg-emerald-700',
        textColor: 'text-emerald-100',
        buttonColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        accentColor: 'bg-emerald-600'
    },
    {
        // Blue Dark
        gradient: 'from-blue-900 to-indigo-900',
        badgeColor: 'bg-blue-700',
        textColor: 'text-blue-100',
        buttonColor: 'bg-blue-600 hover:bg-blue-500 text-white',
        accentColor: 'bg-blue-600'
    },
    {
        // Purple Dark
        gradient: 'from-purple-900 to-violet-900',
        badgeColor: 'bg-purple-700',
        textColor: 'text-purple-100',
        buttonColor: 'bg-purple-600 hover:bg-purple-500 text-white',
        accentColor: 'bg-purple-600'
    },
    {
        // Green Dark
        gradient: 'from-emerald-900 to-teal-900',
        badgeColor: 'bg-emerald-700',
        textColor: 'text-emerald-100',
        buttonColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        accentColor: 'bg-emerald-600'
    },
    {
        // Red Dark
        gradient: 'from-red-900 to-rose-900',
        badgeColor: 'bg-red-700',
        textColor: 'text-red-100',
        buttonColor: 'bg-red-600 hover:bg-red-500 text-white',
        accentColor: 'bg-red-600'
    }
];

export function TicketCard({ option, referralCode, colorScheme = 0 }: TicketCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            // Enviar tanto el amount como el precio ya calculado con descuentos
            const token = await createPurchaseToken(option.originalAmount, option.price);
            const checkoutUrl = referralCode
                ? `/checkout?token=${token}&ref=${encodeURIComponent(referralCode)}`
                : `/checkout?token=${token}`;

            router.push(checkoutUrl);
        } catch (error) {
            alert('Error al procesar la compra. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const pkg = option.package;
    const styles = colorSchemes[colorScheme % 5]; // Asegurar que esté en rango 0-4

    // Usar los datos calculados del paquete
    const name = pkg.name || 'Paquete Especial';
    const badge = pkg.current_offer?.special_badge_text || pkg.badge_text || 'OFERTA ESPECIAL';
    const subtitle = pkg.subtitle || 'ESPECIAL PARA TI';
    const buttonText = pkg.button_text || 'COMPRAR AHORA';

    return (
        <div
            className={`relative w-80 h-96 rounded-3xl cursor-pointer transition-all duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02]'
                }`}
            onClick={handleClick}
            style={{ transformOrigin: 'center center' }}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} rounded-3xl`} />

            {/* Border Effect */}
            <div className="absolute inset-0 rounded-3xl border-4 border-white/10" />

            {/* Top Badge */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${styles.badgeColor} text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg border border-white/20`}>
                {badge}
            </div>

            {/* Special Offer Indicator */}
            {pkg.current_offer && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-600 rounded-full animate-pulse border-2 border-white/90">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        !
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-between p-6 text-center">
                {/* Top Section */}
                <div className="flex-1 flex flex-col justify-center">
                    {/* Quick Entry Badge */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                        <div className="text-white font-black text-2xl tracking-tight leading-tight">
                            {name.toUpperCase()}
                        </div>
                    </div>

                    {/* Includes Label */}
                    <div className={`${styles.textColor} text-sm font-semibold mb-3 opacity-90`}>
                        INCLUYE
                    </div>

                    {/* Amount with bonus indicator */}
                    <div className={`${styles.textColor} text-lg font-bold mb-2`}>
                        {option.originalAmount} NÚMEROS 
                        {pkg.bonus_entries > 0 && (
                            <span className="block text-sm text-amber-300">
                                + {pkg.bonus_entries} BONUS
                            </span>
                        )}
                    </div>

                    {/* Subtitle/Discount */}
                    <div className={`${styles.textColor} text-sm opacity-80`}>
                        {subtitle}
                    </div>

                    {/* Current Offer Info */}
                    {pkg.current_offer && (
                        <div className="mt-2 bg-orange-600/20 backdrop-blur-sm rounded-lg p-2 border border-orange-500/30">
                            <div className="text-amber-300 text-xs font-bold">
                                {pkg.current_offer.offer_name}
                            </div>
                            {pkg.current_offer.special_discount_percentage > 0 && (
                                <div className="text-white text-xs">
                                    {pkg.current_offer.special_discount_percentage}% EXTRA OFF
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="w-full">
                    {/* Stats */}

                    {/* {pkg.show_entry_count && (
                        <div className="flex justify-between items-center mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 ${styles.accentColor} rounded-full`}></div>
                                <span className={`${styles.textColor} text-sm font-semibold`}>
                                    {pkg.entries_display}
                                </span>
                            </div>
                            {pkg.show_multiplier && (
                                <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-amber-500">
                                    {pkg.multiplier_display}
                                </div>
                            )}
                        </div>
                    )} */}

                    {/* Price & Button */}
                    <div className="mb-4">
                        {/* Show original price if there's a discount */}
                        {(pkg.discount_percentage > 0 || (pkg.current_offer?.special_discount_percentage || 0) > 0) && (
                            <div className={`${styles.textColor} text-lg line-through opacity-50`}>
                                ${(option.price / (1 - Math.max(pkg.discount_percentage, pkg.current_offer?.special_discount_percentage || 0) / 100)).toFixed(2)}
                            </div>
                        )}
                        <div className={`${styles.textColor} text-3xl font-black`}>
                            ${option.price}
                        </div>
                    </div>

                    <button
                        className={`w-full ${styles.buttonColor} font-bold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'PROCESANDO...' : buttonText}
                    </button>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse opacity-50" />
        </div>
    );
}