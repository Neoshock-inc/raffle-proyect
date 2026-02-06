// hooks/useTenantManagement.ts
import { useState, useCallback } from 'react'
import { tenantService, TenantWithMetrics, TenantListParams, CreateTenantData } from '../services/tenantService'

export const useTenantManagement = () => {
  const [tenants, setTenants] = useState<TenantWithMetrics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Cargar lista de tenants
  const loadTenants = useCallback(async (params: TenantListParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await tenantService.getTenantsPaginated({
        ...params,
        page: params.page || currentPage
      })

      setTenants(result.data)
      setTotalPages(result.totalPages)
      setTotalCount(result.count)
      setCurrentPage(result.currentPage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error loading tenants:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  // Refrescar datos
  const refreshData = useCallback(() => {
    loadTenants({
      page: currentPage,
      limit: 10
    })
  }, [loadTenants, currentPage])

  // Crear tenant
  const createTenant = useCallback(async (data: CreateTenantData) => {
    setLoading(true)
    setError(null)

    try {
      const newTenant = await tenantService.createTenant(data)
      
      // Recargar la lista después de crear
      await loadTenants()
      
      return newTenant
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tenant'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadTenants])

  // Actualizar status del tenant
  const updateTenantStatus = useCallback(async (tenantId: string, status: 'active' | 'suspended' | 'deleted') => {
    setLoading(true)
    setError(null)

    try {
      await tenantService.updateTenantStatus(tenantId, status)
      
      // Actualizar la lista local
      setTenants(prev => 
        prev.map(tenant => 
          tenant.id === tenantId 
            ? { ...tenant, layout: status } // layout se usa como status temporalmente
            : tenant
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tenant'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // Estado
    tenants,
    loading,
    error,
    totalPages,
    totalCount,
    currentPage,

    // Acciones
    loadTenants,
    createTenant,
    updateTenantStatus,
    refreshData,
    
    // Utilidades
    setCurrentPage,
    clearError: () => setError(null)
  }
}