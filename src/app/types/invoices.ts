// types/invoices.ts
export interface Invoice {
    id: string;
    order_number: string;
    full_name: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    city: string;
    address: string;
    payment_method: string;
    amount: number;
    status: string;
    total_price: number;
    created_at: string;
    participant_id: string;
}

// Interfaz para creación de facturas - usamos camelCase para la API
export interface InvoiceCreationData {
    orderNumber: string;
    fullName: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    status: PaymentStatus;
    city: string;
    address: string;
    paymentMethod: PaymentMethod;
    amount: number;
    totalPrice: number;
    participantId?: string;
    referral_id?: string;
    referral_code?: string; // Código de referido opcional
}

// Estado de pago para facturas
export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

// Metodos de pago disponibles
export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    PAYPAL = 'paypal',
    CRYPTO = 'crypto',
    PAYPHONE = 'payphone',
    OTHER = 'other'
}