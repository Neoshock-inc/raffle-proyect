// hooks/usePlanManagement.ts
import { useState, useCallback, useMemo } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'
import { Activity, Crown, Zap } from 'lucide-react'

export interface PlanFeature {
  name: string
  description?: string
  included: boolean
  highlight?: boolean
}

export interface PlanOption {
  id: 'basic' | 'pro' | 'enterprise'
  name: string
  price: number
  period: 'mes' | 'año'
  popular?: boolean
  features: PlanFeature[]
  limitations?: string[]
  color: string
  icon: React.ElementType   // 👈 acepta un componente React
  maxRaffles?: number
  maxDomains?: number
  supportLevel: 'email' | 'priority' | '24/7'
  apiAccess?: 'none' | 'basic' | 'full'
  customBranding?: boolean
  analytics?: 'basic' | 'advanced' | 'enterprise'
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    period: 'mes',
    color: 'gray',
    icon: Activity,   // 👈 ahora guardas el componente
    maxRaffles: 100,
    maxDomains: 0,
    supportLevel: 'email',
    apiAccess: 'none',
    customBranding: false,
    analytics: 'basic',
    features: [
      { name: 'Subdominio incluido', included: true },
      { name: 'Hasta 100 rifas por mes', included: true },
      { name: 'Soporte por email', included: true },
      { name: '3 layouts básicos', included: true },
      { name: 'Reportes básicos', included: true },
      { name: 'Dominio personalizado', included: false },
      { name: 'API acceso', included: false },
      { name: 'Sin marca externa', included: false }
    ],
    limitations: ['Marca "Powered by Rifas System"', 'No dominios personalizados']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'mes',
    popular: true,
    color: 'blue',
    icon: Zap,
    maxRaffles: -1, // ilimitado
    maxDomains: 1,
    supportLevel: 'priority',
    apiAccess: 'basic',
    customBranding: true,
    analytics: 'advanced',
    features: [
      { name: 'Todo lo del plan Básico', included: true },
      { name: 'Dominio personalizado', included: true, highlight: true },
      { name: 'Rifas ilimitadas', included: true, highlight: true },
      { name: 'Soporte prioritario', included: true },
      { name: '4 layouts premium', included: true },
      { name: 'Reportes avanzados', included: true, highlight: true },
      { name: 'API básica', included: true },
      { name: 'Sin marca externa', included: true },
      { name: 'Múltiples dominios', included: false },
      { name: 'Soporte 24/7', included: false }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'mes',
    color: 'purple',
    icon: Crown,
    maxRaffles: -1, // ilimitado
    maxDomains: -1, // ilimitado
    supportLevel: '24/7',
    apiAccess: 'full',
    customBranding: true,
    analytics: 'enterprise',
    features: [
      { name: 'Todo lo del plan Pro', included: true },
      { name: 'Múltiples dominios', included: true, highlight: true },
      { name: 'Layout personalizado', included: true, highlight: true },
      { name: 'Soporte 24/7', included: true, highlight: true },
      { name: 'API completa', included: true },
      { name: 'White label completo', included: true },
      { name: 'Integración SSO', included: true },
      { name: 'Manager dedicado', included: true, highlight: true },
      { name: 'SLA garantizado', included: true },
      { name: 'Reportes personalizados', included: true }
    ]
  }
]

interface UsePlanManagementProps {
  tenantId: string
  currentPlan: 'basic' | 'pro' | 'enterprise'
  onPlanChange?: (newPlan: string, success: boolean) => void
}

