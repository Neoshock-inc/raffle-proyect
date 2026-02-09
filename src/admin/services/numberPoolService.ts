import { supabase } from '../lib/supabaseTenantClient'
import type { NumberPool, RaffleNumberAssignment, RaffleNumberStatus } from '@/types/database'

export interface CreatePoolData {
    name: string
    total_numbers: number
}

export interface CreateAssignmentData {
    raffle_id: string
    referral_id: string
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
                ...poolData,
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
}

export const numberPoolService = new NumberPoolService()
