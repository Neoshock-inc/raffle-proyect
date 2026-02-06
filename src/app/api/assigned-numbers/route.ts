import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiSuccess, apiError } from '../_shared/responses';
import { withErrorHandler } from '../_shared/withErrorHandler';

async function handler(req: NextRequest) {
    const participantId = req.nextUrl.searchParams.get('participantId');

    if (!participantId) {
        return apiError('participantId requerido', 400);
    }

    const { data: entries, error: entriesError } = await supabase
        .from('raffle_entries')
        .select('number, raffle_id')
        .eq('participant_id', participantId);

    if (entriesError) {
        return apiError('Error al buscar entradas', 500);
    }

    const numbers = entries.map(entry => entry.number);

    const { data: blessed, error: blessedError } = await supabase
        .from('blessed_numbers')
        .select('number, is_minor_prize')
        .eq('assigned_to', participantId);

    if (blessedError) {
        return apiError('Error al buscar números ganadores', 500);
    }

    const blessedMap = new Map<string, { is_minor_prize: boolean }>();
    blessed.forEach(b => blessedMap.set(b.number, { is_minor_prize: b.is_minor_prize }));

    const result = numbers.map(number => ({
        number,
        is_blessed: blessedMap.has(number),
        is_minor_prize: blessedMap.get(number)?.is_minor_prize ?? false
    }));

    return apiSuccess({ numbers: result });
}

export const GET = withErrorHandler(handler, 'assigned-numbers');
