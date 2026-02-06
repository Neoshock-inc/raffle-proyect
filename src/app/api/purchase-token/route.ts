// src/app/api/purchase-token/route.ts - Actualizada para multi-tenant
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { RaffleService } from '@/services/raffleService';
import { TenantService } from '@/services/tenantService';
import { apiSuccess, apiError } from '../_shared/responses';
import { withErrorHandler } from '../_shared/withErrorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

async function handler(request: NextRequest) {
    const {
        amount,
        finalPrice,
        tenantSlug,
        raffleId,
        packageId
    } = await request.json();

    // Validaciones básicas
    if (!amount || amount <= 0) {
        return apiError('Cantidad inválida', 400);
    }
    if (amount > 10000) {
        return apiError('Cantidad máxima excedida', 400);
    }
    if (!finalPrice || finalPrice <= 0) {
        return apiError('Precio inválido', 400);
    }
    if (!tenantSlug || !raffleId) {
        return apiError('Datos del tenant o rifa faltantes', 400);
    }

    // Validar tenant
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
        return apiError('Tenant no encontrado', 404);
    }

    // Validar rifa
    const raffle = await RaffleService.getRaffleById(raffleId);
    if (!raffle || raffle.tenant_id !== tenant.id) {
        return apiError('Rifa no encontrada o no pertenece al tenant', 404);
    }

    // Validación adicional: el precio no puede ser mayor que el precio base
    const basePrice = amount * raffle.price;
    if (finalPrice > basePrice) {
        return apiError('Precio inválido detectado', 400);
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

    return apiSuccess({ token });
}

export const POST = withErrorHandler(handler, 'purchase-token');
