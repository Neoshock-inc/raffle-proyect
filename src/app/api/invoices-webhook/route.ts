// ============================================
// 📄 app/api/webhooks/invoices/route.ts
// ============================================
import { FacebookService } from '@/app/lib/facebook';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { record, old_record } = json;

    if (!record) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }
    console.log('record', record);
    console.log('json', json);
    console.log('📥 Invoice Webhook:', {
      invoice_id: record.id,
      old_status: old_record?.status,
      new_status: record.status,
      amount: record.total_price || record.amount
    });

    if (record.status === 'pending' && json?.type == 'INSERT') {
      console.log('🆕 Nueva factura registrada → Enviando OrderCreated');
      await FacebookService.sendOrderCreatedEvent(record);
    }

    if (old_record?.status !== 'completed' && record.status === 'completed') {
      console.log('✅ Factura completada → Enviando Purchase');
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