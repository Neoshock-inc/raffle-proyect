// src/app/components/plans-checkout/CheckoutForm.tsx

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/app/components/Header'
import { PersonalDataForm } from '@/app/components/checkout/PersonalDataForm'
import PlanSummary from '@/app/components/plans-checkout/PlanSummary'
import { getStripe } from '@/app/lib/stripe/client'
import type { PlanMarketing } from '@/app/types/landing'
import type { CheckoutFormData } from '@/app/types/checkout'
import type { PlanCode, CreateCheckoutRequest } from '@/app/types/subscription'
import PaymentMethods from './PaymentMethods'

const CheckoutForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const initialPlanCode = params.get('plan') || 'basic'

  const [plans, setPlans] = useState<PlanMarketing[]>([])
  const [loading, setLoading] = useState(true)
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
    planCode: initialPlanCode,
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/stripe/checkout')
        const result = await response.json()

        if (result.success && result.data) {
          setPlans(result.data)
        }
      } catch (err) {
        console.error('Error loading plans:', err)
        setError('Error al cargar los planes')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Get current selected plan
  const currentPlan = useMemo(() => {
    return plans.find(p => p.code === extras.planCode) || plans[0]
  }, [plans, extras.planCode])

  const planType: 'subscription' | 'one_time' = currentPlan?.code === 'basic' ? 'subscription' : 'one_time'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTenantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      setTenantData((prev) => ({
        ...prev,
        name: value,
        slug: prev.slug || slug
      }))
    } else {
      setTenantData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    setError('')

    if (stepNumber === 1) {
      if (!formData.name || !formData.lastName || !formData.email ||
        !formData.confirmEmail || !formData.phone || !formData.country ||
        !formData.city || !formData.address) {
        setError('Completa todos los campos personales requeridos')
        return false
      }

      if (formData.email !== formData.confirmEmail) {
        setError('El email y su confirmación no coinciden')
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Ingresa un email válido')
        return false
      }

      return true
    }

    if (stepNumber === 2) {
      if (!tenantData.name || !tenantData.slug) {
        setError('Completa nombre y slug de la empresa')
        return false
      }

      const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenantData.slug)
      if (!slugValid) {
        setError('El slug debe usar minúsculas, números y guiones, sin espacios')
        return false
      }

      if (extras.planCode !== 'basic' && !tenantData.domain) {
        setError('El dominio es requerido para este plan')
        return false
      }

      if (tenantData.domain) {
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
        if (!domainRegex.test(tenantData.domain)) {
          setError('Ingresa un dominio válido (ej: miempresa.com)')
          return false
        }
      }

      return true
    }

    return true
  }

  const goNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const goPrev = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateStep(1) || !validateStep(2)) {
      return
    }

    if (!extras.acceptTerms || !extras.acceptUsage) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setSubmitting(true)

    try {
      const checkoutData: CreateCheckoutRequest = {
        planCode: extras.planCode as PlanCode,
        customer: {
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.province,
            country: formData.country,
            postal_code: undefined,
          }
        },
        tenant: {
          name: tenantData.name,
          slug: tenantData.slug,
          domain: tenantData.domain || undefined,
          description: tenantData.description || undefined,
        }
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear sesión de pago')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Error al cargar Stripe')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: result.data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando planes...</p>
          </div>
        </div>
      </>
    )
  }

  if (!currentPlan) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error: No se pudieron cargar los planes</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">FC</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                  My Fortuna Cloud
                </h1>
                <p className="text-xs text-gray-500">Checkout Seguro</p>
              </div>
            </div>
          </div>

          {/* Compact Progress */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= i
                    ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white shadow-lg scale-110'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`w-12 h-1 mx-1 rounded-full transition-all duration-300 ${step > i ? 'bg-gradient-to-r from-sky-600 to-indigo-600' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Fixed Height with Scroll and OVERFLOW HIDDEN */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
            >
              {/* Step 1: Personal Data */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        Datos Personales
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Paso {step}/3</span>
                  </div>
                  <div className="px-5 py-4 max-h-[calc(100vh)] overflow-y-auto">
                    <PersonalDataForm
                      formData={formData}
                      onInputChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                        handleInputChange(e as React.ChangeEvent<HTMLInputElement>)
                      }
                      isProcessing={submitting}
                    />
                    {error && step === 1 && (
                      <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-xs font-medium">{error}</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={goNext}
                        className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        Continuar →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Company Data */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                  <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        Datos de la Empresa
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Paso {step}/3</span>
                  </div>
                  <div className="px-5 py-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Nombre de la empresa *
                          </label>
                          <input
                            name="name"
                            value={tenantData.name}
                            onChange={handleTenantChange}
                            disabled={submitting}
                            placeholder="Mi Empresa de Rifas"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Slug (URL) *
                          </label>
                          <input
                            name="slug"
                            value={tenantData.slug}
                            onChange={handleTenantChange}
                            disabled={submitting}
                            placeholder="mi-empresa"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {tenantData.slug || 'mi-empresa'}.fortunacloud.com
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Dominio {extras.planCode === 'basic' ? '(opcional)' : '*'}
                          </label>
                          <input
                            name="domain"
                            value={tenantData.domain}
                            onChange={handleTenantChange}
                            disabled={submitting}
                            placeholder="midominio.com"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1.5 text-sm font-medium">
                            Descripción
                          </label>
                          <input
                            name="description"
                            value={tenantData.description}
                            onChange={handleTenantChange}
                            disabled={submitting}
                            placeholder="Breve descripción"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {error && step === 2 && (
                      <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-xs font-medium">{error}</p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between gap-2">
                      <button
                        type="button"
                        onClick={goPrev}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-semibold border border-gray-200 shadow-sm hover:shadow transition-all duration-200"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        Continuar →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Plan Summary */}
                  <div className="space-y-4">
                    {/* Plan Selector */}
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                      <label className="block text-gray-700 mb-2 text-sm font-semibold">
                        Selecciona tu plan
                      </label>
                      <select
                        value={extras.planCode}
                        onChange={(e) => setExtras((p) => ({ ...p, planCode: e.target.value }))}
                        disabled={submitting}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-50 font-medium"
                      >
                        {plans.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name} - {p.price} {p.period}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Summary */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-y-auto">
                      <div className="p-4">
                        <PlanSummary plan={currentPlan} type={planType} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment */}
                  <div className="space-y-4">
                    <PaymentMethods
                      selectedType={planType}
                      acceptTerms={extras.acceptTerms}
                      onToggleTerms={(v) => setExtras((prev) => ({ ...prev, acceptTerms: v }))}
                      acceptUsage={extras.acceptUsage}
                      onToggleUsage={(v) => setExtras((prev) => ({ ...prev, acceptUsage: v }))}
                      loading={submitting}
                      onPay={onSubmit}
                      onBack={goPrev}
                    />

                    {error && step === 3 && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-xs font-medium">{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Footer */}
          <div className="mt-6 text-center py-4">
            <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL Seguro
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pago Verificado
              </span>
              <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline">
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutForm