// components/TicketCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedTicketOption } from '../types/ticketPackages';
import { createPurchaseToken } from '../services/purchaseTokenService';

interface TicketCardProps {
    option: EnhancedTicketOption;
    referralCode: string | null;
    colorScheme?: number; // No se usa en el nuevo diseño
}

export function TicketCard({ option, referralCode }: TicketCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
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
    const currentOffer = pkg.current_offer;


    // Determinar si es "Más Vendido"
    const isBestSeller = pkg.name?.toLowerCase().includes('más vendido') ||
        pkg.badge_text?.toLowerCase().includes('más vendido') ||
        option.originalAmount === 20; // O cualquier lógica que uses

    // Determinar si es "Oferta Limitada"
    const isLimitedOffer = pkg.current_offer ||
        pkg.badge_text?.toLowerCase().includes('oferta limitada') ||
        pkg.name?.toLowerCase().includes('oferta limitada');

    // Nueva condición: es el paquete más grande (100 números)
    const isMegaPack = option.originalAmount === 150;

    const getBorderStyle = () => {
        if (isMegaPack) {
            return 'border-2 border-yellow-400 shadow-2xl shadow-yellow-500/50';
        }
        if (isBestSeller) {
            return 'border-2 border-green-400 shadow-lg shadow-green-500/30';
        }
        if (isLimitedOffer) {
            return 'border border-gray-700 shadow-lg shadow-red-500/30';
        }
        return 'border border-gray-700 shadow-lg';
    };

    const getButtonStyle = () => {
        if (isMegaPack) {
            return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 font-extrabold animate-pulse';
        }
        if (isBestSeller) {
            return 'bg-green-500 text-white hover:bg-green-400 font-black animate-pulse';
        }
        if (isLimitedOffer) {
            return 'bg-red-500 text-white hover:bg-red-400 font-black animate-pulse';
        }
        return 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold';
    };

    // Backgrounds con texturas más llamativas
    const getBackgroundStyle = () => {
        if (isMegaPack) {
            // Mega Pack: Patrón de diamantes dorados más intenso
            return `
                bg-gray-900
                relative
                before:absolute before:inset-0 
                before:bg-[linear-gradient(45deg,rgba(255,215,0,0.15)_25%,transparent_25%,transparent_75%,rgba(255,215,0,0.15)_75%)]
                before:bg-[length:16px_16px]
                after:absolute after:inset-0 
                after:bg-[linear-gradient(-45deg,rgba(255,215,0,0.12)_25%,transparent_25%,transparent_75%,rgba(255,215,0,0.12)_75%)]
                after:bg-[length:16px_16px]
                after:[background-position:8px_8px]
            `;
        }
        if (isBestSeller) {
            // Más vendido: Patrón de hexágonos verdes más visibles
            return `
                bg-gray-900
                relative
                before:absolute before:inset-0 
                before:bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12)_3px,transparent_3px)]
                before:bg-[length:20px_20px]
                after:absolute after:inset-0 
                after:bg-[linear-gradient(60deg,transparent_40%,rgba(34,197,94,0.08)_41%,rgba(34,197,94,0.08)_59%,transparent_60%)]
                after:bg-[length:24px_24px]
            `;
        }
        if (isLimitedOffer) {
            // Oferta limitada: Patrón de rayas diagonales rojas más intensas
            return `
                bg-gray-900
                relative
                before:absolute before:inset-0 
                before:bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(239,68,68,0.12)_6px,rgba(239,68,68,0.12)_8px)]
                after:absolute after:inset-0 
                after:bg-[repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(239,68,68,0.08)_8px,rgba(239,68,68,0.08)_10px)]
            `;
        }
        // Estándar: Patrón de puntos más visible
        return `
            bg-gray-900
            relative
            before:absolute before:inset-0 
            before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_2px,transparent_2px)]
            before:bg-[length:20px_20px]
            after:absolute after:inset-0 
            after:bg-[linear-gradient(0deg,transparent_48%,rgba(255,255,255,0.03)_49%,rgba(255,255,255,0.03)_51%,transparent_52%)]
            after:bg-[length:10px_10px]
        `;
    };

    return (
        <div
            className={`relative w-full max-w-[300px] h-48 sm:h-56 mx-auto rounded-xl cursor-pointer transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] hover:shadow-xl'
                } ${getBackgroundStyle()} ${getBorderStyle()}`}
            onClick={handleClick}
        >
            {/* Badge "Más Vendido" */}
            {isBestSeller && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 
                  bg-green-500 text-white text-sm font-black 
                  px-1 py-1 rounded-full shadow-lg animate-bounce 
                  min-w-[180px] text-center z-10">
                    ★ MÁS VENDIDO ★
                </div>
            )}

            {/* Badge "Oferta Limitada" */}
            {!isBestSeller && isLimitedOffer && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 
                  bg-red-600 text-white text-sm font-black 
                  px-1 py-1 rounded-full shadow-lg animate-bounce 
                  min-w-[200px] text-center z-10">
                    🔥 OFERTA 2x1 🔥
                </div>
            )}

            {/* Badge "Mega Pack" para 100 números */}
            {isMegaPack && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 
                    bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 
                    text-black text-base font-extrabold 
                    px-8 py-2 rounded-full shadow-2xl animate-bounce 
                    min-w-[220px] text-center tracking-wider uppercase border border-yellow-300 z-10">
                    🚀 MEGA PACK 🚀
                </div>
            )}

            {/* Contenido */}
            <div className="h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center relative z-10">
                {/* Título principal */}
                <div className="text-white font-black text-lg sm:text-xl mb-3 sm:mb-4 tracking-wide">
                    X{option.originalAmount} NÚMEROS
                </div>

                {/* Precio Original */}
                <div className="text-gray-400 text-sm line-through">
                    {currentOffer
                        ? `$${(option.price / (1 - currentOffer.special_discount_percentage / 100)).toFixed(1)}`
                        : null}
                </div>

                {/* Precio */}
                <div className={`text-3xl sm:text-4xl font-black mb-4 sm:mb-6 ${isBestSeller ? 'text-green-400' : 'text-yellow-500'}`}>
                    ${option.price}
                </div>

                {/* Botón más delgado */}
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