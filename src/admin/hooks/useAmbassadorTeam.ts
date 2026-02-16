'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { authService } from '../services/authService'
import {
    getAmbassadorStatsByUser,
    getAmbassadorTeamByUser,
    getAmbassadorParticipantsByUser,
} from '../services/ambassadorService'
import { getAmbassadorCode } from '../services/ambassadorAuthService'
import { numberPoolService } from '../services/numberPoolService'
import type { AmbassadorStats } from '../types/ambassador'

export function useAmbassadorTeam() {
    const [userId, setUserId] = useState<string | null>(null)
    const [ambassadorCode, setAmbassadorCode] = useState<string | null>(null)
    const [stats, setStats] = useState<AmbassadorStats | null>(null)
    const [team, setTeam] = useState<any[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [numbers, setNumbers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const user = await authService.getUser()
            if (!user) return
            setUserId(user.id)

            const [code, statsData, teamData, participantsData] = await Promise.all([
                getAmbassadorCode(user.id),
                getAmbassadorStatsByUser(user.id).catch(() => null),
                getAmbassadorTeamByUser(user.id).catch(() => []),
                getAmbassadorParticipantsByUser(user.id).catch(() => []),
            ])

            setAmbassadorCode(code)
            setStats(statsData)
            setTeam(teamData)
            setParticipants(participantsData)

            // Load numbers if we have an ambassador record
            if (user.id) {
                try {
                    const { createClient } = await import('@supabase/supabase-js')
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    )
                    const { data: ambassador } = await supabase
                        .from('ambassadors')
                        .select('id')
                        .eq('user_id', user.id)
                        .single()

                    if (ambassador) {
                        const numbersData = await numberPoolService.getAssignmentsByAmbassador(ambassador.id)
                        setNumbers(numbersData)
                    }
                } catch (err) {
                    console.error('Error loading ambassador numbers:', err)
                }
            }
        } catch (error) {
            console.error('Error loading ambassador data:', error)
            toast.error('Error al cargar datos del embajador')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    return {
        userId,
        ambassadorCode,
        stats,
        team,
        participants,
        numbers,
        loading,
        refreshData: loadData,
    }
}
