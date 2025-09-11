import { supabase } from "../lib/supabaseTenantClient"

export interface BlessedNumber {
  id: string
  number: string
  raffle_id: string
  assigned_to: string | null
  created_at: string
  is_minor_prize: boolean
  is_claimed: boolean
  name?: string | null
  email?: string | null
  raffle_title?: string
}

export interface Raffle {
  id: string
  title: string
  total_numbers: number
  is_active: boolean
  created_at: string
  draw_date: string
  status: string
}

export interface CreateBlessedNumberData {
  raffle_id: string  // AHORA ES OBLIGATORIO
  is_minor_prize: boolean
  quantity?: number
}

export interface UpdateBlessedNumberData {
  assigned_to?: string | null
  is_minor_prize?: boolean
  is_claimed?: boolean
}

// NUEVA FUNCIÓN: Establecer contexto de tenant
export const setTenantContext = (tenantId: string | null, isAdmin: boolean = false) => {
  supabase.setTenantContext(tenantId, isAdmin);
  console.log('🔧 [BLESSED-SERVICE] Tenant context set:', { tenantId, isAdmin });
};

// Obtener números bendecidos de una rifa específica
export async function getBlessedNumbers(raffleId?: string): Promise<BlessedNumber[]> {
  console.log('✨ [BLESSED-SERVICE] Getting blessed numbers...', { raffleId });
  const { tenantId, isAdmin } = supabase.getTenantContext();
  console.log('🔍 [BLESSED-SERVICE] Current context:', { tenantId, isAdmin });

  // Construir query base
  let query = supabase.directQuery('blessed_numbers')
    .select(`
      id,
      number,
      raffle_id,
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed,
      participants:assigned_to(name, email),
      raffles!inner(
        id,
        title,
        tenant_id
      )
    `)
    .order('number', { ascending: true })

  // Filtrar por rifa específica si se proporciona
  if (raffleId) {
    query = query.eq('raffle_id', raffleId)
  }

  // Aplicar filtro de tenant si es necesario
  if (!isAdmin || (isAdmin && tenantId)) {
    if (tenantId) {
      console.log('🎯 [BLESSED-SERVICE] Applying tenant filter:', tenantId);
      query = query.eq('raffles.tenant_id', tenantId)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error fetching blessed numbers:', error);
    throw error;
  }

  console.log('✅ [BLESSED-SERVICE] Blessed numbers loaded:', data?.length || 0);

  return (
    data?.map((item: any) => {
      const participantArray = item.participants || []
      const participant = Array.isArray(participantArray) && participantArray.length > 0 ? participantArray[0] : null
      const raffleArray = item.raffles || []
      const raffle = Array.isArray(raffleArray) && raffleArray.length > 0 ? raffleArray[0] : {}
      return {
        id: item.id,
        number: item.number,
        raffle_id: item.raffle_id,
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        is_minor_prize: item.is_minor_prize,
        is_claimed: item.is_claimed,
        name: participant?.name ?? null,
        email: participant?.email ?? null,
        raffle_title: Array.isArray(raffle) && raffle.length > 0 ? raffle[0].title : undefined
      }
    }) ?? []
  )
}

// Actualizar número bendecido
export async function updateBlessedNumber(id: string, updates: UpdateBlessedNumberData) {
  console.log('✨ [BLESSED-SERVICE] Updating blessed number:', id);
  const { tenantId, isAdmin } = supabase.getTenantContext();

  // Verificar permisos antes de actualizar
  if (!isAdmin || (isAdmin && tenantId)) {
    const { data: blessedNumber, error: checkError } = await supabase.directQuery('blessed_numbers')
      .select('id, raffles!inner(tenant_id)')
      .eq('id', id)
      .eq('raffles.tenant_id', tenantId)
      .single()

    if (checkError || !blessedNumber) {
      throw new Error('No tienes permisos para modificar este registro');
    }
  }

  const { data, error } = await supabase.directQuery('blessed_numbers')
    .update(updates)
    .eq('id', id)
    .select(`
      id,
      number,
      raffle_id,
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed,
      participants:assigned_to(name, email),
      raffles(title)
    `)
    .single()

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error updating blessed number:', error);
    throw error;
  }

  const participantArray = data.participants || []
  const participant = Array.isArray(participantArray) && participantArray.length > 0 ? participantArray[0] : null
  const raffle = data.raffles || {}
  return {
    id: data.id,
    number: data.number,
    raffle_id: data.raffle_id,
    assigned_to: data.assigned_to,
    created_at: data.created_at,
    is_minor_prize: data.is_minor_prize,
    is_claimed: data.is_claimed,
    name: participant?.name ?? null,
    email: participant?.email ?? null,
    raffle_title: Array.isArray(raffle) && raffle.length > 0 ? raffle[0].title : undefined
  }
}

// Obtener todas las rifas disponibles
export async function getRaffles(): Promise<Raffle[]> {
  console.log('✨ [BLESSED-SERVICE] Getting raffles...');

  // Las rifas tienen tenant_id directo
  const { data, error } = await supabase
    .from('raffles')
    .select('id, title, total_numbers, is_active, created_at, draw_date, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error fetching raffles:', error);
    throw error;
  }

  console.log('✅ [BLESSED-SERVICE] Raffles loaded:', data?.length || 0);
  return data || []
}

