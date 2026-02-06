// hooks/useTenantConfigurations.ts - Compone sub-hooks de configuración
import { useState, useCallback, useEffect } from 'react'
import { tenantService } from '@/admin/services/tenantService'
import { usePaymentConfigurations, validateProviderFields } from './configurations/usePaymentConfigurations'
import { useEmailConfiguration } from './configurations/useEmailConfiguration'
import { useBankAccounts } from './configurations/useBankAccounts'

interface UseTenantConfigurationsProps {
  tenantId: string
}

export const useTenantConfigurations = ({ tenantId }: UseTenantConfigurationsProps) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    paymentConfigs, paymentForms, setPaymentForms,
    loadPaymentData, updatePaymentConfig: _updatePayment
  } = usePaymentConfigurations(tenantId)

  const {
    emailConfigs, emailForm, setEmailForm,
    loadEmailData, updateEmailConfig: _updateEmail
  } = useEmailConfiguration(tenantId)

  const {
    bankAccounts, setBankAccounts, loadBankData,
    addBankAccount, updateBankAccount,
    removeBankAccount: _removeBankAccount,
    saveBankAccount: _saveBankAccount
  } = useBankAccounts(tenantId)

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

      const newPaymentForms = loadPaymentData(paymentData)
      loadBankData(paymentData)
      const newEmailForm = loadEmailData(emailData)

      console.log('Configuraciones cargadas:', {
        payment: newPaymentForms,
        email: newEmailForm,
        bankAccounts: bankAccounts.length
      })
    } catch (error) {
      console.error('Error loading configurations:', error)
    } finally {
      setLoading(false)
    }
  }, [tenantId, loadPaymentData, loadBankData, loadEmailData, bankAccounts.length])

  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  // Wrappers que inyectan setSaving y reloadAll
  const updatePaymentConfig = useCallback(async (provider: string, enabled: boolean) => {
    return _updatePayment(provider, enabled, setSaving, loadConfigurations)
  }, [_updatePayment, loadConfigurations])

  const updateEmailConfig = useCallback(async (enabled: boolean) => {
    return _updateEmail(enabled, setSaving)
  }, [_updateEmail])

  const removeBankAccount = useCallback(async (index: number) => {
    return _removeBankAccount(index, setSaving)
  }, [_removeBankAccount])

  const saveBankAccount = useCallback(async (index: number) => {
    return _saveBankAccount(index, setSaving)
  }, [_saveBankAccount])

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
  }, [tenantId, emailForm, paymentForms])

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
