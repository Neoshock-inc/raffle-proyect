// 📁 components/tenant-details/modals/PlanUpgradeModal.tsx (Actualizado)
import { Plan } from '@/app/types/plans'
import { X, Check, CheckCircle, Star, Crown, ChevronUp, ChevronDown } from 'lucide-react'

interface PlanUpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    allPlans: Plan[]
    currentPlan: string
    changingPlan: boolean
    onChangePlan: (planId: string) => void
    isUpgrade: (planId: string) => boolean
}

export function PlanUpgradeModal({
    isOpen,
    onClose,
    allPlans,
    currentPlan,
    changingPlan,
    onChangePlan,
    isUpgrade
}: PlanUpgradeModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Cambiar Plan de Suscripción
                        </h3>
                        <p className="text-sm text-gray-500">
                            Selecciona el plan que mejor se adapte a tus necesidades
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {allPlans.map((plan) => {
                            const isCurrentPlan = plan.id === currentPlan
                            const isUpgradePlan = isUpgrade(plan.id)
                            const Icon = plan.icon

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-lg border-2 p-6 ${isCurrentPlan
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : plan.id === 'pro' // popular plan
                                                ? 'border-orange-300 ring-2 ring-orange-100'
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${!isCurrentPlan ? 'cursor-pointer' : ''} transition-all`}
                                    onClick={() => !isCurrentPlan && !changingPlan && onChangePlan(plan.id)}
                                >
                                    {plan.id === 'pro' && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                <Star className="h-3 w-3 mr-1" />
                                                Más Popular
                                            </span>
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <Check className="h-3 w-3 mr-1" />
                                                Plan Actual
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <div className={`mx-auto w-12 h-12 rounded-full bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                                            <Icon className={`h-6 w-6 text-${plan.color}-600`} />
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                                        <div className="mt-2 mb-4">
                                            <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                            <span className="text-gray-500">/mes</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {Object.entries(plan.features).map(([feature, included], idx) => (
                                            <li key={idx} className="flex items-start">
                                                {included ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                                ) : (
                                                    <X className="h-4 w-4 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                                                )}
                                                <span className={`text-sm ${included ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-center mb-4">
                                        <span className="text-sm text-gray-500">{plan.tenantCount}</span>
                                    </div>

                                    <div className="mt-auto">
                                        {isCurrentPlan ? (
                                            <button
                                                disabled
                                                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 cursor-not-allowed"
                                            >
                                                Plan Actual
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onChangePlan(plan.id)
                                                }}
                                                disabled={changingPlan}
                                                className={`w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white ${isUpgradePlan
                                                        ? `bg-${plan.color}-600 hover:bg-${plan.color}-700`
                                                        : `bg-gray-400 hover:bg-gray-500`
                                                    } disabled:opacity-50 transition-colors`}
                                            >
                                                {changingPlan ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Cambiando...
                                                    </div>
                                                ) : (
                                                    <>
                                                        {isUpgradePlan ? 'Actualizar' : 'Cambiar'} a {plan.name}
                                                        {isUpgradePlan && <ChevronUp className="h-4 w-4 ml-1 inline" />}
                                                        {!isUpgradePlan && <ChevronDown className="h-4 w-4 ml-1 inline" />}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Plan Comparison Info */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                ¿Necesitas ayuda para elegir?
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Todos los planes incluyen actualizaciones automáticas y soporte técnico.
                                Puedes cambiar o cancelar en cualquier momento.
                            </p>
                            <div className="flex justify-center space-x-4 text-sm">
                                <div className="flex items-center text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    Sin compromisos a largo plazo
                                </div>
                                <div className="flex items-center text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    Migración de datos incluida
                                </div>
                                <div className="flex items-center text-gray-500">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    Soporte durante la transición
                                </div>
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
                    <button
                        onClick={() => {
                            console.log('Contact support for plan consultation')
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                        Contactar Soporte
                    </button>
                </div>
            </div>
        </div>
    )
}