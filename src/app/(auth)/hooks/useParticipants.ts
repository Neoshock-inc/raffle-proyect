'use client'
import { useState, useEffect, useCallback } from 'react'
import {
    ParticipantWithStats,
    CreateParticipantData,
    UpdateParticipantData,
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
    const [error, setError] = useState<Error | null>(null)
    const [page, setPage] = useState(1)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filteredData = data.filter((participant) =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const participants = await getParticipantsWithStats()
            setData(participants)
        } catch (e) {
            setError(e as Error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Reset page when search term changes
    useEffect(() => {
        setPage(1)
    }, [searchTerm])

    const createNew = useCallback(
        async (participantData: CreateParticipantData) => {
            setCreating(true)
            setError(null)
            try {
                await createParticipant(participantData)
                await fetchData() // Refetch to get updated stats
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setCreating(false)
            }
        },
        [fetchData]
    )

    const updateExisting = useCallback(
        async (id: string, updates: UpdateParticipantData) => {
            setUpdating(true)
            setError(null)
            try {
                await updateParticipant(id, updates)
                await fetchData() // Refetch to get updated data
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setUpdating(false)
            }
        },
        [fetchData]
    )

    const deleteExisting = useCallback(
        async (id: string) => {
            setDeleting(true)
            setError(null)
            try {
                await deleteParticipant(id)
                setData((prev) => prev.filter((participant) => participant.id !== id))
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setDeleting(false)
            }
        },
        []
    )

    const getParticipantDetails = useCallback(
        async (id: string) => {
            try {
                return await getParticipantById(id)
            } catch (e) {
                setError(e as Error)
                throw e
            }
        },
        []
    )

    return {
        // Data
        paginatedParticipants: paginatedData,
        filteredParticipants: filteredData,
        allParticipants: data,

        // Pagination
        pagination: {
            page,
            totalPages,
            itemsPerPage: ITEMS_PER_PAGE,
            totalItems: filteredData.length
        },
        setPage,

        // States
        loading,
        error,
        creating,
        updating,
        deleting,

        // Actions
        createNew,
        updateExisting,
        deleteExisting,
        getParticipantDetails,
        refreshData: fetchData
    }
}