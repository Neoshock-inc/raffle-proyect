// src/app/(auth)/dashboard/tenants/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, AlertCircle, Building2, Globe, Crown, UserPlus, Palette, Layout, Sparkles } from 'lucide-react'
import React from 'react'
import { useTenantManagement } from '@/admin/hooks/useTenantManagement'
import { useTenantValidation } from '@/admin/hooks/useTenantValidation'
import { CreateTenantData } from '@/admin/services/tenantService'
import { PLANS } from '@/admin/utils/tenant'

interface StepData {
  // Paso 1: Datos básicos
  name: string
  slug: string
  description: string

  // Paso 2: Plan y Features
  selectedPlan: 'basic' | 'pro' | 'enterprise'

  // Paso 3: Plantillas
  selectedTemplate: 'default' | 'vibrant' | 'elegant'

  // Paso 4: Dominio (solo si no es basic)
  domain: string

  // Paso 5: Administrador
  ownerEmail: string
  ownerName: string
  ownerPhone: string
}

const INITIAL_DATA: StepData = {
  name: '',
  slug: '',
  description: '',
  selectedPlan: 'basic',
  selectedTemplate: 'default',
  domain: '',
  ownerEmail: '',
  ownerName: '',
  ownerPhone: ''
}

const TEMPLATES = {
  default: {
    name: 'Default',
    description: 'Diseño clásico y profesional para cualquier tipo de evento',
    color: 'blue',
    features: [
      'Diseño limpio y minimalista',
      'Navegación intuitiva',
      'Optimizado para móviles',
      'Colores neutros y profesionales',
      'Fácil personalización'
    ],
    category: 'Clásico',
    image: '/images/templates/default.jpeg'
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Diseño dinámico y colorido que destaca visualmente',
    color: 'purple',
    features: [
      'Colores vibrantes y llamativos',
      'Gradientes modernos',
      'Animaciones dinámicas',
      'Perfecto para eventos juveniles',
      'Alta conversión visual'
    ],
    category: 'Moderno',
    image: '/images/templates/vibrant.jpeg'
  },
  elegant: {
    name: 'Elegant',
    description: 'Diseño sofisticado y elegante para eventos premium',
    color: 'gold',
    features: [
      'Tipografía elegante',
      'Espacios amplios y limpios',
      'Paleta de colores sofisticada',
      'Ideal para eventos corporativos',
      'Imagen premium y profesional'
    ],
    category: 'Premium',
    image: '/images/templates/elegant.jpeg'
  }
}

// Helper function to get base URL
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

