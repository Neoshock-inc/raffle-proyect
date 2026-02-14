'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useRaffleWizard } from '@/admin/hooks/useRaffleWizard'
import type { WizardFormData } from '@/admin/hooks/useRaffleWizard'
import { useRaffles, useRaffle } from '@/admin/hooks/useRaffles'
import { numberPoolService } from '@/admin/services/numberPoolService'
import { Button } from '@/admin/components/ui/Button'
import RaffleWizardStepper from './RaffleWizardStepper'
import StepBasicInfo from './StepBasicInfo'
import StepConfig from './StepConfig'
import StepDesign from './StepDesign'
import StepReview from './StepReview'

interface RaffleWizardPageProps {
    mode: 'create' | 'edit'
    raffleId?: string
}

export default function RaffleWizardPage({ mode, raffleId }: RaffleWizardPageProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const { createRaffle } = useRaffles({ enabled: false })
    const { raffle, loading: loadingRaffle, updateRaffle } = useRaffle(mode === 'edit' ? raffleId || null : null)

    const {
        step,
        formData,
        errors,
        setField,
        setStep,
        nextStep,
        prevStep,
        getSubmitData,
        reset,
    } = useRaffleWizard()

    // Load existing raffle data for edit mode
    useEffect(() => {
        if (mode === 'edit' && raffle) {
            const editData: WizardFormData = {
                title: raffle.title || '',
                description: raffle.description || '',
                price: raffle.price || 0,
                total_numbers: raffle.total_numbers || 100,
                draw_date: raffle.draw_date ? raffle.draw_date.split('T')[0] : '',
                primary_color: raffle.primary_color || '#800000',
                secondary_color: raffle.secondary_color || '#FFC107',
                background_color: raffle.background_color || '#FFFFFF',
                text_color: raffle.text_color || '#333333',
                logo_url: raffle.logo_url || '',
                banner_url: raffle.banner_url || '',
                show_countdown: raffle.show_countdown ?? true,
                show_progress_bar: raffle.show_progress_bar ?? true,
                max_tickets_per_user: raffle.max_tickets_per_user,
                min_tickets_to_activate: raffle.min_tickets_to_activate ?? 1,
                status: raffle.status || 'draft',
                MARKETING_BOOST_PERCENTAGE: raffle.MARKETING_BOOST_PERCENTAGE || 0,
                pool_id: raffle.pool_id || undefined,
                raffle_type: raffle.raffle_type || 'daily_am',
                is_leftover_raffle: false,
            }

            // Detect existing custom pool
            if (raffle.pool_id) {
                numberPoolService.getPoolById(raffle.pool_id).then(pool => {
                    if (pool.pool_type === 'custom') {
                        editData.is_leftover_raffle = true
                    }
                    reset(editData)
                }).catch(() => {
                    reset(editData)
                })
            } else {
                reset(editData)
            }
        }
    }, [mode, raffle, reset])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const data = getSubmitData()

            // Auto-create custom pool for leftover raffles
            if (formData.is_leftover_raffle && !data.pool_id) {
                const pool = await numberPoolService.createPool({
                    name: `Pool: ${data.title}`,
                    total_numbers: 0,
                    pool_type: 'custom',
                })
                data.pool_id = pool.id
                data.total_numbers = 0
            }

            if (mode === 'edit' && raffleId) {
                await updateRaffle({ ...data, id: raffleId })
            } else {
                await createRaffle(data)
            }
            router.push('/dashboard/raffles')
        } catch (error) {
            console.error('Error saving raffle:', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (mode === 'edit' && loadingRaffle) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    const isLastStep = step === 3

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Breadcrumb header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/dashboard/raffles')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm">Volver a Rifas</span>
                </button>
            </div>

            {/* Title */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {mode === 'create' ? 'Crear nueva rifa' : 'Editar rifa'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {mode === 'create'
                        ? 'Completa los pasos para crear tu nueva rifa'
                        : `Editando: ${raffle?.title || ''}`}
                </p>
            </div>

            {/* Stepper */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                <RaffleWizardStepper
                    currentStep={step}
                    onStepClick={setStep}
                />
            </div>

            {/* Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                {step === 0 && (
                    <StepBasicInfo formData={formData} errors={errors} setField={setField} />
                )}
                {step === 1 && (
                    <StepConfig formData={formData} errors={errors} setField={setField} />
                )}
                {step === 2 && (
                    <StepDesign formData={formData} errors={errors} setField={setField} />
                )}
                {step === 3 && (
                    <StepReview formData={formData} onEditSection={setStep} />
                )}
            </div>

            {/* Navigation buttons */}
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
                        onClick={() => router.push('/dashboard/raffles')}
                    >
                        Cancelar
                    </Button>

                    {isLastStep ? (
                        <Button
                            onClick={handleSubmit}
                            loading={submitting}
                            icon={<Save className="h-4 w-4" />}
                        >
                            {mode === 'create' ? 'Crear Rifa' : 'Guardar Cambios'}
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            icon={<ChevronRight className="h-4 w-4" />}
                        >
                            Siguiente
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
