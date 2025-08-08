// pages/api/payphone/webhook.ts (o app/api/payphone/webhook/route.ts si usas App Router)
import { NextResponse } from 'next/server';
import { PaymentStatus } from '../../../types/invoices'; // Ajusta la ruta según tu estructura

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('PayPhone Webhook recibido:', body);

        const {
            linkId, // ID del link de pago
            clientTransactionId, // clientTransactionId que enviaste
            status, // Estado del pago: 'Paid', 'Cancelled', 'Expired', etc.
            amount, // Monto en centavos
            phoneNumber,
            email,
            paymentDate,
            // otros campos que PayPhone puede enviar para links
        } = body;

        if (!clientTransactionId) {
            console.error('clientTransactionId no encontrado en webhook');
            return NextResponse.json({ 
                error: 'clientTransactionId requerido' 
            }, { status: 400 });
        }

        // Extraer el orderNumber del clientTransactionId
        // Si tu clientTransactionId tiene formato "ORDER-123-1234567890"
        const orderNumber = clientTransactionId.split('-').slice(0, -1).join('-');

        let paymentStatus: PaymentStatus;

        // Mapear los estados de links de PayPhone a tu sistema
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
            case 'success':
                paymentStatus = PaymentStatus.COMPLETED;
                break;
            case 'cancelled':
            case 'canceled':
            case 'rejected':
            case 'failed':
                paymentStatus = PaymentStatus.FAILED;
                break;
            case 'expired':
                paymentStatus = PaymentStatus.FAILED; // O podrías tener un estado específico para expirado
                break;
            default:
                paymentStatus = PaymentStatus.PENDING;
                break;
        }

        console.log(`Actualizando orden ${orderNumber} a estado ${paymentStatus}`);

        // Responder a PayPhone que recibiste el webhook
        return NextResponse.json({ 
            success: true, 
            message: 'Webhook procesado correctamente',
            orderNumber 
        });

    } catch (error: any) {
        console.error('Error procesando webhook de PayPhone:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { 
            status: 500 
        });
    }
}

// También manejar GET si PayPhone lo requiere para links
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    const clientTransactionId = searchParams.get('clientTransactionId');
    const status = searchParams.get('status');

    console.log('PayPhone Webhook GET recibido:', { 
        linkId, 
        clientTransactionId, 
        status 
    });

    try {
        if (!clientTransactionId) {
            return NextResponse.json({ 
                error: 'clientTransactionId requerido' 
            }, { status: 400 });
        }

        const orderNumber = clientTransactionId.split('-').slice(0, -1).join('-');

        let paymentStatus: PaymentStatus;
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
                paymentStatus = PaymentStatus.COMPLETED;
                break;
            case 'cancelled':
            case 'failed':
            case 'expired':
                paymentStatus = PaymentStatus.FAILED;
                break;
            default:
                paymentStatus = PaymentStatus.PENDING;
                break;
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Webhook GET procesado',
            orderNumber 
        });

    } catch (error: any) {
        console.error('Error procesando webhook GET de PayPhone:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { 
            status: 500 
        });
    }
}