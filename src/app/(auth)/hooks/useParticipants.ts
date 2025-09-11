// src/hooks/useParticipants.ts - MIGRACIÓN MULTI-TENANT
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext'
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
    const [currentPage, setCurrentPage] = useState(1)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // AGREGAR: Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Filtrar participantes
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data

        const term = searchTerm.toLowerCase().trim()
        return data.filter((participant) =>
            participant.name.toLowerCase().includes(term) ||
            participant.email.toLowerCase().includes(term)
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

    // Participantes paginados
    const paginatedData = useMemo(() => {
        const start = (validPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return filteredData.slice(start, end)
    }, [filteredData, validPage])

    // Función para cargar participantes
    const fetchParticipants = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando
        if (tenantLoading) return

        try {
            setLoading(true)
            console.log('👥 [PARTICIPANTS-HOOK] Loading participants for tenant:', currentTenant?.name || 'Global')

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const participants = await getParticipantsWithStats()
            setData(participants)
            setError(null)

            console.log('✅ [PARTICIPANTS-HOOK] Loaded participants:', participants.length)
        } catch (err) {
            setError('Error al obtener participantes')
            console.error('❌ [PARTICIPANTS-HOOK] Error:', err)
            toast.error('Error al cargar los participantes')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading])

    // Efecto para cargar participantes cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [PARTICIPANTS-HOOK] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            fetchParticipants(true) // Force refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, fetchParticipants])

    // Funciones de acción
    const setPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    // Función create actualizada
    const createNew = useCallback(async (participantData: CreateParticipantData) => {
        try {
            setCreating(true)
            console.log('📝 [PARTICIPANTS-HOOK] Creating participant for tenant:', currentTenant?.name || 'Global')

            const newParticipant = await createParticipant(participantData)

            // Refrescar datos para obtener estadísticas actualizadas
            await fetchParticipants(true)

            toast.success('Participante creado exitosamente')
            console.log('✅ [PARTICIPANTS-HOOK] Participant created:', newParticipant.id)
            return newParticipant
        } catch (err) {
            console.error('❌ [PARTICIPANTS-HOOK] Error creating participant:', err)
            toast.error('Error al crear el participante')
            throw err
        } finally {
            setCreating(false)
        }
    }, [currentTenant, fetchParticipants])

    // Función update actualizada
    const updateExisting = useCallback(async (id: string, updates: Omit<UpdateParticipantInput, 'id'>) => {
        try {
            setUpdating(true)
            console.log('✏️ [PARTICIPANTS-HOOK] Updating participant for tenant:', currentTenant?.name || 'Global')

            const input: UpdateParticipantInput = {
                id,
                ...updates
            }

            const updated = await updateParticipant(input)

            // Refrescar datos para obtener estadísticas actualizadas
            await fetchParticipants(true)

            toast.success('Participante actualizado exitosamente')
            console.log('✅ [PARTICIPANTS-HOOK] Participant updated:', updated.id)
            return updated
        } catch (err) {
            console.error('❌ [PARTICIPANTS-HOOK] Error updating participant:', err)
            toast.error('Error al actualizar el participante')
            throw err
        } finally {
            setUpdating(false)
        }
    }, [currentTenant, fetchParticipants])

    // Función delete actualizada
    const deleteExisting = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            console.log('🗑️ [PARTICIPANTS-HOOK] Deleting participant for tenant:', currentTenant?.name || 'Global')

            await deleteParticipant(id)
            setData(prev => prev.filter(participant => participant.id !== id))

            toast.success('Participante eliminado exitosamente')
            console.log('✅ [PARTICIPANTS-HOOK] Participant deleted:', id)
        } catch (err) {
            console.error('❌ [PARTICIPANTS-HOOK] Error deleting participant:', err)
            toast.error('Error al eliminar el participante')
            throw err
        } finally {
            setDeleting(false)
        }
    }, [currentTenant])

    // Función para obtener detalles de participante
    const getParticipantDetails = useCallback(async (id: string) => {
        try {
            console.log('🔍 [PARTICIPANTS-HOOK] Getting participant details for tenant:', currentTenant?.name || 'Global')

            const participant = await getParticipantById(id)
            console.log('✅ [PARTICIPANTS-HOOK] Participant details loaded:', participant?.email)
            return participant
        } catch (err) {
            console.error('❌ [PARTICIPANTS-HOOK] Error getting participant details:', err)
            toast.error('Error al obtener detalles del participante')
            throw err
        }
    }, [currentTenant])

    // Función refetch actualizada
    const refreshData = useCallback(async () => {
        console.log('🔄 [PARTICIPANTS-HOOK] Manual refresh triggered')
        await fetchParticipants(true)
    }, [fetchParticipants])

    return {
        // Datos principales
        paginatedParticipants: paginatedData,
        filteredParticipants: filteredData,
        allParticipants: data,

        // Paginación
        pagination,
        setPage,

        // Estados
        loading: loading || tenantLoading, // Incluir tenant loading
        error,
        creating,
        updating,
        deleting,

        // Acciones
        createNew,
        updateExisting,
        deleteExisting,
        getParticipantDetails,
        refreshData
    }
}