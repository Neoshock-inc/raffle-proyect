// components/LayoutPreview.tsx
'use client'
import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, X, RefreshCw, ExternalLink, Eye, Lock, Maximize2, Code } from 'lucide-react'
import { LayoutTemplate } from '../hooks/useLayoutManager'

interface LayoutPreviewProps {
    layout: LayoutTemplate
    isOpen: boolean
    onClose: () => void
    device?: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void
    tenantSlug?: string
    renderDirectly?: boolean
}

// Helper function to get base URL
const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

// Función para generar URL de preview dinámicamente
const getPreviewUrl = (layout: LayoutTemplate, tenantSlug: string = 'demo') => {
    const baseUrl = getBaseUrl()

    // Para desarrollo local
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        return `${baseUrl}/preview/${layout.id}?tenant=${tenantSlug}`
    }

    // Para producción, usar subdominio con parámetro de template
    const domain = baseUrl.replace(/^https?:\/\//, '')
    return `https://${tenantSlug}.${domain}?template=${layout.id}&preview=true`
}

export const LayoutPreview = ({
    layout,
    isOpen,
    onClose,
    device = 'desktop',
    onDeviceChange,
    tenantSlug = 'demo',
    renderDirectly = true // Por defecto usar componentes directos
}: LayoutPreviewProps) => {
    const [loading, setLoading] = useState(true)
    const [currentDevice, setCurrentDevice] = useState(device)
    const [previewUrl, setPreviewUrl] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [renderMode, setRenderMode] = useState<'component' | 'iframe'>(renderDirectly ? 'component' : 'iframe')

    const deviceSizes = {
        desktop: { width: '100%', height: '600px', maxWidth: '1200px' },
        tablet: { width: '768px', height: '600px', maxWidth: '768px' },
        mobile: { width: '375px', height: '600px', maxWidth: '375px' }
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

            if (renderMode === 'iframe') {
                // Solo generar URL si vamos a usar iframe
                const url = getPreviewUrl(layout, tenantSlug)
                setPreviewUrl(url)
            }

            const timer = setTimeout(() => setLoading(false), renderMode === 'component' ? 500 : 1200)
            return () => clearTimeout(timer)
        }
    }, [isOpen, layout, tenantSlug, renderMode])

    const handleDeviceChange = (newDevice: 'desktop' | 'tablet' | 'mobile') => {
        setCurrentDevice(newDevice)
        onDeviceChange?.(newDevice)
    }

    const handleRefresh = () => {
        setLoading(true)

        if (renderMode === 'component') {
            // Para componentes directos, simplemente resetear
            setTimeout(() => setLoading(false), 500)
        } else {
            // Para iframes, recargar
            const iframe = document.getElementById('layout-preview-iframe') as HTMLIFrameElement
            if (iframe) {
                iframe.src = iframe.src
            }
            setTimeout(() => setLoading(false), 1000)
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const toggleRenderMode = () => {
        setRenderMode(prev => prev === 'component' ? 'iframe' : 'component')
    }

    // Renderizar el componente directamente
    const renderComponent = () => {
        if (!layout.component) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8">
                        <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{layout.name}</h4>
                        <p className="text-sm text-gray-500 mb-4">{layout.description}</p>
                        <p className="text-xs text-gray-400">Componente no disponible</p>
                    </div>
                </div>
            )
        }

        const Component = layout.component
        const props = {
            ...layout.props,
            previewMode: true,
            device: currentDevice,
            tenantSlug
        }

        try {
            return <Component {...props} />
        } catch (error) {
            console.error('Error rendering component:', error)
            return (
                <div className="w-full h-full flex items-center justify-center bg-red-50">
                    <div className="text-center p-8">
                        <X className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-red-900 mb-2">Error de Renderizado</h4>
                        <p className="text-sm text-red-600">No se pudo cargar el componente {layout.name}</p>
                    </div>
                </div>
            )
        }
    }

    if (!isOpen) return null

    const currentSize = deviceSizes[currentDevice]

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
            <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full rounded-none' : 'max-w-7xl w-full max-h-[90vh]'} flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-3 h-3 rounded-full ${layout.color_scheme === 'dark' ? 'bg-gray-800' : 'bg-blue-500'}`}
                            ></div>
                            <h3 className="text-lg font-medium text-gray-900">{layout.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {renderMode === 'component' ? 'Componente' : 'URL'} Preview
                            </span>
                            {layout.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                    {layout.category}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 hidden md:block">{layout.description}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                        {/* Device Controls */}
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
                            onClick={toggleRenderMode}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title={`Cambiar a ${renderMode === 'component' ? 'URL' : 'componente'}`}
                        >
                            <Code className="h-4 w-4" />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>

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
                                width: isFullscreen ? '100%' : currentSize.width,
                                height: isFullscreen ? 'calc(100vh - 180px)' : currentSize.height,
                                maxWidth: isFullscreen ? '100%' : currentSize.maxWidth,
                                maxHeight: '100%'
                            }}
                        >
                            {loading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-gray-600">Cargando {layout.name}...</span>
                                    </div>
                                </div>
                            )}

                            {/* Preview Content */}
                            <div className="w-full h-full overflow-auto">
                                {renderMode === 'component' ? (
                                    // Renderizar componente directamente
                                    <div className="w-full h-full">
                                        {renderComponent()}
                                    </div>
                                ) : previewUrl ? (
                                    // Usar iframe para URL externa
                                    <iframe
                                        id="layout-preview-iframe"
                                        src={previewUrl}
                                        className="w-full h-full border-0"
                                        onLoad={() => setLoading(false)}
                                        onError={() => {
                                            setLoading(false)
                                            console.warn('Error loading preview for:', layout.name)
                                        }}
                                    />
                                ) : (
                                    // Fallback content
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <div className="text-center p-8">
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                                <Monitor className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">{layout.name}</h4>
                                            <p className="text-sm text-gray-500 mb-4">{layout.description}</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {layout.features.slice(0, 4).map((feature, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Resolución:</span> {currentSize.width} × {currentSize.height}
                        </div>
                        <div>
                            <span className="font-medium">Esquema:</span> {layout.color_scheme}
                        </div>
                        <div>
                            <span className="font-medium">Responsive:</span> {layout.responsive ? 'Sí' : 'No'}
                        </div>
                        <div>
                            <span className="font-medium">Modo:</span> {renderMode === 'component' ? 'Componente' : 'URL'}
                        </div>
                        {layout.component && (
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span className="text-xs">Componente disponible</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        {renderMode === 'iframe' && previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Abrir en ventana
                            </a>
                        )}

                        <button
                            onClick={toggleRenderMode}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Code className="h-4 w-4 mr-1" />
                            {renderMode === 'component' ? 'Ver como URL' : 'Ver componente'}
                        </button>

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

// Componente selector actualizado (sin cambios principales)
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
                const hasComponent = !!layout.component

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
                                <Lock className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Component indicator */}
                        {hasComponent && (
                            <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                                <Code className="h-3 w-3 text-white" />
                            </div>
                        )}

                        {/* Preview Image */}
                        <div className="mb-3 relative overflow-hidden rounded-md border bg-gray-100">
                            {layout.preview ? (
                                <img
                                    src={layout.preview}
                                    alt={layout.name}
                                    className="w-full h-40 object-cover object-top rounded-md"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        target.nextElementSibling?.classList.remove('hidden')
                                    }}
                                />
                            ) : null}

                            {/* Fallback content */}
                            <div className={`absolute inset-0 flex items-center justify-center ${layout.preview ? 'hidden' : ''}`}>
                                <div className="text-center">
                                    <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">{layout.name}</p>
                                </div>
                            </div>

                            {/* Preview Button */}
                            {onPreview && isAvailable && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onPreview(layout)
                                    }}
                                    className="absolute bottom-2 right-2 p-1.5 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-opacity"
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
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                                        {layout.category}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{layout.description}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
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

                            {/* Plan availability indicator */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    {layout.available.map((plan, idx) => (
                                        <span
                                            key={plan}
                                            className={`inline-block w-2 h-2 rounded-full ${plan === 'basic' ? 'bg-gray-400' :
                                                    plan === 'pro' ? 'bg-blue-400' : 'bg-purple-400'
                                                }`}
                                            title={`Plan ${plan}`}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {layout.responsive && (
                                        <span className="text-xs text-green-600 font-medium">
                                            Responsive
                                        </span>
                                    )}
                                    {hasComponent && (
                                        <span className="text-xs text-blue-600 font-medium">
                                            Componente
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Upgrade notice for locked layouts */}
                            {!isAvailable && (
                                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-center">
                                    <p className="text-xs text-amber-700">
                                        Requiere plan {layout.available.filter(p => p !== 'basic')[0] || 'superior'}
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