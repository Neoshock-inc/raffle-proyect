import { Check, AlertCircle } from 'lucide-react'
import { PLANS } from '@/admin/utils/tenant'
import type { TenantWizardFormData } from '@/admin/hooks/useTenantWizard'
import type { PlanId } from '@/types/plans'

const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

const getSubdomainUrl = (slug: string) => {
    const baseUrl = getBaseUrl()
    const domain = baseUrl.replace(/^https?:\/\//, '')
    return `https://${slug}.${domain}`
}

interface StepPlanProps {
    formData: TenantWizardFormData
    setField: (field: string, value: string) => void
}

export default function StepPlan({ formData, setField }: StepPlanProps) {
    const colorClasses: Record<string, {
        border: (sel: boolean) => string
        header: string
        badge: string
        button: (sel: boolean) => string
    }> = {
        gray: {
            border: (sel) => sel ? 'ring-2 ring-gray-500 border-gray-500' : 'border-gray-200 hover:border-gray-300',
            header: 'bg-gray-50 dark:bg-gray-900',
            badge: 'bg-gray-100 text-gray-800',
            button: (sel) => sel ? 'bg-gray-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900',
        },
        blue: {
            border: (sel) => sel ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200 hover:border-indigo-300',
            header: 'bg-indigo-50 dark:bg-indigo-900/20',
            badge: 'bg-indigo-100 text-indigo-800',
            button: (sel) => sel ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-indigo-50',
        },
        purple: {
            border: (sel) => sel ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200 hover:border-purple-300',
            header: 'bg-purple-50 dark:bg-purple-900/20',
            badge: 'bg-purple-100 text-purple-800',
            button: (sel) => sel ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 hover:bg-purple-50',
        },
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-5 text-center">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Selecciona el plan perfecto para tu organización
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Puedes cambiar de plan en cualquier momento
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {Object.entries(PLANS).map(([key, plan]) => {
                    const isSelected = formData.selectedPlan === key
                    const colors = colorClasses[plan.color] || colorClasses.gray

                    return (
                        <div
                            key={key}
                            className={`relative rounded-xl border ${colors.border(isSelected)} bg-white dark:bg-gray-800 shadow-sm cursor-pointer transition-all duration-200 ${isSelected ? 'scale-[1.02] shadow-md' : ''}`}
                            onClick={() => setField('selectedPlan', key)}
                        >
                            {isSelected && (
                                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-green-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                                        Seleccionado
                                    </span>
                                </div>
                            )}

                            <div className={`p-4 ${colors.header} rounded-t-xl`}>
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        {plan.name}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                                        {plan.tenantCount}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {plan.price}
                                    {key !== 'basic' && <span className="text-sm font-normal text-gray-500"></span>}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{plan.description}</p>

                                <div className="mt-2">
                                    {plan.subdomain ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                            Subdominio incluido
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Dominio personalizado
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">Features:</h5>
                                <div className="space-y-1.5">
                                    {Object.entries(plan.features).map(([feature, included]) => (
                                        <div key={feature} className="flex items-center justify-between">
                                            <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                                            {included ? (
                                                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600 text-xs">--</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className={`w-full mt-4 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${colors.button(isSelected)}`}
                                    onClick={() => setField('selectedPlan', key)}
                                >
                                    {isSelected ? 'Seleccionado' : `Seleccionar ${plan.name}`}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {formData.selectedPlan === 'basic' && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-400">
                            <p className="font-semibold mb-1">Plan Basic - Subdominio incluido</p>
                            <p>Tu tenant estará en: <span className="font-medium">{getSubdomainUrl(formData.slug || 'tu-slug')}</span></p>
                            <p className="mt-1">Para dominio personalizado, considera Plan Pro o Enterprise.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
