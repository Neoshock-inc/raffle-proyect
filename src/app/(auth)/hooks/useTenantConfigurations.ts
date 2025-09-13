// 📁 hooks/useTenantConfigurations.ts - VERSIÓN ACTUALIZADA
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

  // Estados para los formularios
  const [paymentForms, setPaymentForms] = useState({
    stripe: { public_key: '', secret_key: '', enabled: false },
    paypal: { client_id: '', client_secret: '', sandbox: true, enabled: false }
  })

  // Estado para cuentas bancarias
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  // Estado para email - CORREGIDO para manejar el mapeo de campos
  const [emailForm, setEmailForm] = useState({
    resend: { api_key: '', from_email: '', from_name: '', enabled: false }
  })

  // Cargar configuraciones existentes - ACTUALIZADO
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
      const newEmailForm = {
        resend: { api_key: '', from_email: '', from_name: '', enabled: false }
      }

      // Procesar configuraciones de pago
      paymentData.forEach((config: any) => {
        if (config.provider === 'stripe') {
          newPaymentForms.stripe = {
            public_key: config.public_key,
            secret_key: config.secret_key,
            enabled: true
          }
        } else if (config.provider === 'paypal') {
          newPaymentForms.paypal = {
            client_id: config.extra?.client_id || config.public_key || '',
            client_secret: config.extra?.client_secret || config.secret_key || '',
            sandbox: config.extra?.sandbox ?? true,
            enabled: true
          }
        } else if (config.provider === 'bank_account') {
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

      // Procesar configuraciones de email - CORREGIDO
      emailData.forEach((config: any) => {
        if (config.provider === 'resend') {
          newEmailForm.resend = {
            // IMPORTANTE: Mapear correctamente los campos
            api_key: config.password || '', // La API key está guardada en el campo password
            from_email: config.username || '', // El from_email está en username
            from_name: config.from_name || '', // Este campo debería existir en el esquema
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
  }, [tenantId])

  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  // Actualizar configuración de pago
  const updatePaymentConfig = useCallback(async (provider: 'stripe' | 'paypal', enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        let configData: any = {
          provider,
          tenant_id: tenantId
        }

        if (provider === 'stripe') {
          if (!paymentForms.stripe.public_key || !paymentForms.stripe.secret_key) {
            throw new Error('Faltan las claves de Stripe')
          }
          configData = {
            ...configData,
            public_key: paymentForms.stripe.public_key,
            secret_key: paymentForms.stripe.secret_key
          }
        } else if (provider === 'paypal') {
          if (!paymentForms.paypal.client_id || !paymentForms.paypal.client_secret) {
            throw new Error('Faltan las credenciales de PayPal')
          }
          configData = {
            ...configData,
            public_key: paymentForms.paypal.client_id,
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

  // Actualizar configuración de email - CORREGIDO SIMPLE
  const updateEmailConfig = useCallback(async (enabled: boolean) => {
    setSaving(true)
    try {
      if (enabled) {
        // Solo validar si está habilitando Y tiene campos llenos
        // Si está habilitando pero los campos están vacíos, solo cambiar el estado del checkbox
        if (emailForm.resend.api_key && emailForm.resend.from_email) {
          const configData = {
            provider: 'resend' as const,
            tenant_id: tenantId,
            password: emailForm.resend.api_key, // Directamente al campo password
            username: emailForm.resend.from_email, // Directamente al campo username
            from_name: emailForm.resend.from_name || null
          }

          console.log('Enviando configuración de email:', configData)
          await tenantService.upsertEmailConfig({
            ...configData,
            from_name: configData.from_name ?? undefined, // convierte null en undefined
          })
        } else {
          // Solo cambiar el estado del formulario si no hay datos
          setEmailForm(prev => ({
            ...prev,
            resend: { ...prev.resend, enabled: true }
          }))
          return { success: true }
        }
      } else {
        // Si está deshabilitando, eliminar la configuración
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
  }, [tenantId, emailForm, loadConfigurations])

  // Funciones para cuentas bancarias (sin cambios)
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

  // Testear configuraciones - ACTUALIZADO
  const testConfiguration = useCallback(async (type: 'payment' | 'email', provider: string) => {
    try {
      setSaving(true)

      // Validaciones locales antes de enviar al servidor
      if (type === 'email' && provider === 'resend') {
        if (!emailForm.resend.api_key) {
          return {
            success: false,
            error: 'Falta la API key de Resend'
          }
        }
        if (!emailForm.resend.from_email) {
          return {
            success: false,
            error: 'Falta el email remitente'
          }
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
  }, [tenantId, emailForm])

  return {
    // Estados
    loading,
    saving,
    paymentConfigs,
    emailConfigs,
    paymentForms,
    emailForm,
    bankAccounts,

    // Acciones
    setPaymentForms,
    setEmailForm,
    setBankAccounts,
    updatePaymentConfig,
    updateEmailConfig,
    testConfiguration,
    loadConfigurations,

    // Acciones para cuentas bancarias
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    saveBankAccount
  }
}