// types/checkout.ts
import { PaymentMethod, PaymentStatus } from './invoices';

// Re-exportar para mantener compatibilidad de imports existentes
export { PaymentMethod, PaymentStatus };

export interface PurchaseData {
    amount: number;
    price: number;
    raffleId: string;
    tenantId: string;
    tenantName?: string;
    expiresAt?: number;
}

export interface TokenPayload {
    amount: number;
    price: number;
    raffleId: string;
    createdAt: number;
    exp: number;
}

export interface CheckoutFormData {
    name: string;
    lastName: string;
    email: string;
    confirmEmail: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
}

export interface PayPhoneTransactionData {
    payphone_transaction_id?: string;
    payphone_status?: string;
    payphone_status_code?: string;
    phone_number?: string;
    callback_received_at?: string;
    callback_method?: 'GET' | 'POST';
}

export type PaymentMethodType = 'stripe' | 'payphone' | 'transfer' | 'paypal' | null;
