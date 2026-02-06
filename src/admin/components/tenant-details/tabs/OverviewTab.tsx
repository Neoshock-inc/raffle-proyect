// 📁 components/tenant-details/tabs/OverviewTab.tsx
import { TenantDetails } from '@/admin/types/tenant'
import { CheckCircle } from 'lucide-react'
import { JSX } from 'react'

interface OverviewTabProps {
    tenant: TenantDetails
    getStatusBadge: (status: string) => JSX.Element
    getPlanInfo: (plan: string) => any
    formatDate: (date: string) => string
}

export function OverviewTab({ tenant, getStatusBadge, getPlanInfo, formatDate }: OverviewTabProps) {
    const planInfo = getPlanInfo(tenant.plan)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información General
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Nombre del Tenant</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Slug</dt>
                            <dd className="mt-1 text-sm text-gray-900">/{tenant.slug}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Plan</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.className}`}>
                                    <planInfo.icon className="h-3 w-3 mr-1" />
                                    {planInfo.name}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Estado</dt>
                            <dd className="mt-1">{getStatusBadge(tenant.status || 'active')}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(tenant.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Layout</dt>
                            <dd className="mt-1 text-sm text-gray-900">{tenant.layout || 'default'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Características del Plan {planInfo.name}
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {planInfo.features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
