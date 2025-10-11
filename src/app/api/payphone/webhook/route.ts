import { NextRequest, NextResponse } from 'next/server';

// GET porque PayPhone envía los parámetros en la URL
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const transactionId = searchParams.get('id');
        const clientTransactionId = searchParams.get('clientTransactionId');

        console.log('📱 Webhook PayPhone recibido:', {
            transactionId,
            clientTransactionId,
            timestamp: new Date().toISOString()
        });

        // Por ahora solo logueamos
        // TODO: Aquí actualizarás el estado de la factura en tu base de datos

        return NextResponse.json({
            success: true,
            message: 'Webhook recibido correctamente'
        });

    } catch (error) {
        console.error('❌ Error en webhook PayPhone:', error);
        return NextResponse.json({
            success: false,
            error: 'Error procesando webhook'
        }, { status: 500 });
    }
}