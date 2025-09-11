// src/services/participantsService.ts - MIGRACIÓN MULTI-TENANT
import { supabase } from '../lib/supabaseTenantClient';

export interface Participant {
    id: string
    email: string
    name: string
    created_at: string
    // Campos calculados
    total_numbers?: number
    total_invoices?: number
    pending_invoices?: number
    paid_invoices?: number
    total_amount_spent?: number
}

export interface ParticipantWithStats extends Participant {
    total_numbers: number
    total_invoices: number
    pending_invoices: number
    paid_invoices: number
    total_amount_spent: number
}

export interface CreateParticipantData {
    email: string
    name: string
}

// CAMBIO: Actualizar interface para coincidir con pattern de facturas
export interface UpdateParticipantInput {
    id: string
    email?: string
    name?: string
}

/**
 * Obtener todos los participantes con estadísticas y contexto de tenant
 * @returns Lista de participantes con estadísticas filtrados por tenant
 */
export async function getParticipantsWithStats(): Promise<ParticipantWithStats[]> {
    try {
        console.log('👥 [PARTICIPANTS-SERVICE] Getting participants with stats...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [PARTICIPANTS-SERVICE] Current context:', { tenantId, isAdmin });

        const { data, error } = await supabase
            .from('participants')
            .select(`
                id,
                email,
                name,
                created_at,
                raffle_entries(id, number),
                invoices(id, status, total_price, amount)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error fetching participants:', error);
            throw new Error(error.message);
        }

        const result = data?.map((participant: any) => {
            const entries = participant.raffle_entries || []
            const invoices = participant.invoices || []

            const pendingInvoices = invoices.filter((inv: any) => inv.status === 'pending')
            const paidInvoices = invoices.filter((inv: any) => inv.status === 'completed')

            return {
                id: participant.id,
                email: participant.email,
                name: participant.name,
                created_at: participant.created_at,
                total_numbers: entries.length,
                total_invoices: invoices.length,
                pending_invoices: pendingInvoices.length,
                paid_invoices: paidInvoices.length,
                total_amount_spent: paidInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_price) || 0), 0)
            }
        }) ?? []

        console.log('✅ [PARTICIPANTS-SERVICE] Participants with stats loaded:', result.length);
        return result;
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in getParticipantsWithStats:', error);
        throw error;
    }
}

/**
 * Obtener participantes básicos (sin estadísticas) con contexto de tenant
 * @returns Lista de participantes básicos filtrados por tenant
 */
export async function getParticipants(): Promise<Participant[]> {
    try {
        console.log('👥 [PARTICIPANTS-SERVICE] Getting basic participants...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [PARTICIPANTS-SERVICE] Current context:', { tenantId, isAdmin });

        const { data, error } = await supabase
            .from('participants')
            .select('id, email, name, created_at')
            .order('name', { ascending: true });

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error fetching basic participants:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Basic participants loaded:', data?.length || 0);
        return data || []
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in getParticipants:', error);
        throw error;
    }
}

/**
 * Obtener un participante por ID con estadísticas detalladas y contexto de tenant
 * @param id ID del participante
 * @returns Participante con estadísticas o null si no existe
 */
export async function getParticipantById(id: string): Promise<ParticipantWithStats | null> {
    try {
        console.log('👥 [PARTICIPANTS-SERVICE] Getting participant by ID:', id);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [PARTICIPANTS-SERVICE] Current context:', { tenantId, isAdmin });

        const { data, error } = await supabase
            .from('participants')
            .select(`
                id,
                email,
                name,
                created_at,
                raffle_entries(id, number, purchased_at, payment_status),
                invoices(id, order_number, status, total_price, amount, created_at)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            console.error('❌ [PARTICIPANTS-SERVICE] Error fetching participant:', error);
            throw new Error(error.message);
        }

        const entries = data.raffle_entries || []
        const invoices = data.invoices || []

        const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING')
        const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID')

        const result = {
            id: data.id,
            email: data.email,
            name: data.name,
            created_at: data.created_at,
            total_numbers: entries.length,
            total_invoices: invoices.length,
            pending_invoices: pendingInvoices.length,
            paid_invoices: paidInvoices.length,
            total_amount_spent: paidInvoices.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_price) || 0), 0)
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant found:', result.email);
        return result;
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in getParticipantById:', error);
        throw error;
    }
}

