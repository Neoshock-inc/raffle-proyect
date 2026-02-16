import { useState, useEffect, useCallback } from 'react'
import { numberPoolService } from '../services/numberPoolService'
import type { CreatePoolData, CreateAssignmentData, CreateAmbassadorAssignmentData } from '../services/numberPoolService'
import type { NumberPool, NumberPoolNumber, RaffleNumberAssignment, RaffleNumberStatus } from '@/types/database'
import type { AmbassadorNumberAssignment } from '../types/ambassador'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext'

export function useNumberPools() {
    const [pools, setPools] = useState<NumberPool[]>([])
    const [loading, setLoading] = useState(false)
    const { currentTenant, loading: tenantLoading } = useTenantContext()

    const fetchPools = useCallback(async () => {
        if (tenantLoading) return
        setLoading(true)
        try {
            const data = await numberPoolService.getPools()
            setPools(data)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar pools')
        } finally {
            setLoading(false)
        }
    }, [tenantLoading])

    useEffect(() => {
        if (!tenantLoading) fetchPools()
    }, [currentTenant?.id, tenantLoading, fetchPools])

    const createPool = async (data: CreatePoolData): Promise<NumberPool> => {
        const pool = await numberPoolService.createPool(data)
        setPools(prev => [pool, ...prev])
        toast.success('Pool creado')
        return pool
    }

    const updatePool = async (id: string, updates: Partial<Pick<NumberPool, 'name' | 'status'>>) => {
        const updated = await numberPoolService.updatePool(id, updates)
        setPools(prev => prev.map(p => p.id === id ? updated : p))
        toast.success('Pool actualizado')
        return updated
    }

    const deletePool = async (id: string) => {
        await numberPoolService.deletePool(id)
        setPools(prev => prev.filter(p => p.id !== id))
        toast.success('Pool eliminado')
    }

    return {
        pools,
        loading: loading || tenantLoading,
        refetch: fetchPools,
        createPool,
        updatePool,
        deletePool,
    }
}

export function useRaffleAssignments(raffleId: string | null) {
    const [assignments, setAssignments] = useState<RaffleNumberAssignment[]>([])
    const [loading, setLoading] = useState(false)

    const fetchAssignments = useCallback(async () => {
        if (!raffleId) return
        setLoading(true)
        try {
            const data = await numberPoolService.getAssignments(raffleId)
            setAssignments(data)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar asignaciones')
        } finally {
            setLoading(false)
        }
    }, [raffleId])

    useEffect(() => {
        fetchAssignments()
    }, [fetchAssignments])

    const createAssignment = async (data: CreateAssignmentData) => {
        const assignment = await numberPoolService.createAssignment(data)
        setAssignments(prev => [...prev, assignment].sort((a, b) => a.range_start - b.range_start))
        toast.success('Rango asignado')
        return assignment
    }

    const deleteAssignment = async (assignmentId: string) => {
        await numberPoolService.deleteAssignment(assignmentId)
        setAssignments(prev => prev.filter(a => a.id !== assignmentId))
        toast.success('Asignacion eliminada')
    }

    return {
        assignments,
        loading,
        refetch: fetchAssignments,
        createAssignment,
        deleteAssignment,
    }
}

export function useRaffleNumbers(raffleId: string | null) {
    const [numberStatus, setNumberStatus] = useState<RaffleNumberStatus[]>([])
    const [soldNumbers, setSoldNumbers] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [gridRange, setGridRange] = useState({ start: 1, end: 500 })

    const fetchStatus = useCallback(async () => {
        if (!raffleId) return
        setLoading(true)
        try {
            const data = await numberPoolService.getRaffleNumberStatus(raffleId)
            setNumberStatus(data)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar estado de numeros')
        } finally {
            setLoading(false)
        }
    }, [raffleId])

    const fetchSoldInRange = useCallback(async (start: number, end: number) => {
        if (!raffleId) return
        try {
            const data = await numberPoolService.getSoldNumbersInRange(raffleId, start, end)
            setSoldNumbers(data)
            setGridRange({ start, end })
        } catch (err) {
            console.error('Error fetching sold numbers:', err)
        }
    }, [raffleId])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    useEffect(() => {
        if (raffleId) {
            fetchSoldInRange(gridRange.start, gridRange.end)
        }
    }, [raffleId, gridRange.start, gridRange.end, fetchSoldInRange])

    const totalAssigned = numberStatus.reduce((sum, s) => sum + s.total_in_range, 0)
    const totalSold = numberStatus.reduce((sum, s) => sum + Number(s.sold_in_range), 0)

    return {
        numberStatus,
        soldNumbers,
        loading,
        totalAssigned,
        totalSold,
        gridRange,
        setGridRange,
        refetch: fetchStatus,
        fetchSoldInRange,
    }
}

export function useCustomPoolNumbers(poolId: string | null) {
    const [numbers, setNumbers] = useState<number[]>([])
    const [loading, setLoading] = useState(false)

    const fetchNumbers = useCallback(async () => {
        if (!poolId) return
        setLoading(true)
        try {
            const data = await numberPoolService.getCustomNumbers(poolId)
            setNumbers(data)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar números del pool')
        } finally {
            setLoading(false)
        }
    }, [poolId])

    useEffect(() => {
        fetchNumbers()
    }, [fetchNumbers])

    const uploadNumbers = async (nums: number[]) => {
        if (!poolId) return
        await numberPoolService.uploadCustomNumbers(poolId, nums)
        setNumbers(nums.sort((a, b) => a - b))
    }

    const clearNumbers = async () => {
        if (!poolId) return
        await numberPoolService.clearCustomNumbers(poolId)
        setNumbers([])
    }

    return {
        numbers,
        loading,
        refetch: fetchNumbers,
        uploadNumbers,
        clearNumbers,
    }
}

export function useAmbassadorAssignments(raffleId: string | null) {
    const [assignments, setAssignments] = useState<AmbassadorNumberAssignment[]>([])
    const [loading, setLoading] = useState(false)

    const fetchAssignments = useCallback(async () => {
        if (!raffleId) return
        setLoading(true)
        try {
            const data = await numberPoolService.getAmbassadorAssignments(raffleId)
            setAssignments(data)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar asignaciones de embajadores')
        } finally {
            setLoading(false)
        }
    }, [raffleId])

    useEffect(() => {
        fetchAssignments()
    }, [fetchAssignments])

    const createAssignment = async (data: CreateAmbassadorAssignmentData) => {
        const assignment = await numberPoolService.createAmbassadorAssignment(data)
        setAssignments(prev => [...prev, assignment].sort((a, b) => a.range_start - b.range_start))
        toast.success('Rango asignado a embajador')
        return assignment
    }

    const deleteAssignment = async (assignmentId: string) => {
        await numberPoolService.deleteAmbassadorAssignment(assignmentId)
        setAssignments(prev => prev.filter(a => a.id !== assignmentId))
        toast.success('Asignacion de embajador eliminada')
    }

    return {
        assignments,
        loading,
        refetch: fetchAssignments,
        createAssignment,
        deleteAssignment,
    }
}
