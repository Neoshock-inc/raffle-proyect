// pages/api/payphone/callback.ts (o app/api/payphone/callback/route.ts si usas App Router)
import { NextResponse } from 'next/server';
import { PaymentStatus } from '../../../types/invoices'; // Ajusta la ruta según tu estructura

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('PayPhone Callback recibido:', body);

        const {
            id, // transactionId de PayPhone
            clientTxId, // clientTransactionId que enviaste
            statusCode,
            status,
            phoneNumber,
            amount,
            // otros campos que PayPhone puede enviar
        } = body;

        // Extraer el orderNumber del clientTransactionId
        // Si tu clientTransactionId tiene formato "ORDER-123-1234567890"
        const orderNumber = clientTxId.split('-').slice(0, -1).join('-');

        let paymentStatus: PaymentStatus;

        // Mapear los códigos de estado de PayPhone a tu sistema
        switch (statusCode) {
            case '4': // Éxito en PayPhone
            case 'Pending': // A veces puede venir como string
                paymentStatus = PaymentStatus.COMPLETED;
                break;
            case '9': // Error/Rechazado
            case 'Canceled':
            case 'Rejected':
                paymentStatus = PaymentStatus.FAILED;
                break;
            default:
                paymentStatus = PaymentStatus.PENDING;
                break;
        }

        console.log(`Actualizando orden ${orderNumber} a estado ${paymentStatus}`);

        // Responder a PayPhone que recibiste el callback
        return NextResponse.json({
            success: true,
            message: 'Callback procesado correctamente',
            orderNumber
        });

    } catch (error: any) {
        console.error('Error procesando callback de PayPhone:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}

// También manejar GET si PayPhone lo requiere
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('id');
    const clientTransactionId = searchParams.get('clientTxId');
    const statusCode = searchParams.get('statusCode');

    console.log('PayPhone Callback GET recibido:', {
        transactionId,
        clientTransactionId,
        statusCode
    });

    try {
        if (!clientTransactionId) {
            return NextResponse.json({
                error: 'clientTransactionId requerido'
            }, { status: 400 });
        }

        const orderNumber = clientTransactionId.split('-').slice(0, -1).join('-');

        let paymentStatus: PaymentStatus;
        switch (statusCode) {
            case '4':
                paymentStatus = PaymentStatus.COMPLETED;
                break;
            case '9':
                paymentStatus = PaymentStatus.FAILED;
                break;
            default:
                paymentStatus = PaymentStatus.PENDING;
                break;
        }

        return NextResponse.json({
            success: true,
            message: 'Callback GET procesado',
            orderNumber
        });

    } catch (error: any) {
        console.error('Error procesando callback GET de PayPhone:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}