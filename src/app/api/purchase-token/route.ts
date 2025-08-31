// src/app/api/purchase-token/route.ts - Actualizada para multi-tenant
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { RaffleService } from '@/app/services/raffleService';
import { TenantService } from '@/app/services/tenantService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export async function POST(request: NextRequest) {
    try {
        const {
            amount,
            finalPrice,
            tenantSlug,
            raffleId,
            packageId
        } = await request.json();

        // Validaciones básicas
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

        if (!finalPrice || finalPrice <= 0) {
            return NextResponse.json(
                { error: 'Precio inválido' },
                { status: 400 }
            );
        }

        if (!tenantSlug || !raffleId) {
            return NextResponse.json(
                { error: 'Datos del tenant o rifa faltantes' },
                { status: 400 }
            );
        }

        // Validar tenant
        const tenant = await TenantService.getTenantBySlug(tenantSlug);
        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant no encontrado' },
                { status: 404 }
            );
        }

        // Validar rifa
        const raffle = await RaffleService.getRaffleById(raffleId);
        if (!raffle || raffle.tenant_id !== tenant.id) {
            return NextResponse.json(
                { error: 'Rifa no encontrada o no pertenece al tenant' },
                { status: 404 }
            );
        }

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
                price: finalPrice,
                raffleId: raffle.id,
                tenantId: tenant.id,
                tenantSlug: tenant.slug,
                packageId,
                createdAt: Date.now(),
            },
            JWT_SECRET,
            { expiresIn: '15m' }
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
