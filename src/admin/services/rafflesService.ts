import { supabase, supabaseOriginal } from '../lib/supabaseTenantClient';
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

  // Reemplazar el método getRaffleEntries existente en raffleService con este:

  async getRaffleEntries(raffleId?: string) {
    try {
      console.log('🎫 Getting raffle entries...');
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context:', { tenantId, isAdmin });

      let query = supabase
        .from('raffle_entries')
        .select(`
        id,
        number,
        participant_id,
        raffle_id,
        is_winner,
        purchased_at,
        participant:participants(
          id,
          name,
          email
        )
      `)
        .order('purchased_at', { ascending: false });

      // Si se especifica un raffleId, filtrar por él
      if (raffleId) {
        query = query.eq('raffle_id', raffleId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching raffle entries:', error);
        throw new Error('Error al obtener los números comprados');
      }

      // Transformar los datos para incluir el nombre del participante
      const transformedData = data?.map((entry: { participant: { name: any; }; }) => ({
        ...entry,
        participant_name: entry.participant?.name || 'Participante Anónimo'
      })) || [];

      console.log('✅ Raffle entries fetched:', transformedData.length);
      return transformedData;
    } catch (error) {
      console.error('❌ Error in getRaffleEntries:', error);
      throw error;
    }
  }

  // Agregar este nuevo método al final de la clase RaffleService:

  async getRaffleStats(raffleId: string, timeFilter: '7d' | '30d' | 'all' = '30d') {
    try {
      console.log('📊 Getting raffle stats for:', raffleId);
      const { tenantId, isAdmin } = supabase.getTenantContext();

      // Obtener la rifa para tener datos base
      const raffle = await this.getRaffleById(raffleId);

      // Obtener todas las entradas de esta rifa
      const entries = await this.getRaffleEntries(raffleId);

      // Filtrar por tiempo si es necesario
      let filteredEntries = entries;
      if (timeFilter !== 'all') {
        const days = timeFilter === '7d' ? 7 : 30;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);
        filteredEntries = entries.filter((entry: { purchased_at: string | number | Date; }) =>
          new Date(entry.purchased_at) >= dateFrom
        );
      }

      // Calcular estadísticas
      const totalEntries = entries.length;
      const uniqueParticipants = new Set(entries.map((e: { participant_id: any; }) => e.participant_id)).size;
      const totalRevenue = totalEntries * raffle.price;
      const averageTicketsPerUser = uniqueParticipants > 0 ? totalEntries / uniqueParticipants : 0;

      // Calcular progreso
      const progressPercentage = (totalEntries / raffle.total_numbers) * 100;

      // Calcular días restantes
      const daysRemaining = Math.max(0, Math.ceil((new Date(raffle.draw_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      // Calcular entradas por día (basado en filteredEntries)
      const entriesPerDay = filteredEntries.length / (timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : Math.max(1, totalEntries > 0 ? this.getDaysSinceFirstEntry(entries) : 1));

      // Analizar patrones de compra
      const participantGroups = this.groupEntriesByParticipant(entries);
      const participantCounts = Object.values(participantGroups).map(entries => entries.length);

      const singleTicketBuyers = participantCounts.filter(count => count === 1).length;
      const multiTicketBuyers = participantCounts.filter(count => count > 1 && count <= 5).length;
      const bulkBuyers = participantCounts.filter(count => count > 5).length;

      const popularPackages = [
        {
          id: '1',
          name: 'Ticket Individual',
          purchases: singleTicketBuyers,
          revenue: singleTicketBuyers * raffle.price
        },
        {
          id: '2',
          name: 'Paquete Múltiple (2-5)',
          purchases: multiTicketBuyers,
          revenue: participantCounts
            .filter(count => count > 1 && count <= 5)
            .reduce((sum, count) => sum + (count * raffle.price), 0)
        },
        {
          id: '3',
          name: 'Paquete Bulk (6+)',
          purchases: bulkBuyers,
          revenue: participantCounts
            .filter(count => count > 5)
            .reduce((sum, count) => sum + (count * raffle.price), 0)
        }
      ].filter(pkg => pkg.purchases > 0);

      // Estimación de tasa de conversión (simplificada)
      const estimatedConversionRate = Math.min((totalEntries / (raffle.total_numbers * 0.1)) * 100, 25);

      const stats = {
        totalEntries,
        totalParticipants: uniqueParticipants,
        totalRevenue,
        averageTicketsPerUser,
        conversionRate: estimatedConversionRate,
        progressPercentage,
        daysRemaining,
        entriesPerDay: Math.round(entriesPerDay * 10) / 10,
        popularPackages,
        recentEntries: entries.slice(0, 10).map((entry: { id: any; number: any; participant_name: any; purchased_at: any; }) => ({
          id: entry.id,
          number: entry.number,
          participant_name: entry.participant_name,
          purchased_at: entry.purchased_at
        }))
      };

      console.log('✅ Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error in getRaffleStats:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados - agregar al final de la clase:

  private getDaysSinceFirstEntry(entries: any[]): number {
    if (entries.length === 0) return 1;

    const sortedEntries = entries.sort((a, b) =>
      new Date(a.purchased_at).getTime() - new Date(b.purchased_at).getTime()
    );

    const firstEntry = new Date(sortedEntries[0].purchased_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstEntry.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays);
  }

  private groupEntriesByParticipant(entries: any[]) {
    const groups: Record<string, any[]> = {};

    entries.forEach(entry => {
      if (!groups[entry.participant_id]) {
        groups[entry.participant_id] = [];
      }
      groups[entry.participant_id].push(entry);
    });

    return groups;
  }

  async createNewRaffleEntriesFromOrder(orderNumber: string, quantity: number) {
    try {
      console.log('🎫 Creating raffle entries from order:', orderNumber, 'quantity:', quantity);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during entry creation:', { tenantId, isAdmin });

      // 1. Buscar orden existente
      const { data: order, error: orderError } = await supabase
        .from('invoices')
        .select('full_name, email, amount, status')
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !order) {
        throw new Error('Orden no encontrada');
      }

      const { full_name, email, amount, status } = order;

      // 2. Validar cantidad
      if (parseInt(amount.toString()) !== quantity) {
        throw new Error(`Cantidad solicitada (${quantity}) no coincide con el total de la orden (${amount})`);
      }

      console.log('Order found:', { full_name, email, amount, status });

      // 3. Si ya fue procesada (por status)
      if (status === 'completed') {
        return { success: true, message: 'Orden ya fue procesada previamente' };
      }

      // 4. Obtener rifa activa
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('id, total_numbers')
        .eq('is_active', true)
        .single();

      if (raffleError || !raffle) {
        throw new Error('No hay una rifa activa');
      }

      const raffleId = raffle.id;
      const maxNumber = raffle.total_numbers || 99999;

      // 5. Obtener o crear participante
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('id')
        .eq('email', email)
        .single();

      let participantId = existingParticipant?.id;

      if (!participantId) {
        const { data: newParticipant, error: newError } = await supabase
          .from('participants')
          .insert({ name: full_name, email })
          .select()
          .single();

        if (newError || !newParticipant) {
          throw new Error('Error al crear participante');
        }

        participantId = newParticipant.id;
      }

      // 7. Verificar disponibilidad
      const { data: usedNumbers, error: usedError } = await supabase
        .from('raffle_entries')
        .select('number')
        .eq('raffle_id', raffleId);

      if (usedError) {
        throw new Error('Error al obtener números usados');
      }

      const usedCount = usedNumbers?.length || 0;

      if (maxNumber - usedCount < quantity) {
        throw new Error(`No hay suficientes números disponibles. Disponibles: ${maxNumber - usedCount}`);
      }

      // 8. Generar números
      const { data: generated, error: generateError } = await supabaseOriginal.rpc('generate_raffle_numbers', {
        in_participant_id: participantId,
        in_raffle_id: raffleId,
        in_amount: quantity,
      });

      if (generateError) {
        throw new Error(`Error en RPC: ${generateError.message}`);
      }

      if (!generated || generated.length === 0) {
        throw new Error('No se generaron números');
      }

      if (quantity <= 1000 && generated.length !== quantity) {
        throw new Error(`Se generaron ${generated.length} en lugar de ${quantity}`);
      }

      // 9. Actualizar la orden como completada
      const { error: statusUpdateError } = await supabase
        .from('invoices')
        .update({ status: 'completed' })
        .eq('order_number', orderNumber);

      if (statusUpdateError) {
        console.warn('⚠️ No se pudo actualizar el estado de la orden:', statusUpdateError.message);
      }

      console.log('✅ Raffle entries created successfully:', generated.length);
      return {
        success: true,
        assigned: generated.map((g: any) => g.generated_number),
        total_assigned: generated.length,
        raffle_id: raffleId
      };

    } catch (error) {
      console.error('❌ Error en createNewRaffleEntriesFromOrder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const raffleService = new RaffleService()