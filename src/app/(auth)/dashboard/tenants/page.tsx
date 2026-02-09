// src/app/(auth)/dashboard/tenants/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Eye, Ban, MoreHorizontal, Globe, Users, TrendingUp, RefreshCw, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { useTenantManagement } from '@/admin/hooks/useTenantManagement'
import { TenantWithMetrics } from '@/admin/services/tenantService'
import { Button, Input, Select, Badge } from '@/admin/components/ui'

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

  const statusBadgeMap: Record<string, 'success' | 'warning' | 'danger'> = {
    active: 'success',
    suspended: 'warning',
    deleted: 'danger',
  }

  const statusLabelMap: Record<string, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    deleted: 'Eliminado',
  }

  const planBadgeMap: Record<string, 'neutral' | 'info' | 'success'> = {
    basic: 'neutral',
    professional: 'info',
    enterprise: 'success',
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
            <div className="bg-indigo-700 text-white p-2 rounded-full">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tenants</h2>
              <p className="text-gray-600 dark:text-gray-400">Cargando lista de tenants...</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Cargando tenants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-700 text-white p-2 rounded-full">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tenants</h2>
            <p className="text-gray-600 dark:text-gray-400">Gestión de tenants y configuraciones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => refreshData()}
            disabled={loading}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>

          <Button
            onClick={() => router.push('/dashboard/tenants/create')}
            icon={<Plus className="h-4 w-4" />}
          >
            Nuevo Tenant
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {getActiveTenantsCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspendidos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {getSuspendedTenantsCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
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
        <div className="flex-1 max-w-md">
          <Input
            icon={<Search className="h-5 w-5" />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Buscar por nombre o slug..."
          />
        </div>

        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          icon={<Filter className="h-4 w-4" />}
        >
          Filtros
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Estado"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activo' },
                { value: 'suspended', label: 'Suspendido' },
                { value: 'deleted', label: 'Eliminado' },
              ]}
            />
            <Select
              label="Ordenar por"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
              options={[
                { value: 'created_at', label: 'Fecha de creación' },
                { value: 'name', label: 'Nombre' },
                { value: 'user_count', label: 'Número de usuarios' },
                { value: 'raffle_count', label: 'Número de rifas' },
              ]}
            />
            <Select
              label="Orden"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              options={[
                { value: 'desc', label: 'Descendente' },
                { value: 'asc', label: 'Ascendente' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dominio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tenants.length > 0 ? (
                tenants.map((tenant: TenantWithMetrics) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {tenant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
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
                      <Badge variant={statusBadgeMap[tenant.status || 'active'] || 'success'}>
                        {statusLabelMap[tenant.status || 'active'] || 'Activo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={planBadgeMap[tenant.plan || 'basic'] || 'neutral'}>
                        {(tenant.plan || 'basic').charAt(0).toUpperCase() + (tenant.plan || 'basic').slice(1)}
                      </Badge>
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
                      <div className="text-sm text-gray-900 dark:text-gray-100">
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
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
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
                          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No hay tenants</p>
                        <p className="mt-1">Comienza creando tu primer tenant</p>
                        <Button
                          className="mt-4"
                          onClick={() => router.push('/dashboard/tenants/create')}
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Crear primer tenant
                        </Button>
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
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalCount)}
                </span>{' '}
                de <span className="font-medium">{totalCount}</span> resultados
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNumber > totalPages) return null

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={loading}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors disabled:opacity-50 ${currentPage === pageNumber
                      ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}