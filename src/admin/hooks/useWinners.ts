// src/hooks/useWinners.ts - MIGRACIÓN MULTI-TENANT + HOOKS COMPARTIDOS
import { useState, useEffect, useCallback } from 'react'
import { usePaginatedFilter } from '@/hooks/shared'
import {
    WinnerWithDetails,
    getWinnersWithDetails,
    getRaffles,
    getWinnersByRaffle,
    setWinner,
    removeWinner,
    selectRandomWinner,
    setTenantContext
} from '../services/winnersService'
import { useTenantContext } from '../contexts/TenantContext'

const ITEMS_PER_PAGE = 10

export function useWinners(searchTerm: string = '', raffleFilter: string = '') {
    const [winners, setWinners] = useState<WinnerWithDetails[]>([])
    const [raffles, setRaffles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [updating, setUpdating] = useState(false)

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Pre-filtrar por rifa (antes de pasar a usePaginatedFilter)
    const raffleFilteredWinners = raffleFilter
        ? winners.filter(w => w.raffle_id === raffleFilter)
        : winners

    // Usar hook compartido para filtrado por texto y paginación
    const {
        paginated: paginatedWinners,
        filtered: filteredWinners,
        pagination,
        setPage
    } = usePaginatedFilter(
        raffleFilteredWinners,
        searchTerm,
        (winner, term) =>
            winner.participant_name.toLowerCase().includes(term) ||
            winner.participant_email.toLowerCase().includes(term) ||
            winner.number.toLowerCase().includes(term) ||
            winner.raffle_title.toLowerCase().includes(term),
        ITEMS_PER_PAGE
    )

    // Cargar datos
    const loadData = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return

        try {
            setLoading(true)
            setError(null)
            setTenantContext(currentTenant?.id || null, isAdmin)

            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const [winnersData, rafflesData] = await Promise.all([
                getWinnersWithDetails(),
                getRaffles()
            ])

            setWinners(winnersData)
            setRaffles(rafflesData)
        } catch (err) {
            console.error('Error loading winners:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [currentTenant, isAdmin, tenantLoading])

    // Cargar ganadores por rifa
    const loadWinnersByRaffle = useCallback(async (raffleId: string) => {
        try {
            setLoading(true)
            setError(null)
            setTenantContext(currentTenant?.id || null, isAdmin)
            const data = await getWinnersByRaffle(raffleId)
            setWinners(data)
        } catch (err) {
            console.error('Error loading winners by raffle:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [currentTenant, isAdmin])

    // Marcar como ganador
    const markAsWinner = useCallback(async (entryId: string) => {
        try {
            setUpdating(true)
            setTenantContext(currentTenant?.id || null, isAdmin)
            await setWinner(entryId)
            await loadData(true)
        } catch (err) {
            console.error('Error marking as winner:', err)
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData, currentTenant, isAdmin])

    // Remover ganador
    const unmarkWinner = useCallback(async (entryId: string) => {
        try {
            setUpdating(true)
            setTenantContext(currentTenant?.id || null, isAdmin)
            await removeWinner(entryId)
            await loadData(true)
        } catch (err) {
            console.error('Error unmarking winner:', err)
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData, currentTenant, isAdmin])

    // Seleccionar ganador aleatorio
    const selectRandom = useCallback(async (raffleId: string) => {
        try {
            setUpdating(true)
            setTenantContext(currentTenant?.id || null, isAdmin)
            const winner = await selectRandomWinner(raffleId)
            await loadData(true)
            return winner
        } catch (err) {
            console.error('Error selecting random winner:', err)
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData, currentTenant, isAdmin])

    const refreshData = useCallback(() => {
        loadData(true)
    }, [loadData])

    // Efecto para cargar datos cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            loadData(true)
        }
    }, [currentTenant?.id, tenantLoading, loadData])

    return {
        winners: paginatedWinners,
        filteredWinners,
        raffles,
        pagination,
        setPage,
        loading: loading || tenantLoading,
        error,
        updating,
        markAsWinner,
        unmarkWinner,
        selectRandom,
        loadWinnersByRaffle,
        refreshData
    }
}
