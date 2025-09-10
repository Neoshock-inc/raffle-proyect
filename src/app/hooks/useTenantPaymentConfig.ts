// 📁 hooks/useTenantPaymentConfig.ts
import { useState, useEffect } from 'react'

interface PaymentConfig {
    id: string
    provider: 'stripe' | 'paypal' | 'bank_account'
    public_key: string
    secret_key: string
    extra?: {
        client_id?: string
        client_secret?: string
        sandbox?: boolean
        bank_name?: string
        account_number?: string
        account_holder?: string
        routing_number?: string
        swift_code?: string
    }
}

interface TenantPaymentConfig {
    stripe?: PaymentConfig
    paypal?: PaymentConfig
    bank_account?: PaymentConfig
    availableMethods: string[]
    bankInfo?: {
        bank_name: string
        account_number: string
        account_holder: string
        routing_number?: string
        swift_code?: string
    }
}

export const useTenantPaymentConfig = (tenantId: string) => {
    const [config, setConfig] = useState<TenantPaymentConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPaymentConfig = async () => {
            if (!tenantId) return

            try {
                setLoading(true)
                const response = await fetch(`/api/tenant-payment-config/${tenantId}`)

                if (!response.ok) {
                    throw new Error('Error al obtener configuración de pagos')
                }

                const data = await response.json()
                setConfig(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
                console.error('Error fetching payment config:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentConfig()
    }, [tenantId])

    return { config, loading, error }
}
