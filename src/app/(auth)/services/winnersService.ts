import { supabase } from '../../lib/supabase'

export interface Winner {
    id: string
    raffle_id: string
    participant_id: string
    number: string
    is_winner: boolean
    purchased_at: string
    payment_status: string
    // Datos del participante
    participant_name: string
    participant_email: string
    // Datos de la factura (información adicional del participante)
    full_name?: string
    phone?: string
    country?: string
    province?: string
    city?: string
    address?: string
    // Datos de la rifa
    raffle_title: string
    raffle_draw_date: string
}

export interface WinnerWithDetails extends Winner {
    invoice_details?: {
        id: string
        order_number: string
        full_name: string
        phone: string
        country: string
        province: string
        city: string
        address: string
        payment_method: string
        amount: number
        total_price: number
        status: string
        created_at: string
    }
}

export interface CreateWinnerData {
    raffle_id: string
    number: string
}

// Obtener todos los ganadores con información detallada
export async function getWinnersWithDetails(): Promise<WinnerWithDetails[]> {
    const { data, error } = await supabase
        .from('raffle_entries')
        .select(`
            id,
            raffle_id,
            participant_id,
            number,
            is_winner,
            purchased_at,
            payment_status,
            participants(
                id, 
                email, 
                name,
                invoices(
                    id,
                    order_number,
                    full_name,
                    email,
                    phone,
                    country,
                    province,
                    city,
                    address,
                    payment_method,
                    amount,
                    total_price,
                    status,
                    created_at
                )
            ),
            raffles(id, title, draw_date)
        `)
        .eq('is_winner', true)
        .order('purchased_at', { ascending: false })

    if (error) throw error

    return (
        data?.map((entry: any) => {
            const participant = entry.participants
            const raffle = entry.raffles
            const invoice = participant?.invoices?.[0] // Tomar la primera factura del participante

            return {
                id: entry.id,
                raffle_id: entry.raffle_id,
                participant_id: entry.participant_id,
                number: entry.number,
                is_winner: entry.is_winner,
                purchased_at: entry.purchased_at,
                payment_status: entry.payment_status,
                participant_name: participant?.name || '',
                participant_email: participant?.email || '',
                full_name: invoice?.full_name,
                phone: invoice?.phone,
                country: invoice?.country,
                province: invoice?.province,
                city: invoice?.city,
                address: invoice?.address,
                raffle_title: raffle?.title || '',
                raffle_draw_date: raffle?.draw_date || '',
                invoice_details: invoice ? {
                    id: invoice.id,
                    order_number: invoice.order_number,
                    full_name: invoice.full_name,
                    phone: invoice.phone,
                    country: invoice.country,
                    province: invoice.province,
                    city: invoice.city,
                    address: invoice.address,
                    payment_method: invoice.payment_method,
                    amount: invoice.amount,
                    total_price: parseFloat(invoice.total_price) || 0,
                    status: invoice.status,
                    created_at: invoice.created_at
                } : undefined
            }
        }) ?? []
    )
}

