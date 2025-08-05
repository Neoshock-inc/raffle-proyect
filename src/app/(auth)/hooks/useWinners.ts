import { useState, useEffect, useCallback } from 'react'
import { WinnerWithDetails, getWinnersWithDetails, getRaffles, getWinnersByRaffle, setWinner, removeWinner, selectRandomWinner } from '../services/winnersService'

const ITEMS_PER_PAGE = 10

export function useWinners(searchTerm: string = '', raffleFilter: string = '') {
    const [winners, setWinners] = useState<WinnerWithDetails[]>([])
    const [raffles, setRaffles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [updating, setUpdating] = useState(false)
    const [page, setPage] = useState(1)

    // Filtrar ganadores
    const filteredWinners = winners.filter(winner => {
        const matchesSearch = searchTerm === '' ||
            winner.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.participant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.raffle_title.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRaffle = raffleFilter === '' || winner.raffle_id === raffleFilter

        return matchesSearch && matchesRaffle
    })

    // Paginación
    const totalPages = Math.ceil(filteredWinners.length / ITEMS_PER_PAGE)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const paginatedWinners = filteredWinners.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const pagination = {
        page,
        totalPages,
        totalItems: filteredWinners.length,
        itemsPerPage: ITEMS_PER_PAGE
    }

    // Cargar datos
    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const [winnersData, rafflesData] = await Promise.all([
                getWinnersWithDetails(),
                getRaffles()
            ])

            setWinners(winnersData)
            setRaffles(rafflesData)
        } catch (err) {
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Cargar ganadores por rifa
    const loadWinnersByRaffle = useCallback(async (raffleId: string) => {
        try {
            setLoading(true)
            setError(null)
            const data = await getWinnersByRaffle(raffleId)
            setWinners(data)
        } catch (err) {
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Marcar como ganador
    const markAsWinner = useCallback(async (entryId: string) => {
        try {
            setUpdating(true)
            await setWinner(entryId)
            await loadData() // Recargar datos
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData])

    // Remover ganador
    const unmarkWinner = useCallback(async (entryId: string) => {
        try {
            setUpdating(true)
            await removeWinner(entryId)
            await loadData() // Recargar datos
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData])

    // Seleccionar ganador aleatorio
    const selectRandom = useCallback(async (raffleId: string) => {
        try {
            setUpdating(true)
            const winner = await selectRandomWinner(raffleId)
            await loadData() // Recargar datos
            return winner
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData])

    // Refrescar datos
    const refreshData = useCallback(() => {
        loadData()
    }, [loadData])

    // Cargar datos iniciales
    useEffect(() => {
        loadData()
    }, [loadData])

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setPage(1)
    }, [searchTerm, raffleFilter])

    return {
        winners: paginatedWinners,
        filteredWinners,
        raffles,
        pagination,
        setPage,
        loading,
        error,
        updating,
        markAsWinner,
        unmarkWinner,
        selectRandom,
        loadWinnersByRaffle,
        refreshData
    }
}