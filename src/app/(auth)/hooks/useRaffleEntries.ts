// src/hooks/useRaffleEntries.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { raffleService } from '../services/rafflesService'
import { useTenantContext } from '../contexts/TenantContext'
import { supabase } from '../lib/supabaseTenantClient'

const ITEMS_PER_PAGE = 10

export const useRaffleEntries = (searchTerm: string = '') => {
    const [raffleEntries, setRaffleEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Función para cargar entradas
    const fetchRaffleEntries = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando
        if (tenantLoading) return

        try {
            setLoading(true)
            console.log('🎫 [RAFFLE-ENTRIES] Loading entries for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer el contexto de tenant en el cliente Supabase
            supabase.setTenantContext(currentTenant?.id || null, isAdmin)

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const data = await raffleService.getRaffleEntries()
            setRaffleEntries(data)
            setError(null)

            console.log('✅ [RAFFLE-ENTRIES] Loaded entries:', data.length)
        } catch (err) {
            setError('Error al obtener entradas de rifa')
            console.error('❌ [RAFFLE-ENTRIES] Error:', err)
            toast.error('Error al cargar las entradas de rifa')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading, isAdmin])

    // Efecto para cargar entradas cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [RAFFLE-ENTRIES] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            fetchRaffleEntries(true) // Force refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, fetchRaffleEntries])

    // Filtrar entradas
    const filteredEntries = useMemo(() => {
        if (!searchTerm.trim()) return raffleEntries

        const term = searchTerm.toLowerCase().trim()
        return raffleEntries.filter((entry) =>
            `${entry.number}`.includes(term) ||
            new Date(entry.purchased_at).toLocaleDateString().includes(term)
        )
    }, [raffleEntries, searchTerm])

    // Reset page cuando cambia el search
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Calcular paginación
    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE))
    const validPage = Math.min(currentPage, totalPages)

    const pagination = useMemo(() => ({
        page: validPage,
        limit: ITEMS_PER_PAGE,
        totalPages
    }), [validPage, totalPages])

    // Entradas paginadas
    const paginatedEntries = useMemo(() => {
        const start = (validPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return filteredEntries.slice(start, end)
    }, [filteredEntries, validPage])

    // Funciones de acción
    const setPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    // Función para crear nueva entrada desde orden
    const createEntryFromOrder = useCallback(async (orderNumber: string, quantity: number) => {
        try {
            console.log('📝 [RAFFLE-ENTRIES] Creating entry from order for tenant:', currentTenant?.name || 'Global')

            // CRÍTICO: Establecer contexto antes de crear
            supabase.setTenantContext(currentTenant?.id || null, isAdmin)

            const result = await raffleService.createNewRaffleEntriesFromOrder(orderNumber, quantity)

            if (result.success) {
                toast.success(`Se asignaron ${result.total_assigned} números exitosamente`)
                await fetchRaffleEntries(true) // Refrescar la lista
            } else {
                toast.error(result.error || 'Error al crear las entradas')
            }

            return result
        } catch (err) {
            console.error('❌ [RAFFLE-ENTRIES] Error creating entry from order:', err)
            toast.error('Error al crear las entradas desde la orden')
            throw err
        }
    }, [currentTenant, isAdmin, fetchRaffleEntries])

    // Función refetch
    const refetch = useCallback(async () => {
        console.log('🔄 [RAFFLE-ENTRIES] Manual refresh triggered')
        await fetchRaffleEntries(true)
    }, [fetchRaffleEntries])

    return {
        loading: loading || tenantLoading,
        error,
        raffleEntries: filteredEntries,
        paginatedEntries,
        pagination,
        setPage,
        createEntryFromOrder,
        refetch
    }


}