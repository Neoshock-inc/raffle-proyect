// 📁 components/tenant-details/tabs/DomainsTab.tsx
import { TenantDetails } from '@/app/(auth)/types/tenant'
import { Globe, Lock, Info, Crown, CheckCircle, Clock, MoreHorizontal } from 'lucide-react'

interface DomainsTabProps {
    tenant: TenantDetails
    isBasicPlan: boolean
    getBaseUrl: () => string
    formatDate: (date: string) => string
    onUpgradePlan: () => void
}

export function DomainsTab({ tenant, isBasicPlan, getBaseUrl, formatDate, onUpgradePlan }: DomainsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Configuración de Dominios
                </h3>
                {!isBasicPlan ? (
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                        <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Agregar Dominio
                    </button>
                ) : (
                    <div className="flex items-center text-sm text-gray-500">
                        <Lock className="h-4 w-4 mr-1" />
                        Plan básico
                    </div>
                )}
            </div>

            {isBasicPlan && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-amber-800">
                                Plan Básico - Subdominio Incluido
                            </h4>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>Con el plan básico, tu tenant está disponible en:</p>
                                <p className="mt-1 font-mono bg-amber-100 px-2 py-1 rounded">
                                    https://{tenant.slug}.{getBaseUrl().replace(/^https?:\/\//, '')}
                                </p>
                                <p className="mt-2">
                                    Para usar dominios personalizados, actualiza a Plan Pro o Enterprise.
                                </p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={onUpgradePlan}
                                    className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-600"
                                >
                                    <Crown className="h-4 w-4 mr-1" />
                                    Actualizar Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg">
                {tenant.tenant_domains && tenant.tenant_domains.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {tenant.tenant_domains.map((domain, index) => (
                            <div key={index} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {domain.domain}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Agregado {formatDate(domain.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {domain.verified ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verificado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Pendiente
                                            </span>
                                        )}
                                        {!isBasicPlan && (
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {!domain.verified && !isBasicPlan && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="text-sm text-yellow-700">
                                            <p className="font-medium">DNS no verificado</p>
                                            <p className="mt-1">
                                                Configura tu DNS para apuntar este dominio a nuestros servidores.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {isBasicPlan ? 'Dominio por Defecto' : 'No hay dominios configurados'}
                        </h4>
                        <p className="text-gray-500 mb-4">
                            {isBasicPlan
                                ? `Tu tenant está disponible en https://${tenant.slug}.${getBaseUrl().replace(/^https?:\/\//, '')}`
                                : 'Agrega un dominio para que los usuarios puedan acceder al tenant.'
                            }
                        </p>
                        {!isBasicPlan && (
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                            >
                                <Globe className="-ml-0.5 mr-1.5 h-5 w-5" />
                                Agregar Primer Dominio
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}