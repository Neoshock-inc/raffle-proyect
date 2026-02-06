// src/hooks/useRaffles.ts

import { useState, useEffect, useCallback } from 'react'
import { raffleService } from '../services/rafflesService';
import type {
  Raffle,
  CreateRaffleData,
  UpdateRaffleData,
  RaffleStatus,
  UseRafflesOptions
} from '../types/raffle'
import { toast } from 'sonner'
import { useTenantContext } from '../contexts/TenantContext' // AGREGAR: Usar contexto de tenant

export const useRaffles = (options: UseRafflesOptions = {}) => {
  const { filters = {}, enabled = true, refetchInterval } = options

  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })

  // AGREGAR: Obtener contexto de tenant
  const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

  // Función de fetch simple
  const fetchRaffles = useCallback(async (page: number, limit: number, currentFilters = filters, forceRefresh = false) => {
    // No cargar si el tenant aún está cargando
    if (tenantLoading || !enabled) return

    try {
      setLoading(true)
      setError(null)

      console.log('🎟️ [RAFFLES] Loading raffles for tenant:', currentTenant?.name || 'Global')

      // Agregar pequeño delay si es force refresh para asegurar contexto
      if (forceRefresh) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const response = await raffleService.getRaffles(currentFilters, page, limit)
      setRaffles(response.data)
      setPagination(response.pagination)

      console.log('✅ [RAFFLES] Loaded raffles:', response.data.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rifas'
      setError(errorMessage)
      console.error('❌ [RAFFLES] Error:', err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentTenant, tenantLoading, enabled])

  // Efecto inicial - se ejecuta cuando cambian filters, tenant o enabled
  useEffect(() => {
    console.log('🔄 [RAFFLES] Tenant context changed:', {
      tenantId: currentTenant?.id,
      tenantName: currentTenant?.name,
      isAdmin,
      tenantLoading
    })

    if (!tenantLoading && enabled) {
      fetchRaffles(1, 10, filters, true) // Force refresh cuando cambie el tenant
    }
  }, [currentTenant?.id, tenantLoading, JSON.stringify(filters), enabled, fetchRaffles])

  // Efecto para refetch interval
  useEffect(() => {
    if (refetchInterval && enabled && !tenantLoading) {
      const interval = setInterval(() => {
        fetchRaffles(pagination.page, pagination.limit, filters)
      }, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [refetchInterval, enabled, tenantLoading, pagination.page, pagination.limit, JSON.stringify(filters), fetchRaffles])

  const createRaffle = async (data: CreateRaffleData): Promise<Raffle> => {
    try {
      console.log('📝 [RAFFLES] Creating raffle for tenant:', currentTenant?.name || 'Global')

      const newRaffle = await raffleService.createRaffle(data)
      setRaffles(prev => [newRaffle, ...prev])
      toast.success('Rifa creada exitosamente')

      console.log('✅ [RAFFLES] Raffle created:', newRaffle.id)
      return newRaffle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rifa'
      console.error('❌ [RAFFLES] Error creating raffle:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  const updateRaffle = async (data: UpdateRaffleData): Promise<Raffle> => {
    try {
      console.log('✏️ [RAFFLES] Updating raffle for tenant:', currentTenant?.name || 'Global')

      const updatedRaffle = await raffleService.updateRaffle(data)
      setRaffles(prev => prev.map(raffle =>
        raffle.id === data.id ? updatedRaffle : raffle
      ))
      toast.success('Rifa actualizada exitosamente')

      console.log('✅ [RAFFLES] Raffle updated:', updatedRaffle.id)
      return updatedRaffle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rifa'
      console.error('❌ [RAFFLES] Error updating raffle:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteRaffle = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ [RAFFLES] Deleting raffle for tenant:', currentTenant?.name || 'Global')

      await raffleService.deleteRaffle(id)
      setRaffles(prev => prev.filter(raffle => raffle.id !== id))
      toast.success('Rifa eliminada exitosamente')

      console.log('✅ [RAFFLES] Raffle deleted:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar rifa'
      console.error('❌ [RAFFLES] Error deleting raffle:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  const updateStatus = async (id: string, status: RaffleStatus): Promise<void> => {
    try {
      console.log('🔄 [RAFFLES] Updating raffle status for tenant:', currentTenant?.name || 'Global')

      const updatedRaffle = await raffleService.updateRaffleStatus(id, status)
      setRaffles(prev => prev.map(raffle =>
        raffle.id === id ? updatedRaffle : raffle
      ))
      toast.success('Estado actualizado exitosamente')

      console.log('✅ [RAFFLES] Raffle status updated:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado'
      console.error('❌ [RAFFLES] Error updating raffle status:', err)
      toast.error(errorMessage)
      throw err
    }
  }

  const changePage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchRaffles(page, pagination.limit, filters)
  }

  const changeLimit = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
    fetchRaffles(1, limit, filters)
  }

  const refetch = useCallback(async () => {
    console.log('🔄 [RAFFLES] Manual refresh triggered')
    await fetchRaffles(pagination.page, pagination.limit, filters, true)
  }, [fetchRaffles, pagination.page, pagination.limit, filters])

  return {
    raffles,
    loading: loading || tenantLoading, // Incluir tenant loading
    error,
    pagination,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    updateStatus,
    refetch,
    changePage,
    changeLimit
  }
}

// src/hooks/useRaffle.ts - Hook individual con actualización

export const useRaffle = (id: string | null) => {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false) // Nuevo estado para updates

  // Obtener contexto de tenant
  const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

  const fetchRaffle = useCallback(async (forceRefresh = false) => {
    if (!id || tenantLoading) return

    setLoading(true)
    setError(null)

    try {
      console.log('🎟️ [RAFFLE] Loading raffle for tenant:', currentTenant?.name || 'Global')

      // Agregar pequeño delay si es force refresh para asegurar contexto
      if (forceRefresh) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const raffleData = await raffleService.getRaffleById(id)
      setRaffle(raffleData)

      console.log('✅ [RAFFLE] Raffle loaded:', raffleData.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rifa'
      setError(errorMessage)
      console.error('❌ [RAFFLE] Error:', err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, currentTenant, tenantLoading])

  // Nueva función para actualizar la rifa
  const updateRaffle = useCallback(async (updateData: UpdateRaffleData) => {
    if (!id || tenantLoading) {
      throw new Error('No se puede actualizar: ID faltante o tenant no cargado')
    }

    setUpdating(true)
    setError(null)

    try {
      console.log('✏️ [RAFFLE] Updating raffle:', updateData)
      
      const updatedRaffle = await raffleService.updateRaffle(updateData)
      
      // Actualizar el estado local inmediatamente
      setRaffle(updatedRaffle)
      
      console.log('✅ [RAFFLE] Raffle updated successfully:', updatedRaffle.id)
      return updatedRaffle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rifa'
      setError(errorMessage)
      console.error('❌ [RAFFLE] Update error:', err)
      throw err // Re-throw para que el componente pueda manejarlo
    } finally {
      setUpdating(false)
    }
  }, [id, tenantLoading])

  useEffect(() => {
    console.log('🔄 [RAFFLE] Tenant context changed:', {
      tenantId: currentTenant?.id,
      tenantName: currentTenant?.name,
      isAdmin,
      tenantLoading,
      raffleId: id
    })

    if (!tenantLoading) {
      fetchRaffle(true) // Force refresh cuando cambie el tenant
    }
  }, [currentTenant?.id, tenantLoading, fetchRaffle])

  return {
    raffle,
    loading: loading || tenantLoading, // Incluir tenant loading
    updating, // Nuevo estado para mostrar cuando se está actualizando
    error,
    refetch: fetchRaffle,
    updateRaffle, // Nueva función de actualización
    setRaffle
  }
}