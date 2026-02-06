'use client'

type Props = {
  selectedType: 'subscription' | 'one_time'
  acceptTerms: boolean
  onToggleTerms: (v: boolean) => void
  acceptUsage: boolean
  onToggleUsage: (v: boolean) => void
  loading: boolean
  onPay: (e: any) => void
}

const PaymentMethodsMock = ({ selectedType, acceptTerms, onToggleTerms, acceptUsage, onToggleUsage, loading, onPay }: Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Pago</h3>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold">Stripe</div>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">Plan {selectedType === 'subscription' ? 'Suscripción' : 'Pago único'}</div>
      <div className="mt-2 flex items-start space-x-2">
        <input id="legal-age" type="checkbox" checked={acceptTerms} onChange={(e) => onToggleTerms(e.target.checked)} disabled={loading} className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
        <label htmlFor="legal-age" className="text-sm text-gray-700">
          Confirmo que soy mayor de 18 años y acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">términos y condiciones</a>.
        </label>
      </div>
      <div className="mt-3 flex items-start space-x-2">
        <input id="terms-usage" type="checkbox" checked={acceptUsage} onChange={(e) => onToggleUsage(e.target.checked)} disabled={loading} className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
        <label htmlFor="terms-usage" className="text-sm text-gray-700">
          Acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">términos de uso</a> de la plataforma.
        </label>
      </div>
      <div className="mt-6">
        <button onClick={onPay} disabled={loading || !acceptTerms} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors">
          {loading ? 'Procesando...' : 'Pagar con tarjeta'}
        </button>
      </div>
    </div>
  )
}

export default PaymentMethodsMock