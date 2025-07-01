
// src/hooks/useRaffleCategories.ts

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { raffleService } from '../services/rafflesService'
import type { RaffleCategory } from '../types/raffle'

export const useRaffleCategories = () => {
    const [categories, setCategories] = useState<RaffleCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const categoriesData = await raffleService.getCategories()
            setCategories(categoriesData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const createCategory = async (categoryData: Omit<RaffleCategory, 'id' | 'created_at'>) => {
        try {
            const newCategory = await raffleService.createCategory(categoryData)
            setCategories(prev => [...prev, newCategory])
            toast.success('Categoría creada exitosamente')
            return newCategory
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría'
            toast.error(errorMessage)
            throw err
        }
    }

    return {
        categories,
        loading,
        error,
        createCategory,
        refetch: fetchCategories
    }
}
