const PAYPHONE_TOKEN = process.env.PAYPHONE_TOKEN!;
const PAYPHONE_API_URL = 'https://pay.payphonetodoesposible.com/api/Links';

export interface PayphoneLinkParams {
    amount: number;  // cantidad de boletos
    price: number;   // precio total con IVA
    name: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
    orderNumber: string;
}

export async function createPayphoneLink(params: PayphoneLinkParams) {
    const {
        amount, price, name, email, phone,
        country, province, city, address, orderNumber
    } = params;

    const clientTransactionId = `${orderNumber}-${Date.now()}`;
    const priceInCents = Math.round(Number(price) * 100);
    const taxValue = Math.round(priceInCents * 0.12);
    const amountWithoutTaxValue = priceInCents - taxValue;

    const paymentLinkData = {
        amount: priceInCents,
        amountWithoutTax: amountWithoutTaxValue,
        amountWithTax: taxValue,
        tax: taxValue,
        service: 0,
        tip: 0,
        currency: "USD",
        reference: `Pago por API Link - Orden ${orderNumber}`,
        clientTransactionId,
        storeId: process.env.PAYPHONE_STORE_ID || '',
        additionalData: `Compra de ${amount} números de rifa`,
        oneTime: true,
        expireIn: 0,
        isAmountEditable: false
    };

    const response = await fetch(PAYPHONE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `bearer ${PAYPHONE_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentLinkData)
    });

    if (!response.ok) {
        console.error('Error en la creación del link de PayPhone:', await response.json());
        throw new Error(`Error PayPhone: ${JSON.stringify(await response.json())}`);
    }

    const data = await response.json();
    return {
        paymentLink: data.linkPayment || data.paymentLink,
        linkId: data.linkId || data.id,
        clientTransactionId: data.clientTransactionId || clientTransactionId,
        expirationDate: data.expirationDate
    };
}
