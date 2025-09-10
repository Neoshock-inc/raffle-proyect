// 📁 components/tenant-details/modals/LayoutPreviewModal.tsx
import { X, Monitor, Smartphone, Tablet } from 'lucide-react'
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react'

interface LayoutPreviewModalProps {
    layout: any // Replace with proper layout type
    isOpen: boolean
    onClose: () => void
    device: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
    tenantSlug: string
}

export function LayoutPreviewModal({
    layout,
    isOpen,
    onClose,
    device,
    onDeviceChange,
    tenantSlug
}: LayoutPreviewModalProps) {
    if (!isOpen) return null

    const deviceConfig = {
        desktop: { width: 'w-full', height: 'h-96', icon: Monitor },
        tablet: { width: 'w-2/3', height: 'h-80', icon: Tablet },
        mobile: { width: 'w-80', height: 'h-96', icon: Smartphone }
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Preview: {layout.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Vista previa del layout en diferentes dispositivos
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-6">
                    {/* Device Selector */}
                    <div className="flex justify-center space-x-4 mb-6">
                        {Object.entries(deviceConfig).map(([deviceType, config]) => {
                            const Icon = config.icon
                            return (
                                <button
                                    key={deviceType}
                                    onClick={() => onDeviceChange(deviceType as any)}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${device === deviceType
                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                            : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                                        } border`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
                                </button>
                            )
                        })}
                    </div>

                    {/* Preview Frame */}
                    <div className="flex justify-center">
                        <div className={`${deviceConfig[device].width} ${deviceConfig[device].height} border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg`}>
                            <iframe
                                src={`https://${tenantSlug}.myfortunacloud.com?preview=${layout.id}`}
                                className="w-full h-full"
                                title={`Preview ${layout.name}`}
                            />
                        </div>
                    </div>

                    {/* Layout Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{layout.name}</h4>
                                <p className="text-sm text-gray-500">{layout.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {layout.features.slice(0, 4).map((feature: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, idx: Key | null | undefined) => (
                                    <span
                                        key={idx}
                                        className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}