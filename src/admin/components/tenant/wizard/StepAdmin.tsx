import { Check, AlertCircle, UserPlus } from 'lucide-react'
import { PLANS } from '@/admin/utils/tenant'
import type { TenantWizardFormData } from '@/admin/hooks/useTenantWizard'

interface StepAdminProps {
    formData: TenantWizardFormData
    errors: Record<string, string>
    setField: (field: string, value: string) => void
}

const inputClass = (hasError?: string) =>
    `block w-full rounded-lg border-0 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ${
        hasError
            ? 'ring-red-300 focus:ring-red-500'
            : 'ring-gray-300 dark:ring-gray-600 focus:ring-indigo-500'
    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset bg-white dark:bg-gray-800`

export default function StepAdmin({ formData, errors, setField }: StepAdminProps) {
    const plan = PLANS[formData.selectedPlan]

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre del Administrador *
                    </label>
                    <input
                        type="text"
                        className={inputClass(errors.ownerName)}
                        placeholder="Juan Pérez González"
                        value={formData.ownerName}
                        onChange={(e) => setField('ownerName', e.target.value)}
                    />
                    {errors.ownerName && (
                        <p className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            {errors.ownerName}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                        type="tel"
                        className={inputClass()}
                        placeholder="+1 (555) 123-4567"
                        value={formData.ownerPhone}
                        onChange={(e) => setField('ownerPhone', e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email del Administrador *
                </label>
                <input
                    type="email"
                    className={inputClass(errors.ownerEmail)}
                    placeholder="admin@miempresa.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setField('ownerEmail', e.target.value)}
                />
                {errors.ownerEmail && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {errors.ownerEmail}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    Recibirá las credenciales de acceso
                </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-2">Resumen</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-green-700 dark:text-green-400">
                            <div>
                                <span className="font-medium">Tenant:</span> {formData.name}
                            </div>
                            <div>
                                <span className="font-medium">Plan:</span> {plan?.name}
                            </div>
                            <div>
                                <span className="font-medium">Plantilla:</span> {formData.selectedTemplate}
                            </div>
                            <div>
                                <span className="font-medium">
                                    {formData.selectedPlan === 'basic' ? 'Subdominio:' : 'Dominio:'}
                                </span>{' '}
                                {formData.selectedPlan === 'basic'
                                    ? formData.slug
                                    : formData.domain}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <UserPlus className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-700 dark:text-indigo-400">
                        <p className="font-semibold mb-1">¿Qué sucede después?</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>Se creará el tenant con la plantilla {formData.selectedTemplate}</li>
                            <li>Se creará el usuario administrador</li>
                            <li>Se enviarán las credenciales por email</li>
                            {formData.selectedPlan !== 'basic' && <li>Recibirás instrucciones para configurar el DNS</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
