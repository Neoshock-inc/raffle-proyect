'use client'
import { useState, useMemo } from 'react'
import { PlanMarketing } from '@/app/types/landing'
import { plans } from '@/app/components/landing/data/plans'
import { MockSubscriptionService, MockCheckoutPayload } from '@/app/services/mockSubscriptionService'
import { useRouter, useSearchParams } from 'next/navigation'
import { PersonalDataForm } from '@/app/components/checkout/PersonalDataForm'
import PlanSummary from '@/app/components/plans-checkout/PlanSummary'
import PaymentMethodsMock from '@/app/components/plans-checkout/PaymentMethodsMock'

const CheckoutForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlanId = useMemo(() => params.get('plan') ?? plans[0].id, [params])
  const [form, setForm] = useState({
    planId: initialPlanId,
    name: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    country: '',
    province: '',
    city: '',
    address: '',
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
    if (!form.name || !form.lastName || !form.email || !form.confirmEmail || !form.phone || !form.country || !form.city || !form.address) {
      setError('Completa todos los campos requeridos')
      return
    }
    if (form.email !== form.confirmEmail) {
      setError('El email y su confirmación no coinciden')
      return
    }
    if (!form.acceptTerms) {
      setError('Debes aceptar términos y confirmar mayoría de edad')
      return
    }
    setLoading(true)
    const payload: MockCheckoutPayload = {
      planId: form.planId,
      type,
      fullName: `${form.name} ${form.lastName}`.trim(),
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">FC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Fortuna Cloud</h1>
              <p className="text-gray-600">Checkout de Planes (Simulado)</p>
            </div>
          </div>
          <div className="w-24 h-1 bg-sky-600 rounded mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <PersonalDataForm
              formData={form as any}
              onInputChange={onChange}
              isProcessing={loading}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <PlanSummary plan={plan} type={type} />
            <PaymentMethodsMock
              selectedType={type}
              acceptTerms={form.acceptTerms}
              onToggleTerms={(v) => setForm((prev) => ({ ...prev, acceptTerms: v }))}
              loading={loading}
              onPay={onSubmit}
            />
            {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm