import { NextRequest, NextResponse } from 'next/server';

// GET porque PayPhone envía los parámetros en la URL
export async function POST(request: NextRequest) {
    console.log('📱 Webhook PayPhone recibido - Procesando...');
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
    console.log('URL:', request);
    
    try {
        const { id, clientTransactionId } = await request.json();

        console.log('📱 Webhook PayPhone recibido:', {
            transactionId: id,
            clientTransactionId,
            timestamp: new Date().toISOString()
        });

        console.log('📱 Webhook PayPhone recibido:', {
            transactionId: id,
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