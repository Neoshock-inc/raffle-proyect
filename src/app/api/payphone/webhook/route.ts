// src/app/api/payphone/webhook/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

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
        console.log('🔑 Token de PayPhone obtenido');

        // 4. Verificar el estado de la transacción con PayPhone
        console.log(`🔍 Consultando transacción en PayPhone: ${transactionId}`);
        const response = await axios.get(
            `https://pay.payphonetodoesposible.com/api/Sale/${transactionId}`,
            {
                headers: {
                    Authorization: `Bearer ${payphoneToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
                validateStatus: () => true,
            }
        );

        console.log('📥 Respuesta de PayPhone:', response.status, response.data);

        if (response.status !== 200) {
            return NextResponse.json(
                { success: false, error: 'Error al consultar transacción', details: response.data },
                { status: response.status }
            );
        }

        const transactionData = response.data;
        console.log('📊 Estado de transacción PayPhone:', {
            transactionId: transactionData.transactionId,
            statusCode: transactionData.statusCode,
            transactionStatus: transactionData.transactionStatus,
            amount: transactionData.amount
        });

        // 5. Verificar si el pago fue aprobado (statusCode: 3 = Approved)
        if (transactionData.statusCode === 3 && transactionData.transactionStatus === 'Approved') {
            console.log('✅ Pago aprobado, procesando...');

            // 6. Actualizar la factura a COMPLETED
            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    status: 'completed',
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

            // 7. Generar números de rifa (lógica integrada)
            try {
                console.log('🎲 Generando números de rifa...');

                // 7.1. Obtener rifa activa del tenant
                const { data: raffle, error: raffleError } = await supabase
                    .from('raffles')
                    .select('id, total_numbers')
                    .eq('is_active', true)
                    .eq('tenant_id', invoice.tenant_id)
                    .maybeSingle();

                if (raffleError || !raffle) {
                    console.error('❌ No hay rifa activa para el tenant:', invoice.tenant_id);
                    return NextResponse.json({
                        success: false,
                        error: 'No hay una rifa activa para este tenant'
                    }, { status: 404 });
                }

                const raffleId = raffle.id;
                const maxNumber = raffle.total_numbers || 99999;
                console.log(`📋 Rifa activa encontrada: ID ${raffleId}, máximo ${maxNumber} números`);

                // 7.2. Buscar o crear participante ligado al tenant
                const { data: existingParticipant } = await supabase
                    .from('participants')
                    .select('id')
                    .eq('email', invoice.email)
                    .eq('tenant_id', invoice.tenant_id)
                    .maybeSingle();

                let participantId = existingParticipant?.id;

                if (!participantId) {
                    console.log('👤 Creando nuevo participante...');
                    const { data: newParticipant, error: participantError } = await supabase
                        .from('participants')
                        .insert({
                            name: invoice.full_name,
                            email: invoice.email,
                            tenant_id: invoice.tenant_id
                        })
                        .select()
                        .single();

                    if (participantError || !newParticipant) {
                        console.error('❌ Error al crear participante:', participantError);
                        return NextResponse.json({
                            success: false,
                            error: 'Error al crear participante'
                        }, { status: 500 });
                    }

                    participantId = newParticipant.id;
                    console.log('✅ Participante creado:', participantId);
                } else {
                    console.log('✅ Participante existente:', participantId);
                }

                // 7.3. Verificar disponibilidad de números
                const { data: usedEntries, error: usedError } = await supabase
                    .from('raffle_entries')
                    .select('number')
                    .eq('raffle_id', raffleId);

                if (usedError) {
                    console.error('❌ Error al obtener números usados:', usedError);
                    return NextResponse.json({
                        success: false,
                        error: 'Error al verificar números disponibles'
                    }, { status: 500 });
                }

                const usedCount = usedEntries?.length || 0;
                const requestedAmount = parseInt(invoice.amount.toString());

                console.log(`📊 Disponibilidad: ${maxNumber - usedCount} números de ${maxNumber}`);

                if (isNaN(requestedAmount) || requestedAmount <= 0) {
                    return NextResponse.json({
                        success: false,
                        error: 'Cantidad inválida en la factura'
                    }, { status: 400 });
                }

                if (maxNumber - usedCount < requestedAmount) {
                    return NextResponse.json({
                        success: false,
                        error: `No hay suficientes números disponibles. Solicitados: ${requestedAmount}, Disponibles: ${maxNumber - usedCount}`
                    }, { status: 400 });
                }

                // 7.4. Generar números usando procedimiento almacenado
                console.log(`🎯 Generando ${requestedAmount} números para participante ${participantId}...`);

                const { data: generated, error: rpcError } = await supabase.rpc(
                    'generate_raffle_numbers',
                    {
                        in_participant_id: participantId,
                        in_raffle_id: raffleId,
                        in_amount: requestedAmount
                    }
                );

                if (rpcError || !generated || generated.length !== requestedAmount) {
                    console.error('❌ Error al generar números:', rpcError);
                    return NextResponse.json({
                        success: false,
                        error: 'Error al generar números',
                        details: rpcError?.message
                    }, { status: 500 });
                }

                console.log('✅ Números de rifa generados exitosamente:', generated);

                // 8. Respuesta exitosa
                return NextResponse.json({
                    success: true,
                    message: 'Pago procesado correctamente',
                    data: {
                        orderNumber,
                        transactionId,
                        status: 'completed',
                        participantId,
                        raffleId,
                        numbersGenerated: generated.length
                    }
                });

            } catch (raffleError) {
                console.error('❌ Error en generación de números:', raffleError);
                return NextResponse.json({
                    success: false,
                    error: 'Error al generar números de rifa',
                    details: raffleError instanceof Error ? raffleError.message : 'Error desconocido'
                }, { status: 500 });
            }

        } else {
            // Pago no aprobado o rechazado
            console.log('❌ Pago no aprobado:', transactionData.transactionStatus);

            // Actualizar factura a FAILED
            await supabase
                .from('invoices')
                .update({
                    status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoice.id);

            return NextResponse.json({
                success: false,
                message: 'Pago rechazado o no aprobado',
                data: {
                    orderNumber,
                    transactionId,
                    status: transactionData.transactionStatus,
                    statusCode: transactionData.statusCode
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