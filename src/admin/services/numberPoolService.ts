import { supabase } from '../lib/supabaseTenantClient'
import type { NumberPool, NumberPoolNumber, RaffleNumberAssignment, RaffleNumberStatus, AmbassadorNumberAssignment } from '@/types/database'
import type { AmbassadorNumberAssignment as AmbassadorAssignmentFull } from '../types/ambassador'

export interface CreatePoolData {
    name: string
    total_numbers: number
    pool_type?: 'range' | 'custom'
}

export interface CreateAssignmentData {
    raffle_id: string
    referral_id: string
    range_start: number
    range_end: number
}

export interface CreateAmbassadorAssignmentData {
    ambassador_id: string
    raffle_id: string
    range_start: number
    range_end: number
}

class NumberPoolService {

    async getPools(): Promise<NumberPool[]> {
        const { data, error } = await supabase
            .from('number_pools')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    async getPoolById(id: string): Promise<NumberPool> {
        const { data, error } = await supabase
            .from('number_pools')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async createPool(poolData: CreatePoolData): Promise<NumberPool> {
        const { tenantId } = supabase.getTenantContext()

        const { data, error } = await supabase
            .from('number_pools')
            .insert({
                name: poolData.name,
                total_numbers: poolData.total_numbers,
                pool_type: poolData.pool_type || 'range',
                tenant_id: tenantId,
                status: 'active',
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async updatePool(id: string, updates: Partial<Pick<NumberPool, 'name' | 'status'>>): Promise<NumberPool> {
        const { data, error } = await supabase
            .from('number_pools')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async deletePool(id: string): Promise<void> {
        const { error } = await supabase
            .from('number_pools')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }

    // --- Assignments (per-raffle) ---

    async getAssignments(raffleId: string): Promise<RaffleNumberAssignment[]> {
        const { data, error } = await supabase
            .from('raffle_number_assignments')
            .select(`
                *,
                referral:referrals(id, name, referral_code)
            `)
            .eq('raffle_id', raffleId)
            .eq('status', 'assigned')
            .order('range_start', { ascending: true })

        if (error) throw new Error(error.message)
        return data || []
    }

    async createAssignment(data: CreateAssignmentData): Promise<RaffleNumberAssignment> {
        if (data.range_start < 1 || data.range_start > data.range_end) {
            throw new Error('Rango invalido')
        }

        const { data: overlaps, error: overlapError } = await supabase
            .from('raffle_number_assignments')
            .select('id, range_start, range_end')
            .eq('raffle_id', data.raffle_id)
            .eq('status', 'assigned')
            .or(`and(range_start.lte.${data.range_end},range_end.gte.${data.range_start})`)

        if (overlapError) throw new Error(overlapError.message)
        if (overlaps && overlaps.length > 0) {
            throw new Error(`El rango se superpone con asignaciones existentes (${overlaps[0].range_start}-${overlaps[0].range_end})`)
        }

        const { data: created, error } = await supabase
            .from('raffle_number_assignments')
            .insert(data)
            .select(`
                *,
                referral:referrals(id, name, referral_code)
            `)
            .single()

        if (error) throw new Error(error.message)
        return created
    }

    async deleteAssignment(assignmentId: string): Promise<void> {
        const { error } = await supabase
            .from('raffle_number_assignments')
            .delete()
            .eq('id', assignmentId)

        if (error) throw new Error(error.message)
    }

    async duplicateAssignments(sourceRaffleId: string, targetRaffleId: string): Promise<RaffleNumberAssignment[]> {
        const sourceAssignments = await this.getAssignments(sourceRaffleId)
        if (sourceAssignments.length === 0) return []

        const rows = sourceAssignments.map(a => ({
            raffle_id: targetRaffleId,
            referral_id: a.referral_id,
            range_start: a.range_start,
            range_end: a.range_end,
            status: 'assigned',
        }))

        const { data, error } = await supabase
            .from('raffle_number_assignments')
            .insert(rows)
            .select(`
                *,
                referral:referrals(id, name, referral_code)
            `)

        if (error) throw new Error(error.message)
        return data || []
    }

    async getAssignmentsByReferral(referralId: string): Promise<(RaffleNumberAssignment & { raffle?: { id: string; title: string; raffle_type: string; status: string } })[]> {
        const { data, error } = await supabase
            .from('raffle_number_assignments')
            .select(`
                *,
                raffle:raffles(id, title, raffle_type, status)
            `)
            .eq('referral_id', referralId)
            .eq('status', 'assigned')
            .order('assigned_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    // --- Custom Pool Numbers ---

    async getCustomNumbers(poolId: string): Promise<number[]> {
        const { data, error } = await supabase
            .from('number_pool_numbers')
            .select('number')
            .eq('pool_id', poolId)
            .order('number', { ascending: true })

        if (error) throw new Error(error.message)
        return (data || []).map((row: { number: number }) => row.number)
    }

    async uploadCustomNumbers(poolId: string, numbers: number[]): Promise<{ inserted: number }> {
        const BATCH_SIZE = 1000
        let totalInserted = 0

        for (let i = 0; i < numbers.length; i += BATCH_SIZE) {
            const batch = numbers.slice(i, i + BATCH_SIZE).map(n => ({
                pool_id: poolId,
                number: n,
            }))

            const { error } = await supabase
                .from('number_pool_numbers')
                .insert(batch)

            if (error) throw new Error(error.message)
            totalInserted += batch.length
        }

        // Update pool total_numbers
        const { error: updateError } = await supabase
            .from('number_pools')
            .update({ total_numbers: numbers.length, updated_at: new Date().toISOString() })
            .eq('id', poolId)

        if (updateError) throw new Error(updateError.message)

        return { inserted: totalInserted }
    }

    async clearCustomNumbers(poolId: string): Promise<void> {
        const { error } = await supabase
            .from('number_pool_numbers')
            .delete()
            .eq('pool_id', poolId)

        if (error) throw new Error(error.message)

        const { error: updateError } = await supabase
            .from('number_pools')
            .update({ total_numbers: 0, updated_at: new Date().toISOString() })
            .eq('id', poolId)

        if (updateError) throw new Error(updateError.message)
    }

    // --- RPCs ---

    async getRaffleNumberStatus(raffleId: string): Promise<RaffleNumberStatus[]> {
        const { data, error } = await supabase
            .rpc('get_raffle_number_status', { p_raffle_id: raffleId })

        if (error) throw new Error(error.message)
        return data || []
    }

    async getSoldNumbersInRange(raffleId: string, rangeStart: number, rangeEnd: number): Promise<number[]> {
        const { data, error } = await supabase
            .rpc('get_sold_numbers_in_range', {
                p_raffle_id: raffleId,
                p_range_start: rangeStart,
                p_range_end: rangeEnd,
            })

        if (error) throw new Error(error.message)
        return (data || []).map((row: { num: number }) => row.num)
    }

    // --- Ambassador Assignments ---

    async getAmbassadorAssignments(raffleId: string): Promise<AmbassadorAssignmentFull[]> {
        const { data, error } = await supabase
            .from('ambassador_number_assignments')
            .select(`
                *,
                ambassador:ambassadors(id, name, ambassador_code)
            `)
            .eq('raffle_id', raffleId)
            .eq('status', 'assigned')
            .order('range_start', { ascending: true })

        if (error) throw new Error(error.message)
        return data || []
    }

    async createAmbassadorAssignment(data: CreateAmbassadorAssignmentData): Promise<AmbassadorAssignmentFull> {
        if (data.range_start < 0 || data.range_start > data.range_end) {
            throw new Error('Rango invalido')
        }

        // Check overlap against referral assignments
        const { data: referralOverlaps, error: refOverlapError } = await supabase
            .from('raffle_number_assignments')
            .select('id, range_start, range_end')
            .eq('raffle_id', data.raffle_id)
            .eq('status', 'assigned')
            .or(`and(range_start.lte.${data.range_end},range_end.gte.${data.range_start})`)

        if (refOverlapError) throw new Error(refOverlapError.message)
        if (referralOverlaps && referralOverlaps.length > 0) {
            throw new Error(`El rango se superpone con asignaciones de referidos (${referralOverlaps[0].range_start}-${referralOverlaps[0].range_end})`)
        }

        // Check overlap against ambassador assignments
        const { data: ambOverlaps, error: ambOverlapError } = await supabase
            .from('ambassador_number_assignments')
            .select('id, range_start, range_end')
            .eq('raffle_id', data.raffle_id)
            .eq('status', 'assigned')
            .or(`and(range_start.lte.${data.range_end},range_end.gte.${data.range_start})`)

        if (ambOverlapError) throw new Error(ambOverlapError.message)
        if (ambOverlaps && ambOverlaps.length > 0) {
            throw new Error(`El rango se superpone con asignaciones de embajadores (${ambOverlaps[0].range_start}-${ambOverlaps[0].range_end})`)
        }

        const { tenantId } = supabase.getTenantContext()

        const { data: created, error } = await supabase
            .from('ambassador_number_assignments')
            .insert({
                ...data,
                tenant_id: tenantId,
            })
            .select(`
                *,
                ambassador:ambassadors(id, name, ambassador_code)
            `)
            .single()

        if (error) throw new Error(error.message)
        return created
    }

    async deleteAmbassadorAssignment(assignmentId: string): Promise<void> {
        const { error } = await supabase
            .from('ambassador_number_assignments')
            .delete()
            .eq('id', assignmentId)

        if (error) throw new Error(error.message)
    }

    async getAssignmentsByAmbassador(ambassadorId: string): Promise<(AmbassadorAssignmentFull)[]> {
        const { data, error } = await supabase
            .from('ambassador_number_assignments')
            .select(`
                *,
                raffle:raffles(id, title, raffle_type, status)
            `)
            .eq('ambassador_id', ambassadorId)
            .eq('status', 'assigned')
            .order('assigned_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    async duplicateAmbassadorAssignments(sourceRaffleId: string, targetRaffleId: string): Promise<AmbassadorAssignmentFull[]> {
        const sourceAssignments = await this.getAmbassadorAssignments(sourceRaffleId)
        if (sourceAssignments.length === 0) return []

        const { tenantId } = supabase.getTenantContext()

        const rows = sourceAssignments.map(a => ({
            raffle_id: targetRaffleId,
            ambassador_id: a.ambassador_id,
            range_start: a.range_start,
            range_end: a.range_end,
            status: 'assigned',
            tenant_id: tenantId,
        }))

        const { data, error } = await supabase
            .from('ambassador_number_assignments')
            .insert(rows)
            .select(`
                *,
                ambassador:ambassadors(id, name, ambassador_code)
            `)

        if (error) throw new Error(error.message)
        return data || []
    }
}

export const numberPoolService = new NumberPoolService()
