// src/app/services/invoicesService.ts
import { supabase, supabaseOriginal } from '../(auth)/lib/supabaseTenantClient';
import { Invoice, InvoiceCreationData } from '../types/invoices';

/**
 * Obtiene todas las facturas con contexto de tenant
 * @returns Lista de facturas filtradas por tenant
 */
export const getInvoicesList = async (): Promise<Invoice[]> => {
    try {
        console.log('📄 Getting invoices list...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context:', { tenantId, isAdmin });

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching invoices:', error);
            throw new Error(error.message);
        }

        console.log('✅ Invoices fetched:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('❌ Error in getInvoicesList:', error);
        throw error;
    }
};

/**
 * Obtiene una factura específica por su ID
 * @param invoiceId ID de la factura
 * @returns La factura solicitada
 */
export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
    try {
        console.log('📄 Getting invoice by ID:', invoiceId);

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (error) {
            console.error('❌ Error fetching invoice:', error);
            throw new Error(error.message);
        }

        console.log('✅ Invoice fetched:', data?.id);
        return data;
    } catch (error) {
        console.error('❌ Error in getInvoiceById:', error);
        throw error;
    }
};

/**
 * Obtiene todas las facturas de un participante específico
 * @param participantId ID del participante
 * @returns Lista de facturas del participante
 */
export const getInvoicesByParticipant = async (participantId: string): Promise<Invoice[]> => {
    try {
        console.log('📄 Getting invoices by participant:', participantId);

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching participant invoices:', error);
            throw new Error(error.message);
        }

        console.log('✅ Participant invoices fetched:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('❌ Error in getInvoicesByParticipant:', error);
        throw error;
    }
};

/**
 * Busca un participante por email, o lo crea si no existe
 * @param email Email del participante
 * @param name Nombre del participante (opcional, usado en caso de crear uno nuevo)
 * @returns El ID del participante encontrado o creado
 */
export const findOrCreateParticipant = async (email: string, name?: string): Promise<string> => {
    try {
        console.log('👤 Finding or creating participant:', email);

        // Primero intentamos encontrar el participante por email
        const { data: existingParticipant, error: searchError } = await supabase
            .from('participants')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        // Si el participante existe, retornamos su ID
        if (existingParticipant) {
            console.log('✅ Participant found:', existingParticipant.id);
            return existingParticipant.id;
        }

        // Si no existe, creamos un nuevo participante
        const { data: newParticipant, error: insertError } = await supabase
            .from('participants')
            .insert([{ email, name: name || email.split('@')[0] }])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error creating participant:', insertError);
            throw new Error(insertError.message);
        }

        console.log('✅ Participant created:', newParticipant.id);
        return newParticipant.id;
    } catch (error) {
        console.error('❌ Error in findOrCreateParticipant:', error);
        throw error;
    }
};

/**
 * Crea una nueva factura, primero asegurándose de que exista el participante
 * @param invoiceData Datos de la factura a crear
 * @returns La factura creada
 */
export const createInvoiceWithParticipant = async (invoiceData: Omit<InvoiceCreationData, 'participantId'>): Promise<Invoice> => {
    try {
        console.log('📝 Creating invoice with participant for:', invoiceData.email);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context during creation:', { tenantId, isAdmin });

        // Encontrar o crear el participante primero
        const participantId = await findOrCreateParticipant(invoiceData.email, invoiceData.fullName);

        // Luego crear la factura con el ID del participante
        const completeInvoiceData = {
            ...invoiceData,
            participantId
        };

        const result = await createInvoice(completeInvoiceData);
        console.log('✅ Invoice with participant created:', result.id);
        return result;
    } catch (error) {
        console.error('❌ Error in createInvoiceWithParticipant:', error);
        throw error;
    }
};

/**
 * Crea una nueva factura con contexto de tenant
 * @param invoiceData Datos de la factura a crear
 * @returns La factura creada
 */
