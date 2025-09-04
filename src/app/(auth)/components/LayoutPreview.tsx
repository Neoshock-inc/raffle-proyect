// components/LayoutPreview.tsx
'use client'
import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, X, RefreshCw, ExternalLink, Eye } from 'lucide-react'
import { LayoutTemplate } from '../hooks/useLayoutManager'

interface LayoutPreviewProps {
    layout: LayoutTemplate
    isOpen: boolean
    onClose: () => void
    device?: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void
    tenantSlug?: string
}

export const LayoutPreview = ({
    layout,
    isOpen,
    onClose,
    device = 'desktop',
    onDeviceChange,
    tenantSlug = 'demo'
}: LayoutPreviewProps) => {
    const [loading, setLoading] = useState(true)
    const [currentDevice, setCurrentDevice] = useState(device)

    const PREVIEW_URL = 'http://luxury-dreams.127.0.0.1.nip.io:3000/' // 🔗 URL estática

    const deviceSizes = {
        desktop: { width: '100%', height: '600px' },
        tablet: { width: '768px', height: '600px' },
        mobile: { width: '375px', height: '600px' }
    }

    const deviceIcons = {
        desktop: Monitor,
        tablet: Tablet,
        mobile: Smartphone
    }

    useEffect(() => {
        setCurrentDevice(device)
    }, [device])

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            const timer = setTimeout(() => setLoading(false), 800)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleDeviceChange = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
        setCurrentDevice(newDevice)
        onDeviceChange?.(newDevice)
    }

    const handleRefresh = () => {
        setLoading(true)
        const iframe = document.getElementById('layout-preview-iframe') as HTMLIFrameElement
        if (iframe) iframe.src = iframe.src // recarga el iframe
        setTimeout(() => setLoading(false), 1000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-3 h-3 rounded-full bg-${layout.color_scheme === 'dark' ? 'gray-800' : 'blue-500'
                                    }`}
                            ></div>
                            <h3 className="text-lg font-medium text-gray-900">{layout.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Preview
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{layout.description}</p>
                    </div>

                    {/* Device Controls */}
                    <div className="flex items-center space-x-2">
                        <div className="flex rounded-md shadow-sm">
                            {Object.entries(deviceIcons).map(([deviceType, Icon]) => (
                                <button
                                    key={deviceType}
                                    onClick={() => handleDeviceChange(deviceType as any)}
                                    className={`px-3 py-2 text-sm font-medium border ${currentDevice === deviceType
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 z-10'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        } ${deviceType === 'desktop'
                                            ? 'rounded-l-md'
                                            : deviceType === 'mobile'
                                                ? 'rounded-r-md -ml-px'
                                                : '-ml-px'
                                        }`}
                                    title={`Vista ${deviceType}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Recargar preview"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 p-6 bg-gray-50 overflow-hidden">
                    <div className="h-full flex items-center justify-center">
                        <div
                            className="bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden"
                            style={{
                                width: deviceSizes[currentDevice].width,
                                height: deviceSizes[currentDevice].height,
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        >
                            {loading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-gray-600">Cargando preview...</span>
                                    </div>
                                </div>
                            )}

                            {/* Real URL in iframe */}
                            <iframe
                                id="layout-preview-iframe"
                                src={PREVIEW_URL}
                                className="w-full h-full border-0"
                                onLoad={() => setLoading(false)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Resolución:</span> {deviceSizes[currentDevice].width} ×{' '}
                            {deviceSizes[currentDevice].height}
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Esquema:</span> {layout.color_scheme}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href={PREVIEW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir en ventana
                        </a>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Cerrar Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Componente adicional para el selector de layouts mejorado
export const LayoutSelector = ({
    layouts,
    selectedLayout,
    onLayoutSelect,
    onPreview,
    userPlan,
    className = ""
}: {
    layouts: LayoutTemplate[]
    selectedLayout: string
    onLayoutSelect: (layoutId: string) => void
    onPreview?: (layout: LayoutTemplate) => void
    userPlan: 'basic' | 'pro' | 'enterprise'
    className?: string
}) => {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
            {layouts.map((layout) => {
                const isAvailable = layout.available.includes(userPlan)
                const isSelected = layout.id === selectedLayout

                return (
                    <div
                        key={layout.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected
                            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                            : isAvailable
                                ? 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                : 'border-gray-200 opacity-60'
                            } ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                        onClick={() => isAvailable && onLayoutSelect(layout.id)}
                    >
                        {/* Selection Indicator */}
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                                <div className="h-5 w-5 text-white">✓</div>
                            </div>
                        )}

                        {/* Lock Indicator for unavailable layouts */}
                        {!isAvailable && (
                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center shadow-sm">
                                <div className="h-4 w-4 text-white">🔒</div>
                            </div>
                        )}

                        {/* Preview Real Image */}
                        <div className="mb-3 relative overflow-hidden rounded-md border">
                            <img
                                src={layout.preview}
                                alt={layout.name}
                                className="w-full h-40 object-cover object-top rounded-md"
                            />

                            {/* Preview Button */}
                            {onPreview && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onPreview(layout)
                                    }}
                                    className="absolute bottom-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
                                    title="Vista previa"
                                >
                                    <Eye className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Layout Info */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{layout.name}</h5>
                                {layout.category && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                        {layout.category}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mb-3">{layout.description}</p>

                            <div className="flex flex-wrap gap-1">
                                {layout.features.slice(0, 3).map((feature, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                        {feature}
                                    </span>
                                ))}
                                {layout.features.length > 3 && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                        +{layout.features.length - 3} más
                                    </span>
                                )}
                            </div>

                            {/* Upgrade notice for locked layouts */}
                            {!isAvailable && (
                                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-center">
                                    <p className="text-xs text-amber-700">
                                        Requiere plan {layout.available.filter(p => p !== 'basic')[0]}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}