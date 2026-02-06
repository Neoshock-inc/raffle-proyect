import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiSuccess, apiError } from '../../_shared/responses';
import { withErrorHandler } from '../../_shared/withErrorHandler';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

async function handler(req: NextRequest) {
    const { orderNumber, status } = await req.json();

    if (!orderNumber || !status) {
        return apiError('Faltan parámetros requeridos.', 400);
    }

    const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('order_number', orderNumber);

    if (error) {
        console.error('Error al actualizar factura:', error);
        return apiError('Error al actualizar factura.', 500);
    }

    return apiSuccess({ success: true });
}

export const POST = withErrorHandler(handler, 'invoice/complete');
