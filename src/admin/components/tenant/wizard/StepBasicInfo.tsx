import { Check, AlertCircle } from 'lucide-react'
import type { TenantWizardFormData } from '@/admin/hooks/useTenantWizard'

const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

const getSubdomainUrl = (slug: string) => {
    const baseUrl = getBaseUrl()
    const domain = baseUrl.replace(/^https?:\/\//, '')
    return `https://${slug}.${domain}`
}

interface StepBasicInfoProps {
    formData: TenantWizardFormData
    errors: Record<string, string>
    setField: (field: string, value: string) => void
    onNameChange: (name: string) => void
    onSlugChange: (slug: string) => void
    validatingSlug: boolean
    slugValid: boolean
}

const inputClass = (hasError?: string, isValid?: boolean) =>
    `block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ${
        hasError
            ? 'ring-red-300 focus:ring-red-500'
            : isValid
                ? 'ring-green-300 focus:ring-green-500'
                : 'ring-gray-300 dark:ring-gray-600 focus:ring-indigo-500'
    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset bg-white dark:bg-gray-800`

export default function StepBasicInfo({
    formData,
    errors,
    setField,
    onNameChange,
    onSlugChange,
    validatingSlug,
    slugValid,
}: StepBasicInfoProps) {
    return (
        <div className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre del Tenant *
                    </label>
                    <input
                        type="text"
                        className={inputClass(errors.name)}
                        placeholder="Mi Empresa S.A."
                        value={formData.name}
                        onChange={(e) => onNameChange(e.target.value)}
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Slug *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            className={inputClass(errors.slug, slugValid)}
                            placeholder="mi-empresa"
                            value={formData.slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                        />
                        {validatingSlug && (
                            <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                            </div>
                        )}
                        {!validatingSlug && formData.slug && slugValid && (
                            <div className="absolute right-3 top-2.5">
                                <Check className="h-4 w-4 text-green-500" />
                            </div>
                        )}
                    </div>
                    {errors.slug && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            {errors.slug}
                        </p>
                    )}
                </div>
            </div>

            <div className="py-1.5 px-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                    <strong>URL:</strong> {getSubdomainUrl(formData.slug || 'tu-slug')}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                    rows={2}
                    className={inputClass()}
                    placeholder="Breve descripción de tu organización..."
                    value={formData.description}
                    onChange={(e) => setField('description', e.target.value)}
                />
            </div>
        </div>
    )
}
