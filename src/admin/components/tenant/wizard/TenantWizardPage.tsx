'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Building2, Crown, Palette, Globe, UserPlus } from 'lucide-react'
import { useTenantWizard, getStepCount } from '@/admin/hooks/useTenantWizard'
import { useTenantManagement } from '@/admin/hooks/useTenantManagement'
import { useTenantValidation } from '@/admin/hooks/useTenantValidation'
import { Button } from '@/admin/components/ui/Button'
import TenantWizardStepper from './TenantWizardStepper'
import type { WizardStep } from './TenantWizardStepper'
import StepBasicInfo from './StepBasicInfo'
import StepPlan from './StepPlan'
import StepTemplate from './StepTemplate'
import StepDomain from './StepDomain'
import StepAdmin from './StepAdmin'

function getSteps(plan: string): WizardStep[] {
    const base: WizardStep[] = [
        { label: 'Datos Básicos', icon: Building2 },
        { label: 'Plan', icon: Crown },
        { label: 'Plantilla', icon: Palette },
    ]
    if (plan !== 'basic') {
        base.push({ label: 'Dominio', icon: Globe })
    }
    base.push({ label: 'Administrador', icon: UserPlus })
    return base
}

export default function TenantWizardPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const { createTenant } = useTenantManagement()
    const {
        validateSlug,
        validateDomain,
        generateSlugFromName,
        validatingSlug,
        validatingDomain,
    } = useTenantValidation()

    const {
        step,
        formData,
        errors,
        totalSteps,
        setField,
        setStep,
        nextStep,
        prevStep,
        getSubmitData,
    } = useTenantWizard()

    const [validationStatus, setValidationStatus] = useState({
        slug: false,
        domain: false,
    })

    const steps = getSteps(formData.selectedPlan)
    const isLastStep = step === totalSteps - 1

    const handleNameChange = useCallback(async (name: string) => {
        setField('name', name)
        if (name.length > 2) {
            const generatedSlug = generateSlugFromName(name)
            setField('slug', generatedSlug)
            if (generatedSlug) {
                const isValid = await validateSlug(generatedSlug)
                setValidationStatus(prev => ({ ...prev, slug: isValid }))
            }
        }
    }, [setField, generateSlugFromName, validateSlug])

    const handleSlugChange = useCallback(async (slug: string) => {
        setField('slug', slug)
        if (slug.length > 2) {
            const isValid = await validateSlug(slug)
            setValidationStatus(prev => ({ ...prev, slug: isValid }))
        }
    }, [setField, validateSlug])

    const handleDomainChange = useCallback(async (domain: string) => {
        setField('domain', domain)
        if (domain.length > 3) {
            const isValid = await validateDomain(domain)
            setValidationStatus(prev => ({ ...prev, domain: isValid }))
        }
    }, [setField, validateDomain])

    const handleNext = () => {
        nextStep(validationStatus.slug, validationStatus.domain)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const data = getSubmitData()
            await createTenant(data)
            router.push('/dashboard/tenants?success=created')
        } catch (error) {
            console.error('Error creating tenant:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const renderStep = () => {
        // Map step index to logical step considering dynamic domain step
        if (step === 0) {
            return (
                <StepBasicInfo
                    formData={formData}
                    errors={errors}
                    setField={setField}
                    onNameChange={handleNameChange}
                    onSlugChange={handleSlugChange}
                    validatingSlug={validatingSlug}
                    slugValid={validationStatus.slug}
                />
            )
        }
        if (step === 1) {
            return <StepPlan formData={formData} setField={setField} />
        }
        if (step === 2) {
            return <StepTemplate formData={formData} setField={setField} />
        }
        if (formData.selectedPlan !== 'basic' && step === 3) {
            return (
                <StepDomain
                    formData={formData}
                    errors={errors}
                    onDomainChange={handleDomainChange}
                    validatingDomain={validatingDomain}
                    domainValid={validationStatus.domain}
                />
            )
        }
        return <StepAdmin formData={formData} errors={errors} setField={setField} />
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/dashboard/tenants')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm">Volver a Tenants</span>
                </button>
                <span className="text-xs text-gray-400">
                    Paso {step + 1} de {totalSteps}
                </span>
            </div>

            {/* Title */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Crear Nuevo Tenant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Completa los pasos para crear un nuevo tenant
                </p>
            </div>

            {/* Stepper */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                <TenantWizardStepper
                    steps={steps}
                    currentStep={step}
                    onStepClick={setStep}
                />
            </div>

            {/* Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="secondary"
                    onClick={prevStep}
                    disabled={step === 0}
                    icon={<ChevronLeft className="h-4 w-4" />}
                >
                    Anterior
                </Button>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/dashboard/tenants')}
                    >
                        Cancelar
                    </Button>

                    {isLastStep ? (
                        <Button
                            variant="success"
                            onClick={handleSubmit}
                            loading={submitting}
                            icon={<Check className="h-4 w-4" />}
                        >
                            Crear Tenant
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            icon={<ChevronRight className="h-4 w-4" />}
                        >
                            Siguiente
                        </Button>
                    )}
                </div>
            </div>

            {/* Help */}
            <div className="text-center">
                <p className="text-xs text-gray-400">
                    ¿Necesitas ayuda?{' '}
                    <a href="#" className="text-indigo-500 hover:text-indigo-600 font-medium">Contacta soporte</a>
                    {' '} o revisa la{' '}
                    <a href="#" className="text-indigo-500 hover:text-indigo-600 font-medium">documentación</a>
                </p>
            </div>
        </div>
    )
}