export const usePlanManagement = ({ tenantId, currentPlan, onPlanChange }: UsePlanManagementProps) => {
  const [changingPlan, setChangingPlan] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  // Obtener información del plan actual
  const getCurrentPlanInfo = useCallback(() => {
    return PLAN_OPTIONS.find(plan => plan.id === currentPlan) || PLAN_OPTIONS[0]
  }, [currentPlan])

  // Obtener todos los planes
  const getAllPlans = useCallback(() => {
    return PLAN_OPTIONS
  }, [])

  // Verificar si es un upgrade o downgrade
  const isUpgrade = useCallback((planId: string) => {
    const planHierarchy = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    const newIndex = planHierarchy.indexOf(planId)
    return newIndex > currentIndex
  }, [currentPlan])

  const isDowngrade = useCallback((planId: string) => {
    const planHierarchy = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    const newIndex = planHierarchy.indexOf(planId)
    return newIndex < currentIndex
  }, [currentPlan])

  // Calcular precio con descuento anual
  const calculatePrice = useCallback((plan: PlanOption) => {
    const basePrice = plan.price
    if (billingPeriod === 'yearly') {
      return Math.round(basePrice * 12 * 0.8) // 20% descuento anual
    }
    return basePrice
  }, [billingPeriod])

  // Obtener ahorros anuales
  const getYearlySavings = useCallback((plan: PlanOption) => {
    const monthlyTotal = plan.price * 12
    const yearlyPrice = calculatePrice(plan)
    return monthlyTotal - yearlyPrice
  }, [calculatePrice])

  // Cambiar plan
  const changePlan = useCallback(async (newPlanId: string) => {
    if (newPlanId === currentPlan) return { success: true }

    setChangingPlan(true)
    try {
      await tenantService.updateTenant(tenantId, { plan: newPlanId as any })
      onPlanChange?.(newPlanId, true)
      setShowUpgradeModal(false)

      return {
        success: true,
        message: `Plan actualizado a ${PLAN_OPTIONS.find(p => p.id === newPlanId)?.name} exitosamente`
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      onPlanChange?.(newPlanId, false)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar el plan'
      }
    } finally {
      setChangingPlan(false)
    }
  }, [tenantId, currentPlan, onPlanChange])

  // Obtener funciones bloqueadas del plan actual
  const getBlockedFeatures = useCallback(() => {
    const currentPlanInfo = getCurrentPlanInfo()
    return currentPlanInfo.features.filter(feature => !feature.included)
  }, [getCurrentPlanInfo])

  // Obtener próximo plan recomendado
  const getRecommendedUpgrade = useCallback(() => {
    const planHierarchy = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    if (currentIndex < planHierarchy.length - 1) {
      return PLAN_OPTIONS.find(p => p.id === planHierarchy[currentIndex + 1])
    }
    return null
  }, [currentPlan])

  // Verificar límites del plan
  const checkPlanLimits = useCallback((usage: {
    raffles?: number
    domains?: number
  }) => {
    const planInfo = getCurrentPlanInfo()
    const warnings = []

    if (planInfo.maxRaffles !== -1 && usage.raffles && usage.raffles > planInfo.maxRaffles! * 0.8) {
      warnings.push({
        type: 'raffles',
        current: usage.raffles,
        limit: planInfo.maxRaffles,
        percentage: (usage.raffles / planInfo.maxRaffles!) * 100
      })
    }

    if (planInfo.maxDomains !== -1 && usage.domains && usage.domains >= planInfo.maxDomains!) {
      warnings.push({
        type: 'domains',
        current: usage.domains,
        limit: planInfo.maxDomains,
        percentage: 100
      })
    }

    return warnings
  }, [getCurrentPlanInfo])

  // Comparar planes
  const comparePlans = useCallback((planIds: string[]) => {
    return planIds.map(id => PLAN_OPTIONS.find(p => p.id === id)).filter(Boolean)
  }, [])

  // Features disponibles por plan
  const getAvailableFeatures = useCallback((planId: string) => {
    const plan = PLAN_OPTIONS.find(p => p.id === planId)
    return plan ? plan.features.filter(f => f.included) : []
  }, [])

  // Memoized values
  const currentPlanInfo = useMemo(() => getCurrentPlanInfo(), [getCurrentPlanInfo])
  const recommendedUpgrade = useMemo(() => getRecommendedUpgrade(), [getRecommendedUpgrade])
  const blockedFeatures = useMemo(() => getBlockedFeatures(), [getBlockedFeatures])

  return {
    // Estados
    changingPlan,
    showUpgradeModal,
    selectedPlan,
    billingPeriod,

    // Información del plan
    currentPlanInfo,
    allPlans: getAllPlans(),
    recommendedUpgrade,
    blockedFeatures,

    // Acciones
    changePlan,
    setShowUpgradeModal,
    setSelectedPlan,
    setBillingPeriod,

    // Utilidades
    isUpgrade,
    isDowngrade,
    calculatePrice,
    getYearlySavings,
    checkPlanLimits,
    comparePlans,
    getAvailableFeatures,

    // Helpers
    canUpgrade: currentPlan !== 'enterprise',
    canDowngrade: currentPlan !== 'basic',
    isFreePlan: currentPlan === 'basic',
    isPremiumPlan: ['pro', 'enterprise'].includes(currentPlan)
  }
}