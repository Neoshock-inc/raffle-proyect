import { useState, useEffect, useCallback } from 'react';
import { PurchaseData } from '../types/checkout';
import { isTokenExpired, decodeJWTPayload } from '../utils/jwtUtils';
import { calculateTimeRemaining } from '../utils/timeUtils';

export const useTokenValidation = (token: string | null) => {
    const [tokenExpired, setTokenExpired] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkTokenValidity = useCallback(async (): Promise<boolean> => {
        if (!token || tokenExpired) return false;

        if (isTokenExpired(token)) {
            setTokenExpired(true);
            return false;
        }

        try {
            const response = await fetch('/api/validate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (response.status === 410 || response.status === 401) {
                setTokenExpired(true);
                return false;
            }

            return response.ok;
        } catch (error) {
            console.error('Error checking token validity:', error);
            return false;
        }
    }, [token, tokenExpired]);

    const validateAndSetPurchaseData = useCallback(async () => {
        if (!token) {
            throw new Error('Token de compra no encontrado');
        }

        if (isTokenExpired(token)) {
            setTokenExpired(true);
            throw new Error('Tu sesión de compra ha expirado');
        }

        try {
            const response = await fetch('/api/validate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            if (response.status === 410 || response.status === 401) {
                setTokenExpired(true);
                const errorData = await response.json();
                throw new Error(errorData.error || 'Tu sesión de compra ha expirado');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }

            const validatedData = await response.json();

            if (!validatedData.amount || !validatedData.price || !validatedData.raffleId) {
                throw new Error('Datos de validación incompletos');
            }

            const payload = decodeJWTPayload(token);
            const purchaseInfo: PurchaseData = {
                amount: validatedData.amount,
                price: validatedData.price,
                raffleId: validatedData.raffleId,
                expiresAt: payload?.exp ? payload.exp * 1000 : undefined
            };

            setPurchaseData(purchaseInfo);
            return validatedData;
        } catch (error) {
            console.error('Error validating token:', error);
            if (error instanceof Error && error.message.includes('expirado')) {
                setTokenExpired(true);
            }
            throw error;
        }
    }, [token]);

    const renewToken = async (): Promise<void> => {
        if (!purchaseData) return;

        try {
            setIsLoading(true);
            const response = await fetch('/api/create-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: purchaseData.amount
                })
            });

            if (response.ok) {
                const { token: newToken } = await response.json();
                window.location.href = `/checkout?token=${newToken}`;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo renovar el token');
            }
        } catch (error) {
            console.error('Error renewing token:', error);
            alert('No se pudo renovar la sesión. Por favor, vuelve a intentar desde el inicio.');
            window.location.href = '/';
        } finally {
            setIsLoading(false);
        }
    };

    // Contador regresivo
    useEffect(() => {
        if (!token) return;

        const payload = decodeJWTPayload(token);
        if (!payload?.exp) return;

        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining(payload.exp);

            if (remaining <= 0) {
                setTokenExpired(true);
                setTimeRemaining(0);
                clearInterval(interval);
            } else {
                setTimeRemaining(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [token]);

    // Verificación periódica
    useEffect(() => {
        if (tokenExpired) return;

        const interval = setInterval(async () => {
            const isValid = await checkTokenValidity();
            if (!isValid) {
                setTokenExpired(true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [checkTokenValidity, tokenExpired]);

    return {
        tokenExpired,
        timeRemaining,
        purchaseData,
        isLoading,
        setIsLoading,
        checkTokenValidity,
        validateAndSetPurchaseData,
        renewToken
    };
};