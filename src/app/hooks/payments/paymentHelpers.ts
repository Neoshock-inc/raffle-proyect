// hooks/payments/paymentHelpers.ts
// Lógica compartida entre los métodos de pago para eliminar duplicación

import { PaymentMethod, PaymentStatus } from '@/app/types/invoices';
import { createInvoiceWithParticipant } from '@/app/services/invoiceService';
import { validateCheckoutForm } from '@/app/utils/validationUtils';
import { PurchaseData, CheckoutFormData } from '@/app/types/checkout';

interface PaymentContext {
    orderNumber: string;
    purchaseData: PurchaseData | null;
    formData: CheckoutFormData;
    isOfLegalAge: boolean;
    token: string | null;
    reffer: string | null;
    checkTokenValidity: () => Promise<boolean>;
    setTokenExpired: (expired: boolean) => void;
    generateNewOrderNumber: () => Promise<string>;
}

/**
 * Valida el formulario y el token antes de procesar cualquier pago.
 * Retorna el contexto validado o null si falla.
 */
export async function validateBeforePayment(ctx: PaymentContext): Promise<{ valid: true } | { valid: false; error: string }> {
    const validation = validateCheckoutForm(ctx.formData, ctx.isOfLegalAge);
    if (!validation.isValid) {
        return { valid: false, error: validation.error || 'Formulario inválido' };
    }

    const isValid = await ctx.checkTokenValidity();
    if (!isValid) {
        ctx.setTokenExpired(true);
        return { valid: false, error: 'Tu sesión ha expirado. Por favor, renueva la sesión.' };
    }

    if (!ctx.token || !ctx.purchaseData) {
        return { valid: false, error: 'Error: Token de compra no válido. Por favor, regresa a la página anterior.' };
    }

    return { valid: true };
}

/**
 * Valida el token con el servidor y retorna los datos validados.
 */
export async function validateTokenOnServer(token: string): Promise<any> {
    const response = await fetch('/api/validate-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token inválido o expirado');
    }

    return response.json();
}

/**
 * Crea una invoice con los datos comunes del formulario.
 */
export async function createPaymentInvoice(
    ctx: PaymentContext,
    paymentMethod: PaymentMethod,
    status: PaymentStatus,
    tenantId?: string,
    overrides?: { amount?: number; totalPrice?: number }
) {
    return createInvoiceWithParticipant({
        orderNumber: ctx.orderNumber,
        fullName: `${ctx.formData.name} ${ctx.formData.lastName}`,
        email: ctx.formData.email,
        phone: ctx.formData.phone,
        country: ctx.formData.country,
        status,
        paymentMethod,
        province: ctx.formData.province,
        city: ctx.formData.city,
        address: ctx.formData.address,
        amount: overrides?.amount ?? ctx.purchaseData!.amount,
        totalPrice: overrides?.totalPrice ?? ctx.purchaseData!.price,
        referral_code: ctx.reffer || undefined
    }, tenantId);
}

export type { PaymentContext };
