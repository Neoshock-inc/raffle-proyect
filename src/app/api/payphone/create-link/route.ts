// app/api/payphone/create-link/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN!;
const PAYPHONE_API_URL = 'https://pay.payphonetodoesposible.com/api/Links';

export async function POST(req: Request) {
  const { price, orderNumber } = await req.json();

  try {
    // clientTransactionId máximo 15 caracteres
    const clientTransactionId = `${orderNumber}-${Date.now()}`.slice(0, 15);
    const totalCents = Math.round(Number(price) * 100);

    // Desglose valores (puedes ajustarlo si es necesario)
    const subtotalSinIva = Math.round(totalCents / 1.12);
    const valorConIva = totalCents - subtotalSinIva;
    const impuesto = Math.round(valorConIva / 1.12);

    const paymentLinkData = {
      amount: totalCents,
      amountWithoutTax: totalCents,
      currency: "USD",
      reference: `Pago por API Link - Orden ${orderNumber}`,
      clientTransactionId,
      storeId: process.env.PAYPHONE_STORE_ID || ''
    };

    console.log('Enviando datos para link de pago PayPhone:', paymentLinkData);

    const response = await axios.post(PAYPHONE_API_URL, paymentLinkData, {
      headers: {
        'Authorization': `Bearer ${PAYPHONE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      responseType: 'text'  // <-- aquí indicamos que la respuesta es texto plano
    });

    console.log('Respuesta de PayPhone Link (texto):', response.data);

    // response.data es un string con el link
    return NextResponse.json({
      paymentLink: response.data,
      clientTransactionId
    });

  } catch (error: any) {
    console.error('Error al crear transacción PayPhone:', error.response?.data || error.message || error);

    return NextResponse.json(
      { error: error.response?.data || error.message || 'Error al crear link de pago PayPhone' },
      { status: error.response?.status || 500 }
    );
  }
}
