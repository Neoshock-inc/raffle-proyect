
// src/hooks/useRaffleThemes.ts

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { raffleService } from '../services/rafflesService'
import type { RaffleTheme } from '../types/raffle'

export const useRaffleThemes = () => {
    const [themes, setThemes] = useState<RaffleTheme[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchThemes = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const themesData = await raffleService.getThemes()
            setThemes(themesData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar temas'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchThemes()
    }, [fetchThemes])

    return {
        themes,
        loading,
        error,
        refetch: fetchThemes
    }
}