// hooks/layout/useLayoutSelection.ts
// Lógica de selección y filtrado de layouts
import { useState, useCallback, useEffect } from 'react'

export interface LayoutTemplate {
    id: string
    name: string
    description: string
    preview: string
    features: string[]
    available: ('basic' | 'professional' | 'enterprise')[]
    category?: 'modern' | 'classic' | 'creative' | 'premium' | 'futuristic' | 'cultural' | 'adventure'
    color_scheme?: 'light' | 'dark' | 'auto'
    responsive?: boolean
    component?: React.ComponentType<any>
    props?: Record<string, any>
}

export function useLayoutSelection(
    allLayouts: LayoutTemplate[],
    currentLayout: string,
    userPlan: 'basic' | 'professional' | 'enterprise',
    onLayoutChange?: (layoutId: string) => void
) {
    const [selectedLayout, setSelectedLayout] = useState(currentLayout)
    const [loading, setLoading] = useState(false)

    const availableLayouts = useCallback(() => {
        return allLayouts.filter(layout => layout.available.includes(userPlan))
    }, [allLayouts, userPlan])

    const getCurrentLayout = useCallback(() => {
        return allLayouts.find(layout => layout.id === selectedLayout) || allLayouts[0]
    }, [allLayouts, selectedLayout])

    const isLayoutAvailable = useCallback((layoutId: string) => {
        const layout = allLayouts.find(l => l.id === layoutId)
        return layout ? layout.available.includes(userPlan) : false
    }, [allLayouts, userPlan])

    const getLayoutsByCategory = useCallback((category?: string) => {
        const layouts = availableLayouts()
        if (!category) return layouts
        return layouts.filter(layout => layout.category === category)
    }, [availableLayouts])

    const selectLayout = useCallback((layoutId: string) => {
        if (isLayoutAvailable(layoutId)) {
            setSelectedLayout(layoutId)
            onLayoutChange?.(layoutId)
        }
    }, [isLayoutAvailable, onLayoutChange])

    const applyLayout = useCallback(async (layoutId: string) => {
        if (!isLayoutAvailable(layoutId)) return false

        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSelectedLayout(layoutId)
            onLayoutChange?.(layoutId)
            return true
        } catch (error) {
            console.error('Error applying layout:', error)
            return false
        } finally {
            setLoading(false)
        }
    }, [isLayoutAvailable, onLayoutChange])

    const getBlockedLayouts = useCallback(() => {
        return allLayouts.filter(layout => !layout.available.includes(userPlan))
    }, [allLayouts, userPlan])

    const getRequiredPlan = useCallback((layoutId: string) => {
        const layout = allLayouts.find(l => l.id === layoutId)
        if (!layout) return null

        const planHierarchy = ['basic', 'professional', 'enterprise']
        const currentPlanIndex = planHierarchy.indexOf(userPlan)

        for (const plan of layout.available) {
            const planIndex = planHierarchy.indexOf(plan)
            if (planIndex > currentPlanIndex) {
                return plan as 'professional' | 'enterprise'
            }
        }
        return null
    }, [allLayouts, userPlan])

    const resetToDefault = useCallback(() => {
        setSelectedLayout('default')
        onLayoutChange?.('default')
    }, [onLayoutChange])

    const getAvailableCategories = useCallback(() => {
        const categories = new Set(availableLayouts().map(l => l.category).filter(Boolean))
        return Array.from(categories)
    }, [availableLayouts])

    useEffect(() => {
        if (currentLayout !== selectedLayout) {
            setSelectedLayout(currentLayout)
        }
    }, [currentLayout, selectedLayout])

    return {
        selectedLayout,
        loading,
        availableLayouts: availableLayouts(),
        allLayouts,
        currentLayout: getCurrentLayout(),
        blockedLayouts: getBlockedLayouts(),
        availableCategories: getAvailableCategories(),
        selectLayout,
        applyLayout,
        resetToDefault,
        isLayoutAvailable,
        getLayoutsByCategory,
        getRequiredPlan
    }
}