/**
 * Crear un nuevo participante con contexto de tenant
 * @param data Datos del participante a crear
 * @returns El participante creado
 */
export async function createParticipant(data: CreateParticipantData): Promise<Participant> {
    try {
        console.log('📝 [PARTICIPANTS-SERVICE] Creating participant for tenant:', supabase.getTenantContext().tenantId);

        const { data: newParticipant, error } = await supabase
            .from('participants')
            .insert([data])
            .select('id, email, name, created_at')
            .single();

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error creating participant:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant created:', newParticipant.id);
        return newParticipant;
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in createParticipant:', error);
        throw error;
    }
}

/**
 * Actualizar un participante existente con contexto de tenant
 * CAMBIO: Usar pattern consistente con facturas
 * @param input Datos de actualización incluyendo ID
 * @returns El participante actualizado
 */
export async function updateParticipant(input: UpdateParticipantInput): Promise<Participant> {
    try {
        console.log('✏️ [PARTICIPANTS-SERVICE] Updating participant:', input.id);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [PARTICIPANTS-SERVICE] Current context during update:', { tenantId, isAdmin });

        // Convertir input a formato de base de datos
        const updateData: any = {};
        if (input.email !== undefined) updateData.email = input.email;
        if (input.name !== undefined) updateData.name = input.name;

        const { data, error } = await supabase
            .from('participants')
            .update(updateData)
            .eq('id', input.id)
            .select('id, email, name, created_at')
            .single();

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error updating participant:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant updated:', data.id);
        return data;
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in updateParticipant:', error);
        throw error;
    }
}

/**
 * Eliminar un participante con contexto de tenant
 * @param id ID del participante a eliminar
 * @returns true si se eliminó correctamente
 */
export async function deleteParticipant(id: string): Promise<boolean> {
    try {
        console.log('🗑️ [PARTICIPANTS-SERVICE] Deleting participant:', id);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [PARTICIPANTS-SERVICE] Current context during deletion:', { tenantId, isAdmin });

        const { error } = await supabase
            .from('participants')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error deleting participant:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in deleteParticipant:', error);
        throw error;
    }
}

/**
 * Obtener números de rifa de un participante con contexto de tenant
 * @param participantId ID del participante
 * @returns Lista de números del participante
 */
export async function getParticipantNumbers(participantId: string) {
    try {
        console.log('🎫 [PARTICIPANTS-SERVICE] Getting participant numbers:', participantId);

        const { data, error } = await supabase
            .from('raffle_entries')
            .select(`
                id,
                number,
                is_winner,
                purchased_at,
                payment_status,
                raffles(title, draw_date)
            `)
            .eq('participant_id', participantId)
            .order('purchased_at', { ascending: false });

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error fetching participant numbers:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant numbers loaded:', data?.length || 0);
        return data || []
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in getParticipantNumbers:', error);
        throw error;
    }
}

/**
 * Obtener facturas de un participante con contexto de tenant
 * @param participantId ID del participante
 * @returns Lista de facturas del participante
 */
export async function getParticipantInvoices(participantId: string) {
    try {
        console.log('🧾 [PARTICIPANTS-SERVICE] Getting participant invoices:', participantId);

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                id,
                order_number,
                status,
                payment_method,
                amount,
                total_price,
                created_at
            `)
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ [PARTICIPANTS-SERVICE] Error fetching participant invoices:', error);
            throw new Error(error.message);
        }

        console.log('✅ [PARTICIPANTS-SERVICE] Participant invoices loaded:', data?.length || 0);
        return data || []
    } catch (error) {
        console.error('❌ [PARTICIPANTS-SERVICE] Error in getParticipantInvoices:', error);
        throw error;
    }
}