import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { RaffleService } from '@/services/raffleService';
import { apiSuccess, apiError } from '../_shared/responses';
import { withErrorHandler } from '../_shared/withErrorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface TokenPayload {
    amount: number;
    price: number;
    raffleId: string;
    tenantId: string;
    tenantSlug: string;
    packageId?: string;
    createdAt: number;
    exp: number;
    iat: number;
}

async function handler(request: NextRequest) {
    const { token } = await request.json();

    if (!token) {
        return apiError('Token requerido', 400);
    }

    let tokenData: TokenPayload;
    try {
        tokenData = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (jwtError: any) {
        if (jwtError.name === 'TokenExpiredError') {
            return apiError('Token expirado', 410);
        }
        return apiError('Token inválido', 401);
    }

    const raffle = await RaffleService.getRaffleById(tokenData.raffleId);
    if (!raffle || raffle.tenant_id !== tokenData.tenantId) {
        return apiError('Token no válido para esta rifa', 410);
    }

    if (tokenData.amount <= 0 || tokenData.amount > 10000) {
        return apiError('Cantidad inválida en el token', 400);
    }
    if (tokenData.price <= 0) {
        return apiError('Precio inválido en el token', 400);
    }

    const maxPossiblePrice = tokenData.amount * raffle.price;
    if (tokenData.price > maxPossiblePrice) {
        return apiError('Precio del token excede el máximo permitido', 400);
    }

    return apiSuccess({
        amount: tokenData.amount,
        price: tokenData.price,
        raffleId: tokenData.raffleId,
        tenantId: tokenData.tenantId,
        packageId: tokenData.packageId,
        expiresAt: tokenData.exp * 1000,
        timeRemaining: Math.max(0, tokenData.exp * 1000 - Date.now())
    });
}

export const POST = withErrorHandler(handler, 'validate-purchase');
