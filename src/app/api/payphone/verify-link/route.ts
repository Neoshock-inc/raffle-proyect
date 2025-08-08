// pages/api/payphone/verify-link.ts (o app/api/payphone/verify-link/route.ts si usas App Router)
import { NextResponse } from 'next/server';
import axios from 'axios';

const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN!;
const VERIFY_URL = 'https://pay.payphonetodoesposible.com/api/Links';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    const clientTransactionId = searchParams.get('clientTransactionId');

    if (!linkId && !clientTransactionId) {
        return NextResponse.json({
            error: 'Se requiere linkId o clientTransactionId'
        }, { status: 400 });
    }

    try {
        let url: string;

        if (linkId) {
            url = `${VERIFY_URL}/${linkId}`;
        } else {
            // Buscar por clientTransactionId - esto puede requerir una consulta diferente
            url = `${VERIFY_URL}?clientTxId=${clientTransactionId}`;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        console.log('Respuesta de verificación PayPhone Link:', response.data);

        return NextResponse.json(response.data);

    } catch (error: any) {
        console.error('Error al verificar link PayPhone:', error.response?.data || error.message);

        return NextResponse.json({
            error: error.response?.data?.message || 'Error al verificar link de pago',
            details: error.response?.data || error.message
        }, {
            status: 500
        });
    }
}

export async function POST(req: Request) {
    const { linkId, clientTransactionId } = await req.json();

    if (!linkId && !clientTransactionId) {
        return NextResponse.json({
            error: 'Se requiere linkId o clientTransactionId'
        }, { status: 400 });
    }

    try {
        let url: string;

        if (linkId) {
            url = `${VERIFY_URL}/${linkId}`;
        } else {
            url = `${VERIFY_URL}?clientTxId=${clientTransactionId}`;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        return NextResponse.json(response.data);

    } catch (error: any) {
        console.error('Error al verificar link PayPhone:', error.response?.data || error.message);

        return NextResponse.json({
            error: error.response?.data?.message || 'Error al verificar link de pago',
            details: error.response?.data || error.message
        }, {
            status: 500
        });
    }
}