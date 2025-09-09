// hooks/useLayoutManager.ts
import { useState, useCallback, useEffect } from 'react'
import AppleRaffleLanding from '../components/raffle_templates/AppleRaffleLanding'
import CyberpunkRaffleLanding from '../components/raffle_templates/CyberpunkRaffleLanding'
import LatinaRaffleLanding from '../components/raffle_templates/LatinaRaffleLanding'
import LuxuryRaffleLanding from '../components/raffle_templates/LuxuryRaffleLanding'
import RifaOffRoadLanding from '../components/raffle_templates/RifaOffRoadLanding'

export interface LayoutTemplate {
    id: string
    name: string
    description: string
    preview: string
    features: string[]
    available: ('basic' | 'pro' | 'enterprise')[]
    category?: 'modern' | 'classic' | 'creative' | 'premium' | 'futuristic' | 'cultural' | 'adventure'
    color_scheme?: 'light' | 'dark' | 'auto'
    responsive?: boolean
    component?: React.ComponentType<any>
    props?: Record<string, any>
}

// Templates de rifas disponibles con componentes directos
const AVAILABLE_LAYOUTS: LayoutTemplate[] = [
    {
        id: 'apple',
        name: 'Apple Raffle',
        description: 'Diseño moderno y elegante inspirado en productos Apple',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_10_54.png',
        component: AppleRaffleLanding,
        features: ['Diseño minimalista', 'Animaciones suaves', 'Responsive design', 'Colores corporativos'],
        available: ['basic', 'pro', 'enterprise'],
        category: 'modern',
        color_scheme: 'light',
        responsive: true,
        props: {
            theme: 'light',
            showAnimation: true
        }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Raffle',
        description: 'Estilo futurista con efectos neon y diseño cyberpunk',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_10_13.png',
        component: CyberpunkRaffleLanding,
        features: ['Efectos neon', 'Estética futurista', 'Animaciones dinámicas', 'Tema oscuro'],
        available: ['pro', 'enterprise'],
        category: 'futuristic',
        color_scheme: 'dark',
        responsive: true,
        props: {
            theme: 'dark',
            enableNeonEffects: true
        }
    },
    {
        id: 'latina',
        name: 'Latina Raffle',
        description: 'Diseño vibrante con colores cálidos y estilo latino',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_09_34.png',
        component: LatinaRaffleLanding,
        features: ['Colores vibrantes', 'Estilo festivo', 'Elementos culturales', 'Diseño alegre'],
        available: ['basic', 'pro', 'enterprise'],
        category: 'cultural',
        color_scheme: 'light',
        responsive: true,
        props: {
            theme: 'vibrant',
            culturalElements: true
        }
    },
    {
        id: 'luxury',
        name: 'Luxury Raffle',
        description: 'Diseño premium con elementos dorados y elegantes',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_07_09.png',
        component: LuxuryRaffleLanding,
        features: ['Diseño premium', 'Elementos dorados', 'Tipografía elegante', 'Exclusividad'],
        available: ['enterprise', 'pro'],
        category: 'premium',
        color_scheme: 'dark',
        responsive: true,
        props: {
            theme: 'luxury',
            showPremiumElements: true
        }
    },
    {
        id: 'offroad',
        name: 'Off-Road Raffle',
        description: 'Tema aventurero para rifas de vehículos y deportes extremos',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_06_25.png',
        component: RifaOffRoadLanding,
        features: ['Tema aventurero', 'Colores terrosos', 'Diseño robusto', 'Estilo deportivo'],
        available: ['pro', 'enterprise'],
        category: 'adventure',
        color_scheme: 'light',
        responsive: true,
        props: {
            theme: 'adventure',
            showVehicles: true
        }
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