'use client'
import CheckoutForm from '@/app/components/plans-checkout/CheckoutForm'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Checkout de Planes (Simulado)</h1>
        <CheckoutForm />
      </div>
    </div>
  )
}