'use client'
import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/app/components/Header'
import { PersonalDataForm } from '@/app/components/checkout/PersonalDataForm'
import PlanSummary from '@/app/components/plans-checkout/PlanSummary'
import PaymentMethodsMock from '@/app/components/plans-checkout/PaymentMethodsMock'
import { plans } from '@/app/components/landing/data/plans'
import type { PlanMarketing } from '@/app/types/landing'
import type { CheckoutFormData } from '@/app/types/checkout'
import { MockSubscriptionService, MockCheckoutPayload } from '@/app/services/mockSubscriptionService'

const CheckoutForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlanId = useMemo(() => params.get('plan') ?? plans[0].id, [params])

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    country: '',
    province: '',
    city: '',
    address: ''
  })

  const [extras, setExtras] = useState({
    planId: initialPlanId,
    acceptTerms: false,
    acceptUsage: false
  })

  const [tenantData, setTenantData] = useState({
    name: '',
    slug: '',
    domain: '',
    description: ''
  })

  const [step, setStep] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = plans.find((p) => p.id === extras.planId) as PlanMarketing
  const type: 'subscription' | 'one_time' = plan.id === 'basic' ? 'subscription' : 'one_time'

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTenantChange = (e: any) => {
    const { name, value } = e.target
    setTenantData((prev) => ({ ...prev, [name]: value }))
  }

  const goNext = () => {
    setError('')
    if (step === 1) {
      if (!formData.name || !formData.lastName || !formData.email || !formData.confirmEmail || !formData.phone || !formData.country || !formData.city || !formData.address) {
        setError('Completa todos los campos personales requeridos')
        return
      }
      if (formData.email !== formData.confirmEmail) {
        setError('El email y su confirmación no coinciden')
        return
      }
      setStep(2)
      return
    }
    if (step === 2) {
      if (!tenantData.name || !tenantData.slug) {
        setError('Completa nombre y slug de la empresa')
        return
      }
      const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenantData.slug)
      if (!slugValid) {
        setError('El slug debe usar minúsculas, números y guiones, sin espacios')
        return
      }
      if (type !== 'subscription' && !tenantData.domain) {
        setError('Para este plan, ingresa un dominio de la empresa')
        return
      }
      setStep(3)
      return
    }
  }

  const goPrev = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    if (!formData.name || !formData.lastName || !formData.email || !formData.confirmEmail || !formData.phone || !formData.country || !formData.city || !formData.address) {
      setError('Completa todos los campos personales requeridos')
      return
    }
    if (formData.email !== formData.confirmEmail) {
      setError('El email y su confirmación no coinciden')
      return
    }
    if (!tenantData.name || !tenantData.slug) {
      setError('Completa nombre y slug de la empresa')
      return
    }
    const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenantData.slug)
    if (!slugValid) {
      setError('El slug debe usar minúsculas, números y guiones, sin espacios')
      return
    }
    if (type !== 'subscription' && !tenantData.domain) {
      setError('Para planes de pago único, ingresa el dominio de la empresa')
      return
    }
    if (!extras.acceptTerms || !extras.acceptUsage) {
      setError('Debes aceptar términos y condiciones y términos de uso')
      return
    }
    setLoading(true)
    const payload: MockCheckoutPayload = {
      planId: extras.planId,
      type,
      fullName: `${formData.name} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city
    }
    const session = await MockSubscriptionService.createSession(payload)
    const completed = await MockSubscriptionService.completeCheckout(session.id)
    setLoading(false)
    router.push(`/plans/checkout/success?session=${completed.id}&plan=${extras.planId}`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">FC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Fortuna Cloud</h1>
                <p className="text-gray-600">Checkout de Planes</p>
              </div>
            </div>
            <div className="w-24 h-1 bg-sky-600 rounded mx-auto"></div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
            >
              {/* Paso 1 */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center">1</div>
                      <span className="text-xl font-semibold text-gray-900">Datos Personales</span>
                    </div>
                    <div className="text-sm text-gray-500">Paso {step} de 3</div>
                  </div>
                  <div className="px-6 pb-6">
                    <PersonalDataForm formData={formData} onInputChange={handleInputChange} isProcessing={loading} />
                    <div className="mt-4 flex justify-end gap-3">
                      <button type="button" onClick={goNext} className="bg-sky-600 text-white px-5 py-2 rounded-md">Siguiente</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center">2</div>
                      <span className="text-xl font-semibold text-gray-900">Datos de la empresa</span>
                    </div>
                    <div className="text-sm text-gray-500">Paso {step} de 3</div>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-1">Nombre de la empresa *</label>
                        <input name="name" value={tenantData.name} onChange={handleTenantChange} disabled={loading} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Slug *</label>
                        <input name="slug" value={tenantData.slug} onChange={handleTenantChange} disabled={loading} placeholder="ej. mi-negocio" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-1">Dominio {type === 'subscription' ? '(opcional)' : '*'} </label>
                        <input name="domain" value={tenantData.domain} onChange={handleTenantChange} disabled={loading} placeholder="ej. midominio.com" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Descripción</label>
                        <input name="description" value={tenantData.description} onChange={handleTenantChange} disabled={loading} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between gap-3">
                      <button type="button" onClick={goPrev} className="bg-gray-200 text-gray-900 px-5 py-2 rounded-md">Atrás</button>
                      <button type="button" onClick={goNext} className="bg-sky-600 text-white px-5 py-2 rounded-md">Siguiente</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl">
                    <label className="block text-gray-700 mb-2">Plan seleccionado</label>
                    <select value={extras.planId} onChange={(e) => setExtras((p) => ({ ...p, planId: e.target.value }))} disabled={loading} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100">
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-white rounded-2xl shadow-2xl">
                    <div className="p-6">
                      <PlanSummary plan={plan} type={type} />
                    </div>
                  </div>
                  <PaymentMethodsMock
                    selectedType={type}
                    acceptTerms={extras.acceptTerms}
                    onToggleTerms={(v) => setExtras((prev) => ({ ...prev, acceptTerms: v }))}
                    acceptUsage={extras.acceptUsage}
                    onToggleUsage={(v) => setExtras((prev) => ({ ...prev, acceptUsage: v }))}
                    loading={loading}
                    onPay={onSubmit}
                  />
                  {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center py-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Procesado de forma segura por My Fortuna Cloud</p>
            <div className="flex justify-center items-center mt-2 space-x-4">
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                SSL Seguro
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Pago Verificado
              </div>
              <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 underline">Ver términos y condiciones</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutForm