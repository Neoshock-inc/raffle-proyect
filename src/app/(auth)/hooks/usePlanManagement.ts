
// 📁 hooks/usePlanManagement.ts (Versión consolidada)
import { useState, useCallback, useMemo } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'
import { PlanId } from '@/app/types/plans'
import { PLANS } from '../utils/tenant'

interface UsePlanManagementProps {
  tenantId: string
  currentPlan: PlanId
  onPlanChange?: (newPlan: string, success: boolean) => void
}

export const usePlanManagement = ({ tenantId, currentPlan, onPlanChange }: UsePlanManagementProps) => {
  const [changingPlan, setChangingPlan] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Obtener información del plan actual
  const getCurrentPlanInfo = useCallback(() => {
    return PLANS[currentPlan] || PLANS.basic
  }, [currentPlan])

  // Obtener todos los planes como array
  const getAllPlans = useCallback(() => {
    return Object.values(PLANS)
  }, [])

  // Verificar si es un upgrade o downgrade
  const isUpgrade = useCallback((planId: string) => {
    const planHierarchy: PlanId[] = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    const newIndex = planHierarchy.indexOf(planId as PlanId)
    return newIndex > currentIndex
  }, [currentPlan])

  const isDowngrade = useCallback((planId: string) => {
    const planHierarchy: PlanId[] = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    const newIndex = planHierarchy.indexOf(planId as PlanId)
    return newIndex < currentIndex
  }, [currentPlan])

  // Cambiar plan
  const changePlan = useCallback(async (newPlanId: string) => {
    if (newPlanId === currentPlan) return { success: true }

    setChangingPlan(true)
    try {
      await tenantService.updateTenant(tenantId, { plan: newPlanId as PlanId })
      onPlanChange?.(newPlanId, true)
      setShowUpgradeModal(false)

      return {
        success: true,
        message: `Plan actualizado a ${PLANS[newPlanId as PlanId]?.name} exitosamente`
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
    return Object.entries(currentPlanInfo.features)
      .filter(([, included]) => !included)
      .map(([name]) => ({ name }))
  }, [getCurrentPlanInfo])

  // Obtener próximo plan recomendado
  const getRecommendedUpgrade = useCallback(() => {
    const planHierarchy: PlanId[] = ['basic', 'pro', 'enterprise']
    const currentIndex = planHierarchy.indexOf(currentPlan)
    if (currentIndex < planHierarchy.length - 1) {
      return PLANS[planHierarchy[currentIndex + 1]]
    }
    return null
  }, [currentPlan])

  // Obtener features disponibles por plan
  const getAvailableFeatures = useCallback((planId: string) => {
    const plan = PLANS[planId as PlanId]
    if (!plan) return []
    
    return Object.entries(plan.features)
      .filter(([, included]) => included)
      .map(([name]) => ({ name, included: true }))
  }, [])

  // Comparar planes
  const comparePlans = useCallback((planIds: string[]) => {
    return planIds
      .map(id => PLANS[id as PlanId])
      .filter(Boolean)
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

    // Información del plan
    currentPlanInfo,
    allPlans: getAllPlans(),
    recommendedUpgrade,
    blockedFeatures,

    // Acciones
    changePlan,
    setShowUpgradeModal,
    setSelectedPlan,

    // Utilidades
    isUpgrade,
    isDowngrade,
    comparePlans,
    getAvailableFeatures,

    // Helpers
    canUpgrade: currentPlan !== 'enterprise',
    canDowngrade: currentPlan !== 'basic',
    isFreePlan: currentPlan === 'basic',
    isPremiumPlan: ['pro', 'enterprise'].includes(currentPlan)
  }
}
