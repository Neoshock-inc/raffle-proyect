'use client'
import { useState, useEffect, useCallback } from 'react'
import {
    BlessedNumber,
    ActiveRaffle,
    CreateBlessedNumberData,
    UpdateBlessedNumberData,
    getBlessedNumbers,
    updateBlessedNumber,
    getActiveRaffle,
    createBlessedNumbers,
    deleteBlessedNumber,
    getParticipants
} from '../services/blessedService'

export const ITEMS_PER_PAGE = 10

export function useBlessedNumbers(searchTerm: string = '') {
    const [data, setData] = useState<BlessedNumber[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [page, setPage] = useState(1)
    const [activeRaffle, setActiveRaffle] = useState<ActiveRaffle | null>(null)
    const [creating, setCreating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [participants, setParticipants] = useState<any[]>([])

    const filteredData = data.filter((item) =>
        item.number.includes(searchTerm) ||
        (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [numbers, raffle, participantsList] = await Promise.all([
                getBlessedNumbers(),
                getActiveRaffle(),
                getParticipants()
            ])
            setData(numbers)
            setActiveRaffle(raffle)
            setParticipants(participantsList)
        } catch (e) {
            setError(e as Error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const toggleClaimed = useCallback(
        async (id: string) => {
            const item = data.find(d => d.id === id)
            if (!item) return

            try {
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
        [data]
    )

    const createNew = useCallback(
        async (createData: CreateBlessedNumberData) => {
            if (!activeRaffle) {
                throw new Error('No hay una rifa activa')
            }

            setCreating(true)
            setError(null)
            try {
                const newBlessedNumbers = await createBlessedNumbers(createData)
                setData((prev) => [...prev, ...newBlessedNumbers].sort((a, b) => a.number.localeCompare(b.number)))
                return newBlessedNumbers
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setCreating(false)
            }
        },
        [activeRaffle]
    )

    const deleteNumber = useCallback(
        async (id: string) => {
            setDeleting(true)
            setError(null)
            try {
                await deleteBlessedNumber(id)
                setData((prev) => prev.filter((item) => item.id !== id))
            } catch (e) {
                setError(e as Error)
                throw e
            } finally {
                setDeleting(false)
            }
        },
        []
    )

    const updateNumber = useCallback(
        async (id: string, updates: UpdateBlessedNumberData) => {
            try {
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
        []
    )

    const assignParticipant = useCallback(
        async (id: string, participantId: string | null) => {
            return updateNumber(id, { assigned_to: participantId })
        },
        [updateNumber]
    )

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
        loading,
        error,
        setPage,
        toggleClaimed,

        // Nuevas funcionalidades
        activeRaffle,
        creating,
        deleting,
        createNew,
        deleteNumber,
        updateNumber,
        assignParticipant,
        participants,
        refreshData: fetchData
    }
}