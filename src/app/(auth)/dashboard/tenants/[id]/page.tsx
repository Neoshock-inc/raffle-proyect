'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Globe, Users, TrendingUp, Calendar, Settings, Ban, Edit, MoreHorizontal,
  CheckCircle, XCircle, Clock, UserCheck, AlertTriangle, Crown, Plus, Eye,
  Gift, Activity, DollarSign, Target, Zap, Lock, Info, Star, Save, X,
  Monitor, Smartphone, Tablet, Check, ChevronUp, ChevronDown
} from 'lucide-react'
import { tenantService } from '@/app/(auth)/services/tenantService'
import { raffleService } from '@/app/(auth)/services/rafflesService'
import { useTenantSettings } from '@/app/(auth)/hooks/useTenantSettings'
import { useLayoutManager } from '@/app/(auth)/hooks/useLayoutManager'
import { usePlanManagement } from '@/app/(auth)/hooks/usePlanManagement'
import { LayoutPreview, LayoutSelector } from '@/app/(auth)/components/LayoutPreview'

interface TenantDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

interface TenantDetails {
  id: string
  name: string
  slug: string
  layout: string
  created_at: string
  status: string | null
  plan: 'basic' | 'pro' | 'enterprise'
  description?: string
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

interface BasicRaffle {
  id: string
  title: string
  status: string
  draw_date: string
  total_numbers: number
  price: number
  created_at: string
}

export default function TenantDetailsPage({ params }: TenantDetailsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [raffles, setRaffles] = useState<BasicRaffle[]>([])
  const [loading, setLoading] = useState(true)
  const [rafflesLoading, setRafflesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Custom hooks for enhanced functionality
  const tenantSettings = useTenantSettings({
    tenantId: resolvedParams.id,
    initialData: tenant ? {
      name: tenant.name,
      description: tenant.description,
      layout: tenant.layout
    } : undefined
  })

  const layoutManager = useLayoutManager({
    currentLayout: tenant?.layout || 'default',
    userPlan: tenant?.plan || 'basic',
    onLayoutChange: (layoutId) => {
      tenantSettings.updateField('layout', layoutId)
    }
  })

  const planManager = usePlanManagement({
    tenantId: resolvedParams.id,
    currentPlan: tenant?.plan || 'basic',
    onPlanChange: (newPlan, success) => {
      if (success && tenant) {
        setTenant(prev => prev ? { ...prev, plan: newPlan as any } : null)
      }
    }
  })

  useEffect(() => {
    loadTenantDetails()
  }, [resolvedParams.id])

  useEffect(() => {
    if (activeTab === 'raffles') {
      loadRaffles()
    }
  }, [activeTab])

  useEffect(() => {
    if (tenant) {
      tenantSettings.updateInitialData({
        name: tenant.name,
        description: tenant.description,
        layout: tenant.layout
      })
    }
  }, [tenant, tenantSettings.updateInitialData])

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

  const loadRaffles = async () => {
    if (!tenant) return

    try {
      setRafflesLoading(true)
      const response = await raffleService.getRaffles(undefined, 1, 5)
      setRaffles(response.data as BasicRaffle[])
    } catch (err) {
      console.error('Error loading raffles:', err)
      setRaffles([])
    } finally {
      setRafflesLoading(false)
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

  const handleSaveSettings = async () => {
    const result = await tenantSettings.saveChanges()
    if (result.success && result.data) {
      setTenant(prev => prev ? { ...prev, ...result.data } : null)
    }
    return result
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

  const getPlanInfo = (plan: string) => {
    const planConfig = {
      basic: {
        name: 'Básico',
        color: 'gray',
        className: 'bg-gray-100 text-gray-800',
        icon: Activity,
        features: ['Subdominio incluido', 'Funciones básicas', 'Soporte estándar']
      },
      pro: {
        name: 'Pro',
        color: 'blue',
        className: 'bg-blue-100 text-blue-800',
        icon: Zap,
        features: ['Dominio personalizado', 'Reportes avanzados', 'Soporte prioritario']
      },
      enterprise: {
        name: 'Enterprise',
        color: 'purple',
        className: 'bg-purple-100 text-purple-800',
        icon: Crown,
        features: ['Todas las funciones', 'API completa', 'Soporte 24/7']
      }
    }

    return planConfig[plan as keyof typeof planConfig] || planConfig.basic
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

  const getRaffleStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      active: { label: 'Activa', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Completada', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: TrendingUp },
    { id: 'domains', name: 'Dominios', icon: Globe },
    { id: 'raffles', name: 'Rifas', icon: Gift },
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

  const planInfo = getPlanInfo(tenant.plan)
  const isBasicPlan = tenant.plan === 'basic'

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
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                  {tenant.name}
                </h1>
                {getStatusBadge(tenant.status || 'active')}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planInfo.className}`}>
                  <planInfo.icon className="h-4 w-4 mr-1" />
                  Plan {planInfo.name}
                </span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-4">
                <span className="truncate">/{tenant.slug}</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Creado {formatDate(tenant.created_at)}
                </span>
                {tenant.description && (
                  <span className="truncate max-w-md">{tenant.description}</span>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <Gift className="h-8 w-8 text-green-400" />
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
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Entradas Vendidas
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {tenant.entry_count.toLocaleString()}
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
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ingresos Est.
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      ${(tenant.entry_count * 10).toLocaleString()}
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
                        <dt className="text-sm font-medium text-gray-500">Plan</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.className}`}>
                            <planInfo.icon className="h-3 w-3 mr-1" />
                            {planInfo.name}
                          </span>
                        </dd>
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

                {/* Plan Features */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Características del Plan {planInfo.name}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {planInfo.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Configuración de Dominios
                  </h3>
                  {!isBasicPlan ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                      <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                      Agregar Dominio
                    </button>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500">
                      <Lock className="h-4 w-4 mr-1" />
                      Plan básico
                    </div>
                  )}
                </div>

                {isBasicPlan && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-amber-800">
                          Plan Básico - Subdominio Incluido
                        </h4>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>Con el plan básico, tu tenant está disponible en:</p>
                          <p className="mt-1 font-mono bg-amber-100 px-2 py-1 rounded">
                            https://{tenant.slug}.{getBaseUrl().replace(/^https?:\/\//, '')}
                          </p>
                          <p className="mt-2">
                            Para usar dominios personalizados, actualiza a Plan Pro o Enterprise.
                          </p>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => planManager.setShowUpgradeModal(true)}
                            className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-600"
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Actualizar Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                              {!isBasicPlan && (
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {!domain.verified && !isBasicPlan && (
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
                        {isBasicPlan ? 'Dominio por Defecto' : 'No hay dominios configurados'}
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {isBasicPlan
                          ? `Tu tenant está disponible en https://${tenant.slug}.${getBaseUrl().replace(/^https?:\/\//, '')}`
                          : 'Agrega un dominio para que los usuarios puedan acceder al tenant.'
                        }
                      </p>
                      {!isBasicPlan && (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                        >
                          <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                          Agregar Primer Dominio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'raffles' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Rifas del Tenant
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                    onClick={() => {
                      console.log('Redirect to create raffle for tenant:', tenant.id)
                    }}
                  >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Nueva Rifa
                  </button>
                </div>

                {rafflesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Cargando rifas...</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {raffles && raffles.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {raffles.map((raffle) => (
                          <div key={raffle.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <Gift className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {raffle.title}
                                    </p>
                                    {getRaffleStatusBadge(raffle.status)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                                    <span>${raffle.price}</span>
                                    <span>{raffle.total_numbers} números</span>
                                    <span>
                                      Sorteo: {new Date(raffle.draw_date).toLocaleDateString('es-ES')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => {
                                    console.log('View raffle:', raffle.id)
                                  }}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </button>
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
                        <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          No hay rifas creadas
                        </h4>
                        <p className="text-gray-500 mb-4">
                          Crea la primera rifa para este tenant y comienza a generar ingresos.
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                          onClick={() => {
                            console.log('Create first raffle for tenant:', tenant.id)
                          }}
                        >
                          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                          Crear Primera Rifa
                        </button>
                      </div>
                    )}
                  </div>
                )}
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

            {/* ENHANCED SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Header de configuración */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Configuración del Tenant
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Gestiona los ajustes generales de tu tenant
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    {tenantSettings.isEditing ? (
                      <>
                        <button
                          onClick={tenantSettings.cancelEditing}
                          disabled={tenantSettings.saveLoading}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveSettings}
                          disabled={tenantSettings.saveLoading || !tenantSettings.hasChanges}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {tenantSettings.saveLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Guardar{tenantSettings.hasChanges ? ' Cambios' : ''}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={tenantSettings.startEditing}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuración General */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-base font-medium text-gray-900">
                      Información General
                    </h4>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Tenant
                        </label>
                        {tenantSettings.isEditing ? (
                          <input
                            type="text"
                            value={tenantSettings.formData.name}
                            onChange={(e) => tenantSettings.updateField('name', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            placeholder="Nombre del tenant"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                            {tenant.name}
                          </p>
                        )}
                        {tenantSettings.isEditing && tenantSettings.validation.errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {tenantSettings.validation.errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            /
                          </span>
                          <input
                            type="text"
                            value={tenant.slug}
                            disabled
                            className="flex-1 block rounded-r-md border-gray-300 bg-gray-50 text-sm"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          El slug no se puede modificar después de la creación
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      {tenantSettings.isEditing ? (
                        <textarea
                          value={tenantSettings.formData.description}
                          onChange={(e) => tenantSettings.updateField('description', e.target.value)}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          placeholder="Descripción del tenant..."
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">
                          {tenant.description || 'Sin descripción'}
                        </p>
                      )}
                      {tenantSettings.isEditing && tenantSettings.validation.errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {tenantSettings.validation.errors.description}
                        </p>
                      )}
                    </div>

                    {/* Layout Selector Mejorado */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Layout / Tema
                          </label>
                          <p className="text-xs text-gray-500">
                            Personaliza la apariencia de tu tenant
                          </p>
                        </div>
                        {tenantSettings.isEditing && (
                          <button
                            onClick={layoutManager.togglePreview}
                            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                          >
                            Ver Preview
                          </button>
                        )}
                      </div>

                      {tenantSettings.isEditing ? (
                        <LayoutSelector
                          layouts={layoutManager.availableLayouts}
                          selectedLayout={tenantSettings.formData.layout}
                          onLayoutSelect={(layoutId) => tenantSettings.updateField('layout', layoutId)}
                          onPreview={(layout) => {
                            layoutManager.selectLayout(layout.id)
                            layoutManager.togglePreview()
                          }}
                          userPlan={tenant.plan}
                        />
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className="h-12 w-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center mr-4">
                              <Monitor className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{layoutManager.currentLayout.name}</h5>
                              <p className="text-sm text-gray-500">{layoutManager.currentLayout.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {layoutManager.currentLayout.features.slice(0, 3).map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              layoutManager.selectLayout(tenant.layout)
                              layoutManager.togglePreview()
                            }}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Management */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium text-gray-900">
                        Gestión de Plan
                      </h4>
                      <button
                        onClick={() => planManager.setShowUpgradeModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Cambiar Plan
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full bg-${planManager.currentPlanInfo.color}-100`}>
                          <planManager.currentPlanInfo.icon className={`h-6 w-6 text-${planManager.currentPlanInfo.color}-600`} />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h5 className="text-lg font-medium text-gray-900">Plan {planManager.currentPlanInfo.name}</h5>
                            {planManager.currentPlanInfo.popular && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            ${planManager.currentPlanInfo.price}/{planManager.currentPlanInfo.period}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${planManager.currentPlanInfo.price}
                        </div>
                        <div className="text-sm text-gray-500">por {planManager.currentPlanInfo.period}</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h6 className="text-sm font-medium text-gray-900 mb-3">Características incluidas</h6>
                        <ul className="space-y-2">
                          {planManager.currentPlanInfo.features.filter(f => f.included).slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {planManager.blockedFeatures.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-900 mb-3">Funciones bloqueadas</h6>
                          <ul className="space-y-2">
                            {planManager.blockedFeatures.slice(0, 5).map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <XCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{feature.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {planManager.canUpgrade && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Crown className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">
                              ¿Necesitas más funcionalidades?
                            </h4>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                Actualiza a un plan superior para acceder a más layouts, dominios personalizados,
                                y funciones avanzadas.
                              </p>
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() => planManager.setShowUpgradeModal(true)}
                                className="inline-flex items-center text-sm font-medium text-blue-800 hover:text-blue-600"
                              >
                                Ver planes disponibles
                                <ChevronUp className="h-4 w-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuración de Seguridad */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-base font-medium text-gray-900">
                      Configuración de Seguridad
                    </h4>
                  </div>
                  <div className="p-6 space-y-4">
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

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Notificaciones por email
                        </p>
                        <p className="text-sm text-gray-500">
                          Recibir notificaciones de actividad del tenant
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
                <div className="bg-white border border-red-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-red-200">
                    <h4 className="text-base font-medium text-red-900">
                      Zona de Peligro
                    </h4>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          Suspender tenant
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          El tenant será suspendido temporalmente. Los usuarios no podrán acceder.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={tenant.status === 'suspended'}
                        className="ml-4 inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleStatusChange('suspended')}
                      >
                        <Ban className="-ml-0.5 mr-1.5 h-4 w-4" />
                        {tenant.status === 'suspended' ? 'Suspendido' : 'Suspender'}
                      </button>
                    </div>

                    <hr className="border-red-200" />

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          Eliminar tenant
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          Esta acción no se puede deshacer. Todos los datos se perderán permanentemente.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ml-4 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres eliminar este tenant? Esta acción no se puede deshacer.')) {
                            handleStatusChange('deleted')
                          }
                        }}
                      >
                        <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
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

      {/* Layout Preview Modal */}
      <LayoutPreview
        layout={layoutManager.currentLayout}
        isOpen={layoutManager.showPreview}
        onClose={layoutManager.togglePreview}
        device={layoutManager.previewMode}
        onDeviceChange={layoutManager.setPreviewDevice}
        tenantSlug={tenant.slug}
      />

      {/* Plan Upgrade Modal */}
      {planManager.showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Cambiar Plan de Suscripción
                </h3>
                <p className="text-sm text-gray-500">
                  Selecciona el plan que mejor se adapte a tus necesidades
                </p>
              </div>
              <button
                onClick={() => planManager.setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {planManager.allPlans.map((plan) => {
                  const isCurrentPlan = plan.id === tenant.plan
                  const isUpgrade = planManager.isUpgrade(plan.id)

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg border-2 p-6 ${isCurrentPlan
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : plan.popular
                            ? 'border-orange-300 ring-2 ring-orange-100'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isCurrentPlan ? 'cursor-pointer' : ''} transition-all`}
                      onClick={() => !isCurrentPlan && !planManager.changingPlan && planManager.changePlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            Más Popular
                          </span>
                        </div>
                      )}

                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Check className="h-3 w-3 mr-1" />
                            Plan Actual
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                          <plan.icon />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                        <div className="mt-2 mb-4">
                          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-500">/{plan.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.filter(f => f.included).slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature.name}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        {isCurrentPlan ? (
                          <button
                            disabled
                            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed"
                          >
                            Plan Actual
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              planManager.changePlan(plan.id)
                            }}
                            disabled={planManager.changingPlan}
                            className={`w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white ${isUpgrade
                                ? `bg-${plan.color}-600 hover:bg-${plan.color}-700`
                                : `bg-gray-400 hover:bg-gray-500`
                              } disabled:opacity-50 transition-colors`}
                          >
                            {planManager.changingPlan ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Cambiando...
                              </div>
                            ) : (
                              <>
                                {isUpgrade ? 'Actualizar' : 'Cambiar'} a {plan.name}
                                {isUpgrade && <ChevronUp className="h-4 w-4 ml-1 inline" />}
                                {!isUpgrade && <ChevronDown className="h-4 w-4 ml-1 inline" />}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Plan Comparison Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    ¿Necesitas ayuda para elegir?
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Todos los planes incluyen actualizaciones automáticas y soporte técnico.
                    Puedes cambiar o cancelar en cualquier momento.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Sin compromisos a largo plazo
                    </div>
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Migración de datos incluida
                    </div>
                    <div className="flex items-center text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Soporte durante la transición
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => planManager.setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  // Aquí podrías abrir un chat de soporte o contacto
                  console.log('Contact support for plan consultation')
                }}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}