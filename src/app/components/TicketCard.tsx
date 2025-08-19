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

    // Determinar si es "Más Vendido"
    const isBestSeller = pkg.name?.toLowerCase().includes('más vendido') ||
        pkg.badge_text?.toLowerCase().includes('más vendido') ||
        option.originalAmount === 10; // O cualquier lógica que uses

    // Determinar si es "Oferta Limitada" 
    const isLimitedOffer = pkg.current_offer ||
        pkg.badge_text?.toLowerCase().includes('oferta limitada') ||
        pkg.name?.toLowerCase().includes('oferta limitada');

    return (
        <div
            className={`relative w-full max-w-[320px] h-80 sm:h-96 mx-auto rounded-2xl cursor-pointer transition-all duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] hover:shadow-lg'
                } ${isBestSeller
                    ? 'bg-white border-4 border-black'
                    : 'bg-gray-200 border border-gray-300'
                }`}
            onClick={handleClick}
        >
            {/* Badge "Más Vendido" */}
            {isBestSeller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs sm:text-sm font-bold px-1 sm:px-1 py-1 rounded-full">
                    ★ Más Vendido ★
                </div>
            )}

            {/* Badge "Oferta Limitada" */}
            {!isBestSeller && isLimitedOffer && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 
        ${option.originalAmount === 100 ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'}
        text-xs sm:text-sm font-bold px-1 sm:px-1 py-1 rounded-full`}>
                    🔥 Oferta Limitada 🔥
                </div>
            )}

            {/* Contenido */}
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center">
                {/* Título principal */}
                <div className="text-black font-black text-xl sm:text-2xl mb-6 sm:mb-8 tracking-wide">
                    X{option.originalAmount} NÚMEROS
                </div>

                {/* Precio */}
                <div className="text-black text-5xl sm:text-5xl font-black mb-8 sm:mb-12">
                    ${option.price}
                </div>

                {/* Botón */}
                <button
                    className="bg-black text-white font-bold text-base sm:text-lg py-3 sm:py-4 px-8 sm:px-12 rounded-lg transition-all duration-200 hover:bg-gray-800"
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