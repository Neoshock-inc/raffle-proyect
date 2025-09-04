// hooks/useLayoutManager.ts
import { useState, useCallback, useEffect } from 'react'

export interface LayoutTemplate {
    id: string
    name: string
    description: string
    preview: string
    features: string[]
    available: ('basic' | 'pro' | 'enterprise')[]
    category?: 'modern' | 'classic' | 'creative'
    color_scheme?: 'light' | 'dark' | 'auto'
    responsive?: boolean
}

// Simulación de templates disponibles (en producción vendría de una API)
const AVAILABLE_LAYOUTS: LayoutTemplate[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Layout clásico y funcional para todo tipo de rifas',
        preview: '/images/templates/default.jpeg',
        features: ['Diseño limpio', 'Fácil navegación', 'Compatible móvil', 'Carga rápida'],
        available: ['basic', 'pro', 'enterprise'],
        category: 'classic',
        color_scheme: 'light',
        responsive: true
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        description: 'Colores vivos y elementos dinámicos para rifas llamativas',
        preview: '/images/templates/vibrant.jpeg',
        features: ['Colores brillantes', 'Efectos hover', 'Elementos interactivos', 'Animaciones'],
        available: ['basic', 'pro', 'enterprise'],
        category: 'creative',
        color_scheme: 'light',
        responsive: true
    },
    {
        id: 'elegant',
        name: 'Elegant',
        description: 'Diseño sofisticado con tipografía elegante para rifas premium',
        preview: '/images/templates/elegant.jpeg',
        features: ['Tipografía premium', 'Diseño minimalista', 'Espacios amplios', 'Alta legibilidad'],
        available: ['enterprise', 'pro'],
        category: 'modern',
        color_scheme: 'dark',
        responsive: true
    }
]

interface UseLayoutManagerProps {
    currentLayout: string
    userPlan: 'basic' | 'pro' | 'enterprise'
    onLayoutChange?: (layoutId: string) => void
}

export const useLayoutManager = ({ currentLayout, userPlan, onLayoutChange }: UseLayoutManagerProps) => {
    const [selectedLayout, setSelectedLayout] = useState(currentLayout)
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [showPreview, setShowPreview] = useState(false)
    const [loading, setLoading] = useState(false)

    // Obtener layouts disponibles según el plan
    const availableLayouts = useCallback(() => {
        return AVAILABLE_LAYOUTS.filter(layout =>
            layout.available.includes(userPlan)
        )
    }, [userPlan])

    // Obtener todos los layouts para mostrar los bloqueados
    const allLayouts = useCallback(() => {
        return AVAILABLE_LAYOUTS
    }, [])

    // Obtener layout actual
    const getCurrentLayout = useCallback(() => {
        return AVAILABLE_LAYOUTS.find(layout => layout.id === selectedLayout) || AVAILABLE_LAYOUTS[0]
    }, [selectedLayout])

    // Verificar si un layout está disponible
    const isLayoutAvailable = useCallback((layoutId: string) => {
        const layout = AVAILABLE_LAYOUTS.find(l => l.id === layoutId)
        return layout ? layout.available.includes(userPlan) : false
    }, [userPlan])

    // Obtener layouts por categoría
    const getLayoutsByCategory = useCallback((category?: string) => {
        const layouts = availableLayouts()
        if (!category) return layouts
        return layouts.filter(layout => layout.category === category)
    }, [availableLayouts])

    // Cambiar layout seleccionado
    const selectLayout = useCallback((layoutId: string) => {
        if (isLayoutAvailable(layoutId)) {
            setSelectedLayout(layoutId)
            onLayoutChange?.(layoutId)
        }
    }, [isLayoutAvailable, onLayoutChange])

    // Aplicar layout con loading
    const applyLayout = useCallback(async (layoutId: string) => {
        if (!isLayoutAvailable(layoutId)) return false

        setLoading(true)
        try {
            // Simular delay de aplicación
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

    // Cambiar modo de preview
    const setPreviewDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
        setPreviewMode(device)
    }, [])

    // Toggle preview
    const togglePreview = useCallback(() => {
        setShowPreview(prev => !prev)
    }, [])

    // Obtener layouts bloqueados (para upgrade)
    const getBlockedLayouts = useCallback(() => {
        return AVAILABLE_LAYOUTS.filter(layout =>
            !layout.available.includes(userPlan)
        )
    }, [userPlan])

    // Obtener siguiente plan requerido para un layout
    const getRequiredPlan = useCallback((layoutId: string) => {
        const layout = AVAILABLE_LAYOUTS.find(l => l.id === layoutId)
        if (!layout) return null

        const planHierarchy = ['basic', 'pro', 'enterprise']
        const currentPlanIndex = planHierarchy.indexOf(userPlan)

        for (const plan of layout.available) {
            const planIndex = planHierarchy.indexOf(plan)
            if (planIndex > currentPlanIndex) {
                return plan as 'pro' | 'enterprise'
            }
        }
        return null
    }, [userPlan])

    // Reset al layout por defecto
    const resetToDefault = useCallback(() => {
        setSelectedLayout('default')
        onLayoutChange?.('default')
    }, [onLayoutChange])

    // Obtener preview URL (simulado)
    const getPreviewUrl = useCallback((layoutId: string) => {
        return `/preview/${layoutId}?device=${previewMode}`
    }, [previewMode])

    // Categorías disponibles
    const getAvailableCategories = useCallback(() => {
        const categories = new Set(availableLayouts().map(l => l.category).filter(Boolean))
        return Array.from(categories)
    }, [availableLayouts])

    // Efectos
    useEffect(() => {
        if (currentLayout !== selectedLayout) {
            setSelectedLayout(currentLayout)
        }
    }, [currentLayout, selectedLayout])

    return {
        // Estados
        selectedLayout,
        previewMode,
        showPreview,
        loading,

        // Layouts
        availableLayouts: availableLayouts(),
        allLayouts: allLayouts(),
        currentLayout: getCurrentLayout(),
        blockedLayouts: getBlockedLayouts(),
        availableCategories: getAvailableCategories(),

        // Acciones
        selectLayout,
        applyLayout,
        setPreviewDevice,
        togglePreview,
        resetToDefault,

        // Utilidades
        isLayoutAvailable,
        getLayoutsByCategory,
        getRequiredPlan,
        getPreviewUrl,

        // Preview controls
        previewControls: {
            show: showPreview,
            device: previewMode,
            toggle: togglePreview,
            setDevice: setPreviewDevice
        }
    }
}