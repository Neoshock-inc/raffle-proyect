import { useReducer, useCallback } from 'react'
import type { CreateRaffleData, RaffleStatus } from '@/admin/types/raffle'

export interface WizardFormData extends CreateRaffleData {
    raffle_type?: 'daily_am' | 'daily_pm' | 'weekly' | 'biweekly'
}

interface WizardState {
    step: number
    formData: WizardFormData
    errors: Record<string, string>
    touched: Record<string, boolean>
}

type WizardAction =
    | { type: 'SET_FIELD'; field: string; value: unknown }
    | { type: 'SET_STEP'; step: number }
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'SET_ERRORS'; errors: Record<string, string> }
    | { type: 'TOUCH_FIELD'; field: string }
    | { type: 'RESET'; data?: WizardFormData }

const defaultFormData: WizardFormData = {
    title: '',
    description: '',
    price: 0,
    total_numbers: 100,
    draw_date: '',
    primary_color: '#800000',
    secondary_color: '#FFC107',
    background_color: '#FFFFFF',
    text_color: '#333333',
    logo_url: '',
    banner_url: '',
    show_countdown: true,
    show_progress_bar: true,
    max_tickets_per_user: undefined,
    min_tickets_to_activate: 1,
    status: 'draft' as RaffleStatus,
    MARKETING_BOOST_PERCENTAGE: 0,
    raffle_type: 'daily_am',
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
            return { ...state, step: Math.min(state.step + 1, 3), errors: {} }
        case 'PREV_STEP':
            return { ...state, step: Math.max(state.step - 1, 0), errors: {} }
        case 'SET_ERRORS':
            return { ...state, errors: action.errors }
        case 'TOUCH_FIELD':
            return { ...state, touched: { ...state.touched, [action.field]: true } }
        case 'RESET':
            return {
                step: 0,
                formData: action.data || defaultFormData,
                errors: {},
                touched: {},
            }
        default:
            return state
    }
}

function isValidHex(color: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
}

function getStepErrors(step: number, data: WizardFormData): Record<string, string> {
    const errors: Record<string, string> = {}

    if (step === 0) {
        if (!data.title?.trim()) errors.title = 'El título es obligatorio'
        if (!data.price || data.price <= 0) errors.price = 'El precio debe ser mayor a 0'
        if (!data.total_numbers || data.total_numbers < 1) errors.total_numbers = 'Debe tener al menos 1 número'
        if (!data.draw_date) errors.draw_date = 'La fecha del sorteo es obligatoria'
    }

    if (step === 1) {
        if (data.min_tickets_to_activate !== undefined && data.min_tickets_to_activate < 1) {
            errors.min_tickets_to_activate = 'Debe ser al menos 1'
        }
    }

    if (step === 2) {
        if (data.primary_color && !isValidHex(data.primary_color)) errors.primary_color = 'Color hex inválido'
        if (data.secondary_color && !isValidHex(data.secondary_color)) errors.secondary_color = 'Color hex inválido'
        if (data.background_color && !isValidHex(data.background_color)) errors.background_color = 'Color hex inválido'
        if (data.text_color && !isValidHex(data.text_color)) errors.text_color = 'Color hex inválido'
    }

    return errors
}

export function useRaffleWizard(initialData?: WizardFormData) {
    const [state, dispatch] = useReducer(reducer, {
        step: 0,
        formData: initialData || defaultFormData,
        errors: {},
        touched: {},
    })

    const setField = useCallback((field: string, value: unknown) => {
        dispatch({ type: 'SET_FIELD', field, value })
    }, [])

    const setStep = useCallback((step: number) => {
        dispatch({ type: 'SET_STEP', step })
    }, [])

    const nextStep = useCallback(() => {
        const errors = getStepErrors(state.step, state.formData)
        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', errors })
            return false
        }
        dispatch({ type: 'NEXT_STEP' })
        return true
    }, [state.step, state.formData])

    const prevStep = useCallback(() => {
        dispatch({ type: 'PREV_STEP' })
    }, [])

    const canProceed = useCallback((step?: number) => {
        const s = step ?? state.step
        const errors = getStepErrors(s, state.formData)
        return Object.keys(errors).length === 0
    }, [state.step, state.formData])

    const validate = useCallback(() => {
        const errors = getStepErrors(state.step, state.formData)
        dispatch({ type: 'SET_ERRORS', errors })
        return Object.keys(errors).length === 0
    }, [state.step, state.formData])

    const reset = useCallback((data?: WizardFormData) => {
        dispatch({ type: 'RESET', data })
    }, [])

    const getSubmitData = useCallback((): CreateRaffleData => {
        return {
            ...state.formData,
            draw_date: state.formData.draw_date ? new Date(state.formData.draw_date).toISOString() : '',
        }
    }, [state.formData])

    return {
        step: state.step,
        formData: state.formData,
        errors: state.errors,
        setField,
        setStep,
        nextStep,
        prevStep,
        canProceed,
        validate,
        reset,
        getSubmitData,
        totalSteps: 4,
    }
}
