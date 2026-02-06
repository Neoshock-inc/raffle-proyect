// hooks/configurations/useBankAccounts.ts
// Lógica de cuentas bancarias
import { useState, useCallback } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'

export interface BankAccount {
  id?: string
  bank_name: string
  account_number: string
  account_holder: string
  routing_number: string
  swift_code: string
  enabled: boolean
}

const EMPTY_BANK_ACCOUNT: BankAccount = {
  bank_name: '',
  account_number: '',
  account_holder: '',
  routing_number: '',
  swift_code: '',
  enabled: false
}

export function useBankAccounts(tenantId: string) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const loadBankData = useCallback((paymentData: any[]) => {
    const accounts: BankAccount[] = []
    paymentData.forEach((config: any) => {
      if (config.provider === 'bank_account') {
        accounts.push({
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
    setBankAccounts(accounts)
    return accounts
  }, [])

  const addBankAccount = useCallback(() => {
    setBankAccounts(prev => [...prev, { ...EMPTY_BANK_ACCOUNT }])
  }, [])

  const updateBankAccount = useCallback((index: number, field: string, value: any) => {
    setBankAccounts(prev => prev.map((account, i) =>
      i === index ? { ...account, [field]: value } : account
    ))
  }, [])

  const removeBankAccount = useCallback(async (
    index: number,
    setSaving: (v: boolean) => void
  ) => {
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

  const saveBankAccount = useCallback(async (
    index: number,
    setSaving: (v: boolean) => void
  ) => {
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

  return {
    bankAccounts,
    setBankAccounts,
    loadBankData,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    saveBankAccount
  }
}
