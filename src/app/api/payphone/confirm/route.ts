// 📁 app/api/payphone/confirm/route.ts (CON AXIOS)
import { NextRequest, NextResponse } from 'next/server';
import { generateRaffleNumbers } from '@/services/invoiceService';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, clientTxId } = body;

        console.log('🔍 Confirmando transacción PayPhone:', { id, clientTxId });

        if (!id || !clientTxId) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos: id y clientTxId' },
                { status: 400 }
            );
        }

        const orderNumber = clientTxId;

        console.log('📝 Buscando factura con orderNumber:', orderNumber);

        // Buscar la factura
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (invoiceError || !invoice) {
            console.error('❌ Factura no encontrada:', {
                orderNumber,
                error: invoiceError
            });
            return NextResponse.json(
                { error: 'Factura no encontrada', orderNumber },
                { status: 404 }
            );
        }

        console.log('✅ Factura encontrada:', {
            id: invoice.id,
            order_number: invoice.order_number,
            status: invoice.status,
            tenant_id: invoice.tenant_id
        });

        // Obtener configuración de PayPhone del tenant
        const { data: paymentConfig, error: configError } = await supabase
            .from('payment_configs')
            .select('*')
            .eq('tenant_id', invoice.tenant_id)
            .eq('provider', 'payphone')
            .single();

        if (configError || !paymentConfig) {
            console.error('❌ Configuración de PayPhone no encontrada:', {
                tenant_id: invoice.tenant_id,
                error: configError
            });
            return NextResponse.json(
                { error: 'Configuración de PayPhone no encontrada' },
                { status: 404 }
            );
        }

        console.log('✅ Configuración de PayPhone obtenida');

        // Preparar payload para PayPhone
        const confirmPayload = {
            id: parseInt(id),
            clientTxId: clientTxId
        };

        console.log('📤 Enviando confirmación a PayPhone:', confirmPayload);

        // 🔥 USAR AXIOS para llamar a PayPhone
        let confirmationData;
        try {
            const payphoneResponse = await axios.post(
                'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
                confirmPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${paymentConfig.secret_key}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 segundos de timeout
                }
            );

            confirmationData = payphoneResponse.data;
            console.log('✅ Respuesta de confirmación PayPhone:', confirmationData);

        } catch (axiosError: any) {
            console.error('❌ Error en petición a PayPhone:', {
                message: axiosError.message,
                response: axiosError.response?.data,
                status: axiosError.response?.status
            });

            // Si PayPhone devuelve un error específico
            if (axiosError.response?.data) {
                return NextResponse.json(
                    {
                        error: 'Error de PayPhone',
                        details: axiosError.response.data,
                        status: axiosError.response.status
                    },
                    { status: 400 }
                );
            }

            throw new Error(`Error de PayPhone: ${axiosError.message}`);
        }

        // Verificar el estado de la transacción
        console.log('🔍 Verificando statusCode:', confirmationData.statusCode);

        if (confirmationData.statusCode === 3) {
            // ✅ Transacción aprobada
            console.log('💰 Transacción aprobada, actualizando factura y generando números...');

            // Actualizar factura a COMPLETED
            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    status: 'completed'
                })
                .eq('id', invoice.id);

            if (updateError) {
                console.error('❌ Error actualizando factura:', updateError);
                throw new Error('Error actualizando el estado de la factura');
            }

            console.log('✅ Factura actualizada a COMPLETED');

            // Generar números de rifa
            console.log('🎲 Generando números de rifa...');
            const raffleResult = await generateRaffleNumbers({
                name: invoice.full_name,
                email: invoice.email,
                amount: invoice.amount,
                orderNumber: invoice.order_number,
                tenantId: invoice.tenant_id
            });

            if (!raffleResult.success) {
                console.error('❌ Error al generar números de rifa:', raffleResult.error);
                throw new Error(`Error al asignar números: ${raffleResult.error}`);
            }

            console.log('✅ Números de rifa generados:', {
                participantId: raffleResult.participantId,
                cantidad: invoice.amount
            });

            // Actualizar factura con el participant_id
            await supabase
                .from('invoices')
                .update({ participant_id: raffleResult.participantId })
                .eq('id', invoice.id);

            console.log('✅ Participant ID actualizado en factura');

            return NextResponse.json({
                success: true,
                status: 'approved',
                transactionId: confirmationData.transactionId,
                authorizationCode: confirmationData.authorizationCode,
                participantId: raffleResult.participantId,
                orderNumber: invoice.order_number,
                data: confirmationData
            });

        } else if (confirmationData.statusCode === 2) {
            // ❌ Transacción cancelada
            console.log('❌ Transacción cancelada por el usuario');

            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    status: 'cancelled',
                    payment_details: confirmationData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', invoice.id);

            if (updateError) {
                console.error('❌ Error actualizando factura cancelada:', updateError);
            }

            return NextResponse.json({
                success: false,
                status: 'cancelled',
                message: 'Transacción cancelada por el usuario',
                data: confirmationData
            });

        } else {
            // ⚠️ Estado desconocido
            console.warn('⚠️ Estado de transacción desconocido:', {
                statusCode: confirmationData.statusCode,
                data: confirmationData
            });

            return NextResponse.json({
                success: false,
                status: 'unknown',
                message: `Estado de transacción desconocido: ${confirmationData.statusCode}`,
                data: confirmationData
            });
        }

    } catch (error: any) {
        console.error('❌ Error en confirmación de PayPhone:', {
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            {
                error: 'Error procesando la confirmación de PayPhone',
                details: error.message
            },
            { status: 500 }
        );
    }
}