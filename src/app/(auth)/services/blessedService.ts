import { supabase } from '../../lib/supabase'

export interface BlessedNumber {
  id: string
  number: string
  assigned_to: string | null
  created_at: string
  is_minor_prize: boolean
  is_claimed: boolean
  name?: string | null
  email?: string | null
}

export interface ActiveRaffle {
  id: string
  title: string
  total_numbers: number
  is_active: boolean
  created_at: string
  draw_date: string
}

export interface CreateBlessedNumberData {
  is_minor_prize: boolean
  quantity?: number // Cantidad de números a crear
}

export interface UpdateBlessedNumberData {
  assigned_to?: string | null
  is_minor_prize?: boolean
  is_claimed?: boolean
}

export async function getBlessedNumbers(): Promise<BlessedNumber[]> {
  const { data, error } = await supabase
    .from('blessed_numbers')
    .select(`
      id,
      number,
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed,
      participants:assigned_to(name, email)
    `)
    .order('number', { ascending: true })

  if (error) throw error

  return (
    data?.map((item: any) => {
      const participant = item.participants || {}
      return {
        id: item.id,
        number: item.number,
        assigned_to: item.assigned_to,
        created_at: item.created_at,
        is_minor_prize: item.is_minor_prize,
        is_claimed: item.is_claimed,
        name: participant.name ?? null,
        email: participant.email ?? null,
      }
    }) ?? []
  )
}

export async function updateBlessedNumber(id: string, updates: UpdateBlessedNumberData) {
  const { data, error } = await supabase
    .from('blessed_numbers')
    .update(updates)
    .eq('id', id)
    .select(`
      id,
      number,
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed,
      participants:assigned_to(name, email)
    `)
    .single()

  if (error) throw error

  const participant = data.participants || {}
  return {
    id: data.id,
    number: data.number,
    assigned_to: data.assigned_to,
    created_at: data.created_at,
    is_minor_prize: data.is_minor_prize,
    is_claimed: data.is_claimed
  }
}

// Obtener la rifa activa
export async function getActiveRaffle(): Promise<ActiveRaffle | null> {
  const { data, error } = await supabase
    .from('raffles')
    .select('id, title, total_numbers, is_active, created_at, draw_date')
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No hay rifa activa
      return null
    }
    throw error
  }

  return data
}

// Generar números aleatorios únicos
export async function generateRandomBlessedNumbers(quantity: number): Promise<string[]> {
  const activeRaffle = await getActiveRaffle()
  if (!activeRaffle) {
    throw new Error('No hay una rifa activa')
  }

  const totalNumbers = activeRaffle.total_numbers
  const digits = totalNumbers.toString().length

  // Obtener números ya existentes
  const { data: existingNumbers, error } = await supabase
    .from('blessed_numbers')
    .select('number')

  if (error) throw error

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
    throw new Error(`Solo quedan ${availableNumbers.length} números disponibles`)
  }

  // Seleccionar números aleatorios
  const selectedNumbers = []
  const availableCopy = [...availableNumbers]
  
  for (let i = 0; i < quantity; i++) {
    const randomIndex = Math.floor(Math.random() * availableCopy.length)
    selectedNumbers.push(availableCopy.splice(randomIndex, 1)[0])
  }

  return selectedNumbers.sort()
}

// Crear múltiples números bendecidos
export async function createBlessedNumbers(data: CreateBlessedNumberData): Promise<BlessedNumber[]> {
  const quantity = data.quantity || 1
  const numbers = await generateRandomBlessedNumbers(quantity)

  const numbersToInsert = numbers.map(number => ({
    number,
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
      assigned_to,
      created_at,
      is_minor_prize,
      is_claimed
    `)

  if (error) throw error

  return newBlessedNumbers.map(item => ({
    id: item.id,
    number: item.number,
    assigned_to: item.assigned_to,
    created_at: item.created_at,
    is_minor_prize: item.is_minor_prize,
    is_claimed: item.is_claimed,
    name: null,
    email: null,
  }))
}

// Eliminar un número bendecido
export async function deleteBlessedNumber(id: string): Promise<void> {
  const { error } = await supabase
    .from('blessed_numbers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Obtener participantes para el selector
export async function getParticipants() {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name, email')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}