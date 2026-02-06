// src/services/blessedService.ts - MIGRACIÓN MULTI-TENANT
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
  raffle_id: string
  is_minor_prize: boolean
  quantity?: number
}

// CAMBIO: Actualizar interface para coincidir con pattern de facturas
export interface UpdateBlessedNumberInput {
  id: string
  assigned_to?: string | null
  is_minor_prize?: boolean
  is_claimed?: boolean
}

/**
 * Obtiene números bendecidos con contexto de tenant
 * @param raffleId ID de la rifa (opcional)
 * @returns Lista de números bendecidos filtrados por tenant
 */
export async function getBlessedNumbers(raffleId?: string): Promise<BlessedNumber[]> {
  try {
    console.log('✨ [BLESSED-SERVICE] Getting blessed numbers...');
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context:', { tenantId, isAdmin });

    // Construir query base - usar supabase normal, el filtrado se hace automáticamente
    let query = supabase
      .from('blessed_numbers')
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
      .order('number', { ascending: true });

    // Filtrar por rifa específica si se proporciona
    if (raffleId) {
      query = query.eq('raffle_id', raffleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error fetching blessed numbers:', error);
      throw new Error(error.message);
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
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in getBlessedNumbers:', error);
    throw error;
  }
}

/**
 * Actualiza un número bendecido con contexto de tenant
 * CAMBIO: Usar pattern consistente con facturas
 * @param input Datos de actualización incluyendo ID
 * @returns El número bendecido actualizado
 */
export async function updateBlessedNumber(input: UpdateBlessedNumberInput): Promise<BlessedNumber> {
  try {
    console.log('✨ [BLESSED-SERVICE] Updating blessed number:', input.id);
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context during update:', { tenantId, isAdmin });

    // Convertir input a formato de base de datos
    const updateData: any = {};
    if (input.assigned_to !== undefined) updateData.assigned_to = input.assigned_to;
    if (input.is_minor_prize !== undefined) updateData.is_minor_prize = input.is_minor_prize;
    if (input.is_claimed !== undefined) updateData.is_claimed = input.is_claimed;

    const { data, error } = await supabase
      .from('blessed_numbers')
      .update(updateData)
      .eq('id', input.id)
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
      .single();

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error updating blessed number:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Blessed number updated:', data.id);

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
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in updateBlessedNumber:', error);
    throw error;
  }
}

/**
 * Obtiene todas las rifas disponibles con contexto de tenant
 * @returns Lista de rifas filtradas por tenant
 */
export async function getRaffles(): Promise<Raffle[]> {
  try {
    console.log('✨ [BLESSED-SERVICE] Getting raffles...');
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context:', { tenantId, isAdmin });

    const { data, error } = await supabase
      .from('raffles')
      .select('id, title, total_numbers, is_active, created_at, draw_date, status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error fetching raffles:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Raffles loaded:', data?.length || 0);
    return data || []
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in getRaffles:', error);
    throw error;
  }
}

/**
 * Obtiene una rifa específica con contexto de tenant
 * @param raffleId ID de la rifa
 * @returns La rifa solicitada o null si no existe
 */
export async function getRaffle(raffleId: string): Promise<Raffle | null> {
  try {
    console.log('✨ [BLESSED-SERVICE] Getting raffle:', raffleId);

    const { data, error } = await supabase
      .from('raffles')
      .select('id, title, total_numbers, is_active, created_at, draw_date, status')
      .eq('id', raffleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('❌ [BLESSED-SERVICE] Error fetching raffle:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Raffle found:', data.title);
    return data
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in getRaffle:', error);
    throw error;
  }
}

/**
 * Generar números aleatorios únicos para una rifa específica con contexto de tenant
 * @param quantity Cantidad de números a generar
 * @param raffleId ID de la rifa
 * @returns Array de números generados
 */
export async function generateRandomBlessedNumbers(quantity: number, raffleId: string): Promise<string[]> {
  try {
    console.log('✨ [BLESSED-SERVICE] Generating random numbers:', { quantity, raffleId });
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context during generation:', { tenantId, isAdmin });

    // Obtener información de la rifa
    const raffle = await getRaffle(raffleId)
    if (!raffle) {
      throw new Error('Rifa no encontrada')
    }

    const totalNumbers = raffle.total_numbers
    const digits = totalNumbers.toString().length - 1;

    // Obtener números ya existentes para esta rifa (filtrado automático por tenant)
    const { data: existingNumbers, error } = await supabase
      .from('blessed_numbers')
      .select('number')
      .eq('raffle_id', raffleId);

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error fetching existing numbers:', error);
      throw new Error(error.message);
    }

    const existingNumbersSet = new Set(existingNumbers?.map((n: { number: any }) => n.number) || [])

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
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in generateRandomBlessedNumbers:', error);
    throw error;
  }
}

/**
 * Crear múltiples números bendecidos para una rifa específica con contexto de tenant
 * @param data Datos de creación
 * @returns Array de números bendecidos creados
 */
export async function createBlessedNumbers(data: CreateBlessedNumberData): Promise<BlessedNumber[]> {
  try {
    console.log('✨ [BLESSED-SERVICE] Creating blessed numbers:', data);
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context during creation:', { tenantId, isAdmin });

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

    const { data: newBlessedNumbers, error } = await supabase
      .from('blessed_numbers')
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
      `);

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error creating blessed numbers:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Created blessed numbers:', newBlessedNumbers.length);

    return newBlessedNumbers.map((item: { id: any; number: any; raffle_id: any; assigned_to: any; created_at: any; is_minor_prize: any; is_claimed: any; raffles: string | any[] }) => ({
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
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in createBlessedNumbers:', error);
    throw error;
  }
}

/**
 * Eliminar un número bendecido con contexto de tenant
 * @param id ID del número bendecido a eliminar
 * @returns true si se eliminó correctamente
 */
export async function deleteBlessedNumber(id: string): Promise<boolean> {
  try {
    console.log('✨ [BLESSED-SERVICE] Deleting blessed number:', id);
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context during deletion:', { tenantId, isAdmin });

    const { error } = await supabase
      .from('blessed_numbers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error deleting blessed number:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Blessed number deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in deleteBlessedNumber:', error);
    throw error;
  }
}

/**
 * Obtener participantes para el selector con contexto de tenant
 * @returns Lista de participantes filtrados por tenant
 */
export async function getParticipants() {
  try {
    console.log('✨ [BLESSED-SERVICE] Getting participants...');
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [BLESSED-SERVICE] Current context:', { tenantId, isAdmin });

    const { data, error } = await supabase
      .from('participants')
      .select('id, name, email')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ [BLESSED-SERVICE] Error fetching participants:', error);
      throw new Error(error.message);
    }

    console.log('✅ [BLESSED-SERVICE] Participants loaded:', data?.length || 0);
    return data || []
  } catch (error) {
    console.error('❌ [BLESSED-SERVICE] Error in getParticipants:', error);
    throw error;
  }
}