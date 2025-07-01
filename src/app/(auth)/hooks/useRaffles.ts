// src/hooks/useRaffles.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import { raffleService } from '../services/rafflesService';
import type {
  Raffle,
  RaffleFilters,
  RaffleListResponse,
  CreateRaffleData,
  UpdateRaffleData,
  RaffleStatus,
  UseRafflesOptions
} from '../types/raffle'
import { toast } from 'sonner'

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

  // Función de fetch simple
  const fetchRaffles = async (page: number, limit: number, currentFilters = filters) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await raffleService.getRaffles(currentFilters, page, limit)
      setRaffles(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rifas'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Efecto inicial - se ejecuta cuando cambian filters o enabled
  useEffect(() => {
    if (enabled) {
      fetchRaffles(1, 10, filters)
    }
  }, [JSON.stringify(filters), enabled]) // Usar JSON.stringify para comparar objetos

  // Efecto para refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        fetchRaffles(pagination.page, pagination.limit, filters)
      }, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [refetchInterval, enabled, pagination.page, pagination.limit, JSON.stringify(filters)])

  const createRaffle = async (data: CreateRaffleData): Promise<Raffle> => {
    try {
      const newRaffle = await raffleService.createRaffle(data)
      setRaffles(prev => [newRaffle, ...prev])
      toast.success('Rifa creada exitosamente')
      return newRaffle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rifa'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateRaffle = async (data: UpdateRaffleData): Promise<Raffle> => {
    try {
      const updatedRaffle = await raffleService.updateRaffle(data)
      setRaffles(prev => prev.map(raffle =>
        raffle.id === data.id ? updatedRaffle : raffle
      ))
      toast.success('Rifa actualizada exitosamente')
      return updatedRaffle
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rifa'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteRaffle = async (id: string): Promise<void> => {
    try {
      await raffleService.deleteRaffle(id)
      setRaffles(prev => prev.filter(raffle => raffle.id !== id))
      toast.success('Rifa eliminada exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar rifa'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateStatus = async (id: string, status: RaffleStatus): Promise<void> => {
    try {
      const updatedRaffle = await raffleService.updateRaffleStatus(id, status)
      setRaffles(prev => prev.map(raffle =>
        raffle.id === id ? updatedRaffle : raffle
      ))
      toast.success('Estado actualizado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado'
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

  const refetch = () => {
    fetchRaffles(pagination.page, pagination.limit, filters)
  }

  return {
    raffles,
    loading,
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

// src/hooks/useRaffle.ts

export const useRaffle = (id: string | null) => {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRaffle = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const raffleData = await raffleService.getRaffleById(id)
      setRaffle(raffleData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rifa'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRaffle()
  }, [fetchRaffle])

  return {
    raffle,
    loading,
    error,
    refetch: fetchRaffle,
    setRaffle
  }
}
