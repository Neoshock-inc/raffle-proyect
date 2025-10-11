// src/app/api/payphone/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

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

        if (!transactionId || !clientTransactionId) {
            console.error('❌ Faltan parámetros requeridos');
            return NextResponse.json({
                success: false,
                error: 'Faltan parámetros: id y clientTransactionId son requeridos'
            }, { status: 400 });
        }

        // 1. Extraer orderNumber del clientTransactionId
        // Formato: INV-20251011-0371-1760206968635 -> INV-20251011-0371
        const orderNumber = clientTransactionId.split('-').slice(0, 3).join('-');
        console.log('🔍 Buscando orden:', orderNumber);

        // 2. Buscar la factura en la base de datos
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*, tenant_id')
            .eq('order_number', orderNumber)
            .single();

        if (invoiceError || !invoice) {
            console.error('❌ Factura no encontrada:', orderNumber);
            return NextResponse.json({
                success: false,
                error: 'Factura no encontrada'
            }, { status: 404 });
        }

        console.log('✅ Factura encontrada:', {
            id: invoice.id,
            tenant_id: invoice.tenant_id,
            amount: invoice.amount
        });

        // 3. Obtener configuración de PayPhone del tenant
        const { data: paymentConfigs, error: configError } = await supabase
            .from('payment_configs')
            .select('*')
            .eq('tenant_id', invoice.tenant_id)
            .eq('provider', 'payphone');

        console.log('🔧 Configuración de pago obtenida:', paymentConfigs);

        if (configError || !paymentConfigs || paymentConfigs.length === 0) {
            console.error('❌ Configuración de PayPhone no encontrada para tenant:', invoice.tenant_id);
            return NextResponse.json({
                success: false,
                error: 'Configuración de pago no encontrada'
            }, { status: 404 });
        }


        const paymentConfig = paymentConfigs[0];
        const payphoneToken = paymentConfig.secret_key.trim();
        console.log('🔑 Token de PayPhone obtenido: ', payphoneToken);

        // 4. Verificar el estado de la transacción con PayPhone
        console.log(`🔍 Consultando transacción en PayPhone: ${transactionId}`);

        const payphoneResponse = await fetch(
            `https://pay.payphonetodoesposible.com/api/Sale/67079248`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer RHcZ5fBS96dDNnaMKjf_ldUkDn8_k5_AfglzTlDQhntQ_thufuVCTEiKNcA2nsdSRQzkmTS51s_pMuOzHnq_YvSjgADt_WXOgogtC6F12ULa-eM6hpf8OOeWPdZfN1JvHcx6FWdQIFh8DB4hE3KJbAJN_MFnxRQhrOid_nZzNS3prwPETRNNWuXhMtu1Ty8pTD1ZSW7zD_XVe-BZ5BSPhrEPXaD-zZi0S7q1yl3719h3dt4rhBEGeLnEyLH3GPzlUF8BRmm5vXF9SNfWrrH3TrnI8dOMwsOT56SAJ4vfxgcDNrSVYCI8AL_BjgKwBcpk4LDbf_YOUUriCLbDqFgWkCUcC1I`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('📥 Respuesta de PayPhone recibida con estado:', payphoneResponse);

        if (!payphoneResponse.ok) {
            const errorText = await payphoneResponse.text();
            console.error('❌ Error consultando PayPhone:', errorText);
            return NextResponse.json({
                success: false,
                error: 'Error al consultar el estado de la transacción'
            }, { status: 500 });
        }

        const transactionData = await payphoneResponse.json();
        console.log('📊 Estado de transacción PayPhone:', {
            transactionId: transactionData.transactionId,
            statusCode: transactionData.statusCode,
            transactionStatus: transactionData.transactionStatus,
            amount: transactionData.amount
        });

        // 5. Verificar si el pago fue aprobado
        // statusCode: 3 = Approved
        if (transactionData.statusCode === 3 && transactionData.transactionStatus === 'Approved') {
            console.log('✅ Pago aprobado, procesando...');

            // 6. Actualizar la factura a COMPLETED
            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    status: 'completed',
                    payment_details: transactionData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoice.id);

            if (updateError) {
                console.error('❌ Error actualizando factura:', updateError);
                return NextResponse.json({
                    success: false,
                    error: 'Error al actualizar la factura'
                }, { status: 500 });
            }

            console.log('✅ Factura actualizada a COMPLETED');

            // 7. Generar números de rifa
            try {
                console.log('🎲 Generando números de rifa...');

                const raffleResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/raffle/register`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: invoice.full_name,
                            email: invoice.email,
                            amount: invoice.amount,
                            orderNumber: orderNumber,
                            tenantId: invoice.tenant_id,
                            payphoneTransactionId: transactionId
                        }),
                    }
                );

                if (!raffleResponse.ok) {
                    const errorText = await raffleResponse.text();
                    console.error('❌ Error al generar números de rifa:', errorText);
                } else {
                    const raffleData = await raffleResponse.json();
                    console.log('✅ Números de rifa generados:', raffleData);
                }
            } catch (raffleError) {
                console.error('❌ Error en generación de números:', raffleError);
            }

            return NextResponse.json({
                success: true,
                message: 'Pago procesado correctamente',
                data: {
                    orderNumber,
                    transactionId,
                    status: 'completed'
                }
            });

        } else {
            // Pago no aprobado o rechazado
            console.log('❌ Pago no aprobado:', transactionData.transactionStatus);

            // Actualizar factura a FAILED
            await supabase
                .from('invoices')
                .update({
                    status: 'failed',
                    payment_details: transactionData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoice.id);

            return NextResponse.json({
                success: false,
                message: 'Pago rechazado o no aprobado',
                data: {
                    orderNumber,
                    transactionId,
                    status: transactionData.transactionStatus
                }
            });
        }

    } catch (error) {
        console.error('❌ Error en webhook PayPhone:', error);
        return NextResponse.json({
            success: false,
            error: 'Error procesando webhook',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}