import { supabase } from '../lib/supabaseTenantClient';
import type {
  Raffle,
  CreateRaffleData,
  UpdateRaffleData,
  RaffleFilters,
  RaffleListResponse,
  RaffleStatus
} from '../types/raffle';

class RaffleService {

  // ============ RIFAS PRINCIPALES ============
  async getRaffles(
    filters?: RaffleFilters,
    page = 1,
    limit = 10
  ): Promise<RaffleListResponse> {
    try {
      console.log('🎟️ Getting raffles list...');
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context:', { tenantId, isAdmin });

      let query = supabase
        .from('raffles')
        .select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.date_from) {
        query = query.gte('draw_date', filters.date_from)
      }

      if (filters?.date_to) {
        query = query.lte('draw_date', filters.date_to)
      }

      // Paginación
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      console.log('Query result:', { data, error, count })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(`Error al obtener rifas: ${error.message}`)
      }

      console.log('✅ Raffles fetched:', data?.length || 0);
      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('❌ Error in getRaffles:', error);
      throw error;
    }
  }

  async getRaffleById(id: string): Promise<Raffle> {
    try {
      console.log('🎟️ Getting raffle by ID:', id);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context:', { tenantId, isAdmin });

      const { data, error } = await supabase
        .from('raffles')
        .select(`
          *,
          category:raffle_categories(*),
          media:raffle_media(*),
          carousel:raffle_carousel(
            *,
            media:raffle_media(*)
          ),
          design_config:raffle_design_config(
            *,
            theme:raffle_themes(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching raffle:', error);
        throw new Error(error.message);
      }
      if (!data) throw new Error('Rifa no encontrada')

      console.log('✅ Raffle fetched:', data.id);
      return data
    } catch (error) {
      console.error('❌ Error in getRaffleById:', error);
      throw error;
    }
  }

  async createRaffle(raffleData: CreateRaffleData): Promise<Raffle> {
    try {
      console.log('📝 Creating raffle...');
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during creation:', { tenantId, isAdmin });

      const { data, error } = await supabase
        .from('raffles')
        .insert({
          ...raffleData,
          status: 'draft' as RaffleStatus
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating raffle:', error);
        throw new Error(error.message);
      }

      console.log('✅ Raffle created:', data.id);
      return data
    } catch (error) {
      console.error('❌ Error in createRaffle:', error);
      throw error;
    }
  }

  async updateRaffle(raffleData: UpdateRaffleData): Promise<Raffle> {
    try {
      console.log('✏️ Updating raffle:', raffleData.id);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during update:', { tenantId, isAdmin });

      const { id, ...updateData } = raffleData

      const { data, error } = await supabase
        .from('raffles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating raffle:', error);
        throw new Error(error.message);
      }

      console.log('✅ Raffle updated:', data.id);
      return data
    } catch (error) {
      console.error('❌ Error in updateRaffle:', error);
      throw error;
    }
  }

  async deleteRaffle(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting raffle:', id);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during deletion:', { tenantId, isAdmin });

      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting raffle:', error);
        throw new Error(error.message);
      }

      console.log('✅ Raffle deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteRaffle:', error);
      throw error;
    }
  }

  async updateRaffleStatus(id: string, status: RaffleStatus): Promise<Raffle> {
    try {
      console.log('🔄 Updating raffle status:', id, status);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during status update:', { tenantId, isAdmin });

      const { data, error } = await supabase
        .from('raffles')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating raffle status:', error);
        throw new Error(error.message);
      }

      console.log('✅ Raffle status updated:', data.id);
      return data
    } catch (error) {
      console.error('❌ Error in updateRaffleStatus:', error);
      throw error;
    }
  }
}

export const raffleService = new RaffleService()