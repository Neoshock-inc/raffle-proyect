// hooks/configurations/useEmailConfiguration.ts
// Lógica de configuración de email (Resend)
import { useState, useCallback } from 'react'
import { tenantService } from '@/admin/services/tenantService'
import { EmailConfig } from '../../types/tenant'

interface EmailFormState {
  resend: {
    api_key: string
    from_email: string
    from_name: string
    enabled: boolean
  }
}

const EMPTY_EMAIL_FORM: EmailFormState = {
  resend: { api_key: '', from_email: '', from_name: '', enabled: false }
}

export function useEmailConfiguration(tenantId: string) {
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])
  const [emailForm, setEmailForm] = useState<EmailFormState>({ ...EMPTY_EMAIL_FORM })

  const loadEmailData = useCallback((emailData: any[]) => {
    setEmailConfigs(emailData)

    const newForm = { ...EMPTY_EMAIL_FORM }
    emailData.forEach((config: any) => {
      if (config.provider === 'resend') {
        newForm.resend = {
          api_key: config.password || '',
          from_email: config.username || '',
          from_name: config.from_name || '',
          enabled: true
        }
      }
    })
    setEmailForm(newForm)
    return newForm
  }, [])

  const updateEmailConfig = useCallback(async (
    enabled: boolean,
    setSaving: (v: boolean) => void
  ) => {
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

  return {
    emailConfigs,
    emailForm,
    setEmailForm,
    loadEmailData,
    updateEmailConfig
  }
}

export type { EmailFormState }
