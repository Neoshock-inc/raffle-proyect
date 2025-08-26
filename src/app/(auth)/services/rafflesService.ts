import { supabase } from '../lib/supabaseTenantClient';
import type {
  Raffle,
  RaffleCategory,
  RaffleMedia,
  RaffleCarouselSlide,
  RaffleTheme,
  RaffleDesignConfig,
  CreateRaffleData,
  UpdateRaffleData,
  RaffleFilters,
  RaffleListResponse,
  UploadMediaData,
  MediaUploadResponse,
  RaffleStatus
} from '../types/raffle';

class RaffleService {
  
  // ============ RIFAS PRINCIPALES ============
  async getRaffles(
    filters?: RaffleFilters,
    page = 1,
    limit = 10
  ): Promise<RaffleListResponse> {
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
      console.error('Supabase error:', error)
      throw new Error(`Error al obtener rifas: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    }
  }

  async getRaffleById(id: string): Promise<Raffle> {
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

    if (error) throw error
    if (!data) throw new Error('Rifa no encontrada')

    return data
  }

  async createRaffle(raffleData: CreateRaffleData): Promise<Raffle> {
    const { data, error } = await supabase
      .from('raffles')
      .insert({
        ...raffleData,
        status: 'draft' as RaffleStatus
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateRaffle(raffleData: UpdateRaffleData): Promise<Raffle> {
    const { id, ...updateData } = raffleData

    const { data, error } = await supabase
      .from('raffles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteRaffle(id: string): Promise<void> {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async updateRaffleStatus(id: string, status: RaffleStatus): Promise<Raffle> {
    const { data, error } = await supabase
      .from('raffles')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ CATEGORÍAS ============

  async getCategories(): Promise<RaffleCategory[]> {
    const { data, error } = await supabase
      .from('raffle_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  async createCategory(categoryData: Omit<RaffleCategory, 'id' | 'created_at'>): Promise<RaffleCategory> {
    const { data, error } = await supabase
      .from('raffle_categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============ MULTIMEDIA ============

  async uploadMedia(uploadData: UploadMediaData): Promise<MediaUploadResponse> {
    const { raffle_id, file, media_type, alt_text, caption, is_featured } = uploadData

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `raffles/${raffle_id}/${fileName}`

    // Subir archivo a Supabase Storage
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('raffle-media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('raffle-media')
      .getPublicUrl(filePath)

    // Guardar metadata en la base de datos
    const { data: mediaData, error: mediaError } = await supabase
      .from('raffle_media')
      .insert({
        raffle_id,
        media_type,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        alt_text,
        caption,
        is_featured: is_featured || false,
        display_order: 0
      })
      .select()
      .single()

    if (mediaError) throw mediaError

    return {
      id: mediaData.id,
      file_url: publicUrl,
      file_name: file.name,
      media_type,
      file_size: file.size,
      mime_type: file.type
    }
  }

  async getRaffleMedia(raffleId: string, mediaType?: string): Promise<RaffleMedia[]> {
    let query = supabase
      .from('raffle_media')
      .select('*')
      .eq('raffle_id', raffleId)
      .eq('is_active', true)

    if (mediaType) {
      query = query.eq('media_type', mediaType)
    }

    const { data, error } = await query.order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  async deleteMedia(mediaId: string): Promise<void> {
    // Obtener información del archivo para eliminarlo del storage
    const { data: mediaData, error: fetchError } = await supabase
      .from('raffle_media')
      .select('file_url')
      .eq('id', mediaId)
      .single()

    if (fetchError) throw fetchError

    // Extraer path del archivo de la URL
    const url = new URL(mediaData.file_url)
    const filePath = url.pathname.split('/').slice(-3).join('/') // raffles/id/filename

    // Eliminar archivo del storage
    const { error: storageError } = await supabase.storage
      .from('raffle-media')
      .remove([filePath])

    if (storageError) console.warn('Error eliminando archivo del storage:', storageError)

    // Eliminar registro de la base de datos
    const { error } = await supabase
      .from('raffle_media')
      .delete()
      .eq('id', mediaId)

    if (error) throw error
  }

  // ============ CARRUSEL ============

  async createCarouselSlide(slideData: Omit<RaffleCarouselSlide, 'id' | 'created_at'>): Promise<RaffleCarouselSlide> {
    const { data, error } = await supabase
      .from('raffle_carousel')
      .insert(slideData)
      .select(`
        *,
        media:raffle_media(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async updateCarouselSlide(slideId: string, slideData: Partial<RaffleCarouselSlide>): Promise<RaffleCarouselSlide> {
    const { data, error } = await supabase
      .from('raffle_carousel')
      .update(slideData)
      .eq('id', slideId)
      .select(`
        *,
        media:raffle_media(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async deleteCarouselSlide(slideId: string): Promise<void> {
    const { error } = await supabase
      .from('raffle_carousel')
      .delete()
      .eq('id', slideId)

    if (error) throw error
  }

  async reorderCarouselSlides(raffleId: string, slideOrders: { id: string; order: number }[]): Promise<void> {
    const updates = slideOrders.map(({ id, order }) =>
      supabase
        .from('raffle_carousel')
        .update({ slide_order: order })
        .eq('id', id)
        .eq('raffle_id', raffleId)
    )

    const results = await Promise.all(updates)

    for (const result of results) {
      if (result.error) throw result.error
    }
  }

  // ============ TEMAS Y DISEÑO ============

  async getThemes(): Promise<RaffleTheme[]> {
    const { data, error } = await supabase
      .from('raffle_themes')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  async getRaffleDesignConfig(raffleId: string): Promise<RaffleDesignConfig | null> {
    const { data, error } = await supabase
      .from('raffle_design_config')
      .select(`
        *,
        theme:raffle_themes(*)
      `)
      .eq('raffle_id', raffleId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  }

  async upsertDesignConfig(configData: Omit<RaffleDesignConfig, 'id' | 'created_at' | 'updated_at'>): Promise<RaffleDesignConfig> {
    const { data, error } = await supabase
      .from('raffle_design_config')
      .upsert(configData, { onConflict: 'raffle_id' })
      .select(`
        *,
        theme:raffle_themes(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  async getRaffleEntries() {

    const { data, error } = await supabase
      .from('raffle_entries')
      .select('id, number, participant_id, is_winner, purchased_at')
      .order('purchased_at', { ascending: false });
    if (error) {
      throw new Error('Error al obtener los números comprados');
    }

    return data;
  }

  async createNewRaffleEntriesFromOrder(orderNumber: string, quantity: number) {
    try {
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
      const { data: generated, error: generateError } = await supabase.rpc('generate_raffle_numbers', {
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

      return {
        success: true,
        assigned: generated.map((g: any) => g.generated_number),
        total_assigned: generated.length,
        raffle_id: raffleId
      };

    } catch (error) {
      console.error('Error en createNewRaffleEntriesFromOrder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const raffleService = new RaffleService()