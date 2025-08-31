// src/hooks/useTenantPurchase.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface TenantPurchaseData {
    tenantSlug: string;
    raffleId: string;
    amount: number;
    finalPrice: number;
    packageId?: string;
}

export const useTenantPurchase = (tenantSlug: string, raffleId: string) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const createPurchaseToken = async (data: TenantPurchaseData): Promise<string> => {
        try {
            const response = await fetch('/api/purchase-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    tenantSlug,
                    raffleId,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear token de compra');
            }

            const result = await response.json();
            return result.token;
        } catch (error) {
            console.error('Error creando token:', error);
            throw error;
        }
    };

    const purchaseTickets = async (
        amount: number,
        finalPrice: number,
        referralCode: string | null,
        packageId?: string
    ) => {
        try {
            setLoading(true);

            const token = await createPurchaseToken({
                tenantSlug,
                raffleId,
                amount,
                finalPrice,
                packageId,
            });

            const checkoutUrl = referralCode
                ? `/${tenantSlug}/checkout?token=${token}&ref=${encodeURIComponent(referralCode)}`
                : `/${tenantSlug}/checkout?token=${token}`;

            router.push(checkoutUrl);
        } catch (error) {
            alert('Error al procesar la compra. Intenta nuevamente.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        purchaseTickets,
        loading,
    };
};