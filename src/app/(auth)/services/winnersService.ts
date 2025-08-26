import { supabase } from "../lib/supabaseTenantClient"

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

// NUEVA FUNCIÓN: Establecer contexto de tenant
export const setTenantContext = (tenantId: string | null, isAdmin: boolean = false) => {
    supabase.setTenantContext(tenantId, isAdmin);
    console.log('🔧 [WINNERS-SERVICE] Tenant context set:', { tenantId, isAdmin });
};

// Obtener todos los ganadores con información detallada
export async function getWinnersWithDetails(): Promise<WinnerWithDetails[]> {
    try {
        console.log('🏆 [WINNERS-SERVICE] Getting winners with details...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 [WINNERS-SERVICE] Current context:', { tenantId, isAdmin });

        // CORRECCIÓN: Construir la query manualmente para filtrar por tenant a través de raffles
        let query = supabase.directQuery('raffle_entries')
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
                raffles!inner(
                    id, 
                    title, 
                    draw_date,
                    tenant_id
                )
            `)
            .eq('is_winner', true)
            .order('purchased_at', { ascending: false })

        // Aplicar filtro de tenant si es necesario
        if (!isAdmin || (isAdmin && tenantId)) {
            if (tenantId) {
                console.log('🎯 [WINNERS-SERVICE] Applying tenant filter:', tenantId);
                query = query.eq('raffles.tenant_id', tenantId)
            }
        }

        const { data, error } = await query

        if (error) {
            console.error('❌ [WINNERS-SERVICE] Error fetching winners:', error);
            throw error;
        }

        console.log('✅ [WINNERS-SERVICE] Winners loaded:', data?.length || 0);

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
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in getWinnersWithDetails:', error);
        throw error;
    }
}

// Obtener ganadores de una rifa específica
export async function getWinnersByRaffle(raffleId: string): Promise<WinnerWithDetails[]> {
    try {
        console.log('🏆 [WINNERS-SERVICE] Getting winners by raffle:', raffleId);
        const { tenantId, isAdmin } = supabase.getTenantContext();

        // CORRECCIÓN: Usar directQuery y aplicar filtros manualmente
        let query = supabase.directQuery('raffle_entries')
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
                raffles!inner(
                    id, 
                    title, 
                    draw_date,
                    tenant_id
                )
            `)
            .eq('raffle_id', raffleId)
            .eq('is_winner', true)
            .order('purchased_at', { ascending: false })

        // Aplicar filtro de tenant si es necesario
        if (!isAdmin || (isAdmin && tenantId)) {
            if (tenantId) {
                console.log('🎯 [WINNERS-SERVICE] Applying tenant filter:', tenantId);
                query = query.eq('raffles.tenant_id', tenantId)
            }
        }

        const { data, error } = await query

        if (error) {
            console.error('❌ [WINNERS-SERVICE] Error fetching winners by raffle:', error);
            throw error;
        }

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
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in getWinnersByRaffle:', error);
        throw error;
    }
}

// Marcar un número como ganador
export async function setWinner(entryId: string): Promise<void> {
    try {
        console.log('🏆 [WINNERS-SERVICE] Setting winner:', entryId);
        const { tenantId, isAdmin } = supabase.getTenantContext();

        // CORRECCIÓN: Verificar que el entry pertenece al tenant actual antes de actualizar
        if (!isAdmin || (isAdmin && tenantId)) {
            // Primero verificar que el entry pertenece al tenant
            const { data: entry, error: checkError } = await supabase.directQuery('raffle_entries')
                .select('id, raffles!inner(tenant_id)')
                .eq('id', entryId)
                .eq('raffles.tenant_id', tenantId)
                .single()

            if (checkError || !entry) {
                throw new Error('No tienes permisos para modificar este registro');
            }
        }

        const { error } = await supabase.directQuery('raffle_entries')
            .update({ is_winner: true })
            .eq('id', entryId)

        if (error) {
            console.error('❌ [WINNERS-SERVICE] Error setting winner:', error);
            throw error;
        }

        console.log('✅ [WINNERS-SERVICE] Winner set successfully');
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in setWinner:', error);
        throw error;
    }
}

