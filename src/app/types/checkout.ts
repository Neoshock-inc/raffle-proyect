export interface PurchaseData {
    amount: number;
    price: number;
    raffleId: string;
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

// types/invoices.ts - Actualizar el enum PaymentMethod

export enum PaymentMethod {
    STRIPE = 'stripe',
    PAYPHONE = 'payphone',
    BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELED = 'canceled',
}

// Agregar interface para los datos adicionales de PayPhone
export interface PayPhoneTransactionData {
    payphone_transaction_id?: string;
    payphone_status?: string;
    payphone_status_code?: string;
    phone_number?: string;
    callback_received_at?: string;
    callback_method?: 'GET' | 'POST';
}

export type PaymentMethodType = 'stripe' | 'payphone' | 'transfer' | null;
