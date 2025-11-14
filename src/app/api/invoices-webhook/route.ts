import { FacebookService } from '@/app/lib/facebook';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const json = await req.json();

        const { record, old_record } = json;

        if (!record || !old_record) {
            return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
        }

        // Solo ejecutar si la factura cambió a completed
        if (
            old_record.status !== 'completed' &&
            record.status === 'completed'
        ) {
            console.log('📌 Factura completada, enviando evento a Facebook CAPI…');
            await FacebookService.sendPurchaseEvent(record);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('❌ Error en invoices-webhook:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
