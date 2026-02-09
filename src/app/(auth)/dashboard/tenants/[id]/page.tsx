// 📁 page.tsx (Versión corregida con preview independiente)
'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Globe, Gift, Users, Settings, XCircle, ArrowLeft } from 'lucide-react'

// Services
import { tenantService } from '@/admin/services/tenantService'
import { raffleService } from '@/admin/services/rafflesService'

// Hooks
import { useTenantSettings } from '@/admin/hooks/useTenantSettings'
import { useLayoutManager } from '@/admin/hooks/useLayoutManager'
import { usePlanManagement } from '@/admin/hooks/usePlanManagement'

// CORRECCIÓN: Cambiado de LayoutPreviewModal a LayoutPreview
import { LayoutPreview } from '@/admin/components/LayoutPreview'
import { PlanUpgradeModal } from '@/admin/components/tenant-details/modals/PlanUpgradeModal'
import { StatsCards } from '@/admin/components/tenant-details/StatsCards'
import { TabNavigation } from '@/admin/components/tenant-details/TabNavigation'
import { DomainsTab } from '@/admin/components/tenant-details/tabs/DomainsTab'
import { OverviewTab } from '@/admin/components/tenant-details/tabs/OverviewTab'
import { RafflesTab } from '@/admin/components/tenant-details/tabs/RafflesTab'
import { SettingsTab } from '@/admin/components/tenant-details/tabs/SettingsTab'
import { UsersTab } from '@/admin/components/tenant-details/tabs/UsersTab'
import { TenantHeader } from '@/admin/components/tenant-details/TenantHeader'
import { TenantDetails, BasicRaffle } from '@/admin/types/tenant'
import { getStatusBadge, getPlanInfo, getBaseUrl, getRaffleStatusBadge } from '@/admin/utils/tenant'
import { formatDate } from '@/utils/templateHelpers'
import { ConfigurationsTab } from '@/admin/components/tenant-details/tabs/ConfigurationsTab'

interface TenantDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function TenantDetailsPage({ params }: TenantDetailsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()

  // State
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [raffles, setRaffles] = useState<BasicRaffle[]>([])
  const [loading, setLoading] = useState(true)
  const [rafflesLoading, setRafflesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // NUEVO: Estado para el preview independiente
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    layout: null as any, // LayoutTemplate | null
    device: 'desktop' as 'desktop' | 'tablet' | 'mobile'
  })

  // Custom hooks
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

  // Effects
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

  // Methods
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

  // NUEVO: Handlers para el preview independiente
  const handleLayoutPreview = (layout: any) => {
    console.log('📱 Abriendo preview para layout:', layout.name)
    setPreviewState({
      isOpen: true,
      layout: layout,
      device: 'desktop'
    })
  }

  const handleClosePreview = () => {
    console.log('❌ Cerrando preview')
    setPreviewState({
      isOpen: false,
      layout: null,
      device: 'desktop'
    })
  }

  const handlePreviewDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewState(prev => ({
      ...prev,
      device
    }))
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: TrendingUp },
    { id: 'domains', name: 'Dominios', icon: Globe },
    { id: 'raffles', name: 'Rifas', icon: Gift },
    { id: 'configurations', name: 'Configuraciones', icon: Settings },
    { id: 'settings', name: 'General', icon: Settings }
  ]

  // Event handlers
  const handleCreateRaffle = () => {
    console.log('Redirect to create raffle for tenant:', tenant?.id)
  }

  const handleViewRaffle = (raffleId: string) => {
    console.log('View raffle:', raffleId)
  }

  const handleInviteUser = () => {
    console.log('Invite user to tenant:', tenant?.id)
  }

  // Loading & Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles del tenant...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tenants
          </button>
        </div>
      </div>
    )
  }

  const isBasicPlan = tenant.plan === 'basic'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-3 lg:px-8 py-3">
        <TenantHeader
          tenant={tenant}
          onBack={() => router.push('/dashboard/tenants')}
          onStatusChange={handleStatusChange}
          actionLoading={actionLoading}
          getStatusBadge={getStatusBadge}
          getPlanInfo={getPlanInfo}
          formatDate={formatDate}
        />

        <StatsCards tenant={tenant} />

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-3">
            {activeTab === 'overview' && (
              <OverviewTab
                tenant={tenant}
                getStatusBadge={getStatusBadge}
                getPlanInfo={getPlanInfo}
                formatDate={formatDate}
              />
            )}

            {activeTab === 'domains' && (
              <DomainsTab
                tenant={tenant}
                isBasicPlan={isBasicPlan}
                getBaseUrl={getBaseUrl}
                formatDate={formatDate}
                onUpgradePlan={() => planManager.setShowUpgradeModal(true)}
              />
            )}

            {activeTab === 'raffles' && (
              <RafflesTab
                raffles={raffles}
                loading={rafflesLoading}
                onCreateRaffle={handleCreateRaffle}
                onViewRaffle={handleViewRaffle}
                getRaffleStatusBadge={getRaffleStatusBadge}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab
                tenant={tenant}
                onInviteUser={handleInviteUser}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                tenant={tenant}
                tenantSettings={tenantSettings}
                layoutManager={layoutManager}
                planManager={planManager}
                onSaveSettings={handleSaveSettings}
                onStatusChange={handleStatusChange}
                // NUEVO: Pasar el handler de preview
                onLayoutPreview={handleLayoutPreview}
              />
            )}

            {activeTab === 'configurations' && (
              <ConfigurationsTab tenantId={tenant.id} />
            )}
          </div>
        </div>
      </div>

      {/* CORRECCIÓN: Usar el estado independiente del preview */}
      {previewState.layout && (
        <LayoutPreview
          layout={previewState.layout}
          isOpen={previewState.isOpen}
          onClose={handleClosePreview}
          device={previewState.device}
          onDeviceChange={handlePreviewDeviceChange}
          tenantSlug={tenant.slug}
          renderDirectly={true}
        />
      )}

      <PlanUpgradeModal
        isOpen={planManager.showUpgradeModal}
        onClose={() => planManager.setShowUpgradeModal(false)}
        allPlans={planManager.allPlans}
        currentPlan={tenant.plan}
        changingPlan={planManager.changingPlan}
        onChangePlan={planManager.changePlan}
        isUpgrade={planManager.isUpgrade}
      />
    </div>
  )
}