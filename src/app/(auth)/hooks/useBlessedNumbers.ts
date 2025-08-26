'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTenantContext } from '../contexts/TenantContext'
import {
    BlessedNumber,
    Raffle,
    CreateBlessedNumberData,
    UpdateBlessedNumberData,
    getBlessedNumbers,
    updateBlessedNumber,
    getRaffles,
    createBlessedNumbers,
    deleteBlessedNumber,
    getParticipants,
    setTenantContext
} from '../services/blessedService'

export const ITEMS_PER_PAGE = 10

export function useBlessedNumbers(searchTerm: string = '') {
    const [data, setData] = useState<BlessedNumber[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [page, setPage] = useState(1)
    const [raffles, setRaffles] = useState<Raffle[]>([])
    const [selectedRaffleId, setSelectedRaffleId] = useState<string>('')
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [participants, setParticipants] = useState<any[]>([])

    // Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Obtener la rifa seleccionada
    const selectedRaffle = raffles.find(r => r.id === selectedRaffleId) || null

    const filteredData = data.filter((item) =>
        item.number.includes(searchTerm) ||
        (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    // Cargar rifas disponibles
    const loadRaffles = useCallback(async () => {
        if (tenantLoading) return

        try {
            console.log('📋 [BLESSED-HOOK] Loading raffles for tenant:', currentTenant?.name || 'Global')
            setTenantContext(currentTenant?.id || null, isAdmin)

            const rafflesList = await getRaffles()
            setRaffles(rafflesList)

            // Si hay rifas disponibles y no hay una seleccionada, seleccionar la primera
            if (rafflesList.length > 0 && !selectedRaffleId) {
                setSelectedRaffleId(rafflesList[0].id)
            }

            return rafflesList
        } catch (e) {
            setError(e as Error)
            return []
        }
    }, [currentTenant, isAdmin, tenantLoading, selectedRaffleId])

    // Cargar datos de números bendecidos
    const fetchData = useCallback(async () => {
        if (tenantLoading || !selectedRaffleId) return

        setLoading(true)
        setError(null)
        try {
            console.log('✨ [BLESSED-HOOK] Loading data for raffle:', selectedRaffleId)
            setTenantContext(currentTenant?.id || null, isAdmin)

            const [numbers, participantsList] = await Promise.all([
                getBlessedNumbers(selectedRaffleId),
                getParticipants()
            ])

            setData(numbers)
            setParticipants(participantsList)
        } catch (e) {
            setError(e as Error)
        } finally {
            setLoading(false)
        }
    }, [selectedRaffleId, currentTenant, isAdmin, tenantLoading])

    // Cargar rifas al inicio o cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            loadRaffles()
        }
    }, [currentTenant?.id, tenantLoading, isAdmin])

    // Cargar datos cuando se seleccione una rifa
    useEffect(() => {
        if (selectedRaffleId) {
            fetchData()
        }
    }, [selectedRaffleId, fetchData])

    // Cambiar de rifa
    const changeRaffle = useCallback((raffleId: string) => {
        console.log('🔄 [BLESSED-HOOK] Changing to raffle:', raffleId)
        setSelectedRaffleId(raffleId)
        setPage(1) // Resetear paginación
    }, [])

    const toggleClaimed = useCallback(
        async (id: string) => {
            const item = data.find(d => d.id === id)
            if (!item) return

            try {
                setTenantContext(currentTenant?.id || null, isAdmin)
                const updated = await updateBlessedNumber(id, { is_claimed: !item.is_claimed })
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? updated : item
                    )
                )
            } catch (e) {
                setError(e as Error)
            }
        },
        [data, currentTenant, isAdmin]
    )

    const createNew = useCallback(
        async (createData: Omit<CreateBlessedNumberData, 'raffle_id'>) => {
            if (!selectedRaffleId) {
                throw new Error('No hay una rifa seleccionada')
            }

            setCreating(true)
            setError(null)
            try {
                console.log('➕ [BLESSED-HOOK] Creating blessed numbers for raffle:', selectedRaffleId)
                setTenantContext(currentTenant?.id || null, isAdmin)

                const fullCreateData: CreateBlessedNumberData = {
                    ...createData,
                    raffle_id: selectedRaffleId
                }

                const newBlessedNumbers = await createBlessedNumbers(fullCreateData)
                setData((prev) => [...prev, ...newBlessedNumbers].sort((a, b) => a.number.localeCompare(b.number)))
                return newBlessedNumbers
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setCreating(false)
            }
        },
        [selectedRaffleId, currentTenant, isAdmin]
    )

    const deleteNumber = useCallback(
        async (id: string) => {
            setDeleting(true)
            setError(null)
            try {
                setTenantContext(currentTenant?.id || null, isAdmin)
                await deleteBlessedNumber(id)
                setData((prev) => prev.filter((item) => item.id !== id))
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setDeleting(false)
            }
        },
        [currentTenant, isAdmin]
    )

    const updateNumber = useCallback(
        async (id: string, updates: UpdateBlessedNumberData) => {
            try {
                setTenantContext(currentTenant?.id || null, isAdmin)
                const updated = await updateBlessedNumber(id, updates)
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? updated : item
                    )
                )
                return updated
            } catch (e) {
                setError(e as Error)
                throw e
            }
        },
        [currentTenant, isAdmin]
    )

    const assignParticipant = useCallback(
        async (id: string, participantId: string | null) => {
            return updateNumber(id, { assigned_to: participantId })
        },
        [updateNumber]
    )

    const refreshData = useCallback(async () => {
        console.log('🔄 [BLESSED-HOOK] Manual refresh triggered')
        await loadRaffles()
        if (selectedRaffleId) {
            await fetchData()
        }
    }, [loadRaffles, fetchData, selectedRaffleId])

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setPage(1)
    }, [searchTerm])

    return {
        // Datos existentes
        paginatedBlessed: paginatedData,
        filteredBlessed: filteredData,
        pagination: {
            page,
            totalPages,
            itemsPerPage: ITEMS_PER_PAGE,
            totalItems: filteredData.length
        },
        loading: loading || tenantLoading,
        error,
        setPage,
        toggleClaimed,

        // Gestión de rifas
        raffles,
        selectedRaffleId,
        selectedRaffle,
        changeRaffle,

        // Funcionalidades
        creating,
        deleting,
        createNew,
        deleteNumber,
        updateNumber,
        assignParticipant,
        participants,
        refreshData
    }
}