// Helper function to format subdomain URL
const getSubdomainUrl = (slug: string) => {
  const baseUrl = getBaseUrl()
  // Remove protocol and get domain
  const domain = baseUrl.replace(/^https?:\/\//, '')
  return `https://${slug}.${domain}`
}

const getSteps = (selectedPlan: 'basic' | 'pro' | 'enterprise') => {
  const baseSteps = [
    {
      id: 1,
      name: 'Datos Básicos',
      description: 'Información general del tenant',
      icon: Building2
    },
    {
      id: 2,
      name: 'Plan',
      description: 'Selección de plan y características',
      icon: Crown
    },
    {
      id: 3,
      name: 'Plantillas',
      description: 'Selección de diseño y funcionalidades',
      icon: Palette
    }
  ]

  // Solo agregar paso de dominio si no es plan basic
  if (selectedPlan !== 'basic') {
    baseSteps.push({
      id: 4,
      name: 'Dominio',
      description: 'Configuración del dominio personalizado',
      icon: Globe
    })
  }

  baseSteps.push({
    id: selectedPlan === 'basic' ? 4 : 5,
    name: 'Administrador',
    description: 'Usuario administrador del tenant',
    icon: UserPlus
  })

  return baseSteps
}

export default function CreateTenantPage() {
  const router = useRouter()
  const { createTenant, loading } = useTenantManagement()
  const {
    validateSlug,
    validateDomain,
    generateSlugFromName,
    validatingSlug,
    validatingDomain
  } = useTenantValidation()

  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<StepData>(INITIAL_DATA)
  const [errors, setErrors] = useState<Partial<StepData>>({})
  const [validationStatus, setValidationStatus] = useState({
    slug: false,
    domain: false
  })

  const STEPS = getSteps(data.selectedPlan)

  const updateData = (field: keyof StepData, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleNameChange = async (name: string) => {
    updateData('name', name)

    if (name.length > 2) {
      const generatedSlug = generateSlugFromName(name)
      updateData('slug', generatedSlug)

      // Validar slug automáticamente
      if (generatedSlug) {
        const isValid = await validateSlug(generatedSlug)
        setValidationStatus(prev => ({
          ...prev,
          slug: isValid
        }))
      }
    }
  }

  const handleSlugChange = async (slug: string) => {
    updateData('slug', slug)

    if (slug.length > 2) {
      const isValid = await validateSlug(slug)
      setValidationStatus(prev => ({
        ...prev,
        slug: isValid
      }))
    }
  }

  const handleDomainChange = async (domain: string) => {
    updateData('domain', domain)

    if (domain.length > 3) {
      const isValid = await validateDomain(domain)
      setValidationStatus(prev => ({
        ...prev,
        domain: isValid
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<StepData> = {}

    switch (step) {
      case 1:
        if (!data.name.trim()) {
          newErrors.name = 'El nombre es requerido'
        }
        if (!data.slug.trim()) {
          newErrors.slug = 'El slug es requerido'
        } else if (!validationStatus.slug) {
          newErrors.slug = 'El slug no está disponible'
        }
        break

      case 4:
        // Solo validar dominio si no es plan basic y estamos en el paso correcto
        if (data.selectedPlan !== 'basic' && step === 4) {
          if (!data.domain.trim()) {
            newErrors.domain = 'El dominio es requerido'
          } else if (!validationStatus.domain) {
            newErrors.domain = 'El dominio no está disponible'
          }
        }
        break

      case 4:
      case 5:
        // Validar administrador (puede ser paso 4 o 5 dependiendo del plan)
        const isAdminStep = (data.selectedPlan === 'basic' && step === 4) ||
          (data.selectedPlan !== 'basic' && step === 5)

        if (isAdminStep) {
          if (!data.ownerName.trim()) {
            newErrors.ownerName = 'El nombre es requerido'
          }
          if (!data.ownerEmail.trim()) {
            newErrors.ownerEmail = 'El email es requerido'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
            newErrors.ownerEmail = 'El formato del email no es válido'
          }
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(STEPS.length, prev + 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    try {
      const tenantData: CreateTenantData = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        domain: data.selectedPlan !== 'basic' ? data.domain.trim() : data.slug.trim(),
        description: data.description.trim() || undefined,
        plan: data.selectedPlan,
        template: data.selectedTemplate,
        ownerEmail: data.ownerEmail.trim(),
        ownerName: data.ownerName.trim(),
        ownerPhone: data.ownerPhone.trim() || undefined,
      }

      await createTenant(tenantData)
      router.push('/dashboard/tenants?success=created')
    } catch (error) {
      console.error('Error creating tenant:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Nombre del Tenant *
                </label>
                <input
                  type="text"
                  className={`block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.name ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-sky-600'
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-lg`}
                  placeholder="Mi Empresa S.A."
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Este será el nombre principal de tu organización
                </p>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Slug (Identificador único) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.slug
                      ? 'ring-red-300 focus:ring-red-500'
                      : validationStatus.slug
                        ? 'ring-green-300 focus:ring-green-500'
                        : 'ring-gray-300 focus:ring-sky-600'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-lg`}
                    placeholder="mi-empresa"
                    value={data.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  {validatingSlug && (
                    <div className="absolute right-4 top-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-600 border-t-transparent" />
                    </div>
                  )}
                  {!validatingSlug && data.slug && validationStatus.slug && (
                    <div className="absolute right-4 top-4">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.slug && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.slug}
                  </p>
                )}
                <div className="mt-2 p-3 bg-sky-50 rounded-lg">
                  <p className="text-sm text-sky-800">
                    <strong>URL de acceso:</strong> {getSubdomainUrl(data.slug || 'tu-slug')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-0 py-4 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 text-lg"
                  placeholder="Breve descripción de tu organización y el propósito del tenant..."
                  value={data.description}
                  onChange={(e) => updateData('description', e.target.value)}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Información adicional sobre tu organización (opcional)
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selecciona el plan perfecto para tu organización
              </h3>
              <p className="text-gray-600">
                Puedes cambiar de plan en cualquier momento desde la configuración
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(PLANS).map(([key, plan]) => {
                const isSelected = data.selectedPlan === key
                const colorClasses = {
                  gray: {
                    border: isSelected ? 'ring-2 ring-gray-500 border-gray-500' : 'border-gray-200 hover:border-gray-300',
                    header: 'bg-gray-50',
                    badge: 'bg-gray-100 text-gray-800',
                    button: isSelected ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  },
                  blue: {
                    border: isSelected ? 'ring-2 ring-sky-500 border-sky-500' : 'border-gray-200 hover:border-sky-300',
                    header: 'bg-sky-50',
                    badge: 'bg-sky-100 text-sky-800',
                    button: isSelected ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-sky-50'
                  },
                  purple: {
                    border: isSelected ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200 hover:border-purple-300',
                    header: 'bg-purple-50',
                    badge: 'bg-purple-100 text-purple-800',
                    button: isSelected ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                  }
                }

                const colors = colorClasses[plan.color as keyof typeof colorClasses]

                return (
                  <div
                    key={key}
                    className={`relative rounded-xl border ${colors.border} bg-white shadow-sm cursor-pointer transition-all duration-200 ${isSelected ? 'transform scale-105 shadow-lg' : ''
                      }`}
                    onClick={() => updateData('selectedPlan', key as any)}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Seleccionado
                        </span>
                      </div>
                    )}

                    <div className={`p-6 ${colors.header} rounded-t-xl`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-bold text-gray-900">
                          {plan.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                          {plan.tenantCount}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {plan.price}
                        {key !== 'basic' && <span className="text-lg font-normal text-gray-600"></span>}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>

                      {/* Indicador de dominio */}
                      <div className="mt-3">
                        {plan.subdomain ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Subdominio incluido
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Dominio personalizado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4">Features incluidos:</h5>
                      <div className="space-y-3">
                        {Object.entries(plan.features).map(([feature, included]) => (
                          <div key={feature} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{feature}</span>
                            <div className="flex items-center">
                              {included ? (
                                <div className="flex items-center">
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  <div className="w-6 h-3 bg-green-500 rounded-full relative">
                                    <div className="w-5 h-5 bg-white rounded-full border-2 border-green-500 absolute -top-1 -right-1"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">×</span>
                                  <div className="w-6 h-3 bg-gray-200 rounded-full relative">
                                    <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-200 absolute -top-1 -left-1"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={`w-full mt-6 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${colors.button}`}
                        onClick={() => updateData('selectedPlan', key as any)}
                      >
                        {isSelected ? 'Seleccionado' : `Seleccionar ${plan.name}`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {data.selectedPlan === 'basic' && (
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-semibold text-amber-800">
                      Plan Basic - Subdominio incluido
                    </h4>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>Con el plan Basic, tu tenant estará disponible en:</p>
                      <p className="mt-1 font-medium">{getSubdomainUrl(data.slug || 'tu-slug')}</p>
                      <p className="mt-2">Si necesitas un dominio personalizado, considera actualizar a Plan Pro o Enterprise.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elige la plantilla perfecta para tu tenant
              </h3>
              <p className="text-gray-600">
                Selecciona un diseño que se adapte a tus necesidades. Podrás personalizarlo después.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(TEMPLATES).map(([key, template]) => {
                const isSelected = data.selectedTemplate === key
                const colorClasses = {
                  blue: 'border-sky-500 bg-sky-50',
                  purple: 'border-purple-500 bg-purple-50',
                  gold: 'border-yellow-500 bg-yellow-50',
                  green: 'border-green-500 bg-green-50',
                  gray: 'border-gray-500 bg-gray-50'
                }

                return (
                  <div
                    key={key}
                    className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                      ? `${colorClasses[template.color as keyof typeof colorClasses]} shadow-lg transform scale-105`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                    onClick={() => updateData('selectedTemplate', key as any)}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Seleccionada
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="text-center mb-4">
                        <div className="mb-3">
                          <img
                            src={template.image}
                            alt={template.name}
                            className="w-full h-40 object-cover object-top rounded-lg border"
                          />
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {template.category}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2 text-center">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        {template.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        <h5 className="text-sm font-semibold text-gray-900">Características:</h5>
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <Sparkles className="h-3 w-3 mr-2 text-gray-400" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        onClick={() => updateData('selectedTemplate', key as any)}
                      >
                        {isSelected ? 'Seleccionada' : 'Seleccionar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 bg-sky-50 border border-sky-200 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Layout className="h-6 w-6 text-sky-400" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-sky-800">
                    Plantilla seleccionada: {TEMPLATES[data.selectedTemplate]?.name || 'Ninguna'}
                  </h4>
                  <div className="mt-2 text-sm text-sky-700">
                    <p>{TEMPLATES[data.selectedTemplate].description}</p>
                    <p className="mt-2">
                      <strong>Nota:</strong> Podrás personalizar colores, logos y contenido después de crear el tenant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        // Este caso se maneja diferente según el plan
        if (data.selectedPlan !== 'basic') {
          // Paso de dominio para planes Pro y Enterprise
          return (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-8">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Dominio Principal *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.domain
                        ? 'ring-red-300 focus:ring-red-500'
                        : validationStatus.domain
                          ? 'ring-green-300 focus:ring-green-500'
                          : 'ring-gray-300 focus:ring-sky-600'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-lg`}
                      placeholder="miempresa.com"
                      value={data.domain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                    />
                    {validatingDomain && (
                      <div className="absolute right-4 top-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-600 border-t-transparent" />
                      </div>
                    )}
                    {!validatingDomain && data.domain && validationStatus.domain && (
                      <div className="absolute right-4 top-4">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.domain && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.domain}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    Este será el dominio principal donde estará disponible el tenant
                  </p>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Globe className="h-6 w-6 text-sky-400" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-semibold text-sky-800">
                        Configuración de DNS
                      </h4>
                      <div className="mt-3 text-sm text-sky-700 space-y-2">
                        <p>
                          Después de crear el tenant, deberás configurar tu DNS para apuntar
                          <strong> {data.domain || 'tu-dominio.com'}</strong> a nuestros servidores.
                        </p>
                        <p>
                          Te enviaremos las instrucciones detalladas por email junto con:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Registros DNS necesarios</li>
                          <li>Guía paso a paso de configuración</li>
                          <li>Herramienta de verificación de dominio</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">
                    ¿No tienes un dominio?
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Puedes registrar un dominio con nosotros o usar un subdominio temporal mientras configuras el tuyo.
                  </p>
                  <button
                    type="button"
                    className="text-sm text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Ver opciones de dominio →
                  </button>
                </div>
              </div>
            </div>
          )
        } else {
          // Paso de administrador para plan Basic
          return renderAdminStep()
        }

      case 5:
        // Paso de administrador para planes Pro y Enterprise
        return renderAdminStep()

      default:
        return null
    }
  }

  const renderAdminStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            Nombre del Administrador *
          </label>
          <input
            type="text"
            className={`block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.ownerName ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-sky-600'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-lg`}
            placeholder="Juan Pérez González"
            value={data.ownerName}
            onChange={(e) => updateData('ownerName', e.target.value)}
          />
          {errors.ownerName && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.ownerName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            Email del Administrador *
          </label>
          <input
            type="email"
            className={`block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.ownerEmail ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-sky-600'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset text-lg`}
            placeholder="admin@miempresa.com"
            value={data.ownerEmail}
            onChange={(e) => updateData('ownerEmail', e.target.value)}
          />
          {errors.ownerEmail && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.ownerEmail}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-600">
            Este usuario será el administrador principal del tenant y recibirá las credenciales de acceso
          </p>
        </div>

        <div>
          <label className="block text-base font-semibold text-gray-900 mb-3">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            className="block w-full rounded-lg border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 text-lg"
            placeholder="+1 (555) 123-4567"
            value={data.ownerPhone}
            onChange={(e) => updateData('ownerPhone', e.target.value)}
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <h4 className="text-base font-semibold text-green-800">
                Resumen de Configuración
              </h4>
              <div className="mt-4 space-y-3 text-sm text-green-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Tenant:</p>
                    <p>{data.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Plan:</p>
                    <p>{PLANS[data.selectedPlan].name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Plantilla:</p>
                    <p>{TEMPLATES[data.selectedTemplate].name}</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {data.selectedPlan === 'basic' ? 'Subdominio:' : 'Dominio:'}
                    </p>
                    <p>
                      {data.selectedPlan === 'basic'
                        ? getSubdomainUrl(data.slug)
                        : data.domain}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Administrador:</p>
                    <p>{data.ownerName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p>{data.ownerEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserPlus className="h-6 w-6 text-sky-400" />
            </div>
            <div className="ml-4">
              <h4 className="text-base font-semibold text-sky-800">
                ¿Qué sucede después?
              </h4>
              <div className="mt-3 text-sm text-sky-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Se creará el tenant con la configuración especificada</li>
                  <li>Se aplicará la plantilla seleccionada ({TEMPLATES[data.selectedTemplate].name})</li>
                  {data.selectedPlan !== 'basic' && <li>Se registrará el dominio en el sistema</li>}
                  <li>Se creará el usuario administrador</li>
                  <li>Se enviarán las credenciales de acceso por email</li>
                  {data.selectedPlan !== 'basic' && <li>Recibirás instrucciones para configurar el DNS</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-2 sm:px-3 lg:px-4 py-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/dashboard/tenants')}
              className="mr-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a Tenants
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
              Crear Nuevo Tenant
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
              Configura un nuevo tenant siguiendo estos sencillos pasos.
              El proceso toma aproximadamente 5 minutos.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-24">
          <nav aria-label="Progress" className="flex justify-center">
            <ol role="list" className="flex items-center space-x-5">
              {STEPS.map((step, stepIdx) => {
                const Icon = step.icon
                const isCurrent = step.id === currentStep
                const isCompleted = step.id < currentStep

                return (
                  <li key={step.id} className="flex items-center">
                    {stepIdx !== 0 && (
                      <div
                        className={`flex-auto border-t-2 mr-5 ${isCompleted ? 'border-sky-600' : 'border-gray-300'
                          }`}
                        style={{ width: '3rem' }}
                      />
                    )}

                    <div className="relative flex flex-col items-center group">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${isCompleted
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : isCurrent
                            ? 'border-sky-600 bg-white text-sky-600'
                            : 'border-gray-300 bg-white text-gray-400'
                          } transition-all duration-200`}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        )}
                      </div>

                      <div className="absolute top-16 text-center min-w-max">
                        <span
                          className={`text-sm font-medium ${isCurrent ? 'text-sky-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                            }`}
                        >
                          {step.name}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 max-w-24">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-8 py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white">
                  {React.createElement(STEPS[currentStep - 1]?.icon, { className: "h-6 w-6" })}
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  {STEPS[currentStep - 1]?.name}
                </h2>
                <p className="mt-1 text-sky-100">
                  Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-12">
            {renderStep()}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {currentStep} de {STEPS.length}
              </div>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creando tenant...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Crear Tenant
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda? {' '}
            <a href="#" className="text-sky-600 hover:text-sky-500 font-medium">
              Contacta nuestro soporte
            </a>
            {' '} o revisa nuestra {' '}
            <a href="#" className="text-sky-600 hover:text-sky-500 font-medium">
              documentación
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}