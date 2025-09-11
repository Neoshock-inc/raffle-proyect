// src/hooks/useBlessedNumbers.ts - MIGRACIÓN MULTI-TENANT
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext'
import {
    BlessedNumber,
    Raffle,
    CreateBlessedNumberData,
    UpdateBlessedNumberInput,
    getBlessedNumbers,
    updateBlessedNumber,
    getRaffles,
    createBlessedNumbers,
    deleteBlessedNumber,
    getParticipants
} from '../services/blessedService'

export const ITEMS_PER_PAGE = 10

export function useBlessedNumbers(searchTerm: string = '') {
    const [data, setData] = useState<BlessedNumber[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [raffles, setRaffles] = useState<Raffle[]>([])
    const [selectedRaffleId, setSelectedRaffleId] = useState<string>('')
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [participants, setParticipants] = useState<any[]>([])

    // AGREGAR: Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Obtener la rifa seleccionada
    const selectedRaffle = raffles.find(r => r.id === selectedRaffleId) || null

    // Filtrar números bendecidos
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data

        const term = searchTerm.toLowerCase().trim()
        return data.filter((item) =>
            item.number.includes(term) ||
            (item.name?.toLowerCase().includes(term) ?? false) ||
            (item.email?.toLowerCase().includes(term) ?? false)
        )
    }, [data, searchTerm])

    // Reset page cuando cambia el search
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Calcular paginación
    const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
    const validPage = Math.min(currentPage, totalPages)

    const pagination = useMemo(() => ({
        page: validPage,
        totalPages,
        itemsPerPage: ITEMS_PER_PAGE,
        totalItems: filteredData.length
    }), [validPage, totalPages, filteredData.length])

    // Números paginados
    const paginatedData = useMemo(() => {
        const start = (validPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return filteredData.slice(start, end)
    }, [filteredData, validPage])

    // Función para cargar rifas
    const fetchRaffles = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando
        if (tenantLoading) return

        try {
            console.log('📋 [BLESSED-HOOK] Loading raffles for tenant:', currentTenant?.name || 'Global')

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const rafflesList = await getRaffles()
            setRaffles(rafflesList)

            // Si hay rifas disponibles y no hay una seleccionada, seleccionar la primera activa o la primera
            if (rafflesList.length > 0 && !selectedRaffleId) {
                const activeRaffle = rafflesList.find(r => r.is_active)
                const targetRaffle = activeRaffle || rafflesList[0]
                setSelectedRaffleId(targetRaffle.id)
            }

            console.log('✅ [BLESSED-HOOK] Loaded raffles:', rafflesList.length)
            return rafflesList
        } catch (err) {
            setError('Error al obtener rifas')
            console.error('❌ [BLESSED-HOOK] Error loading raffles:', err)
            toast.error('Error al cargar las rifas')
            return []
        }
    }, [currentTenant, tenantLoading, selectedRaffleId])

    // Función para cargar números bendecidos
    const fetchBlessedNumbers = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando o no hay rifa seleccionada
        if (tenantLoading || !selectedRaffleId) return

        try {
            setLoading(true)
            console.log('✨ [BLESSED-HOOK] Loading blessed numbers for tenant:', currentTenant?.name || 'Global', 'raffle:', selectedRaffleId)

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const [numbers, participantsList] = await Promise.all([
                getBlessedNumbers(selectedRaffleId),
                getParticipants()
            ])

            setData(numbers)
            setParticipants(participantsList)
            setError(null)

            console.log('✅ [BLESSED-HOOK] Loaded blessed numbers:', numbers.length)
        } catch (err) {
            setError('Error al obtener números bendecidos')
            console.error('❌ [BLESSED-HOOK] Error loading blessed numbers:', err)
            toast.error('Error al cargar los números bendecidos')
        } finally {
            setLoading(false)
        }
    }, [selectedRaffleId, currentTenant, tenantLoading])

    // Efecto para cargar rifas cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [BLESSED-HOOK] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            fetchRaffles(true) // Force refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, fetchRaffles])

    // Efecto para cargar números cuando cambie la rifa seleccionada
    useEffect(() => {
        if (selectedRaffleId && !tenantLoading) {
            fetchBlessedNumbers(true) // Force refresh cuando cambie la rifa
        }
    }, [selectedRaffleId, currentTenant?.id, tenantLoading, fetchBlessedNumbers])

    // Función para cambiar de rifa
    const changeRaffle = useCallback((raffleId: string) => {
        console.log('🔄 [BLESSED-HOOK] Changing to raffle:', raffleId)
        setSelectedRaffleId(raffleId)
        setCurrentPage(1) // Resetear paginación
    }, [])

    // Funciones de acción
    const setPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    // Función toggle claimed actualizada
    const toggleClaimed = useCallback(async (id: string) => {
        const item = data.find(d => d.id === id)
        if (!item) return

        try {
            console.log('🔄 [BLESSED-HOOK] Toggling claimed status for:', id)

            const input: UpdateBlessedNumberInput = {
                id,
                is_claimed: !item.is_claimed
            }

            const updated = await updateBlessedNumber(input)
            setData(prev => prev.map(item => item.id === id ? updated : item))

            toast.success(`Número ${item.is_claimed ? 'marcado como no reclamado' : 'marcado como reclamado'}`)
            console.log('✅ [BLESSED-HOOK] Claimed status toggled:', id)
        } catch (err) {
            console.error('❌ [BLESSED-HOOK] Error toggling claimed:', err)
            toast.error('Error al cambiar el estado del premio')
            throw err
        }
    }, [data])

    // Función create actualizada
    const createNew = useCallback(async (createData: Omit<CreateBlessedNumberData, 'raffle_id'>) => {
        if (!selectedRaffleId) {
            throw new Error('No hay una rifa seleccionada')
        }

        try {
            setCreating(true)
            console.log('➕ [BLESSED-HOOK] Creating blessed numbers for tenant:', currentTenant?.name || 'Global')

            const fullCreateData: CreateBlessedNumberData = {
                ...createData,
                raffle_id: selectedRaffleId
            }

            const newBlessedNumbers = await createBlessedNumbers(fullCreateData)
            setData(prev => [...prev, ...newBlessedNumbers].sort((a, b) => a.number.localeCompare(b.number)))

            toast.success(`Se crearon ${newBlessedNumbers.length} números bendecidos exitosamente`)
            console.log('✅ [BLESSED-HOOK] Blessed numbers created:', newBlessedNumbers.length)
            return newBlessedNumbers
        } catch (err) {
            console.error('❌ [BLESSED-HOOK] Error creating blessed numbers:', err)
            toast.error('Error al crear los números bendecidos')
            throw err
        } finally {
            setCreating(false)
        }
    }, [selectedRaffleId, currentTenant])

    // Función delete actualizada
    const deleteNumber = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            console.log('🗑️ [BLESSED-HOOK] Deleting blessed number for tenant:', currentTenant?.name || 'Global')

            await deleteBlessedNumber(id)
            setData(prev => prev.filter(item => item.id !== id))

            toast.success('Número bendecido eliminado exitosamente')
            console.log('✅ [BLESSED-HOOK] Blessed number deleted:', id)
        } catch (err) {
            console.error('❌ [BLESSED-HOOK] Error deleting blessed number:', err)
            toast.error('Error al eliminar el número bendecido')
            throw err
        } finally {
            setDeleting(false)
        }
    }, [currentTenant])

    // Función update actualizada
    const updateNumber = useCallback(async (id: string, updates: Omit<UpdateBlessedNumberInput, 'id'>) => {
        try {
            console.log('✏️ [BLESSED-HOOK] Updating blessed number for tenant:', currentTenant?.name || 'Global')

            const input: UpdateBlessedNumberInput = {
                id,
                ...updates
            }

            const updated = await updateBlessedNumber(input)
            setData(prev => prev.map(item => item.id === id ? updated : item))

            toast.success('Número bendecido actualizado exitosamente')
            console.log('✅ [BLESSED-HOOK] Blessed number updated:', id)
            return updated
        } catch (err) {
            console.error('❌ [BLESSED-HOOK] Error updating blessed number:', err)
            toast.error('Error al actualizar el número bendecido')
            throw err
        }
    }, [currentTenant])

    // Función assign participant actualizada
    const assignParticipant = useCallback(async (id: string, participantId: string | null) => {
        return updateNumber(id, { assigned_to: participantId })
    }, [updateNumber])

    // Función refetch actualizada
    const refreshData = useCallback(async () => {
        console.log('🔄 [BLESSED-HOOK] Manual refresh triggered')
        await fetchRaffles(true)
        if (selectedRaffleId) {
            await fetchBlessedNumbers(true)
        }
    }, [fetchRaffles, fetchBlessedNumbers, selectedRaffleId])

    return {
        // Datos principales
        paginatedBlessed: paginatedData,
        filteredBlessed: filteredData,
        pagination,
        loading: loading || tenantLoading, // Incluir tenant loading
        error,
        setPage,

        // Gestión de rifas
        raffles,
        selectedRaffleId,
        selectedRaffle,
        changeRaffle,

        // Funcionalidades principales
        toggleClaimed,
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