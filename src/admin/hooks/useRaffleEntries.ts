// src/hooks/useRaffleEntries.ts - MIGRACIÓN MULTI-TENANT + HOOKS COMPARTIDOS
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { raffleService } from '../services/rafflesService'
import { useTenantContext } from '../contexts/TenantContext'
import { supabase } from '../lib/supabaseTenantClient'
import { usePaginatedFilter } from '@/hooks/shared'

const ITEMS_PER_PAGE = 10

export const useRaffleEntries = (searchTerm: string = '') => {
    const [raffleEntries, setRaffleEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Usar hook compartido para filtrado y paginación
    const { paginated: paginatedEntries, filtered: filteredEntries, pagination, setPage } = usePaginatedFilter(
        raffleEntries,
        searchTerm,
        (entry, term) =>
            `${entry.number}`.includes(term) ||
            new Date(entry.purchased_at).toLocaleDateString().includes(term),
        ITEMS_PER_PAGE
    )

    // Función para cargar entradas
    const fetchRaffleEntries = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return

        try {
            setLoading(true)
            supabase.setTenantContext(currentTenant?.id || null, isAdmin)

            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const data = await raffleService.getRaffleEntries()
            setRaffleEntries(data)
            setError(null)
        } catch (err) {
            setError('Error al obtener entradas de rifa')
            console.error('Error loading raffle entries:', err)
            toast.error('Error al cargar las entradas de rifa')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading, isAdmin])

    // Efecto para cargar entradas cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            fetchRaffleEntries(true)
        }
    }, [currentTenant?.id, tenantLoading, fetchRaffleEntries])

    // Función para crear nueva entrada desde orden
    const createEntryFromOrder = useCallback(async (orderNumber: string, quantity: number) => {
        try {
            supabase.setTenantContext(currentTenant?.id || null, isAdmin)
            const result = await raffleService.createNewRaffleEntriesFromOrder(orderNumber, quantity)

            if (result.success) {
                toast.success(`Atención: ${result.message || 'Entradas creadas exitosamente'}`)
                await fetchRaffleEntries(true)
            } else {
                toast.error(result.error || 'Error al crear las entradas')
            }

            return result
        } catch (err) {
            console.error('Error creating entry from order:', err)
            toast.error('Error al crear las entradas desde la orden')
            throw err
        }
    }, [currentTenant, isAdmin, fetchRaffleEntries])

    const refetch = useCallback(async () => {
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
