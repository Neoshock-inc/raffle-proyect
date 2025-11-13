'use client'
import { useState, useMemo } from 'react'
import { PlanMarketing } from '@/app/types/landing'
import { plans } from '@/app/components/landing/data/plans'
import { MockSubscriptionService, MockCheckoutPayload } from '@/app/services/mockSubscriptionService'
import { useRouter, useSearchParams } from 'next/navigation'

const CheckoutForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlanId = useMemo(() => params.get('plan') ?? plans[0].id, [params])
  const [form, setForm] = useState({
    planId: initialPlanId,
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    company: '',
    referralCode: '',
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const plan = plans.find((p) => p.id === form.planId) as PlanMarketing
  const type: 'subscription' | 'one_time' = plan.id === 'basic' ? 'subscription' : 'one_time'
  const onChange = (e: any) => {
    const { name, value, type: t, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: t === 'checkbox' ? checked : value }))
  }
  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.acceptTerms) {
      setError('Completa nombre, email y acepta términos')
      return
    }
    setLoading(true)
    const payload: MockCheckoutPayload = {
      planId: form.planId,
      type,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      city: form.city,
      company: form.company,
      referralCode: form.referralCode
    }
    const session = await MockSubscriptionService.createSession(payload)
    const completed = await MockSubscriptionService.completeCheckout(session.id)
    setLoading(false)
    router.push(`/plans/checkout/success?session=${completed.id}&plan=${form.planId}`)
  }
  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Checkout Simulado</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/80 text-sm">Plan</label>
          <select name="planId" value={form.planId} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20">
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white/80 text-sm">Tipo</label>
          <input value={type === 'subscription' ? 'Suscripción' : 'Pago único'} disabled className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Nombre completo</label>
          <input name="fullName" value={form.fullName} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Teléfono</label>
          <input name="phone" value={form.phone} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">País</label>
          <input name="country" value={form.country} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Ciudad</label>
          <input name="city" value={form.city} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Empresa</label>
          <input name="company" value={form.company} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
        <div>
          <label className="text-white/80 text-sm">Código de referido</label>
          <input name="referralCode" value={form.referralCode} onChange={onChange} className="w-full mt-1 bg-black/30 text-white rounded-xl px-3 py-2 border border-white/20" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={onChange} />
        <span className="text-white/80 text-sm">Acepto términos y condiciones</span>
      </div>
      {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
      <div className="mt-6">
        <button disabled={loading} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">
          {loading ? 'Procesando...' : 'Pagar (Simulado)'}
        </button>
      </div>
    </form>
  )
}

export default CheckoutForm