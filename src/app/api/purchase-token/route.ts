import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getActiveRaffle } from '@/app/services/raffleService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(request: NextRequest) {
    try {
        const { amount, finalPrice } = await request.json();

        // Validaciones en el backend
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Cantidad inválida' },
                { status: 400 }
            );
        }

        if (amount > 10000) {
            return NextResponse.json(
                { error: 'Cantidad máxima excedida' },
                { status: 400 }
            );
        }

        // Validar que se proporcione el precio final
        if (!finalPrice || finalPrice <= 0) {
            return NextResponse.json(
                { error: 'Precio inválido' },
                { status: 400 }
            );
        }

        // Obtener datos actuales del sorteo para validación
        const raffle = await getActiveRaffle();

        // Validación adicional: el precio no puede ser mayor que el precio base
        const basePrice = amount * raffle.price;
        if (finalPrice > basePrice) {
            return NextResponse.json(
                { error: 'Precio inválido detectado' },
                { status: 400 }
            );
        }

        // Crear token JWT con los datos
        const token = jwt.sign(
            {
                amount,
                price: finalPrice, // Usar el precio final ya calculado con descuentos
                raffleId: raffle.id,
                createdAt: Date.now(),
            },
            JWT_SECRET,
            { expiresIn: '15m' } // Token válido por 15 minutos
        );

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error creating purchase token:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}