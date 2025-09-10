// 📁 hooks/useTenantConfigurations.ts
import { useState, useCallback, useEffect } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'
import { PaymentConfig, EmailConfig } from '../types/tenant'

interface UseTenantConfigurationsProps {
  tenantId: string
}

export const useTenantConfigurations = ({ tenantId }: UseTenantConfigurationsProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([])
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])
  
  // Estados para los formularios
  const [paymentForms, setPaymentForms] = useState({
    stripe: { public_key: '', secret_key: '', enabled: false },
    paypal: { client_id: '', client_secret: '', sandbox: true, enabled: false },
    bank_account: { 
      bank_name: '', 
      account_number: '', 
      account_holder: '', 
      routing_number: '',
      swift_code: '',
      enabled: false 
    }
  })
  
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
      const newPaymentForms = { ...paymentForms }
      const newEmailForm = { ...emailForm }
      
      paymentData.forEach((config: { provider: string; public_key: any; secret_key: any; extra: { client_id: any; client_secret: any; sandbox: any; bank_name: any; account_number: any; account_holder: any; routing_number: any; swift_code: any } }) => {
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
          newPaymentForms.bank_account = {
            bank_name: config.extra?.bank_name || '',
            account_number: config.extra?.account_number || '',
            account_holder: config.extra?.account_holder || '',
            routing_number: config.extra?.routing_number || '',
            swift_code: config.extra?.swift_code || '',
            enabled: true
          }
        }
      })
      
      emailData.forEach(config => {
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

  // Actualizar configuración de pago
  const updatePaymentConfig = useCallback(async (provider: 'stripe' | 'paypal' | 'bank_account', enabled: boolean) => {
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
        } else if (provider === 'bank_account') {
          configData = {
            ...configData,
            public_key: 'N/A', // Campo requerido pero no aplica
            secret_key: 'N/A',
            extra: {
              bank_name: paymentForms.bank_account.bank_name,
              account_number: paymentForms.bank_account.account_number,
              account_holder: paymentForms.bank_account.account_holder,
              routing_number: paymentForms.bank_account.routing_number,
              swift_code: paymentForms.bank_account.swift_code
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

    // Acciones
    setPaymentForms,
    setEmailForm,
    updatePaymentConfig,
    updateEmailConfig,
    testConfiguration,
    loadConfigurations
  }
}
