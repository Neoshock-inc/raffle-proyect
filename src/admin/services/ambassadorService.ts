import { supabase } from "../lib/supabaseTenantClient"
import { buildReferralLink } from "../utils/tenantUrl"
import type { Ambassador, AmbassadorInput, AmbassadorStats } from "../types/ambassador"

export const setTenantContext = (tenantId: string | null, isAdmin: boolean = false) => {
    supabase.setTenantContext(tenantId, isAdmin);
};

export async function createAmbassador(input: AmbassadorInput) {
    const { tenantId } = supabase.getTenantContext();

    if (input.email) {
        const { data: existing } = await supabase
            .from('ambassadors')
            .select('id')
            .eq('email', input.email)
            .limit(1)
            .maybeSingle();

        if (existing) {
            throw new Error('email_already_exists');
        }
    }

    const { error } = await supabase.from('ambassadors').insert([
        {
            ...input,
            ambassador_code: input.ambassador_code.toUpperCase(),
            updated_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        if (error.code === '23505') {
            throw new Error('duplicate_ambassador_code');
        }
        throw error;
    }

    // Send verification email if email provided
    if (input.email) {
        try {
            const { data: createdAmbassador } = await supabase
                .from('ambassadors')
                .select('id')
                .eq('ambassador_code', input.ambassador_code.toUpperCase())
                .eq('email', input.email)
                .single();

            if (!createdAmbassador) return;

            const ambassadorLink = await buildReferralLink(input.ambassador_code);

            const { getTenantBaseUrl } = await import('../utils/tenantUrl');
            const baseUrl = await getTenantBaseUrl();
            const verifyUrl = `${baseUrl}/verifyuser?ambassadorId=${createdAmbassador.id}`;

            await fetch('/api/send-ambassador-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ambassadorId: createdAmbassador.id,
                    tenantId,
                    ambassadorLink,
                    verifyUrl,
                }),
            });
        } catch (apiError) {
            console.error('Error al enviar correo de verificación:', apiError);
        }
    }
}

export async function updateAmbassador(id: string, input: AmbassadorInput) {
    const { error } = await supabase
        .from('ambassadors')
        .update({
            ...input,
            ambassador_code: input.ambassador_code.toUpperCase(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) throw error
}

export const getAmbassadors = async (): Promise<Ambassador[]> => {
    const { data, error } = await supabase
        .from('ambassadors')
        .select(`
            *,
            referrals (
                id,
                name,
                is_active,
                invoices (
                    id,
                    total_price,
                    status,
                    participant_id
                )
            )
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (
        data?.map((ambassador: any) => {
            const teamReferrals = ambassador.referrals || []
            const teamCount = teamReferrals.length

            let totalTeamSales = 0
            teamReferrals.forEach((ref: any) => {
                const completedInvoices = ref.invoices?.filter((inv: any) =>
                    inv.status === 'completed' || inv.status === 'paid'
                ) || []
                totalTeamSales += completedInvoices.reduce((sum: number, inv: any) =>
                    sum + (parseFloat(inv.total_price) || 0), 0)
            })

            const totalPersonalCommission = totalTeamSales * ambassador.commission_rate
            const totalTeamCommission = totalTeamSales * ambassador.team_commission_rate

            return {
                ...ambassador,
                referrals: undefined,
                team_count: teamCount,
                total_team_sales: totalTeamSales,
                total_personal_commission: totalPersonalCommission,
                total_team_commission: totalTeamCommission,
            }
        }) || []
    )
}

export const deleteAmbassador = async (id: string) => {
    const { error } = await supabase
        .from('ambassadors')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export const toggleAmbassadorStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
        .from('ambassadors')
        .update({ is_active: !currentStatus })
        .eq('id', id)

    if (error) throw error
}

export async function getAmbassadorStatsByUser(userId: string): Promise<AmbassadorStats> {
    const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('id, commission_rate, team_commission_rate')
        .eq('user_id', userId)
        .single()

    if (ambassadorError || !ambassador) {
        throw new Error('No se encontró embajador para este usuario')
    }

    // Get team referrals
    const { data: teamReferrals, error: teamError } = await supabase
        .from('referrals')
        .select('id, commission_rate')
        .eq('ambassador_id', ambassador.id)

    if (teamError) throw new Error('Error al obtener equipo')

    const teamSize = teamReferrals?.length || 0

    // Get all invoices from team referrals
    let totalSales = 0
    let totalParticipants = new Set<string>()
    let completedCount = 0
    let pendingCount = 0

    if (teamReferrals && teamReferrals.length > 0) {
        const referralIds = teamReferrals.map((r: { id: string }) => r.id)

        const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('total_price, status, participant_id, referral_id')
            .in('referral_id', referralIds)

        if (invoiceError) throw new Error('Error al obtener ventas del equipo')

        const completed = invoices?.filter((i: any) => i.status === 'paid' || i.status === 'completed') || []
        const pending = invoices?.filter((i: any) => i.status !== 'paid' && i.status !== 'completed') || []

        totalSales = completed.reduce((sum: number, inv: any) => sum + (parseFloat(inv.total_price) || 0), 0)
        completed.forEach((i: any) => totalParticipants.add(i.participant_id))
        completedCount = completed.length
        pendingCount = pending.length
    }

    const totalPersonalCommission = totalSales * ambassador.commission_rate
    const totalTeamCommission = totalSales * ambassador.team_commission_rate

    return {
        totalSales,
        totalPersonalCommission,
        totalTeamCommission,
        totalCombinedCommission: totalPersonalCommission + totalTeamCommission,
        teamSize,
        totalParticipants: totalParticipants.size,
        completedCount,
        pendingCount,
    }
}

export async function getAmbassadorTeamByUser(userId: string) {
    const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', userId)
        .single()

    if (!ambassador) throw new Error('No se encontró embajador para este usuario')

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
        .eq('ambassador_id', ambassador.id)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((referido: any) => {
        const completedInvoices = referido.invoices?.filter((inv: any) =>
            inv.status === 'completed' || inv.status === 'paid'
        ) || []

        const totalSales = completedInvoices.reduce((sum: number, inv: any) =>
            sum + (parseFloat(inv.total_price) || 0), 0)

        const totalParticipants = completedInvoices.length > 0
            ? new Set(completedInvoices.map((inv: any) => inv.participant_id)).size
            : 0

        const totalCommission = totalSales * referido.commission_rate

        return {
            ...referido,
            invoices: undefined,
            total_participants: totalParticipants,
            total_sales: totalSales,
            total_commission: totalCommission,
        }
    })
}

export async function getAmbassadorParticipantsByUser(userId: string) {
    const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', userId)
        .single()

    if (!ambassador) throw new Error('No se encontró embajador para este usuario')

    const { data: teamReferrals } = await supabase
        .from('referrals')
        .select('id')
        .eq('ambassador_id', ambassador.id)

    if (!teamReferrals || teamReferrals.length === 0) return []

    const referralIds = teamReferrals.map((r: { id: string }) => r.id)

    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            full_name,
            email,
            total_price,
            status,
            created_at,
            referral_id,
            referrals (name, referral_code)
        `)
        .in('referral_id', referralIds)
        .order('created_at', { ascending: false })

    if (error) throw new Error('Error al obtener participantes')

    return data || []
}
