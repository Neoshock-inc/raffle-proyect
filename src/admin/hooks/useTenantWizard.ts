import { useReducer, useCallback } from 'react'
import type { PlanId } from '@/types/plans'
import type { CreateTenantData } from '@/admin/services/tenantService'

export interface TenantWizardFormData {
    name: string
    slug: string
    description: string
    selectedPlan: PlanId
    selectedTemplate: string
    domain: string
    ownerEmail: string
    ownerName: string
    ownerPhone: string
}

interface WizardState {
    step: number
    formData: TenantWizardFormData
    errors: Record<string, string>
}

type WizardAction =
    | { type: 'SET_FIELD'; field: string; value: string }
    | { type: 'SET_STEP'; step: number }
    | { type: 'NEXT_STEP'; totalSteps: number }
    | { type: 'PREV_STEP' }
    | { type: 'SET_ERRORS'; errors: Record<string, string> }
    | { type: 'RESET' }

const defaultFormData: TenantWizardFormData = {
    name: '',
    slug: '',
    description: '',
    selectedPlan: 'basic',
    selectedTemplate: 'apple',
    domain: '',
    ownerEmail: '',
    ownerName: '',
    ownerPhone: '',
}

function reducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                formData: { ...state.formData, [action.field]: action.value },
                errors: { ...state.errors, [action.field]: '' },
            }
        case 'SET_STEP':
            return { ...state, step: action.step, errors: {} }
        case 'NEXT_STEP':
            return { ...state, step: Math.min(state.step + 1, action.totalSteps - 1), errors: {} }
        case 'PREV_STEP':
            return { ...state, step: Math.max(state.step - 1, 0), errors: {} }
        case 'SET_ERRORS':
            return { ...state, errors: action.errors }
        case 'RESET':
            return { step: 0, formData: defaultFormData, errors: {} }
        default:
            return state
    }
}

export function getStepCount(plan: PlanId): number {
    return plan === 'basic' ? 4 : 5
}

/**
 * Maps wizard step index to logical step name, accounting for dynamic domain step.
 * Steps: 0=BasicInfo, 1=Plan, 2=Template, 3=Domain(non-basic)/Admin(basic), 4=Admin(non-basic)
 */
function getLogicalStep(step: number, plan: PlanId): 'basic_info' | 'plan' | 'template' | 'domain' | 'admin' {
    if (step === 0) return 'basic_info'
    if (step === 1) return 'plan'
    if (step === 2) return 'template'
    if (plan === 'basic') {
        return 'admin'
    }
    if (step === 3) return 'domain'
    return 'admin'
}

function getStepErrors(
    step: number,
    data: TenantWizardFormData,
    slugValid: boolean,
    domainValid: boolean
): Record<string, string> {
    const errors: Record<string, string> = {}
    const logical = getLogicalStep(step, data.selectedPlan)

    if (logical === 'basic_info') {
        if (!data.name.trim()) errors.name = 'El nombre es requerido'
        if (!data.slug.trim()) errors.slug = 'El slug es requerido'
        else if (!slugValid) errors.slug = 'El slug no está disponible'
    }

    if (logical === 'domain') {
        if (!data.domain.trim()) errors.domain = 'El dominio es requerido'
        else if (!domainValid) errors.domain = 'El dominio no está disponible'
    }

    if (logical === 'admin') {
        if (!data.ownerName.trim()) errors.ownerName = 'El nombre es requerido'
        if (!data.ownerEmail.trim()) {
            errors.ownerEmail = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
            errors.ownerEmail = 'El formato del email no es válido'
        }
    }

    return errors
}

export function useTenantWizard() {
    const [state, dispatch] = useReducer(reducer, {
        step: 0,
        formData: defaultFormData,
        errors: {},
    })

    const totalSteps = getStepCount(state.formData.selectedPlan)

    const setField = useCallback((field: string, value: string) => {
        dispatch({ type: 'SET_FIELD', field, value })
    }, [])

    const setStep = useCallback((step: number) => {
        dispatch({ type: 'SET_STEP', step })
    }, [])

    const nextStep = useCallback((slugValid: boolean, domainValid: boolean) => {
        const errors = getStepErrors(state.step, state.formData, slugValid, domainValid)
        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', errors })
            return false
        }
        dispatch({ type: 'NEXT_STEP', totalSteps: getStepCount(state.formData.selectedPlan) })
        return true
    }, [state.step, state.formData])

    const prevStep = useCallback(() => {
        dispatch({ type: 'PREV_STEP' })
    }, [])

    const validate = useCallback((slugValid: boolean, domainValid: boolean) => {
        const errors = getStepErrors(state.step, state.formData, slugValid, domainValid)
        dispatch({ type: 'SET_ERRORS', errors })
        return Object.keys(errors).length === 0
    }, [state.step, state.formData])

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' })
    }, [])

    const getSubmitData = useCallback((): CreateTenantData => {
        const d = state.formData
        return {
            name: d.name.trim(),
            slug: d.slug.trim(),
            domain: d.selectedPlan !== 'basic' ? d.domain.trim() : d.slug.trim(),
            description: d.description.trim() || undefined,
            plan: d.selectedPlan,
            template: d.selectedTemplate,
            ownerEmail: d.ownerEmail.trim(),
            ownerName: d.ownerName.trim(),
            ownerPhone: d.ownerPhone.trim() || undefined,
        }
    }, [state.formData])

    return {
        step: state.step,
        formData: state.formData,
        errors: state.errors,
        totalSteps,
        setField,
        setStep,
        nextStep,
        prevStep,
        validate,
        reset,
        getSubmitData,
    }
}