export const createInvoice = async (invoiceData: InvoiceCreationData): Promise<Invoice> => {
    try {
        console.log('📝 Creating invoice...');
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context during invoice creation:', { tenantId, isAdmin });

        let referralId: string | null = null;

        if (invoiceData.referral_code) {
            const { data: referral, error: referralError } = await supabase
                .from("referrals")
                .select("id")
                .eq("referral_code", invoiceData.referral_code.toUpperCase())
                .single();

            if (referralError) {
                console.warn("⚠️ Código de referido no encontrado:", invoiceData.referral_code);
            } else {
                referralId = referral.id;
                console.log('✅ Referral found:', referralId);
            }
        }

        const newInvoice = {
            order_number: invoiceData.orderNumber,
            full_name: invoiceData.fullName,
            email: invoiceData.email,
            phone: invoiceData.phone,
            country: invoiceData.country,
            province: invoiceData.province,
            status: invoiceData.status,
            city: invoiceData.city,
            address: invoiceData.address,
            payment_method: invoiceData.paymentMethod,
            amount: invoiceData.amount,
            total_price: invoiceData.totalPrice,
            participant_id: invoiceData.participantId,
            referral_id: referralId
        };

        const { data, error } = await supabase
            .from('invoices')
            .insert([newInvoice])
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating invoice:', error);
            throw new Error(error.message);
        }

        console.log('✅ Invoice created:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Error in createInvoice:', error);
        throw error;
    }
};

/**
 * Actualiza una factura existente con contexto de tenant
 * @param invoiceId ID de la factura a actualizar
 * @param invoiceData Datos a actualizar
 * @returns La factura actualizada
 */
export const updateInvoice = async (
    invoiceId: string,
    invoiceData: Partial<InvoiceCreationData>
): Promise<Invoice> => {
    try {
        console.log('✏️ Updating invoice:', invoiceId);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context during update:', { tenantId, isAdmin });

        // Convertir nombres de propiedades al formato de la base de datos
        const updateData: any = {};
        if (invoiceData.orderNumber !== undefined) updateData.order_number = invoiceData.orderNumber;
        if (invoiceData.fullName !== undefined) updateData.full_name = invoiceData.fullName;
        if (invoiceData.email !== undefined) updateData.email = invoiceData.email;
        if (invoiceData.phone !== undefined) updateData.phone = invoiceData.phone;
        if (invoiceData.country !== undefined) updateData.country = invoiceData.country;
        if (invoiceData.province !== undefined) updateData.province = invoiceData.province;
        if (invoiceData.city !== undefined) updateData.city = invoiceData.city;
        if (invoiceData.address !== undefined) updateData.address = invoiceData.address;
        if (invoiceData.paymentMethod !== undefined) updateData.payment_method = invoiceData.paymentMethod;
        if (invoiceData.amount !== undefined) updateData.amount = invoiceData.amount;
        if (invoiceData.totalPrice !== undefined) updateData.total_price = invoiceData.totalPrice;
        if (invoiceData.participantId !== undefined) updateData.participant_id = invoiceData.participantId;
        if (invoiceData.status !== undefined) updateData.status = invoiceData.status;

        const { data, error } = await supabase
            .from('invoices')
            .update(updateData)
            .eq('id', invoiceId)
            .select()
            .single();

        if (error) {
            console.error('❌ Error updating invoice:', error);
            throw new Error(error.message);
        }

        console.log('✅ Invoice updated:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Error in updateInvoice:', error);
        throw error;
    }
};

/**
 * Elimina una factura con contexto de tenant
 * @param invoiceId ID de la factura a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteInvoice = async (invoiceId: string): Promise<boolean> => {
    try {
        console.log('🗑️ Deleting invoice:', invoiceId);
        const { tenantId, isAdmin } = supabase.getTenantContext();
        console.log('🔍 Current context during deletion:', { tenantId, isAdmin });

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoiceId);

        if (error) {
            console.error('❌ Error deleting invoice:', error);
            throw new Error(error.message);
        }

        console.log('✅ Invoice deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Error in deleteInvoice:', error);
        throw error;
    }
};

/**
 * Genera un número de orden secuencial usando RPC
 * @returns Número de orden para la nueva factura
 */
export const generateOrderNumber = async (): Promise<string> => {
    try {
        console.log('🔢 Generating order number...');

        const { data, error } = await supabaseOriginal.rpc('generate_order_number');

        if (error) {
            console.error('❌ Error generating order number:', error);
            throw error;
        }

        console.log('✅ Order number generated:', data);
        return data as string;
    } catch (error) {
        console.error('❌ Error in generateOrderNumber:', error);
        throw error;
    }
};

export interface GenerateNumbersParams {
    name: string;
    email: string;
    amount: number;
    orderNumber?: string; // Para identificar la transacción
}

export interface GenerateNumbersResponse {
    success: boolean;
    assigned?: number[];
    total_assigned?: number;
    raffle_id?: string;
    error?: string;
    details?: string;
}

