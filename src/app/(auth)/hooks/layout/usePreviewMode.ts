// hooks/layout/usePreviewMode.ts
// Lógica de modo preview para templates
import { useState, useCallback } from 'react'

export function usePreviewMode() {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [showPreview, setShowPreview] = useState(false)

    const setDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
        setPreviewDevice(device)
    }, [])

    const togglePreview = useCallback(() => {
        setShowPreview(prev => !prev)
    }, [])

    const getPreviewUrl = useCallback((layoutId: string) => {
        return `/preview/${layoutId}?device=${previewDevice}`
    }, [previewDevice])

    return {
        previewDevice,
        showPreview,
        setDevice,
        togglePreview,
        getPreviewUrl,
        previewControls: {
            show: showPreview,
            device: previewDevice,
            toggle: togglePreview,
            setDevice: setDevice
        }
    }
}
