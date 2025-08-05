// components/LegacyTicketCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketOption } from '../types/tickets';
import { createPurchaseToken } from '../services/purchaseTokenService';

interface LegacyTicketCardProps {
    option: TicketOption;
    bestSeller?: boolean;
    limitedOffer?: boolean;
    referralCode: string | null;
}

export function LegacyTicketCard({ option, bestSeller = false, limitedOffer = false, referralCode }: LegacyTicketCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const token = await createPurchaseToken(option.amount, option.price);
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

    // Determinar colores y estilos basados en el tipo (sistema anterior)
    const getCardStyles = () => {
        if (limitedOffer) {
            return {
                gradient: 'from-orange-400 via-red-400 to-yellow-400',
                badge: 'LIMITED',
                badgeColor: 'bg-orange-500',
                textColor: 'text-white',
                buttonColor: 'bg-white text-orange-600 hover:bg-gray-100'
            };
        }
        if (bestSeller) {
            return {
                gradient: 'from-purple-400 via-pink-400 to-blue-400',
                badge: 'EXCLUSIVE',
                badgeColor: 'bg-purple-600',
                textColor: 'text-white',
                buttonColor: 'bg-white text-purple-600 hover:bg-gray-100'
            };
        }
        return {
            gradient: 'from-green-400 via-teal-400 to-blue-400',
            badge: 'ULTIMATE',
            badgeColor: 'bg-green-600',
            textColor: 'text-white',
            buttonColor: 'bg-white text-green-600 hover:bg-gray-100'
        };
    };

    const styles = getCardStyles();

    // Calcular entradas y porcentaje (sistema anterior)
    const getEntryData = () => {
        const baseEntries = option.amount * 100;
        const percentage = option.amount >= 50 ? '160x' : option.amount >= 25 ? '120x' : '80x';
        return { entries: baseEntries.toLocaleString(), percentage };
    };

    const { entries, percentage } = getEntryData();

    return (
        <div
            className={`relative w-80 h-96 rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl ${loading ? 'opacity-50 pointer-events-none' : ''
                }`}
            onClick={handleClick}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} rounded-3xl`} />

            {/* Border Effect */}
            <div className="absolute inset-0 rounded-3xl border-4 border-white/20" />

            {/* Top Badge */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${styles.badgeColor} text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg`}>
                {styles.badge}
            </div>

            {/* Legacy Indicator (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                    LEGACY
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-between p-6 text-center">
                {/* Top Section */}
                <div className="flex-1 flex flex-col justify-center">
                    {/* Quick Entry Badge */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                        <div className="text-black font-black text-2xl tracking-tight leading-tight">
                            QUICK<br />ENTRY
                        </div>
                    </div>

                    {/* Includes Label */}
                    <div className={`${styles.textColor} text-sm font-semibold mb-3 opacity-90`}>
                        INCLUDES
                    </div>

                    {/* Amount */}
                    <div className={`${styles.textColor} text-lg font-bold mb-2`}>
                        {option.amount} DIGITAL NUMBERS
                    </div>

                    {/* Discount */}
                    <div className={`${styles.textColor} text-sm opacity-90`}>
                        INSTANT ENTRY
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="w-full">
                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className={`${styles.textColor} text-sm font-semibold`}>
                                {entries} Entries
                            </span>
                        </div>
                        <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {percentage}
                        </div>
                    </div>

                    {/* Price & Button */}
                    <div className={`${styles.textColor} text-3xl font-black mb-4`}>
                        ${option.price}
                    </div>

                    <button
                        className={`w-full ${styles.buttonColor} font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${loading ? 'cursor-not-allowed' : 'hover:shadow-xl'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                        disabled={loading}
                    >
                        {loading ? 'PROCESANDO...' : 'COMPRAR AHORA'}
                    </button>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
    );
}