// 📁 hooks/useTenantConfigurations.ts
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

export const useTenantConfigurations = ({ tenantId }: UseTenantConfigurationsProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([])
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])

  // Estados para los formularios (sin bank_account)
  const [paymentForms, setPaymentForms] = useState({
    stripe: { public_key: '', secret_key: '', enabled: false },
    paypal: { client_id: '', client_secret: '', sandbox: true, enabled: false }
  })

  // Nuevo estado para cuentas bancarias como array
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const [emailForm, setEmailForm] = useState({
    resend: { api_key: '', from_email: '', from_name: '', enabled: false }
  })

  // Cargar configuraciones existentes
  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true)
      const [paymentData, emailData] = await Promise.all([
        tenantService.getPaymentConfigs(tenantId),
        tenantService.getEmailConfigs(tenantId)
      ])

      setPaymentConfigs(paymentData)
      setEmailConfigs(emailData)

      // Rellenar formularios con datos existentes
      const newPaymentForms = {
        stripe: { public_key: '', secret_key: '', enabled: false },
        paypal: { client_id: '', client_secret: '', sandbox: true, enabled: false }
      }
      const newBankAccounts: BankAccount[] = []
      const newEmailForm = { ...emailForm }

      paymentData.forEach((config: any) => {
        if (config.provider === 'stripe') {
          newPaymentForms.stripe = {
            public_key: config.public_key,
            secret_key: config.secret_key,
            enabled: true
          }
        } else if (config.provider === 'paypal') {
          newPaymentForms.paypal = {
            client_id: config.extra?.client_id || '',
            client_secret: config.extra?.client_secret || '',
            sandbox: config.extra?.sandbox ?? true,
            enabled: true
          }
        } else if (config.provider === 'bank_account') {
          // Agregar cada cuenta bancaria a la lista
          newBankAccounts.push({
            id: config.id,
            bank_name: config.extra?.bank_name || '',
            account_number: config.extra?.account_number || '',
            account_holder: config.extra?.account_holder || '',
            routing_number: config.extra?.routing_number || '',
            swift_code: config.extra?.swift_code || '',
            enabled: true
          })
        }
      })

      emailData.forEach((config: any) => {
        if (config.provider === 'resend') {
          newEmailForm.resend = {
            api_key: config.api_key || '',
            from_email: config.from_email || '',
            from_name: config.from_name || '',
            enabled: true
          }
        }
      })

      setPaymentForms(newPaymentForms)
      setBankAccounts(newBankAccounts)
      setEmailForm(newEmailForm)
    } catch (error) {
      console.error('Error loading configurations:', error)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  // Actualizar configuración de pago (solo stripe y paypal)
  const updatePaymentConfig = useCallback(async (provider: 'stripe' | 'paypal', enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        let configData: any = {
          provider,
          tenant_id: tenantId
        }

        if (provider === 'stripe') {
          configData = {
            ...configData,
            public_key: paymentForms.stripe.public_key,
            secret_key: paymentForms.stripe.secret_key
          }
        } else if (provider === 'paypal') {
          configData = {
            ...configData,
            public_key: paymentForms.paypal.client_id, // Usar public_key para client_id
            secret_key: paymentForms.paypal.client_secret,
            extra: {
              client_id: paymentForms.paypal.client_id,
              client_secret: paymentForms.paypal.client_secret,
              sandbox: paymentForms.paypal.sandbox
            }
          }
        }

        await tenantService.upsertPaymentConfig(configData)
      } else {
        await tenantService.deletePaymentConfig(tenantId, provider)
      }

      // Recargar configuraciones
      await loadConfigurations()

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
  }, [tenantId, paymentForms, loadConfigurations])

  // Actualizar configuración de email
  const updateEmailConfig = useCallback(async (enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        const configData = {
          provider: 'resend' as const,
          tenant_id: tenantId,
          api_key: emailForm.resend.api_key,
          from_email: emailForm.resend.from_email,
          from_name: emailForm.resend.from_name
        }

        await tenantService.upsertEmailConfig(configData)
      } else {
        await tenantService.deleteEmailConfig(tenantId, 'resend')
      }

      // Recargar configuraciones
      await loadConfigurations()

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
  }, [tenantId, emailForm, loadConfigurations])

  // ======= FUNCIONES PARA CUENTAS BANCARIAS =======

  // Agregar nueva cuenta bancaria
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

  // Actualizar campo de cuenta bancaria específica
  const updateBankAccount = useCallback((index: number, field: string, value: any) => {
    setBankAccounts(prev => prev.map((account, i) =>
      i === index ? { ...account, [field]: value } : account
    ))
  }, [])

  // Eliminar cuenta bancaria
  const removeBankAccount = useCallback(async (index: number) => {
    const account = bankAccounts[index]

    try {
      setSaving(true)

      if (account.id) {
        // Si tiene ID, eliminar de la base de datos
        await tenantService.deleteBankAccount(tenantId, account.id)
      }

      // Eliminar del estado local
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

  // Guardar cuenta bancaria específica
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

      // Actualizar el ID si es una cuenta nueva
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

  // Testear configuraciones
  const testConfiguration = useCallback(async (type: 'payment' | 'email', provider: string) => {
    try {
      setSaving(true)
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
  }, [tenantId])

  return {
    // Estados
    loading,
    saving,
    paymentConfigs,
    emailConfigs,
    paymentForms,
    emailForm,
    bankAccounts, // NUEVO

    // Acciones
    setPaymentForms,
    setEmailForm,
    setBankAccounts, // NUEVO
    updatePaymentConfig,
    updateEmailConfig,
    testConfiguration,
    loadConfigurations,

    // Nuevas acciones para cuentas bancarias
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    saveBankAccount
  }
}