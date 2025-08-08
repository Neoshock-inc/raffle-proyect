// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
    maxNetworkRetries: 3,
    telemetry: false,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        console.error('❌ Missing Stripe signature');
        return new NextResponse('Missing Stripe signature', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Get the raw body as text first, then convert to buffer
        const body = await req.text();
        const rawBody = Buffer.from(body, 'utf8');

        console.log('🔍 Debug Info:');
        console.log('Signature:', sig);
        console.log('Body length:', body.length);
        console.log('Raw body length:', rawBody.length);

        // Construct the event
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

    } catch (err) {
        console.error('❌ Webhook signature verification failed:');
        console.error('Error:', err);

        if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
            console.error('Signature verification error details:', {
                type: err.type,
                header: err.headers,
                // payload property does not exist on StripeSignatureVerificationError
            });
        }

        return new NextResponse(
            `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
            { status: 400 }
        );
    }

    // Handle the event
    try {
        console.log('✅ Webhook signature verified. Event type:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('✅ Processing checkout.session.completed');

            const metadata = session.metadata;
            console.log('Metadata:', metadata);

            if (metadata?.orderNumber) {
                const { orderNumber, name, email, phone, amount } = metadata;

                // Register the raffle entry
                try {
                    console.log('📝 Registering raffle entry...');
                    const raffleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/raffle/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            phone,
                            amount: Number(amount),
                            stripeSessionId: session.id,
                        }),
                    });

                    if (!raffleResponse.ok) {
                        console.error('❌ Failed to register raffle entry:', await raffleResponse.text());
                    } else {
                        console.log('✅ Raffle entry registered successfully');
                    }
                } catch (error) {
                    console.error('❌ Error registering raffle entry:', error);
                }

                // Complete the invoice
                try {
                    console.log('📄 Completing invoice...');
                    const invoiceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/complete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderNumber,
                            status: 'completed'
                        }),
                    });

                    if (!invoiceResponse.ok) {
                        console.error('❌ Failed to complete invoice:', await invoiceResponse.text());
                    } else {
                        console.log('✅ Invoice completed successfully');
                    }
                } catch (error) {
                    console.error('❌ Error completing invoice:', error);
                }
            } else {
                console.warn('⚠️ No orderNumber found in metadata');
            }
        } else {
            console.log('ℹ️ Unhandled webhook event type:', event.type);
        }

        return new NextResponse('Webhook handled successfully', { status: 200 });

    } catch (err) {
        console.error('❌ Error processing webhook event:', err);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
