// 📁 components/tenant-details/tabs/SettingsTab.tsx
import {
    Edit, Save, X, Monitor, Crown, CheckCircle, XCircle,
    ChevronUp, Ban, Info, Star
} from 'lucide-react'
import { LayoutSelector } from '@/admin/components/LayoutPreview'
import { TenantDetails } from '@/admin/types/tenant'
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react'

interface SettingsTabProps {
    tenant: TenantDetails
    tenantSettings: any // Replace with proper type from your hook
    layoutManager: any // Replace with proper type from your hook
    planManager: any // Replace with proper type from your hook
    onSaveSettings: () => Promise<any>
    onStatusChange: (status: 'active' | 'suspended' | 'deleted') => void
    // NUEVO: Handler para el preview independiente
    onLayoutPreview?: (layout: any) => void
}

export function SettingsTab({
    tenant,
    tenantSettings,
    layoutManager,
    planManager,
    onSaveSettings,
    onStatusChange,
    onLayoutPreview
}: SettingsTabProps) {
    const handleSaveSettings = async () => {
        const result = await onSaveSettings()
        return result
    }

    return (
        <div className="space-y-8">
            {/* Header de configuración */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Configuración del Tenant
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona los ajustes generales de tu tenant
                    </p>
                </div>
                <div className="flex space-x-3">
                    {tenantSettings.isEditing ? (
                        <>
                            <button
                                onClick={tenantSettings.cancelEditing}
                                disabled={tenantSettings.saveLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                disabled={tenantSettings.saveLoading || !tenantSettings.hasChanges}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {tenantSettings.saveLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <Save className="h-4 w-4 mr-1" />
                                )}
                                Guardar{tenantSettings.hasChanges ? ' Cambios' : ''}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={tenantSettings.startEditing}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                        </button>
                    )}
                </div>
            </div>

            {/* Configuración General */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                        Información General
                    </h4>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre del Tenant
                            </label>
                            {tenantSettings.isEditing ? (
                                <input
                                    type="text"
                                    value={tenantSettings.formData.name}
                                    onChange={(e) => tenantSettings.updateField('name', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    placeholder="Nombre del tenant"
                                />
                            ) : (
                                <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                    {tenant.name}
                                </p>
                            )}
                            {tenantSettings.isEditing && tenantSettings.validation.errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {tenantSettings.validation.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Slug (URL)
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                                    /
                                </span>
                                <input
                                    type="text"
                                    value={tenant.slug}
                                    disabled
                                    className="flex-1 block rounded-r-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                El slug no se puede modificar después de la creación
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descripción
                        </label>
                        {tenantSettings.isEditing ? (
                            <textarea
                                value={tenantSettings.formData.description}
                                onChange={(e) => tenantSettings.updateField('description', e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="Descripción del tenant..."
                            />
                        ) : (
                            <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-md min-h-[80px]">
                                {tenant.description || 'Sin descripción'}
                            </p>
                        )}
                        {tenantSettings.isEditing && tenantSettings.validation.errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {tenantSettings.validation.errors.description}
                            </p>
                        )}
                    </div>

                    {/* Layout Selector - ACTUALIZADO */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Layout / Tema
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Personaliza la apariencia de tu tenant
                                </p>
                            </div>
                        </div>

                        {tenantSettings.isEditing ? (
                            <LayoutSelector
                                layouts={layoutManager.availableLayouts}
                                selectedLayout={tenantSettings.formData.layout}
                                onLayoutSelect={(layoutId) => tenantSettings.updateField('layout', layoutId)}
                                // CORRECCIÓN: Usar el nuevo handler de preview independiente
                                onPreview={onLayoutPreview}
                                userPlan={tenant.plan}
                            />
                        ) : (
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <div className="h-12 w-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded flex items-center justify-center mr-4">
                                        <Monitor className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">{layoutManager.currentLayout.name}</h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{layoutManager.currentLayout.description}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {layoutManager.currentLayout.features.slice(0, 3).map((feature: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, idx: Key | null | undefined) => (
                                                <span
                                                    key={idx}
                                                    className="inline-block px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onLayoutPreview?.(layoutManager.currentLayout)}
                                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                                >
                                    Preview
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Plan Management */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                            Gestión de Plan
                        </h4>
                        <button
                            onClick={() => planManager.setShowUpgradeModal(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                            Cambiar Plan
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-full bg-${planManager.currentPlanInfo.color}-100`}>
                                <planManager.currentPlanInfo.icon className={`h-6 w-6 text-${planManager.currentPlanInfo.color}-600`} />
                            </div>
                            <div className="ml-4">
                                <div className="flex items-center">
                                    <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100">Plan {planManager.currentPlanInfo.name}</h5>
                                    {planManager.currentPlanInfo.popular && (
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            <Star className="h-3 w-3 mr-1" />
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {planManager.currentPlanInfo.price}/{planManager.currentPlanInfo.period}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {planManager.currentPlanInfo.price}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">por {planManager.currentPlanInfo.period}</div>
                        </div>
                    </div>

                    {planManager.canUpgrade && (
                        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Crown className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-indigo-800">
                                        ¿Necesitas más funcionalidades?
                                    </h4>
                                    <div className="mt-2 text-sm text-indigo-700">
                                        <p>
                                            Actualiza a un plan superior para acceder a más layouts, dominios personalizados,
                                            y funciones avanzadas.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => planManager.setShowUpgradeModal(true)}
                                            className="inline-flex items-center text-sm font-medium text-indigo-800 hover:text-indigo-600"
                                        >
                                            Ver planes disponibles
                                            <ChevronUp className="h-4 w-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Configuración de Seguridad */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-base font-medium text-gray-900">
                        Configuración de Seguridad
                    </h4>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Autenticación de dos factores
                            </p>
                            <p className="text-sm text-gray-500">
                                Requerir 2FA para todos los usuarios del tenant
                            </p>
                        </div>
                        <button
                            type="button"
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Registro público
                            </p>
                            <p className="text-sm text-gray-500">
                                Permitir que usuarios se registren sin invitación
                            </p>
                        </div>
                        <button
                            type="button"
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Notificaciones por email
                            </p>
                            <p className="text-sm text-gray-500">
                                Recibir notificaciones de actividad del tenant
                            </p>
                        </div>
                        <button
                            type="button"
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Zona de Peligro */}
            <div className="bg-white border border-red-200 rounded-lg">
                <div className="px-6 py-4 border-b border-red-200">
                    <h4 className="text-base font-medium text-red-900">
                        Zona de Peligro
                    </h4>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">
                                Suspender tenant
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                                El tenant será suspendido temporalmente. Los usuarios no podrán acceder.
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={tenant.status === 'suspended'}
                            className="ml-4 inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => onStatusChange('suspended')}
                        >
                            <Ban className="-ml-0.5 mr-1.5 h-4 w-4" />
                            {tenant.status === 'suspended' ? 'Suspendido' : 'Suspender'}
                        </button>
                    </div>

                    <hr className="border-red-200" />

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">
                                Eliminar tenant
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                                Esta acción no se puede deshacer. Todos los datos se perderán permanentemente.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="ml-4 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                            onClick={() => {
                                if (confirm('¿Estás seguro de que quieres eliminar este tenant? Esta acción no se puede deshacer.')) {
                                    onStatusChange('deleted')
                                }
                            }}
                        >
                            <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                            Eliminar Tenant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}