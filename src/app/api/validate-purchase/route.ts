import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { RaffleService } from '@/app/services/raffleService';

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

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
        }

        let tokenData: TokenPayload;
        try {
            tokenData = jwt.verify(token, JWT_SECRET) as TokenPayload;
        } catch (jwtError: any) {
            if (jwtError.name === 'TokenExpiredError') {
                return NextResponse.json({ error: 'Token expirado' }, { status: 410 });
            }
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        // ✅ Obtener la rifa específica del tenant
        const raffle = await RaffleService.getRaffleById(tokenData.raffleId);
        if (!raffle || raffle.tenant_id !== tokenData.tenantId) {
            return NextResponse.json({ error: 'Token no válido para esta rifa' }, { status: 410 });
        }

        // Validaciones básicas del token
        if (tokenData.amount <= 0 || tokenData.amount > 10000) {
            return NextResponse.json({ error: 'Cantidad inválida en el token' }, { status: 400 });
        }
        if (tokenData.price <= 0) {
            return NextResponse.json({ error: 'Precio inválido en el token' }, { status: 400 });
        }

        // Validación opcional: que el precio no exceda el máximo permitido
        const maxPossiblePrice = tokenData.amount * raffle.price;
        if (tokenData.price > maxPossiblePrice) {
            return NextResponse.json({ error: 'Precio del token excede el máximo permitido' }, { status: 400 });
        }

        return NextResponse.json({
            amount: tokenData.amount,
            price: tokenData.price,
            raffleId: tokenData.raffleId,
            tenantId: tokenData.tenantId,
            packageId: tokenData.packageId,
            expiresAt: tokenData.exp * 1000,
            timeRemaining: Math.max(0, tokenData.exp * 1000 - Date.now())
        });

    } catch (error) {
        console.error('Error in validate-purchase-token:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
