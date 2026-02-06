import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiSuccess, apiError } from '../../_shared/responses';
import { withErrorHandler } from '../../_shared/withErrorHandler';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

async function handler(req: NextRequest) {
    const { name, email, amount, stripeSessionId } = await req.json();

    // 1. Evitar procesar duplicado
    const { data: existingEntries, error: checkError } = await supabase
        .from('raffle_entries')
        .select('id')
        .eq('stripe_session_id', stripeSessionId)
        .limit(1);

    if (checkError) {
        console.error('Error al verificar sesión existente:', checkError);
        return apiError('Error interno al validar sesión', 500);
    }

    if (existingEntries?.length > 0) {
        return apiSuccess({ success: true, message: 'Sesión ya procesada previamente' });
    }

    // 2. Obtener rifa activa
    const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, total_numbers')
        .eq('is_active', true)
        .single();

    if (raffleError || !raffle) {
        return apiError('No hay una rifa activa disponible', 400);
    }

    const raffleId = raffle.id;
    const maxNumber = raffle.total_numbers || 99999;

    // 3. Verificar o crear participante
    const { data: existingParticipant } = await supabase
        .from('participants')
        .select('id')
        .eq('email', email)
        .single();

    let participantId = existingParticipant?.id;

    if (!participantId) {
        const { data: newParticipant, error: participantError } = await supabase
            .from('participants')
            .insert({ name, email })
            .select()
            .single();

        if (participantError || !newParticipant) {
            return apiError('Error al crear participante', 500);
        }

        participantId = newParticipant.id;
    }

    // 4. Verificar disponibilidad de números
    const { data: usedEntries, error: usedError } = await supabase
        .from('raffle_entries')
        .select('number')
        .eq('raffle_id', raffleId);

    if (usedError) {
        console.error('Error al obtener números usados:', usedError);
        return apiError('Error al verificar números disponibles', 500);
    }

    const usedCount = usedEntries?.length || 0;
    const requestedAmount = parseInt(amount.toString());

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return apiError('Cantidad inválida', 400);
    }

    if (maxNumber - usedCount < requestedAmount) {
        return apiError(
            `No hay suficientes números disponibles. Solicitados: ${requestedAmount}, Disponibles: ${maxNumber - usedCount}`,
            400
        );
    }

    // 5. Llamar procedimiento almacenado
    const { data: generated, error: rpcError } = await supabase.rpc('generate_raffle_numbers', {
        in_participant_id: participantId,
        in_raffle_id: raffleId,
        in_amount: requestedAmount
    });

    if (rpcError || !generated || generated.length !== requestedAmount) {
        console.error('Error al generar números:', rpcError);
        return apiError('Error al generar números', 500, { details: rpcError?.message });
    }

    // 6. Actualizar stripe_session_id
    const { error: updateError } = await supabase
        .from('raffle_entries')
        .update({ stripe_session_id: stripeSessionId })
        .eq('participant_id', participantId)
        .eq('raffle_id', raffleId)
        .in('number', generated.map((n: any) => n.generated_number));

    if (updateError) {
        console.warn('No se pudo actualizar stripe_session_id:', updateError);
    }

    return apiSuccess({
        success: true,
        assigned: generated.map((n: any) => n.generated_number),
        total_assigned: generated.length,
        raffle_id: raffleId
    });
}

export const POST = withErrorHandler(handler, 'raffle/register');
