// src/hooks/useParticipants.ts - MIGRACIÓN MULTI-TENANT + HOOKS COMPARTIDOS
'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext'
import { usePaginatedFilter } from '@/app/hooks/shared'
import {
    ParticipantWithStats,
    CreateParticipantData,
    UpdateParticipantInput,
    getParticipantsWithStats,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    getParticipantById
} from '../services/participantsService'

export const ITEMS_PER_PAGE = 10

export function useParticipants(searchTerm: string = '') {
    const [data, setData] = useState<ParticipantWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Usar hook compartido para filtrado y paginación
    const { paginated: paginatedParticipants, filtered: filteredParticipants, pagination, setPage } = usePaginatedFilter(
        data,
        searchTerm,
        (participant, term) =>
            participant.name.toLowerCase().includes(term) ||
            participant.email.toLowerCase().includes(term),
        ITEMS_PER_PAGE
    )

    // Función para cargar participantes
    const fetchParticipants = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return

        try {
            setLoading(true)
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            const participants = await getParticipantsWithStats()
            setData(participants)
            setError(null)
        } catch (err) {
            setError('Error al obtener participantes')
            console.error('Error loading participants:', err)
            toast.error('Error al cargar los participantes')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading])

    // Efecto para cargar participantes cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            fetchParticipants(true)
        }
    }, [currentTenant?.id, tenantLoading, fetchParticipants])

    // Funciones CRUD
    const createNew = useCallback(async (participantData: CreateParticipantData) => {
        try {
            setCreating(true)
            const newParticipant = await createParticipant(participantData)
            await fetchParticipants(true)
            toast.success('Participante creado exitosamente')
            return newParticipant
        } catch (err) {
            console.error('Error creating participant:', err)
            toast.error('Error al crear el participante')
            throw err
        } finally {
            setCreating(false)
        }
    }, [currentTenant, fetchParticipants])

    const updateExisting = useCallback(async (id: string, updates: Omit<UpdateParticipantInput, 'id'>) => {
        try {
            setUpdating(true)
            const input: UpdateParticipantInput = { id, ...updates }
            const updated = await updateParticipant(input)
            await fetchParticipants(true)
            toast.success('Participante actualizado exitosamente')
            return updated
        } catch (err) {
            console.error('Error updating participant:', err)
            toast.error('Error al actualizar el participante')
            throw err
        } finally {
            setUpdating(false)
        }
    }, [currentTenant, fetchParticipants])

    const deleteExisting = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            await deleteParticipant(id)
            setData(prev => prev.filter(participant => participant.id !== id))
            toast.success('Participante eliminado exitosamente')
        } catch (err) {
            console.error('Error deleting participant:', err)
            toast.error('Error al eliminar el participante')
            throw err
        } finally {
            setDeleting(false)
        }
    }, [currentTenant])

    const getParticipantDetails = useCallback(async (id: string) => {
        try {
            return await getParticipantById(id)
        } catch (err) {
            console.error('Error getting participant details:', err)
            toast.error('Error al obtener detalles del participante')
            throw err
        }
    }, [currentTenant])

    const refreshData = useCallback(async () => {
        await fetchParticipants(true)
    }, [fetchParticipants])

    return {
        paginatedParticipants,
        filteredParticipants,
        allParticipants: data,
        pagination,
        setPage,
        loading: loading || tenantLoading,
        error,
        creating,
        updating,
        deleting,
        createNew,
        updateExisting,
        deleteExisting,
        getParticipantDetails,
        refreshData
    }
}
