// 📁 components/tenant-details/TenantHeader.tsx
'use client'
import { ArrowLeft, Calendar, Ban, MoreHorizontal } from 'lucide-react'
import { TenantDetails } from '../../types/tenant'
import { JSX } from 'react'

interface TenantHeaderProps {
    tenant: TenantDetails
    onBack: () => void
    onStatusChange: (status: 'active' | 'suspended' | 'deleted') => void
    actionLoading: boolean
    getStatusBadge: (status: string) => JSX.Element
    getPlanInfo: (plan: string) => any
    formatDate: (date: string) => string
}

export function TenantHeader({
    tenant,
    onBack,
    onStatusChange,
    actionLoading,
    getStatusBadge,
    getPlanInfo,
    formatDate
}: TenantHeaderProps) {
    const planInfo = getPlanInfo(tenant.plan)

    return (
        <div className="mb-8">
            <div className="flex items-center mb-4">
                <button
                    onClick={onBack}
                    className="mr-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Tenants
                </button>
            </div>

            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-3">
                        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                            {tenant.name}
                        </h1>
                        {getStatusBadge(tenant.status || 'active')}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planInfo.className}`}>
                            <planInfo.icon className="h-4 w-4 mr-1" />
                            Plan {planInfo.name}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-4">
                        <span className="truncate">/{tenant.slug}</span>
                        <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Creado {formatDate(tenant.created_at)}
                        </span>
                        {tenant.description && (
                            <span className="truncate max-w-md">{tenant.description}</span>
                        )}
                    </div>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
                    {tenant.status !== 'deleted' && (
                        <button
                            type="button"
                            onClick={() => onStatusChange(tenant.status === 'active' ? 'suspended' : 'active')}
                            disabled={actionLoading}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${tenant.status === 'active'
                                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                : 'bg-green-600 hover:bg-green-500 text-white'
                                } disabled:opacity-50`}
                        >
                            <Ban className="-ml-0.5 mr-1.5 h-5 w-5" />
                            {tenant.status === 'active' ? 'Suspender' : 'Activar'}
                        </button>
                    )}

                    <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <MoreHorizontal className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Más opciones
                    </button>
                </div>
            </div>
        </div>
    )
}