/**
 * Genera números de rifa para un participante después de una compra validada
 * @param params Parámetros necesarios para generar los números
 * @returns Respuesta con los números asignados o error
 */
export const generateRaffleNumbers = async (params: GenerateNumbersParams): Promise<GenerateNumbersResponse> => {
    try {
        const { name, email, amount, orderNumber } = params;

        // 1. Obtener rifa activa
        const { data: raffle, error: raffleError } = await supabase
            .from('raffles')
            .select('id, total_numbers')
            .eq('is_active', true)
            .single();

        if (raffleError || !raffle) {
            return {
                success: false,
                error: 'No hay una rifa activa disponible'
            };
        }

        const raffleId = raffle.id;
        const maxNumber = raffle.total_numbers || 99999;

        // 2. Verificar o crear participante
        const { data: existingParticipant } = await supabase
            .from('participants')
            .select('id')
            .eq('email', email)
            .single();

        let participantId = existingParticipant?.id;

        if (!participantId) {
            const { data: newParticipant, error: participantError } = await supabase
                .from('participants')
                .insert({ name, email })
                .select()
                .single();

            if (participantError || !newParticipant) {
                return {
                    success: false,
                    error: 'Error al crear participante'
                };
            }

            participantId = newParticipant.id;
        }

        // 3. Verificar disponibilidad de números
        const { data: usedEntries, error: usedError } = await supabase
            .from('raffle_entries')
            .select('number')
            .eq('raffle_id', raffleId);

        if (usedError) {
            console.error('Error al obtener números usados:', usedError);
            return {
                success: false,
                error: 'Error al verificar números disponibles'
            };
        }

        const usedCount = usedEntries?.length || 0;
        const requestedAmount = parseInt(amount.toString());

        if (isNaN(requestedAmount) || requestedAmount <= 0) {
            return {
                success: false,
                error: 'Cantidad inválida'
            };
        }

        if (maxNumber - usedCount < requestedAmount) {
            return {
                success: false,
                error: `No hay suficientes números disponibles. Solicitados: ${requestedAmount}, Disponibles: ${maxNumber - usedCount}`
            };
        }

        // 4. Llamar procedimiento almacenado para generar números
        const { data: generated, error: rpcError } = await supabase.rpc('generate_raffle_numbers', {
            in_participant_id: participantId,
            in_raffle_id: raffleId,
            in_amount: requestedAmount
        });

        if (rpcError || !generated || generated.length !== requestedAmount) {
            console.error('Error al generar números:', rpcError);
            return {
                success: false,
                error: 'Error al generar números',
                details: rpcError?.message
            };
        }

        // 5. Opcional: Actualizar con orderNumber si se proporciona
        if (orderNumber) {
            const { error: updateError } = await supabase
                .from('raffle_entries')
                .update({ order_number: orderNumber })
                .eq('participant_id', participantId)
                .eq('raffle_id', raffleId)
                .in('number', generated.map((n: any) => n.generated_number));

            if (updateError) {
                console.warn('⚠️ No se pudo actualizar order_number:', updateError);
            }
        }

        return {
            success: true,
            assigned: generated.map((n: any) => n.generated_number),
            total_assigned: generated.length,
            raffle_id: raffleId
        };

    } catch (error) {
        console.error('Error general en generateRaffleNumbers:', error);
        return {
            success: false,
            error: 'Error inesperado',
            details: error instanceof Error ? error.message : String(error)
        };
    }
};

/**
 * Verifica si ya existen números generados para un participante y rifa específica
 * @param email Email del participante
 * @param raffleId ID de la rifa (opcional, usa la rifa activa por defecto)
 * @returns Lista de números ya asignados al participante
 */
export const getParticipantNumbers = async (email: string, raffleId?: string): Promise<number[]> => {
    try {
        let query = supabase
            .from('raffle_entries')
            .select('number')
            .eq('participants.email', email);

        if (raffleId) {
            query = query.eq('raffle_id', raffleId);
        } else {
            // Obtener rifa activa
            const { data: raffle } = await supabase
                .from('raffles')
                .select('id')
                .eq('is_active', true)
                .single();

            if (raffle) {
                query = query.eq('raffle_id', raffle.id);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al obtener números del participante:', error);
            return [];
        }

        return data?.map((entry: { number: any; }) => entry.number) || [];
    } catch (error) {
        console.error('Error en getParticipantNumbers:', error);
        return [];
    }
};