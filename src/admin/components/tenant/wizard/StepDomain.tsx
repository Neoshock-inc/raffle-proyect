import { Check, AlertCircle, Globe } from 'lucide-react'
import type { TenantWizardFormData } from '@/admin/hooks/useTenantWizard'

interface StepDomainProps {
    formData: TenantWizardFormData
    errors: Record<string, string>
    onDomainChange: (domain: string) => void
    validatingDomain: boolean
    domainValid: boolean
}

const inputClass = (hasError?: string, isValid?: boolean) =>
    `block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ${
        hasError
            ? 'ring-red-300 focus:ring-red-500'
            : isValid
                ? 'ring-green-300 focus:ring-green-500'
                : 'ring-gray-300 dark:ring-gray-600 focus:ring-indigo-500'
    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset bg-white dark:bg-gray-800`

export default function StepDomain({
    formData,
    errors,
    onDomainChange,
    validatingDomain,
    domainValid,
}: StepDomainProps) {
    return (
        <div className="max-w-lg mx-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dominio Principal *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        className={inputClass(errors.domain, domainValid)}
                        placeholder="miempresa.com"
                        value={formData.domain}
                        onChange={(e) => onDomainChange(e.target.value)}
                    />
                    {validatingDomain && (
                        <div className="absolute right-3 top-2.5">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                        </div>
                    )}
                    {!validatingDomain && formData.domain && domainValid && (
                        <div className="absolute right-3 top-2.5">
                            <Check className="h-4 w-4 text-green-500" />
                        </div>
                    )}
                </div>
                {errors.domain && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {errors.domain}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Dominio principal donde estará disponible el tenant
                </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <Globe className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-700 dark:text-indigo-400">
                        <p className="font-semibold mb-1">Configuración de DNS</p>
                        <p>
                            Después de crear el tenant, deberás configurar tu DNS para apuntar
                            <strong> {formData.domain || 'tu-dominio.com'}</strong> a nuestros servidores.
                            Te enviaremos las instrucciones por email.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    ¿No tienes un dominio?
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                    Puedes registrar uno con nosotros o usar un subdominio temporal.
                </p>
                <button
                    type="button"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                >
                    Ver opciones de dominio →
                </button>
            </div>
        </div>
    )
}
