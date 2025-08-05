// hooks/useCustomTicketPurchase.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPurchaseToken } from '../services/purchaseTokenService';

export const useCustomTicketPurchase = (referralCode: string | null, soldTickets: number, totalNumbers: number) => {
    const [customAmount, setCustomAmount] = useState<number | null>(null);
    const router = useRouter();

    const handleCustomBuyWithToken = async () => {
        if (!customAmount || customAmount <= 0 || customAmount < 20) {
            alert("Por favor ingresa una cantidad válida");
            return;
        }

        if (customAmount > 10000) {
            alert("La cantidad máxima a comprar es de 10,000 números");
            return;
        }

        const remainingTickets = totalNumbers - soldTickets;
        if (customAmount > remainingTickets) {
            alert(`Solo quedan ${remainingTickets} boletos disponibles`);
            return;
        }

        try {
            const token = await createPurchaseToken(customAmount, customAmount * 1.50);
            const checkoutUrl = referralCode
                ? `/checkout?token=${token}&ref=${encodeURIComponent(referralCode)}`
                : `/checkout?token=${token}`;

            router.push(checkoutUrl);
        } catch (error) {
            alert('Error al procesar la compra. Intenta nuevamente.');
        }
    };

    return {
        customAmount,
        setCustomAmount,
        handleCustomBuyWithToken
    };
};