import { supabase } from "../lib/supabaseTenantClient"
import { buildReferralLink } from "../utils/tenantUrl"

export interface Referido {
    id: string
    referral_code: string
    name: string
    email?: string
    phone?: string
    commission_rate: number
    is_active: boolean
    created_at: string
    tenant_id?: string
    total_participants?: number
    total_sales?: number
    total_commission?: number
}

export interface ReferidoInput {
    name: string
    email?: string
    phone?: string
    referral_code: string
    commission_rate: number
    is_active: boolean
}

// NUEVA FUNCIÓN: Establecer contexto de tenant
export const setTenantContext = (tenantId: string | null, isAdmin: boolean = false) => {
    supabase.setTenantContext(tenantId, isAdmin);
    console.log('🔧 [REFERIDO-SERVICE] Tenant context set:', { tenantId, isAdmin });
};

export async function getCurrentUserId() {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) throw new Error('Usuario no autenticado')
    return data.user.id
}

export async function createReferido(input: ReferidoInput) {
    console.log('➕ [REFERIDO-SERVICE] Creating referido:', input.name);
    const { tenantId } = supabase.getTenantContext();

    if (input.email) {
        // Validar si el correo ya existe en referrals PARA ESTE TENANT
        const { data: existing, error: fetchError } = await supabase
            .from('referrals')
            .select('id')
            .eq('email', input.email)
            .limit(1)
            .maybeSingle();

        console.log('Existing referral check:', existing, fetchError);

        if (fetchError) {
            console.error('Error al validar email existente:', fetchError);
            throw fetchError;
        }

        if (existing) {
            throw new Error('email_already_exists');
        }
    }

    // El tenant_id se agregará automáticamente por el interceptor
    const { error } = await supabase.from('referrals').insert([
        {
            ...input,
            referral_code: input.referral_code.toUpperCase(),
            updated_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        if (error.code === '23505') {
            throw new Error('duplicate_referral_code');
        }
        throw error;
    }

    // Obtener el ID del referido recién creado para enviar verificación
    if (input.email) {
        try {
            // Buscar el referido recién creado
            const { data: createdReferral, error: fetchError } = await supabase
                .from('referrals')
                .select('id')
                .eq('referral_code', input.referral_code.toUpperCase())
                .eq('email', input.email)
                .single();

            if (fetchError || !createdReferral) {
                console.error('Error al obtener referido creado:', fetchError);
                return;
            }

            // Usar la nueva función para construir el enlace de referido
            const referralLink = await buildReferralLink(input.referral_code);

            // Para el enlace de verificación, también usar la URL del tenant
            const { getTenantBaseUrl } = await import('../utils/tenantUrl');
            const baseUrl = await getTenantBaseUrl();
            const verifyUrl = `${baseUrl}/verifyuser?referralId=${createdReferral.id}`;

            await fetch('/api/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    referralId: createdReferral.id,
                    tenantId,
                    referralLink,
                    verifyUrl,
                }),
            });
        } catch (apiError) {
            console.error('Error al enviar correo de verificación:', apiError);
        }
    }

    console.log('✅ [REFERIDO-SERVICE] Referido created successfully');
}

export async function updateReferido(id: string, input: ReferidoInput) {
    console.log('✏️ [REFERIDO-SERVICE] Updating referido:', id);

    const { error } = await supabase
        .from('referrals')
        .update({
            ...input,
            referral_code: input.referral_code.toUpperCase(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) throw error
    console.log('✅ [REFERIDO-SERVICE] Referido updated successfully');
}

export const getReferidos = async (): Promise<Referido[]> => {
    console.log('📋 [REFERIDO-SERVICE] Getting referidos...');
    const { tenantId, isAdmin } = supabase.getTenantContext();
    console.log('🔍 [REFERIDO-SERVICE] Current context:', { tenantId, isAdmin });

    // La tabla referrals tiene tenant_id directo, así que usamos el método normal
    const { data, error } = await supabase
        .from('referrals')
        .select(`
            *,
            invoices (
                id,
                total_price,
                status,
                participant_id
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ [REFERIDO-SERVICE] Error al obtener referidos:', error)
        throw error
    }

    console.log('✅ [REFERIDO-SERVICE] Referidos loaded:', data?.length || 0);

    return (
        data?.map((referido: any) => {
            // Filtrar solo las facturas completadas
            const completedInvoices = referido.invoices?.filter((inv: any) =>
                inv.status === 'completed' || inv.status === 'paid'
            ) || []

            const totalSales = completedInvoices.reduce((sum: number, inv: any) => {
                return sum + (parseFloat(inv.total_price) || 0)
            }, 0)

            const totalParticipants = completedInvoices.length > 0
                ? new Set(completedInvoices.map((inv: any) => inv.participant_id)).size
                : 0

            const totalCommission = totalSales * referido.commission_rate

            return {
                ...referido,
                total_participants: totalParticipants,
                total_sales: totalSales,
                total_commission: totalCommission
            }
        }) || []
    )
}

export const deleteReferido = async (id: string) => {
    console.log('🗑️ [REFERIDO-SERVICE] Deleting referido:', id);

    const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', id)

    if (error) throw error
    console.log('✅ [REFERIDO-SERVICE] Referido deleted successfully');
}

export const toggleReferidoStatus = async (id: string, currentStatus: boolean) => {
    console.log('🔄 [REFERIDO-SERVICE] Toggling referido status:', id);

    const { error } = await supabase
        .from('referrals')
        .update({ is_active: !currentStatus })
        .eq('id', id)

    if (error) throw error
    console.log('✅ [REFERIDO-SERVICE] Status toggled successfully');
}

export async function getReferralStatsByUser(userId: string) {
    console.log('📊 [REFERIDO-SERVICE] Getting referral stats for user:', userId);

    const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('id, commission_rate')
        .eq('referrer_user_id', userId)
        .single()

    if (referralError || !referral) {
        throw new Error('No se encontró referido para este usuario')
    }

    // Buscar todas las facturas asociadas a ese referral_id
    const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_price, status, participant_id')
        .eq('referral_id', referral.id)

    if (invoiceError) {
        throw new Error('Error al obtener ventas del referido')
    }

    const completed = invoices.filter((i: { status: string; total_price: string; participant_id: string }) => i.status === 'paid' || i.status === 'completed')
    const pending = invoices.filter((i: { status: string; total_price: string; participant_id: string }) => i.status !== 'paid' && i.status !== 'completed')

    const totalSales = completed.reduce((sum: number, inv: { status: string; total_price: string; participant_id: string }) => sum + (parseFloat(inv.total_price) || 0), 0)
    const totalCommission = totalSales * (referral.commission_rate ?? 0)
    const uniqueParticipants = new Set(completed.map((i: { status: string; total_price: string; participant_id: string }) => i.participant_id))

    return {
        totalSales,
        totalCommission,
        totalParticipants: uniqueParticipants.size,
        completedCount: completed.length,
        pendingCount: pending.length
    }
}

export async function getReferralParticipantsByUser(userId: string) {
    console.log('👥 [REFERIDO-SERVICE] Getting participants for user:', userId);

    const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_user_id', userId)
        .single()

    if (referralError || !referral) {
        throw new Error('No se encontró referido para este usuario')
    }

    // Las facturas tienen tenant_id directo
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            full_name,
            email,
            total_price,
            status,
            created_at
        `)
        .eq('referral_id', referral.id)
        .order('created_at', { ascending: false })

    if (error) throw new Error('Error al obtener participantes')

    return data
}