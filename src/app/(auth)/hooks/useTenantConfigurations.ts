// 📁 hooks/useTenantConfigurations.ts - VERSIÓN DINÁMICA CON MAPEO CORRECTO
import { useState, useCallback, useEffect } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'
import { PaymentConfig, EmailConfig } from '../types/tenant'

interface UseTenantConfigurationsProps {
  tenantId: string
}

interface BankAccount {
  id?: string
  bank_name: string
  account_number: string
  account_holder: string
  routing_number: string
  swift_code: string
  enabled: boolean
}

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
  publicKeyField: string    // Campo del form que va a public_key en DB
  secretKeyField: string     // Campo del form que va a secret_key en DB
  extraFields?: string[]     // Campos adicionales que van a extra (JSONB)
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

export const useTenantConfigurations = ({ tenantId }: UseTenantConfigurationsProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([])
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])
  const [paymentForms, setPaymentForms] = useState<PaymentFormsState>({})
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [emailForm, setEmailForm] = useState({
    resend: { api_key: '', from_email: '', from_name: '', enabled: false }
  })

  /**
   * Convierte los datos de la BD al formato del formulario
   * BD: { provider, public_key, secret_key, extra }
   * Form: { field1, field2, field3, enabled }
   */
  const mapDbToForm = useCallback((config: any): PaymentProviderConfig => {
    const provider = config.provider
    const mapping = PROVIDER_MAPPING[provider]

    if (!mapping) {
      // Si no hay mapeo, devolver extra directamente y asegurar enabled
      return {
        ...config.extra,
        enabled: true
      }
    }

    const formData: PaymentProviderConfig = { enabled: true }

    // Mapear public_key al campo correspondiente del form
    if (config.public_key) {
      formData[mapping.publicKeyField] = config.public_key
    }

    // Mapear secret_key al campo correspondiente del form
    if (config.secret_key) {
      formData[mapping.secretKeyField] = config.secret_key
    }

    // Mapear campos adicionales desde extra
    if (mapping.extraFields && config.extra) {
      mapping.extraFields.forEach(field => {
        if (config.extra[field] !== undefined) {
          formData[field] = config.extra[field]
        }
      })
    }

    // Asegurar que enabled siempre esté presente
    if (typeof formData.enabled !== 'boolean') {
      formData.enabled = true
    }

    return formData
  }, [])

  /**
   * Convierte los datos del formulario al formato de la BD
   * Form: { field1, field2, field3 }
   * BD: { provider, public_key, secret_key, extra }
   */
  const mapFormToDb = useCallback((provider: string, formData: PaymentProviderConfig) => {
    const mapping = PROVIDER_MAPPING[provider]

    const dbData: any = {
      provider,
      tenant_id: tenantId,
      public_key: '',
      secret_key: '',
      extra: {}
    }

    if (!mapping) {
      // Si no hay mapeo, todo va a extra
      const { enabled, ...rest } = formData
      dbData.extra = rest
      return dbData
    }

    // Extraer public_key del campo correspondiente del form
    const publicKeyValue = formData[mapping.publicKeyField]
    if (publicKeyValue) {
      dbData.public_key = publicKeyValue
    }

    // Extraer secret_key del campo correspondiente del form
    const secretKeyValue = formData[mapping.secretKeyField]
    if (secretKeyValue) {
      dbData.secret_key = secretKeyValue
    }

    // Construir objeto extra con TODOS los campos del formulario
    const extraData: Record<string, any> = {}

    // Agregar los campos principales también a extra (para referencia)
    if (publicKeyValue) {
      extraData[mapping.publicKeyField] = publicKeyValue
    }
    if (secretKeyValue) {
      extraData[mapping.secretKeyField] = secretKeyValue
    }

    // Agregar campos extra específicos
    if (mapping.extraFields) {
      mapping.extraFields.forEach(field => {
        if (formData[field] !== undefined) {
          extraData[field] = formData[field]
        }
      })
    }

    dbData.extra = extraData
    return dbData
  }, [tenantId])

  /**
   * Validar que los campos requeridos estén completos
   */
  const validateProviderFields = useCallback((provider: string, formData: PaymentProviderConfig) => {
    const mapping = PROVIDER_MAPPING[provider]

    if (!mapping) return true

    // Validar public_key
    const publicKeyValue = formData[mapping.publicKeyField]
    if (!publicKeyValue || publicKeyValue.toString().trim() === '') {
      throw new Error(`Falta el campo: ${mapping.publicKeyField}`)
    }

    // Validar secret_key
    const secretKeyValue = formData[mapping.secretKeyField]
    if (!secretKeyValue || secretKeyValue.toString().trim() === '') {
      throw new Error(`Falta el campo: ${mapping.secretKeyField}`)
    }

    return true
  }, [])

  /**
   * Cargar configuraciones desde la BD
   */
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true)
      const [paymentData, emailData] = await Promise.all([
        tenantService.getPaymentConfigs(tenantId),
        tenantService.getEmailConfigs(tenantId)
      ])

      setPaymentConfigs(paymentData)
      setEmailConfigs(emailData)

      const newPaymentForms: PaymentFormsState = {}
      const newBankAccounts: BankAccount[] = []
      const newEmailForm = {
        resend: { api_key: '', from_email: '', from_name: '', enabled: false }
      }

      // Procesar configuraciones de pago
      paymentData.forEach((config: any) => {
        if (config.provider === 'bank_account') {
          // Cuentas bancarias se manejan por separado
          newBankAccounts.push({
            id: config.id,
            bank_name: config.extra?.bank_name || '',
            account_number: config.extra?.account_number || '',
            account_holder: config.extra?.account_holder || '',
            routing_number: config.extra?.routing_number || '',
            swift_code: config.extra?.swift_code || '',
            enabled: true
          })
        } else {
          // Mapear dinámicamente cualquier proveedor de pago
          newPaymentForms[config.provider] = mapDbToForm(config)
        }
      })

      // Procesar configuraciones de email
      emailData.forEach((config: any) => {
        if (config.provider === 'resend') {
          newEmailForm.resend = {
            api_key: config.password || '',
            from_email: config.username || '',
            from_name: config.from_name || '',
            enabled: true
          }
        }
      })

      setPaymentForms(newPaymentForms)
      setBankAccounts(newBankAccounts)
      setEmailForm(newEmailForm)

      console.log('Configuraciones cargadas:', {
        payment: newPaymentForms,
        email: newEmailForm,
        bankAccounts: newBankAccounts.length
      })

    } catch (error) {
      console.error('Error loading configurations:', error)
    } finally {
      setLoading(false)
    }
  }, [tenantId, mapDbToForm])

  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  /**
   * Actualizar configuración de pago (genérico para cualquier proveedor)
   */
  const updatePaymentConfig = useCallback(async (provider: string, enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        let formData = paymentForms[provider]

        // Si no existe la configuración, solo cambiar el estado del toggle
        // El usuario debe llenar los campos y hacer clic en "Guardar"
        if (!formData || Object.keys(formData).length <= 1) {
          // Inicializar el formulario vacío para este proveedor
          setPaymentForms(prev => ({
            ...prev,
            [provider]: { enabled: true }
          }))
          return { success: true }
        }

        // Validar campos requeridos
        validateProviderFields(provider, formData)

        // Convertir form a formato DB y enviar
        const dbData = mapFormToDb(provider, formData)
        await tenantService.upsertPaymentConfig(dbData)

        await loadConfigurations()
      } else {
        // Deshabilitar/eliminar configuración
        await tenantService.deletePaymentConfig(tenantId, provider)

        // Remover del estado local
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
  }, [tenantId, paymentForms, validateProviderFields, mapFormToDb, loadConfigurations, setPaymentForms])

  /**
   * Actualizar configuración de email
   */
  const updateEmailConfig = useCallback(async (enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        if (emailForm.resend.api_key && emailForm.resend.from_email) {
          const configData = {
            provider: 'resend' as const,
            tenant_id: tenantId,
            password: emailForm.resend.api_key,
            username: emailForm.resend.from_email,
            from_name: emailForm.resend.from_name || null
          }

          await tenantService.upsertEmailConfig({
            ...configData,
            from_name: configData.from_name ?? undefined,
          })
        } else {
          setEmailForm(prev => ({
            ...prev,
            resend: { ...prev.resend, enabled: true }
          }))
          return { success: true }
        }
      } else {
        await tenantService.deleteEmailConfig(tenantId, 'resend')
        setEmailForm(prev => ({
          ...prev,
          resend: { ...prev.resend, enabled: false }
        }))
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating email config:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar configuración de email'
      }
    } finally {
      setSaving(false)
    }
  }, [tenantId, emailForm])

  // Funciones para cuentas bancarias
  const addBankAccount = useCallback(() => {
    setBankAccounts(prev => [...prev, {
      bank_name: '',
      account_number: '',
      account_holder: '',
      routing_number: '',
      swift_code: '',
      enabled: false
    }])
  }, [])

  const updateBankAccount = useCallback((index: number, field: string, value: any) => {
    setBankAccounts(prev => prev.map((account, i) =>
      i === index ? { ...account, [field]: value } : account
    ))
  }, [])

  const removeBankAccount = useCallback(async (index: number) => {
    const account = bankAccounts[index]

    try {
      setSaving(true)

      if (account.id) {
        await tenantService.deleteBankAccount(tenantId, account.id)
      }

      setBankAccounts(prev => prev.filter((_, i) => i !== index))
      return { success: true }
    } catch (error) {
      console.error('Error removing bank account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar la cuenta bancaria'
      }
    } finally {
      setSaving(false)
    }
  }, [bankAccounts, tenantId])

  const saveBankAccount = useCallback(async (index: number) => {
    const account = bankAccounts[index]

    if (!account.bank_name || !account.account_number || !account.account_holder) {
      throw new Error('Faltan campos requeridos: Nombre del banco, Número de cuenta y Titular')
    }

    setSaving(true)
    try {
      const result = await tenantService.upsertBankAccount({
        id: account.id,
        tenant_id: tenantId,
        bank_name: account.bank_name,
        account_number: account.account_number,
        account_holder: account.account_holder,
        routing_number: account.routing_number,
        swift_code: account.swift_code
      })

      if (result.id && !account.id) {
        setBankAccounts(prev => prev.map((acc, i) =>
          i === index ? { ...acc, id: result.id, enabled: true } : acc
        ))
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('Error saving bank account:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al guardar la cuenta bancaria'
      }
    } finally {
      setSaving(false)
    }
  }, [bankAccounts, tenantId])

  /**
   * Testear configuraciones
   */
  const testConfiguration = useCallback(async (type: 'payment' | 'email', provider: string) => {
    try {
      setSaving(true)

      if (type === 'email' && provider === 'resend') {
        if (!emailForm.resend.api_key) {
          return { success: false, error: 'Falta la API key de Resend' }
        }
        if (!emailForm.resend.from_email) {
          return { success: false, error: 'Falta el email remitente' }
        }
      }

      if (type === 'payment') {
        const formData = paymentForms[provider]
        if (formData) {
          validateProviderFields(provider, formData)
        }
      }

      const result = await tenantService.testConfiguration(tenantId, type, provider)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al probar configuración'
      }
    } finally {
      setSaving(false)
    }
  }, [tenantId, emailForm, paymentForms, validateProviderFields])

  return {
    loading,
    saving,
    paymentConfigs,
    emailConfigs,
    paymentForms,
    emailForm,
    bankAccounts,
    setPaymentForms,
    setEmailForm,
    setBankAccounts,
    updatePaymentConfig,
    updateEmailConfig,
    testConfiguration,
    loadConfigurations,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    saveBankAccount
  }
}