// Remover ganador
export async function removeWinner(entryId: string): Promise<void> {
    try {
        console.log('🏆 [WINNERS-SERVICE] Removing winner:', entryId);
        const { tenantId, isAdmin } = supabase.getTenantContext();

        // CORRECCIÓN: Verificar que el entry pertenece al tenant actual antes de actualizar
        if (!isAdmin || (isAdmin && tenantId)) {
            // Primero verificar que el entry pertenece al tenant
            const { data: entry, error: checkError } = await supabase.directQuery('raffle_entries')
                .select('id, raffles!inner(tenant_id)')
                .eq('id', entryId)
                .eq('raffles.tenant_id', tenantId)
                .single()

            if (checkError || !entry) {
                throw new Error('No tienes permisos para modificar este registro');
            }
        }

        const { error } = await supabase.directQuery('raffle_entries')
            .update({ is_winner: false })
            .eq('id', entryId)

        if (error) {
            console.error('❌ [WINNERS-SERVICE] Error removing winner:', error);
            throw error;
        }

        console.log('✅ [WINNERS-SERVICE] Winner removed successfully');
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in removeWinner:', error);
        throw error;
    }
}

// Obtener hasta 10.000 entradas de una rifa para la ruleta (con paginación automática)
export async function getRaffleEntries(raffleId: string) {
    try {
        console.log('🎫 [WINNERS-SERVICE] Getting raffle entries for raffle:', raffleId);
        const { tenantId, isAdmin } = supabase.getTenantContext();

        const allEntries: any[] = []
        let from = 0
        const pageSize = 2000 // más grande para menos vueltas
        let hasMore = true

        while (hasMore) {
            let query = supabase.directQuery('raffle_entries')
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
                    ),
                    raffles!inner(tenant_id)
                `)
                .eq('raffle_id', raffleId)
                .eq('payment_status', 'paid')
                .order('number', { ascending: true })
                .range(from, from + pageSize - 1)

            // Aplicar filtro de tenant si es necesario
            if (!isAdmin || (isAdmin && tenantId)) {
                if (tenantId) {
                    console.log('🎯 [WINNERS-SERVICE] Applying tenant filter for entries:', tenantId);
                    query = query.eq('raffles.tenant_id', tenantId)
                }
            }

            const { data, error } = await query

            if (error) {
                console.error('❌ [WINNERS-SERVICE] Error fetching raffle entries:', error);
                throw error;
            }

            if (data && data.length > 0) {
                allEntries.push(...data)

                // Si llegamos a 10k, dejamos de pedir más
                if (allEntries.length >= 10000) {
                    console.warn('Se alcanzó el límite de 10,000 entradas (se truncó el resultado)')
                    break
                }

                hasMore = data.length === pageSize
                from += pageSize
            } else {
                hasMore = false
            }
        }

        console.log(`✅ [WINNERS-SERVICE] Total Raffle Entries loaded: ${allEntries.length}`)

        // Si hay más de 10k, solo nos quedamos con los primeros 10k
        const trimmed = allEntries.slice(0, 10000)

        return trimmed.map((entry: any) => ({
            id: entry.id,
            number: entry.number,
            participant_id: entry.participant_id,
            is_winner: entry.is_winner,
            purchased_at: entry.purchased_at,
            participant_name: entry.participants?.name || '',
            participant_email: entry.participants?.email || '',
            full_name: entry.participants?.invoices?.[0]?.full_name || '',
            phone: entry.participants?.invoices?.[0]?.phone || '',
            city: entry.participants?.invoices?.[0]?.city || '',
            province: entry.participants?.invoices?.[0]?.province || ''
        }))
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in getRaffleEntries:', error);
        throw error;
    }
}

// Obtener lista de rifas disponibles
export async function getRaffles() {
    try {
        console.log('🏆 [WINNERS-SERVICE] Getting raffles...');

        // Las rifas SÍ tienen tenant_id directo, así que usamos el método normal
        const { data, error } = await supabase
            .from('raffles')
            .select('id, title, draw_date, status')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ [WINNERS-SERVICE] Error fetching raffles:', error);
            throw error;
        }

        console.log('✅ [WINNERS-SERVICE] Raffles loaded:', data?.length || 0);
        return data || []
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in getRaffles:', error);
        throw error;
    }
}

// Seleccionar ganador aleatorio de una rifa
export async function selectRandomWinner(raffleId: string): Promise<any> {
    try {
        console.log('🏆 [WINNERS-SERVICE] Selecting random winner for raffle:', raffleId);
        const { tenantId, isAdmin } = supabase.getTenantContext();

        // CORRECCIÓN: Verificar que la rifa pertenece al tenant antes de seleccionar ganador
        if (!isAdmin || (isAdmin && tenantId)) {
            const { data: raffle, error: checkError } = await supabase
                .from('raffles')
                .select('id')
                .eq('id', raffleId)
                .single()

            if (checkError || !raffle) {
                throw new Error('No tienes permisos para modificar esta rifa');
            }
        }

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

        console.log('✅ [WINNERS-SERVICE] Random winner selected:', selectedEntry.number);
        return selectedEntry
    } catch (error) {
        console.error('❌ [WINNERS-SERVICE] Error in selectRandomWinner:', error);
        throw error;
    }
}