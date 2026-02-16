export interface Ambassador {
    id: string
    tenant_id: string
    user_id?: string
    name: string
    email?: string
    phone?: string
    ambassador_code: string
    commission_rate: number
    team_commission_rate: number
    is_active: boolean
    max_referrals: number
    created_at: string
    updated_at: string
    // Computed stats (from joins)
    team_count?: number
    total_team_sales?: number
    total_personal_commission?: number
    total_team_commission?: number
}

export interface AmbassadorInput {
    name: string
    email?: string
    phone?: string
    ambassador_code: string
    commission_rate: number
    team_commission_rate: number
    is_active: boolean
    max_referrals: number
}

export interface AmbassadorStats {
    totalSales: number
    totalPersonalCommission: number
    totalTeamCommission: number
    totalCombinedCommission: number
    teamSize: number
    totalParticipants: number
    completedCount: number
    pendingCount: number
}

export interface AmbassadorNumberAssignment {
    id: string
    ambassador_id: string
    raffle_id: string
    tenant_id: string
    range_start: number
    range_end: number
    status: 'assigned' | 'returned'
    assigned_at: string
    returned_at?: string
    ambassador?: {
        id: string
        name: string
        ambassador_code: string
    }
    raffle?: {
        id: string
        title: string
        raffle_type: string
        status: string
    }
}
