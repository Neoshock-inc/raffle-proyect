// src/app/components/plans-checkout/PaymentMethods.tsx

'use client'

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
        <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Pago</h3>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold">
                        Stripe
                    </div>
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5zm-2.207 14.793l-4.5-4.5 1.414-1.414L10 13.672l6.293-6.293 1.414 1.414-7.914 7.914z" />
                    </svg>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                Plan: {selectedType === 'subscription' ? 'Suscripción mensual' : 'Pago único (lifetime)'}
            </div>

            {/* Security badges */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Pago 100% seguro con Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Aceptamos:</span>
                        <span className="font-semibold">Visa</span>
                        <span className="font-semibold">Mastercard</span>
                        <span className="font-semibold">AMEX</span>
                    </div>
                </div>
            </div>

            {/* Terms checkboxes */}
            <div className="space-y-3">
                <div className="flex items-start space-x-2">
                    <input
                        id="legal-age"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => onToggleTerms(e.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="legal-age" className="text-sm text-gray-700">
                        Confirmo que soy mayor de 18 años y acepto los{' '}
                        <a
                            href="/terminos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 underline hover:text-sky-700"
                        >
                            términos y condiciones
                        </a>
                    </label>
                </div>

                <div className="flex items-start space-x-2">
                    <input
                        id="terms-usage"
                        type="checkbox"
                        checked={acceptUsage}
                        onChange={(e) => onToggleUsage(e.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms-usage" className="text-sm text-gray-700">
                        Acepto los{' '}
                        <a
                            href="/terminos-uso"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 underline hover:text-sky-700"
                        >
                            términos de uso
                        </a>{' '}
                        de la plataforma
                    </label>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
                {onBack && (
                    <button
                        onClick={onBack}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 rounded-lg font-semibold transition-colors"
                    >
                        Atrás
                    </button>
                )}

                <button
                    onClick={onPay}
                    disabled={loading || !acceptTerms || !acceptUsage}
                    className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Proceder al Pago Seguro
                        </span>
                    )}
                </button>
            </div>

            {/* Additional info */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    Serás redirigido a Stripe para completar el pago de forma segura
                </p>
                {selectedType === 'subscription' && (
                    <p className="text-xs text-gray-500 mt-1">
                        Puedes cancelar tu suscripción en cualquier momento
                    </p>
                )}
            </div>
        </div>
    )
}

export default PaymentMethods