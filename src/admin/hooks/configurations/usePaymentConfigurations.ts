// hooks/configurations/usePaymentConfigurations.ts
// Lógica de configuración de proveedores de pago
import { useState, useCallback } from 'react'
import { tenantService } from '@/admin/services/tenantService'
import { PaymentConfig } from '../../types/tenant'

// Tipo genérico para cualquier proveedor de pago
interface PaymentProviderConfig {
  enabled: boolean
  [key: string]: any
}

type PaymentFormsState = Record<string, PaymentProviderConfig>

/**
 * Configuración de mapeo para cada proveedor
 * Define qué campos del formulario van a public_key, secret_key, y extra
 */
const PROVIDER_MAPPING: Record<string, {
  publicKeyField: string
  secretKeyField: string
  extraFields?: string[]
}> = {
  stripe: {
    publicKeyField: 'public_key',
    secretKeyField: 'secret_key'
  },
  paypal: {
    publicKeyField: 'client_id',
    secretKeyField: 'client_secret',
    extraFields: ['sandbox']
  },
  payphone: {
    publicKeyField: 'store_id',
    secretKeyField: 'token'
  },
  kushki: {
    publicKeyField: 'public_key',
    secretKeyField: 'private_key',
    extraFields: ['test_mode']
  }
}

/**
 * Convierte los datos de la BD al formato del formulario
 */
export function mapDbToForm(config: any): PaymentProviderConfig {
  const provider = config.provider
  const mapping = PROVIDER_MAPPING[provider]

  if (!mapping) {
    return { ...config.extra, enabled: true }
  }

  const formData: PaymentProviderConfig = { enabled: true }

  if (config.public_key) {
    formData[mapping.publicKeyField] = config.public_key
  }
  if (config.secret_key) {
    formData[mapping.secretKeyField] = config.secret_key
  }

  if (mapping.extraFields && config.extra) {
    mapping.extraFields.forEach(field => {
      if (config.extra[field] !== undefined) {
        formData[field] = config.extra[field]
      }
    })
  }

  if (typeof formData.enabled !== 'boolean') {
    formData.enabled = true
  }

  return formData
}

/**
 * Convierte los datos del formulario al formato de la BD
 */
export function mapFormToDb(tenantId: string, provider: string, formData: PaymentProviderConfig) {
  const mapping = PROVIDER_MAPPING[provider]

  const dbData: any = {
    provider,
    tenant_id: tenantId,
    public_key: '',
    secret_key: '',
    extra: {}
  }

  if (!mapping) {
    const { enabled, ...rest } = formData
    dbData.extra = rest
    return dbData
  }

  const publicKeyValue = formData[mapping.publicKeyField]
  if (publicKeyValue) {
    dbData.public_key = publicKeyValue
  }

  const secretKeyValue = formData[mapping.secretKeyField]
  if (secretKeyValue) {
    dbData.secret_key = secretKeyValue
  }

  const extraData: Record<string, any> = {}
  if (publicKeyValue) {
    extraData[mapping.publicKeyField] = publicKeyValue
  }
  if (secretKeyValue) {
    extraData[mapping.secretKeyField] = secretKeyValue
  }

  if (mapping.extraFields) {
    mapping.extraFields.forEach(field => {
      if (formData[field] !== undefined) {
        extraData[field] = formData[field]
      }
    })
  }

  dbData.extra = extraData
  return dbData
}

/**
 * Validar que los campos requeridos estén completos
 */
export function validateProviderFields(provider: string, formData: PaymentProviderConfig) {
  const mapping = PROVIDER_MAPPING[provider]
  if (!mapping) return true

  const publicKeyValue = formData[mapping.publicKeyField]
  if (!publicKeyValue || publicKeyValue.toString().trim() === '') {
    throw new Error(`Falta el campo: ${mapping.publicKeyField}`)
  }

  const secretKeyValue = formData[mapping.secretKeyField]
  if (!secretKeyValue || secretKeyValue.toString().trim() === '') {
    throw new Error(`Falta el campo: ${mapping.secretKeyField}`)
  }

  return true
}

export function usePaymentConfigurations(tenantId: string) {
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([])
  const [paymentForms, setPaymentForms] = useState<PaymentFormsState>({})

  const loadPaymentData = useCallback((paymentData: any[]) => {
    setPaymentConfigs(paymentData)

    const newForms: PaymentFormsState = {}
    paymentData.forEach((config: any) => {
      if (config.provider !== 'bank_account') {
        newForms[config.provider] = mapDbToForm(config)
      }
    })
    setPaymentForms(newForms)
    return newForms
  }, [])

  const updatePaymentConfig = useCallback(async (
    provider: string,
    enabled: boolean,
    setSaving: (v: boolean) => void,
    reloadAll: () => Promise<void>
  ) => {
    setSaving(true)
    try {
      if (enabled) {
        const formData = paymentForms[provider]

        if (!formData || Object.keys(formData).length <= 1) {
          setPaymentForms(prev => ({
            ...prev,
            [provider]: { enabled: true }
          }))
          return { success: true }
        }

        validateProviderFields(provider, formData)

        const dbData = mapFormToDb(tenantId, provider, formData)
        await tenantService.upsertPaymentConfig(dbData)
        await reloadAll()
      } else {
        await tenantService.deletePaymentConfig(tenantId, provider)

        setPaymentForms(prev => {
          const newForms = { ...prev }
          delete newForms[provider]
          return newForms
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating payment config:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar configuración de pago'
      }
    } finally {
      setSaving(false)
    }
  }, [tenantId, paymentForms])

  return {
    paymentConfigs,
    paymentForms,
    setPaymentForms,
    loadPaymentData,
    updatePaymentConfig,
    validateProviderFields
  }
}

export type { PaymentProviderConfig, PaymentFormsState }
