'use client'
import { useState } from 'react'

type Props = {
  selectedType: 'subscription' | 'one_time'
  acceptTerms: boolean
  onToggleTerms: (v: boolean) => void
  loading: boolean
  onPay: (e: any) => void
}

const PaymentMethodsMock = ({ selectedType, acceptTerms, onToggleTerms, loading, onPay }: Props) => {
  const [method, setMethod] = useState<'stripe' | 'paypal' | 'transfer' | 'payphone'>('stripe')
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Método de pago (Simulado)</h3>
      <div className="space-y-4">
        {['stripe', 'paypal', 'payphone', 'transfer'].map((m) => (
          <label key={m} className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
            <input type="radio" name="payment" value={m} checked={method === m} onChange={() => setMethod(m as any)} disabled={loading} className="h-5 w-5 text-sky-600 focus:ring-sky-500" />
            <div>
              <span className="font-medium text-gray-900">{m === 'stripe' ? 'Tarjeta' : m === 'paypal' ? 'PayPal / Tarjeta' : m === 'payphone' ? 'PayPhone' : 'Transferencia'}</span>
              <p className="text-sm text-gray-500">Pago de plan: {selectedType === 'subscription' ? 'Suscripción' : 'Único'}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-6 flex items-start space-x-2">
        <input id="legal-age" type="checkbox" checked={acceptTerms} onChange={(e) => onToggleTerms(e.target.checked)} disabled={loading} className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
        <label htmlFor="legal-age" className="text-sm text-gray-700">Confirmo que soy mayor de 18 años y acepto los términos.</label>
      </div>
      <div className="mt-6">
        <button onClick={onPay} disabled={loading || !acceptTerms} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors">{loading ? 'Procesando...' : 'Pagar (Simulado)'}</button>
      </div>
    </div>
  )
}

export default PaymentMethodsMock