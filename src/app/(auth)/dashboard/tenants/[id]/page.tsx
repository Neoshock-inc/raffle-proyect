// src/app/(auth)/dashboard/tenants/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Users, TrendingUp, Calendar, Settings, Ban, Edit, MoreHorizontal, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react'
import { tenantService } from '@/app/(auth)/services/tenantService'

interface TenantDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

interface TenantDetails {
  id: string
  name: string
  slug: string
  layout: string
  created_at: string
  status: string | null
  tenant_domains: Array<{
    domain: string
    verified: boolean
    created_at: string
  }>
  user_roles: Array<{
    id: string
    user_id: string
    role_id: string
    roles: {
      name: string
      description: string
    }
  }>
  user_count: number
  raffle_count: number
  entry_count: number
}

export default function TenantDetailsPage({ params }: TenantDetailsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadTenantDetails()
  }, [resolvedParams.id])

  const loadTenantDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tenantService.getTenantById(resolvedParams.id)
      setTenant(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'active' | 'suspended' | 'deleted') => {
    if (!tenant) return

    setActionLoading(true)
    try {
      await tenantService.updateTenantStatus(tenant.id, newStatus)
      setTenant(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error) {
      console.error('Error updating tenant status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: 'Activo',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      suspended: {
        label: 'Suspendido',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      deleted: {
        label: 'Eliminado',
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    )
  }

  const getPlanBadge = (tenant: TenantDetails) => {
    let plan = 'Free'
    let className = 'bg-gray-100 text-gray-800'

    if (tenant.raffle_count > 10) {
      plan = 'Enterprise'
      className = 'bg-purple-100 text-purple-800'
    } else if (tenant.raffle_count > 5) {
      plan = 'Pro'
      className = 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {plan}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: TrendingUp },
    { id: 'domains', name: 'Dominios', icon: Globe },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'settings', name: 'Configuración', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del tenant...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mt-4 text-lg font-medium text-gray-900">Error</h1>
          <p className="mt-2 text-sm text-gray-500">
            {error || 'No se pudo cargar el tenant'}
          </p>
          <button
            onClick={() => router.push('/dashboard/tenants')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tenants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/dashboard/tenants')}
              className="mr-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a Tenants
            </button>
          </div>

          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl mr-4">
                  {tenant.name}
                </h1>
                {getStatusBadge(tenant.status || 'active')}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="truncate">/{tenant.slug}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>Creado {formatDate(tenant.created_at)}</span>
              </div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
              {tenant.status !== 'deleted' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(tenant.status === 'active' ? 'suspended' : 'active')}
                  disabled={actionLoading}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${tenant.status === 'active'
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                    } disabled:opacity-50`}
                >
                  <Ban className="-ml-0.5 mr-1.5 h-5 w-5" />
                  {tenant.status === 'active' ? 'Suspender' : 'Activar'}
                </button>
              )}

              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <MoreHorizontal className="-ml-0.5 mr-1.5 h-5 w-5" />
                Más opciones
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuarios Totales
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {tenant.user_count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rifas Creadas
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {tenant.raffle_count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Globe className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Entradas Vendidas
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {tenant.entry_count}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información General
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Nombre del Tenant</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Slug</dt>
                        <dd className="mt-1 text-sm text-gray-900">/{tenant.slug}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estado</dt>
                        <dd className="mt-1">{getStatusBadge(tenant.status || 'active')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(tenant.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Layout</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tenant.layout || 'default'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>Funcionalidad de actividad reciente en desarrollo</p>
                      <p className="text-sm mt-1">Aquí se mostrarán las últimas acciones del tenant</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dominios Configurados
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Agregar Dominio
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  {tenant.tenant_domains && tenant.tenant_domains.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {tenant.tenant_domains.map((domain, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Globe className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {domain.domain}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Agregado {formatDate(domain.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {domain.verified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verificado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendiente
                                </span>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {!domain.verified && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <div className="text-sm text-yellow-700">
                                <p className="font-medium">DNS no verificado</p>
                                <p className="mt-1">
                                  Configura tu DNS para apuntar este dominio a nuestros servidores.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No hay dominios configurados
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Agrega un dominio para que los usuarios puedan acceder al tenant.
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                      >
                        <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Agregar Primer Dominio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Usuarios del Tenant
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <Users className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Invitar Usuario
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  {tenant.user_roles && tenant.user_roles.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {tenant.user_roles.map((userRole) => (
                        <div key={userRole.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Usuario ID: {userRole.user_id.substring(0, 8)}...
                                </p>
                                <p className="text-sm text-gray-500">
                                  {userRole.roles.name} - {userRole.roles.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {userRole.roles.name}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No hay usuarios asignados
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Invita usuarios para que puedan acceder y gestionar este tenant.
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                      >
                        <Users className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Invitar Primer Usuario
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Configuración del Tenant
                  </h3>
                </div>

                {/* Configuración General */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    Configuración General
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Tenant
                      </label>
                      <input
                        type="text"
                        value={tenant.name}
                        disabled
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={tenant.slug}
                        disabled
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Layout
                      </label>
                      <select
                        value={tenant.layout || 'default'}
                        disabled
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
                      >
                        <option value="default">Default</option>
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Configuración de Seguridad */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    Configuración de Seguridad
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Autenticación de dos factores
                        </p>
                        <p className="text-sm text-gray-500">
                          Requerir 2FA para todos los usuarios del tenant
                        </p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Registro público
                        </p>
                        <p className="text-sm text-gray-500">
                          Permitir que usuarios se registren sin invitación
                        </p>
                      </div>
                      <button
                        type="button"
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zona de Peligro */}
                <div className="bg-white border border-red-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-red-900 mb-4">
                    Zona de Peligro
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Eliminar tenant
                        </p>
                        <p className="text-sm text-red-700">
                          Esta acción no se puede deshacer. Todos los datos se perderán permanentemente.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                      >
                        Eliminar Tenant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}