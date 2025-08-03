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

export type PaymentMethodType = 'stripe' | 'transfer' | null;