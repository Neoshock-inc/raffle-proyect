// hooks/usePaymentMethods.ts - Refactorizado con helpers compartidos
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod, PaymentStatus } from '@/types/invoices';
import { PurchaseData, CheckoutFormData, PaymentMethodType } from '@/types/checkout';
import { PaymentConfig } from '@/admin/types/tenant';
import {
    validateBeforePayment,
    validateTokenOnServer,
    createPaymentInvoice,
    PaymentContext
} from './payments/paymentHelpers';

export const usePaymentMethods = (
    orderNumber: string,
    purchaseData: PurchaseData | null,
    formData: CheckoutFormData,
    isOfLegalAge: boolean,
    reffer: string | null,
    token: string | null,
    checkTokenValidity: () => Promise<boolean>,
    setTokenExpired: (expired: boolean) => void,
    generateNewOrderNumber: () => Promise<string>,
    payphoneConfig?: PaymentConfig | null
) => {
    const [method, setMethod] = useState<PaymentMethodType>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPayPhoneModal, setShowPayPhoneModal] = useState(false);
    const [payphoneModalConfig, setPayphoneModalConfig] = useState<any>(null);

    // Contexto compartido para todos los métodos de pago
    const ctx: PaymentContext = {
        orderNumber, purchaseData, formData, isOfLegalAge,
        token, reffer, checkTokenValidity, setTokenExpired, generateNewOrderNumber
    };

    // ── Stripe ──────────────────────────────────────────────
    const handleStripePayment = async (): Promise<void> => {
        const check = await validateBeforePayment(ctx);
        if (!check.valid) { alert(check.error); return; }

        setIsProcessing(true);
        try {
            await createPaymentInvoice(ctx, PaymentMethod.STRIPE, PaymentStatus.PENDING);

            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({
                    orderNumber,
                    amount: purchaseData!.amount,
                    price: purchaseData!.price,
                    name: `${formData.name} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    province: formData.province,
                    city: formData.city,
                    address: formData.address
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (data.id) {
                const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
                const result = await stripe?.redirectToCheckout({ sessionId: data.id });
                if (result?.error) {
                    throw new Error(result.error.message || 'Error en la redirección');
                }
            } else {
                throw new Error(data.error || 'No se pudo crear la sesión de Stripe');
            }
        } catch (error) {
            console.error('Error en el pago con Stripe:', error);
            alert('Hubo un error al procesar tu pago. Por favor, intenta de nuevo.');
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
    };

    // ── PayPhone ────────────────────────────────────────────
    const handlePayPhonePayment = async (): Promise<void> => {
        const check = await validateBeforePayment(ctx);
        if (!check.valid) { alert(check.error); return; }

        if (!payphoneConfig) {
            alert('Error: Configuración de PayPhone no disponible.');
            return;
        }

        setIsProcessing(true);
        try {
            const validatedData = await validateTokenOnServer(token!);

            await createPaymentInvoice(
                ctx, PaymentMethod.PAYPHONE, PaymentStatus.PENDING, validatedData.tenantId
            );

            const cleanPhone = formData.phone.replace(/\D/g, '');
            const phoneNumber = cleanPhone.startsWith('593')
                ? `+${cleanPhone}`
                : cleanPhone.startsWith('0')
                    ? `+593${cleanPhone.slice(1)}`
                    : `+593${cleanPhone}`;

            const amountInCents = Math.round(purchaseData!.price * 100);

            setPayphoneModalConfig({
                token: payphoneConfig.secret_key,
                storeId: payphoneConfig.public_key,
                amount: amountInCents,
                amountWithoutTax: amountInCents,
                clientTransactionId: orderNumber,
                reference: orderNumber,
                phoneNumber,
                email: formData.email,
                documentId: formData.phone
            });
            setShowPayPhoneModal(true);
        } catch (error: any) {
            console.error('Error preparando pago PayPhone:', error);
            alert(`Error: ${error.message || 'No se pudo iniciar el pago'}`);
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClosePayPhoneModal = () => {
        setShowPayPhoneModal(false);
        setPayphoneModalConfig(null);
    };

    const handlePayPhoneSuccess = async (transactionData: any) => {
        console.log('Pago exitoso con PayPhone:', transactionData);
        handleClosePayPhoneModal();
    };

    const handlePayPhoneError = async (error: any) => {
        console.error('Error en pago PayPhone:', error);
        handleClosePayPhoneModal();
        alert('Hubo un error al procesar tu pago con PayPhone. Por favor, intenta de nuevo.');
        await generateNewOrderNumber();
    };

    // ── Transferencia Bancaria ──────────────────────────────
    const handleTransferPayment = async (): Promise<void> => {
        const check = await validateBeforePayment(ctx);
        if (!check.valid) { alert(check.error); return; }

        setIsProcessing(true);
        try {
            const validatedData = await validateTokenOnServer(token!);

            await createPaymentInvoice(
                ctx, PaymentMethod.BANK_TRANSFER, PaymentStatus.PENDING, validatedData.tenantId,
                { amount: validatedData.amount, totalPrice: validatedData.price }
            );

            await new Promise(resolve => setTimeout(resolve, 1000));

            window.location.href = `/transfer-success?email=${formData.email}&name=${formData.name}&lastName=${formData.lastName}&phone=${formData.phone}&amount=${validatedData.amount}&price=${validatedData.price}&orderNumber=${orderNumber}&tenantId=${validatedData.tenantId}`;
        } catch (error: any) {
            console.error('Error al crear factura para transferencia:', error);
            alert(`Hubo un error al procesar tu pedido: ${error.message}`);
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
    };

    // ── PayPal ──────────────────────────────────────────────
    const handlePayPalPayment = async (): Promise<{ success: boolean; error?: string }> => {
        const check = await validateBeforePayment(ctx);
        if (!check.valid) { return { success: false, error: check.error }; }

        setIsProcessing(true);
        return { success: true };
    };

    const handlePayPalApprove = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const validatedData = await validateTokenOnServer(token!);

            await createPaymentInvoice(
                ctx, PaymentMethod.PAYPAL, PaymentStatus.COMPLETED, validatedData.tenantId
            );

            const queryParams = new URLSearchParams({
                email: formData.email,
                amount: purchaseData!.amount.toString(),
                orderNumber
            });
            window.location.href = `/success?${queryParams.toString()}`;

            return { success: true };
        } catch (error: any) {
            console.error('Error al procesar PayPal:', error);
            await generateNewOrderNumber();
            return { success: false, error: error.message || 'Error al procesar el pago' };
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayPalError = async (error: any): Promise<void> => {
        console.error('Error en PayPal:', error);
        setIsProcessing(false);
        alert('Hubo un error al procesar tu pago con PayPal.');
        await generateNewOrderNumber();
    };

    return {
        method,
        setMethod,
        isProcessing,
        showPayPhoneModal,
        payphoneModalConfig,
        setShowPayPhoneModal: handleClosePayPhoneModal,
        handleStripePayment,
        handlePayPhonePayment,
        handlePayPhoneSuccess,
        handlePayPhoneError,
        handleTransferPayment,
        handlePayPalPayment,
        handlePayPalApprove,
        handlePayPalError
    };
};