// Obtener una rifa específica
export async function getRaffle(raffleId: string): Promise<Raffle | null> {
  console.log('✨ [BLESSED-SERVICE] Getting raffle:', raffleId);

  const { data, error } = await supabase
    .from('raffles')
    .select('id, title, total_numbers, is_active, created_at, draw_date, status')
    .eq('id', raffleId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('❌ [BLESSED-SERVICE] Error fetching raffle:', error);
    throw error
  }

  console.log('✅ [BLESSED-SERVICE] Raffle found:', data.title);
  return data
}

// Generar números aleatorios únicos PARA UNA RIFA ESPECÍFICA
export async function generateRandomBlessedNumbers(quantity: number, raffleId: string): Promise<string[]> {
  console.log('✨ [BLESSED-SERVICE] Generating random numbers:', { quantity, raffleId });
  const { tenantId, isAdmin } = supabase.getTenantContext();

  // Obtener información de la rifa
  const raffle = await getRaffle(raffleId)
  if (!raffle) {
    throw new Error('Rifa no encontrada')
  }

  const totalNumbers = raffle.total_numbers
  const digits = totalNumbers.toString().length - 1;

  // Obtener números ya existentes PARA ESTA RIFA
  let existingQuery = supabase.directQuery('blessed_numbers')
    .select('number, raffles!inner(tenant_id)')
    .eq('raffle_id', raffleId)

  if (!isAdmin || (isAdmin && tenantId)) {
    if (tenantId) {
      existingQuery = existingQuery.eq('raffles.tenant_id', tenantId)
    }
  }

  const { data: existingNumbers, error } = await existingQuery

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error fetching existing numbers:', error);
    throw error;
  }

  const existingNumbersSet = new Set(existingNumbers?.map(n => n.number) || [])

  // Generar números únicos aleatorios
  const availableNumbers = []
  for (let i = 1; i <= totalNumbers; i++) {
    const formattedNumber = i.toString().padStart(digits, '0')
    if (!existingNumbersSet.has(formattedNumber)) {
      availableNumbers.push(formattedNumber)
    }
  }

  if (availableNumbers.length < quantity) {
    throw new Error(`Solo quedan ${availableNumbers.length} números disponibles para esta rifa`)
  }

  // Seleccionar números aleatorios
  const selectedNumbers = []
  const availableCopy = [...availableNumbers]

  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * availableCopy.length)
    selectedNumbers.push(availableCopy.splice(randomIndex, 1)[0])
  }

  console.log('✅ [BLESSED-SERVICE] Generated numbers:', selectedNumbers.length);
  return selectedNumbers.sort()
}

// Crear múltiples números bendecidos PARA UNA RIFA ESPECÍFICA
export async function createBlessedNumbers(data: CreateBlessedNumberData): Promise<BlessedNumber[]> {
  console.log('✨ [BLESSED-SERVICE] Creating blessed numbers:', data);

  if (!data.raffle_id) {
    throw new Error('Se requiere especificar una rifa')
  }

  const quantity = data.quantity || 1
  const numbers = await generateRandomBlessedNumbers(quantity, data.raffle_id)

  const numbersToInsert = numbers.map(number => ({
    number,
    raffle_id: data.raffle_id,
    is_minor_prize: data.is_minor_prize,
    assigned_to: null,
    is_claimed: false
  }))

  const { data: newBlessedNumbers, error } = await supabase.directQuery('blessed_numbers')
    .insert(numbersToInsert)
    .select(`
      id,
      number,
      raffle_id,
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed,
      raffles(title)
    `)

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error creating blessed numbers:', error);
    throw error;
  }

  console.log('✅ [BLESSED-SERVICE] Created blessed numbers:', newBlessedNumbers.length);

  return newBlessedNumbers.map(item => ({
    id: item.id,
    number: item.number,
    raffle_id: item.raffle_id,
    assigned_to: item.assigned_to,
    created_at: item.created_at,
    is_minor_prize: item.is_minor_prize,
    is_claimed: item.is_claimed,
    name: null,
    email: null,
    raffle_title: Array.isArray(item.raffles) && item.raffles.length > 0 ? item.raffles[0].title : undefined
  }))
}

// Eliminar un número bendecido
export async function deleteBlessedNumber(id: string): Promise<void> {
  console.log('✨ [BLESSED-SERVICE] Deleting blessed number:', id);
  const { tenantId, isAdmin } = supabase.getTenantContext();

  // Verificar permisos antes de eliminar
  if (!isAdmin || (isAdmin && tenantId)) {
    const { data: blessedNumber, error: checkError } = await supabase.directQuery('blessed_numbers')
      .select('id, raffles!inner(tenant_id)')
      .eq('id', id)
      .eq('raffles.tenant_id', tenantId)
      .single()

    if (checkError || !blessedNumber) {
      throw new Error('No tienes permisos para eliminar este registro');
    }
  }

  const { error } = await supabase.directQuery('blessed_numbers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error deleting blessed number:', error);
    throw error;
  }

  console.log('✅ [BLESSED-SERVICE] Blessed number deleted');
}

// Obtener participantes para el selector
export async function getParticipants() {
  console.log('✨ [BLESSED-SERVICE] Getting participants...');

  // Los participantes tienen tenant_id directo
  const { data, error } = await supabase
    .from('participants')
    .select('id, name, email')
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ [BLESSED-SERVICE] Error fetching participants:', error);
    throw error;
  }

  console.log('✅ [BLESSED-SERVICE] Participants loaded:', data?.length || 0);
  return data || []
}