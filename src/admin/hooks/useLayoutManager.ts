// hooks/useLayoutManager.ts - Compone sub-hooks de layout
import AppleRaffleLanding from '../components/raffle_templates/AppleRaffleLanding'
import CyberpunkRaffleLanding from '../components/raffle_templates/CyberpunkRaffleLanding'
import LatinaRaffleLanding from '../components/raffle_templates/LatinaRaffleLanding'
import LuxuryRaffleLanding from '../components/raffle_templates/LuxuryRaffleLanding'
import RifaOffRoadLanding from '../components/raffle_templates/RifaOffRoadLanding'
import { useLayoutSelection } from './layout/useLayoutSelection'
import { usePreviewMode } from './layout/usePreviewMode'

// Re-export para compatibilidad
export type { LayoutTemplate } from './layout/useLayoutSelection'

// Templates de rifas disponibles con componentes directos
const AVAILABLE_LAYOUTS = [
    {
        id: 'apple',
        name: 'Apple Raffle',
        description: 'Diseño moderno y elegante inspirado en productos Apple',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_10_54.png',
        component: AppleRaffleLanding,
        features: ['Diseño minimalista', 'Animaciones suaves', 'Responsive design', 'Colores corporativos'],
        available: ['basic' as const, 'pro' as const, 'enterprise' as const],
        category: 'modern' as const,
        color_scheme: 'light' as const,
        responsive: true,
        props: { theme: 'light', showAnimation: true }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Raffle',
        description: 'Estilo futurista con efectos neon y diseño cyberpunk',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_10_13.png',
        component: CyberpunkRaffleLanding,
        features: ['Efectos neon', 'Estética futurista', 'Animaciones dinámicas', 'Tema oscuro'],
        available: ['pro' as const, 'enterprise' as const],
        category: 'futuristic' as const,
        color_scheme: 'dark' as const,
        responsive: true,
        props: { theme: 'dark', enableNeonEffects: true }
    },
    {
        id: 'latina',
        name: 'Latina Raffle',
        description: 'Diseño vibrante con colores cálidos y estilo latino',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_09_34.png',
        component: LatinaRaffleLanding,
        features: ['Colores vibrantes', 'Estilo festivo', 'Elementos culturales', 'Diseño alegre'],
        available: ['basic' as const, 'pro' as const, 'enterprise' as const],
        category: 'cultural' as const,
        color_scheme: 'light' as const,
        responsive: true,
        props: { theme: 'vibrant', culturalElements: true }
    },
    {
        id: 'luxury',
        name: 'Luxury Raffle',
        description: 'Diseño premium con elementos dorados y elegantes',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_07_09.png',
        component: LuxuryRaffleLanding,
        features: ['Diseño premium', 'Elementos dorados', 'Tipografía elegante', 'Exclusividad'],
        available: ['enterprise' as const, 'pro' as const],
        category: 'premium' as const,
        color_scheme: 'dark' as const,
        responsive: true,
        props: { theme: 'luxury', showPremiumElements: true }
    },
    {
        id: 'offroad',
        name: 'Off-Road Raffle',
        description: 'Tema aventurero para rifas de vehículos y deportes extremos',
        preview: '/images/templates/screencapture-nextjsauk1epd2-5qhr-3000-96435430-local-credentialless-webcontainer-io-2025-09-08-21_06_25.png',
        component: RifaOffRoadLanding,
        features: ['Tema aventurero', 'Colores terrosos', 'Diseño robusto', 'Estilo deportivo'],
        available: ['pro' as const, 'enterprise' as const],
        category: 'adventure' as const,
        color_scheme: 'light' as const,
        responsive: true,
        props: { theme: 'adventure', showVehicles: true }
    }
]

interface UseLayoutManagerProps {
    currentLayout: string
    userPlan: 'basic' | 'pro' | 'enterprise'
    onLayoutChange?: (layoutId: string) => void
}

export const useLayoutManager = ({ currentLayout, userPlan, onLayoutChange }: UseLayoutManagerProps) => {
    const {
        selectedLayout, loading,
        availableLayouts, allLayouts, currentLayout: currentLayoutObj,
        blockedLayouts, availableCategories,
        selectLayout, applyLayout, resetToDefault,
        isLayoutAvailable, getLayoutsByCategory, getRequiredPlan
    } = useLayoutSelection(AVAILABLE_LAYOUTS, currentLayout, userPlan, onLayoutChange)

    const {
        previewDevice: previewMode, showPreview,
        setDevice: setPreviewDevice, togglePreview, getPreviewUrl,
        previewControls
    } = usePreviewMode()

    return {
        // Estados
        selectedLayout,
        previewMode,
        showPreview,
        loading,

        // Layouts
        availableLayouts,
        allLayouts,
        currentLayout: currentLayoutObj,
        blockedLayouts,
        availableCategories,

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
        previewControls
    }
}
