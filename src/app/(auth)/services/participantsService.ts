import { supabase } from '../../lib/supabase'

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

export interface UpdateParticipantData {
    email?: string
    name?: string
}

// Obtener todos los participantes con estadísticas
export async function getParticipantsWithStats(): Promise<ParticipantWithStats[]> {
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
        .order('created_at', { ascending: false })

    if (error) throw error

    return (
        data?.map((participant: any) => {
            const entries = participant.raffle_entries || []
            const invoices = participant.invoices || []

            const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING')
            const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID')

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
    )
}

// Obtener participantes básicos (sin estadísticas)
export async function getParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
        .from('participants')
        .select('id, email, name, created_at')
        .order('name', { ascending: true })

    if (error) throw error
    return data || []
}

// Obtener un participante por ID con estadísticas detalladas
export async function getParticipantById(id: string): Promise<ParticipantWithStats | null> {
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
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null
        }
        throw error
    }

    const entries = data.raffle_entries || []
    const invoices = data.invoices || []

    const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING')
    const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID')

    return {
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
}

// Crear un nuevo participante
export async function createParticipant(data: CreateParticipantData): Promise<Participant> {
    const { data: newParticipant, error } = await supabase
        .from('participants')
        .insert([data])
        .select('id, email, name, created_at')
        .single()

    if (error) throw error
    return newParticipant
}

// Actualizar un participante
export async function updateParticipant(id: string, updates: UpdateParticipantData): Promise<Participant> {
    const { data, error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', id)
        .select('id, email, name, created_at')
        .single()

    if (error) throw error
    return data
}

// Eliminar un participante
export async function deleteParticipant(id: string): Promise<void> {
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Obtener números de un participante
export async function getParticipantNumbers(participantId: string) {
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
        .order('purchased_at', { ascending: false })

    if (error) throw error
    return data || []
}

// Obtener facturas de un participante
export async function getParticipantInvoices(participantId: string) {
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
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}