// Obtener ganadores de una rifa específica
export async function getWinnersByRaffle(raffleId: string): Promise<WinnerWithDetails[]> {
    const { data, error } = await supabase
        .from('raffle_entries')
        .select(`
            id,
            raffle_id,
            participant_id,
            number,
            is_winner,
            purchased_at,
            payment_status,
            participants(
                id, 
                email, 
                name,
                invoices(
                    id,
                    order_number,
                    full_name,
                    email,
                    phone,
                    country,
                    province,
                    city,
                    address,
                    payment_method,
                    amount,
                    total_price,
                    status,
                    created_at
                )
            ),
            raffles(id, title, draw_date)
        `)
        .eq('raffle_id', raffleId)
        .eq('is_winner', true)
        .order('purchased_at', { ascending: false })

    if (error) throw error

    return (
        data?.map((entry: any) => {
            const participant = entry.participants
            const raffle = entry.raffles
            const invoice = participant?.invoices?.[0]

            return {
                id: entry.id,
                raffle_id: entry.raffle_id,
                participant_id: entry.participant_id,
                number: entry.number,
                is_winner: entry.is_winner,
                purchased_at: entry.purchased_at,
                payment_status: entry.payment_status,
                participant_name: participant?.name || '',
                participant_email: participant?.email || '',
                full_name: invoice?.full_name,
                phone: invoice?.phone,
                country: invoice?.country,
                province: invoice?.province,
                city: invoice?.city,
                address: invoice?.address,
                raffle_title: raffle?.title || '',
                raffle_draw_date: raffle?.draw_date || '',
                invoice_details: invoice ? {
                    id: invoice.id,
                    order_number: invoice.order_number,
                    full_name: invoice.full_name,
                    phone: invoice.phone,
                    country: invoice.country,
                    province: invoice.province,
                    city: invoice.city,
                    address: invoice.address,
                    payment_method: invoice.payment_method,
                    amount: invoice.amount,
                    total_price: parseFloat(invoice.total_price) || 0,
                    status: invoice.status,
                    created_at: invoice.created_at
                } : undefined
            }
        }) ?? []
    )
}

// Marcar un número como ganador
export async function setWinner(entryId: string): Promise<void> {
    const { error } = await supabase
        .from('raffle_entries')
        .update({ is_winner: true })
        .eq('id', entryId)

    if (error) throw error
}

// Remover ganador
export async function removeWinner(entryId: string): Promise<void> {
    const { error } = await supabase
        .from('raffle_entries')
        .update({ is_winner: false })
        .eq('id', entryId)

    if (error) throw error
}

// Obtener todas las entradas de una rifa para la ruleta (con paginación automática)
export async function getRaffleEntries(raffleId: string) {
    const allEntries: any[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
        const { data, error } = await supabase
            .from('raffle_entries')
            .select(`
                id,
                number,
                participant_id,
                is_winner,
                purchased_at,
                participants(
                    name, 
                    email,
                    invoices(full_name, phone, city, province)
                )
            `)
            .eq('raffle_id', raffleId)
            .eq('payment_status', 'paid')
            .order('number', { ascending: true })
            .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
            allEntries.push(...data)

            // Si recibimos menos registros que el tamaño de página, no hay más datos
            hasMore = data.length === pageSize
            from += pageSize
        } else {
            hasMore = false
        }
    }

    console.log(`Total Raffle Entries loaded: ${allEntries.length}`)

    return allEntries.map((entry: any) => ({
        id: entry.id,
        number: entry.number,
        participant_id: entry.participant_id,
        is_winner: entry.is_winner,
        purchased_at: entry.purchased_at, // ← AGREGAR ESTA LÍNEA
        participant_name: entry.participants?.name || '',
        participant_email: entry.participants?.email || '',
        full_name: entry.participants?.invoices?.[0]?.full_name || '',
        phone: entry.participants?.invoices?.[0]?.phone || '',
        city: entry.participants?.invoices?.[0]?.city || '',
        province: entry.participants?.invoices?.[0]?.province || ''
    }))
}

// Obtener lista de rifas disponibles
export async function getRaffles() {
    const { data, error } = await supabase
        .from('raffles')
        .select('id, title, draw_date, status')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

// Seleccionar ganador aleatorio de una rifa
export async function selectRandomWinner(raffleId: string): Promise<any> {
    // Primero obtenemos todas las entradas pagadas de la rifa que no sean ganadoras
    const entries = await getRaffleEntries(raffleId)
    const availableEntries = entries.filter(entry => !entry.is_winner)

    if (availableEntries.length === 0) {
        throw new Error('No hay números disponibles para seleccionar un ganador')
    }

    // Seleccionar una entrada aleatoria
    const randomIndex = Math.floor(Math.random() * availableEntries.length)
    const selectedEntry = availableEntries[randomIndex]

    // Marcar como ganador
    await setWinner(selectedEntry.id)

    return selectedEntry
}