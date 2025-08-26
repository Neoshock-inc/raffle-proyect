import { useState, useEffect, useCallback } from 'react'
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
    const [page, setPage] = useState(1)

    // Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

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
    const loadData = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando
        if (tenantLoading) return

        try {
            setLoading(true)
            setError(null)

            console.log('🏆 [WINNERS] Loading data for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer el contexto de tenant antes de hacer consultas
            setTenantContext(currentTenant?.id || null, isAdmin)

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const [winnersData, rafflesData] = await Promise.all([
                getWinnersWithDetails(),
                getRaffles()
            ])

            setWinners(winnersData)
            setRaffles(rafflesData)

            console.log('✅ [WINNERS] Data loaded:', { winners: winnersData.length, raffles: rafflesData.length })
        } catch (err) {
            console.error('❌ [WINNERS] Error loading data:', err)
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

            console.log('🏆 [WINNERS] Loading winners by raffle for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer contexto antes de la consulta
            setTenantContext(currentTenant?.id || null, isAdmin)

            const data = await getWinnersByRaffle(raffleId)
            setWinners(data)
        } catch (err) {
            console.error('❌ [WINNERS] Error loading winners by raffle:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [currentTenant, isAdmin])

    // Marcar como ganador
    const markAsWinner = useCallback(async (entryId: string) => {
        try {
            setUpdating(true)

            console.log('🏆 [WINNERS] Marking as winner for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer contexto antes de la operación
            setTenantContext(currentTenant?.id || null, isAdmin)

            await setWinner(entryId)
            await loadData(true) // Recargar datos con force refresh
        } catch (err) {
            console.error('❌ [WINNERS] Error marking as winner:', err)
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

            console.log('🏆 [WINNERS] Unmarking winner for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer contexto antes de la operación
            setTenantContext(currentTenant?.id || null, isAdmin)

            await removeWinner(entryId)
            await loadData(true) // Recargar datos con force refresh
        } catch (err) {
            console.error('❌ [WINNERS] Error unmarking winner:', err)
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

            console.log('🏆 [WINNERS] Selecting random winner for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer contexto antes de la operación
            setTenantContext(currentTenant?.id || null, isAdmin)

            const winner = await selectRandomWinner(raffleId)
            await loadData(true) // Recargar datos con force refresh
            return winner
        } catch (err) {
            console.error('❌ [WINNERS] Error selecting random winner:', err)
            setError(err as Error)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [loadData, currentTenant, isAdmin])

    // Refrescar datos
    const refreshData = useCallback(() => {
        console.log('🔄 [WINNERS] Manual refresh triggered')
        loadData(true)
    }, [loadData])

    // Efecto para cargar datos cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [WINNERS] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            loadData(true) // Force refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, loadData])

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