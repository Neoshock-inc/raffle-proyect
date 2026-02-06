// src/app/(auth)/dashboard/tenants/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Eye, Ban, MoreHorizontal, Globe, Users, TrendingUp, RefreshCw, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { useTenantManagement } from '@/admin/hooks/useTenantManagement'
import { TenantWithMetrics } from '@/admin/services/tenantService'

interface FilterState {
  search: string
  status: string
  sortBy: 'name' | 'created_at' | 'user_count' | 'raffle_count'
  sortOrder: 'asc' | 'desc'
}

export default function TenantsPage() {
  const router = useRouter()
  const {
    tenants,
    loading,
    error,
    totalPages,
    totalCount,
    currentPage,
    loadTenants,
    updateTenantStatus,
    setCurrentPage,
    refreshData
  } = useTenantManagement()

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Cargar tenants al montar y cuando cambien los filtros
  useEffect(() => {
    loadTenants({
      page: currentPage,
      limit: 10,
      search: filters.search,
      status: filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    })
  }, [loadTenants, currentPage, filters])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1)
      } else {
        loadTenants({
          page: 1,
          limit: 10,
          search: filters.search,
          status: filters.status,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters.search])

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1)
  }, [setCurrentPage])

  const handleStatusChange = async (tenantId: string, newStatus: 'active' | 'suspended' | 'deleted') => {
    setActionLoading(tenantId)
    try {
      await updateTenantStatus(tenantId, newStatus)
    } catch (error) {
      console.error('Error updating tenant status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (tenant: TenantWithMetrics) => {
    // Ahora usar el campo 'status' en lugar de 'layout'
    const status = tenant.status || 'active'

    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspendido', className: 'bg-yellow-100 text-yellow-800' },
      deleted: { label: 'Eliminado', className: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getPlanBadge = (tenant: TenantWithMetrics) => {
    // Usar el campo 'plan' real en lugar de simular basado en métricas
    const plan = tenant.plan || 'basic'

    const planConfig = {
      basic: { label: 'Basic', className: 'bg-gray-100 text-gray-800' },
      pro: { label: 'Pro', className: 'bg-blue-100 text-blue-800' },
      enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-800' }
    }

    const config = planConfig[plan as keyof typeof planConfig] || planConfig.basic

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getActiveTenantsCount = () => {
    return tenants.filter((t: TenantWithMetrics) => (t.status || 'active') === 'active').length
  }

  const getSuspendedTenantsCount = () => {
    return tenants.filter((t: TenantWithMetrics) => t.status === 'suspended').length
  }

  const getDeletedTenantsCount = () => {
    return tenants.filter((t: TenantWithMetrics) => t.status === 'deleted').length
  }

  if (loading && tenants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-700 text-white p-2 rounded-full">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
              <p className="text-gray-600">Cargando lista de tenants...</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Cargando tenants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-sky-700 text-white p-2 rounded-full">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
            <p className="text-gray-600">Gestión de tenants y configuraciones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            onClick={() => router.push('/dashboard/tenants/create')}
            className="flex items-center gap-2 px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800"
          >
            <Plus className="h-4 w-4" />
            Nuevo Tenant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getActiveTenantsCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspendidos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getSuspendedTenantsCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tenants.reduce((sum: number, t: TenantWithMetrics) => sum + t.user_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Buscar por nombre o slug..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${showFilters
            ? 'border-sky-500 text-sky-700 bg-sky-50'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-700 focus:ring-sky-700 sm:text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="deleted">Eliminado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-700 focus:ring-sky-700 sm:text-sm"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
              >
                <option value="created_at">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="user_count">Número de usuarios</option>
                <option value="raffle_count">Número de rifas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-700 focus:ring-sky-700 sm:text-sm"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dominio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.length > 0 ? (
                tenants.map((tenant: TenantWithMetrics) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.name}
                        </div>
                        {tenant.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {tenant.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {tenant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="truncate max-w-xs">
                          {tenant.primary_domain || 'Sin dominio'}
                        </span>
                        {tenant.domain_verified && (
                          <span className="ml-2 text-green-500" title="Dominio verificado">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tenant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(tenant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {new Date(tenant.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(tenant.created_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1" title="Usuarios">
                          <Users className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="font-medium">{tenant.user_count}</span>
                        </div>
                        <div className="flex items-center" title="Rifas">
                          <TrendingUp className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="font-medium">{tenant.raffle_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {tenant.status !== 'deleted' && (
                          <button
                            onClick={() => handleStatusChange(
                              tenant.id,
                              tenant.status === 'active' ? 'suspended' : 'active'
                            )}
                            disabled={actionLoading === tenant.id}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 disabled:opacity-50"
                            title={tenant.status === 'active' ? 'Suspender' : 'Activar'}
                          >
                            {actionLoading === tenant.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {tenant.status !== 'deleted' && (
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres eliminar este tenant? Esta acción no se puede deshacer.')) {
                                handleStatusChange(tenant.id, 'deleted')
                              }
                            }}
                            disabled={actionLoading === tenant.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Eliminar tenant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {filters.search ? (
                      <div>
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No se encontraron tenants</p>
                        <p className="mt-1">Intenta con otros términos de búsqueda</p>
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="mt-4 text-sky-600 hover:text-sky-800 font-medium"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No hay tenants</p>
                        <p className="mt-1">Comienza creando tu primer tenant</p>
                        <button
                          onClick={() => router.push('/dashboard/tenants/create')}
                          className="mt-4 inline-flex items-center px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear primer tenant
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalCount)}
                </span>{' '}
                de <span className="font-medium">{totalCount}</span> resultados
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNumber > totalPages) return null

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={loading}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors disabled:opacity-50 ${currentPage === pageNumber
                      ? 'z-10 bg-sky-50 border-sky-500 text-sky-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}