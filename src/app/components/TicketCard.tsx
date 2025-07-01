// components/TicketCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketOption } from '../types/tickets';
import { createPurchaseToken } from '../services/purchaseTokenService';

interface TicketCardProps {
    option: TicketOption;
    bestSeller?: boolean;
    limitedOffer?: boolean;
    referralCode: string | null;
}

export function TicketCard({ option, bestSeller = false, limitedOffer = false, referralCode }: TicketCardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const token = await createPurchaseToken(option.amount);
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

    return (
        <div
            className={`relative bg-gray-100 border rounded-2xl p-3 shadow hover:shadow-lg transition text-center cursor-pointer flex flex-col items-center ${limitedOffer ? 'border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50' : ''
                } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleClick}
        >
            {bestSeller && (
                <div className="absolute -top-3 -left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-tr-lg rounded-bl-lg shadow-md z-10">
                    MÁS VENDIDO
                </div>
            )}

            {limitedOffer && (
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-br-lg shadow-md z-10 animate-pulse">
                    OFERTA LIMITADA
                </div>
            )}

            <h3 className={`text-xl font-bold tracking-wide mb-2 ${limitedOffer ? 'text-orange-700' : ''}`}>
                x{option.amount} NÚMEROS
            </h3>

            {limitedOffer && (
                <div className="mb-2">
                    <div className="text-xs text-orange-600 font-semibold">¡SÚPER DESCUENTO!</div>
                </div>
            )}

            <p className={`text-2xl font-bold mb-4 ${limitedOffer ? 'text-orange-600' : ''}`}>
                ${option.price}
            </p>

            <button
                className={`text-sm font-semibold px-4 py-2 rounded transition ${limitedOffer
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-black text-white hover:bg-gray-800'
                    } ${loading ? 'cursor-not-allowed' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                disabled={loading}
            >
                {loading ? 'PROCESANDO...' : 'COMPRAR'}
            </button>
        </div>
    );
}