// hooks/useTenantPaymentConfig.ts
import { useAsyncData } from './shared';

interface PaymentConfig {
    id: string
    provider: 'stripe' | 'paypal' | 'bank_account' | 'payphone'
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

interface BankAccount {
    id?: string
    bank_name: string
    account_number: string
    account_holder: string
    routing_number?: string
    swift_code?: string
}

interface TenantPaymentConfig {
    stripe?: PaymentConfig
    paypal?: PaymentConfig
    payphone?: PaymentConfig
    bankAccounts: BankAccount[]
    availableMethods: string[]
    bankInfo?: BankAccount
}

export const useTenantPaymentConfig = (tenantId: string) => {
    const { data: config, loading, error } = useAsyncData<TenantPaymentConfig>(
        async () => {
            const response = await fetch(`/api/tenant-payment-config/${tenantId}`);
            if (!response.ok) {
                throw new Error('Error al obtener configuración de pagos');
            }
            return response.json();
        },
        [tenantId],
        { enabled: !!tenantId }
    );

    return { config, loading, error };
};
