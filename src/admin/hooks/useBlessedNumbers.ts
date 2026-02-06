// src/hooks/useBlessedNumbers.ts - MIGRACIÓN MULTI-TENANT + HOOKS COMPARTIDOS
'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext'
import { usePaginatedFilter } from '@/hooks/shared'
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
    const [raffles, setRaffles] = useState<Raffle[]>([])
    const [selectedRaffleId, setSelectedRaffleId] = useState<string>('')
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [participants, setParticipants] = useState<any[]>([])

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Usar hook compartido para filtrado y paginación
    const { paginated: paginatedBlessed, filtered: filteredBlessed, pagination, setPage } = usePaginatedFilter(
        data,
        searchTerm,
        (item, term) =>
            item.number.includes(term) ||
            (item.name?.toLowerCase().includes(term) ?? false) ||
            (item.email?.toLowerCase().includes(term) ?? false),
        ITEMS_PER_PAGE
    )

    // Obtener la rifa seleccionada
    const selectedRaffle = raffles.find(r => r.id === selectedRaffleId) || null

    // Función para cargar rifas
    const fetchRaffles = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return

        try {
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const rafflesList = await getRaffles()
            setRaffles(rafflesList)

            if (rafflesList.length > 0 && !selectedRaffleId) {
                const activeRaffle = rafflesList.find(r => r.is_active)
                const targetRaffle = activeRaffle || rafflesList[0]
                setSelectedRaffleId(targetRaffle.id)
            }

            return rafflesList
        } catch (err) {
            setError('Error al obtener rifas')
            console.error('Error loading raffles:', err)
            toast.error('Error al cargar las rifas')
            return []
        }
    }, [currentTenant, tenantLoading, selectedRaffleId])

    // Función para cargar números bendecidos
    const fetchBlessedNumbers = useCallback(async (forceRefresh = false) => {
        if (tenantLoading || !selectedRaffleId) return

        try {
            setLoading(true)

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
        } catch (err) {
            setError('Error al obtener números bendecidos')
            console.error('Error loading blessed numbers:', err)
            toast.error('Error al cargar los números bendecidos')
        } finally {
            setLoading(false)
        }
    }, [selectedRaffleId, currentTenant, tenantLoading])

    // Efecto para cargar rifas cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            fetchRaffles(true)
        }
    }, [currentTenant?.id, tenantLoading, fetchRaffles])

    // Efecto para cargar números cuando cambie la rifa seleccionada
    useEffect(() => {
        if (selectedRaffleId && !tenantLoading) {
            fetchBlessedNumbers(true)
        }
    }, [selectedRaffleId, currentTenant?.id, tenantLoading, fetchBlessedNumbers])

    // Función para cambiar de rifa
    const changeRaffle = useCallback((raffleId: string) => {
        setSelectedRaffleId(raffleId)
    }, [])

    // Funciones CRUD
    const toggleClaimed = useCallback(async (id: string) => {
        const item = data.find(d => d.id === id)
        if (!item) return

        try {
            const input: UpdateBlessedNumberInput = { id, is_claimed: !item.is_claimed }
            const updated = await updateBlessedNumber(input)
            setData(prev => prev.map(item => item.id === id ? updated : item))
            toast.success(`Número ${item.is_claimed ? 'marcado como no reclamado' : 'marcado como reclamado'}`)
        } catch (err) {
            console.error('Error toggling claimed:', err)
            toast.error('Error al cambiar el estado del premio')
            throw err
        }
    }, [data])

    const createNew = useCallback(async (createData: Omit<CreateBlessedNumberData, 'raffle_id'>) => {
        if (!selectedRaffleId) {
            throw new Error('No hay una rifa seleccionada')
        }

        try {
            setCreating(true)
            const fullCreateData: CreateBlessedNumberData = { ...createData, raffle_id: selectedRaffleId }
            const newBlessedNumbers = await createBlessedNumbers(fullCreateData)
            setData(prev => [...prev, ...newBlessedNumbers].sort((a, b) => a.number.localeCompare(b.number)))
            toast.success(`Se crearon ${newBlessedNumbers.length} números bendecidos exitosamente`)
            return newBlessedNumbers
        } catch (err) {
            console.error('Error creating blessed numbers:', err)
            toast.error('Error al crear los números bendecidos')
            throw err
        } finally {
            setCreating(false)
        }
    }, [selectedRaffleId, currentTenant])

    const deleteNumber = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            await deleteBlessedNumber(id)
            setData(prev => prev.filter(item => item.id !== id))
            toast.success('Número bendecido eliminado exitosamente')
        } catch (err) {
            console.error('Error deleting blessed number:', err)
            toast.error('Error al eliminar el número bendecido')
            throw err
        } finally {
            setDeleting(false)
        }
    }, [currentTenant])

    const updateNumber = useCallback(async (id: string, updates: Omit<UpdateBlessedNumberInput, 'id'>) => {
        try {
            const input: UpdateBlessedNumberInput = { id, ...updates }
            const updated = await updateBlessedNumber(input)
            setData(prev => prev.map(item => item.id === id ? updated : item))
            toast.success('Número bendecido actualizado exitosamente')
            return updated
        } catch (err) {
            console.error('Error updating blessed number:', err)
            toast.error('Error al actualizar el número bendecido')
            throw err
        }
    }, [currentTenant])

    const assignParticipant = useCallback(async (id: string, participantId: string | null) => {
        return updateNumber(id, { assigned_to: participantId })
    }, [updateNumber])

    const refreshData = useCallback(async () => {
        await fetchRaffles(true)
        if (selectedRaffleId) {
            await fetchBlessedNumbers(true)
        }
    }, [fetchRaffles, fetchBlessedNumbers, selectedRaffleId])

    return {
        paginatedBlessed,
        filteredBlessed,
        pagination,
        loading: loading || tenantLoading,
        error,
        setPage,
        raffles,
        selectedRaffleId,
        selectedRaffle,
        changeRaffle,
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
