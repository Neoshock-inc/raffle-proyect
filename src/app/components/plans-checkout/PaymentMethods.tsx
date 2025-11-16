// src/app/components/plans-checkout/PaymentMethods.tsx

'use client'
import { CreditCard, Shield, Zap, ArrowLeft, Check } from 'lucide-react'

type Props = {
    selectedType: 'subscription' | 'one_time'
    acceptTerms: boolean
    onToggleTerms: (v: boolean) => void
    acceptUsage: boolean
    onToggleUsage: (v: boolean) => void
    loading: boolean
    onPay: (e: React.FormEvent) => void
    onBack?: () => void
}

const PaymentMethods = ({
    selectedType,
    acceptTerms,
    onToggleTerms,
    acceptUsage,
    onToggleUsage,
    loading,
    onPay,
    onBack
}: Props) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Método de Pago</h3>
                            <p className="text-xs text-sky-100">
                                {selectedType === 'subscription' ? '💳 Suscripción Mensual' : '⚡ Pago Único'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                            <span className="text-white text-xs font-bold">Stripe</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Security Badge */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-green-800 mb-1">Pago 100% Seguro</p>
                            <p className="text-xs text-green-600 leading-relaxed">
                                Procesado con encriptación SSL de nivel bancario por Stripe
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Features Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-blue-800">Instantáneo</span>
                        </div>
                        <p className="text-xs text-blue-600">Activación inmediata</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center">
                                <CreditCard className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-purple-800">Multi-tarjeta</span>
                        </div>
                        <p className="text-xs text-purple-600">Visa, MC, AMEX</p>
                    </div>
                </div>

                {/* Payment Cards Logos */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Aceptamos:</span>
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-white rounded border border-gray-200">
                                <span className="text-xs font-bold text-blue-600">VISA</span>
                            </div>
                            <div className="px-2 py-1 bg-white rounded border border-gray-200">
                                <span className="text-xs font-bold text-orange-600">MC</span>
                            </div>
                            <div className="px-2 py-1 bg-white rounded border border-gray-200">
                                <span className="text-xs font-bold text-blue-700">AMEX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms Section - Compact */}
                <div className="space-y-2.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start gap-2.5">
                        <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                            <input
                                id="legal-age"
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => onToggleTerms(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-sky-600 focus:ring-2 focus:ring-sky-500 border-gray-300 rounded cursor-pointer transition-all appearance-none checked:bg-sky-600 checked:border-sky-600"
                            />
                            {acceptTerms && (
                                <Check className="w-3 h-3 text-white absolute pointer-events-none" strokeWidth={3} />
                            )}
                        </div>
                        <label htmlFor="legal-age" className="text-xs text-gray-700 leading-relaxed cursor-pointer flex-1">
                            Confirmo que soy <span className="font-semibold">mayor de 18 años</span> y acepto los{' '}
                            <a
                                href="/terminos"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 font-semibold underline hover:text-sky-700"
                            >
                                términos y condiciones
                            </a>
                        </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                        <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                            <input
                                id="terms-usage"
                                type="checkbox"
                                checked={acceptUsage}
                                onChange={(e) => onToggleUsage(e.target.checked)}
                                disabled={loading}
                                className="h-4 w-4 text-sky-600 focus:ring-2 focus:ring-sky-500 border-gray-300 rounded cursor-pointer transition-all appearance-none checked:bg-sky-600 checked:border-sky-600"
                            />
                            {acceptUsage && (
                                <Check className="w-3 h-3 text-white absolute pointer-events-none" strokeWidth={3} />
                            )}
                        </div>
                        <label htmlFor="terms-usage" className="text-xs text-gray-700 leading-relaxed cursor-pointer flex-1">
                            Acepto los{' '}
                            <a
                                href="/terminos-uso"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 font-semibold underline hover:text-sky-700"
                            >
                                términos de uso
                            </a>{' '}
                            de la plataforma
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <button
                        onClick={onPay}
                        disabled={loading || !acceptTerms || !acceptUsage}
                        className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center w-full gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Procesando pago...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Proceder al Pago Seguro</span>
                                </div>
                                <span className="opacity-75 group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </button>

                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={loading}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver</span>
                        </button>
                    )}
                </div>

                {/* Additional Info */}
                <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                        🔒 Serás redirigido a Stripe para completar el pago
                    </p>
                    {selectedType === 'subscription' && (
                        <p className="text-xs text-gray-500">
                            ✓ Cancela tu suscripción en cualquier momento
                        </p>
                    )}
                    {selectedType === 'one_time' && (
                        <p className="text-xs text-gray-500">
                            ✓ Acceso de por vida, sin pagos recurrentes
                        </p>
                    )}
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">SSL 256-bit</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">PCI DSS</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentMethods