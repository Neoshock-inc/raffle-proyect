// 📁 hooks/usePaymentMethods.ts (ACTUALIZADO)
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod, PaymentStatus } from '../types/invoices';
import { createInvoiceWithParticipant } from '../services/invoiceService';
import { PurchaseData, CheckoutFormData, PaymentMethodType } from '../types/checkout';
import { validateCheckoutForm } from '../utils/validationUtils';
import { PaymentConfig } from '../(auth)/types/tenant';

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

    const handleStripePayment = async (): Promise<void> => {
        const validation = validateCheckoutForm(formData, isOfLegalAge);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        const isValid = await checkTokenValidity();
        if (!isValid) {
            setTokenExpired(true);
            alert('Tu sesión ha expirado. Por favor, renueva la sesión.');
            return;
        }

        if (!token || !purchaseData) {
            alert('Error: Token de compra no válido. Por favor, regresa a la página anterior.');
            return;
        }

        setIsProcessing(true);

        try {
            await createInvoiceWithParticipant({
                orderNumber: orderNumber,
                fullName: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                status: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.STRIPE,
                province: formData.province,
                city: formData.city,
                address: formData.address,
                amount: purchaseData.amount,
                totalPrice: purchaseData.price,
                referral_code: reffer || undefined
            });

            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({
                    orderNumber,
                    amount: purchaseData.amount,
                    price: purchaseData.price,
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
                    console.error('Error en redirección de Stripe:', result.error);
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

    const handlePayPhonePayment = async (): Promise<void> => {
        const validation = validateCheckoutForm(formData, isOfLegalAge);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        const isValid = await checkTokenValidity();
        if (!isValid) {
            setTokenExpired(true);
            alert('Tu sesión ha expirado. Por favor, renueva la sesión.');
            return;
        }

        if (!token || !purchaseData) {
            alert('Error: Token de compra no válido.');
            return;
        }

        if (!payphoneConfig) {
            alert('Error: Configuración de PayPhone no disponible.');
            return;
        }

        setIsProcessing(true);

        try {
            console.log('🔄 Iniciando proceso de pago PayPhone...');

            // 1. Validar token para obtener tenantId
            const tokenValidation = await fetch('/api/validate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (!tokenValidation.ok) {
                const errorData = await tokenValidation.json();
                throw new Error(errorData.error || 'Token inválido o expirado');
            }

            const validatedData = await tokenValidation.json();
            console.log('✅ Token validado:', validatedData);

            // 2. Crear factura PENDING
            console.log('📝 Creando factura PENDING...');
            await createInvoiceWithParticipant({
                orderNumber,
                fullName: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                status: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.PAYPHONE,
                province: formData.province,
                city: formData.city,
                address: formData.address,
                amount: purchaseData.amount,
                totalPrice: purchaseData.price,
                referral_code: reffer || undefined
            }, validatedData.tenantId);

            console.log('✅ Factura PENDING creada exitosamente');

            // 3. Formatear teléfono
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const phoneNumber = cleanPhone.startsWith('593')
                ? `+${cleanPhone}`
                : cleanPhone.startsWith('0')
                    ? `+593${cleanPhone.slice(1)}`
                    : `+593${cleanPhone}`;

            // 4. Calcular montos en centavos
            const totalAmount = purchaseData.price;
            const amountInCents = Math.round(totalAmount * 100);

            // 5. Generar clientTransactionId único
            const clientTransactionId = orderNumber;
            // 6. Configurar modal de PayPhone
            const modalConfig = {
                token: payphoneConfig.secret_key,
                storeId: payphoneConfig.public_key,
                amount: amountInCents,
                amountWithoutTax: amountInCents,
                clientTransactionId,
                reference: orderNumber,
                phoneNumber,
                email: formData.email,
                documentId: formData.phone
            };

            console.log('📱 Configuración del modal PayPhone:', {
                ...modalConfig,
                token: modalConfig.token.substring(0, 10) + '...'
            });

            // 7. Abrir modal
            setPayphoneModalConfig(modalConfig);
            setShowPayPhoneModal(true);

            console.log('✅ Modal de PayPhone configurado');

        } catch (error: any) {
            console.error('❌ Error preparando pago PayPhone:', error);
            alert(`Error: ${error.message || 'No se pudo iniciar el pago'}`);
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
    };

    // Manejar cierre del modal
    const handleClosePayPhoneModal = () => {
        setShowPayPhoneModal(false);
        setPayphoneModalConfig(null);
    };

    // Manejar éxito de PayPhone (no se usa porque redirige PayPhone)
    const handlePayPhoneSuccess = async (transactionData: any) => {
        console.log('✅ Pago exitoso con PayPhone:', transactionData);
        handleClosePayPhoneModal();
    };

    // Manejar error de PayPhone
    const handlePayPhoneError = async (error: any) => {
        console.error('❌ Error en pago PayPhone:', error);
        handleClosePayPhoneModal();
        alert('Hubo un error al procesar tu pago con PayPhone. Por favor, intenta de nuevo.');
        await generateNewOrderNumber();
    };


    const handleTransferPayment = async (): Promise<void> => {
        const validation = validateCheckoutForm(formData, isOfLegalAge);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        const isValid = await checkTokenValidity();
        if (!isValid) {
            setTokenExpired(true);
            alert('Tu sesión ha expirado. Por favor, renueva la sesión.');
            return;
        }

        if (!token || !purchaseData) {
            alert('Error: Token de compra no válido. Por favor, regresa a la página anterior.');
            return;
        }

        setIsProcessing(true);

        try {
            const tokenValidation = await fetch('/api/validate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (!tokenValidation.ok) {
                const errorData = await tokenValidation.json();
                throw new Error(errorData.error || 'Token inválido o expirado');
            }

            const validatedData = await tokenValidation.json();

            await createInvoiceWithParticipant({
                orderNumber: orderNumber,
                fullName: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                status: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.BANK_TRANSFER,
                province: formData.province,
                city: formData.city,
                address: formData.address,
                amount: validatedData.amount,
                totalPrice: validatedData.price,
                referral_code: reffer || undefined
            }, validatedData.tenantId);

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

    const handlePayPalPayment = async (): Promise<{ success: boolean; error?: string }> => {
        const validation = validateCheckoutForm(formData, isOfLegalAge);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const isValid = await checkTokenValidity();
        if (!isValid) {
            setTokenExpired(true);
            return { success: false, error: 'Tu sesión ha expirado.' };
        }

        if (!token || !purchaseData) {
            return { success: false, error: 'Token de compra no válido.' };
        }

        setIsProcessing(true);

        return { success: true };
    };

    const handlePayPalApprove = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const tokenValidation = await fetch('/api/validate-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            if (!tokenValidation.ok) {
                const errorData = await tokenValidation.json();
                throw new Error(errorData.error || 'Token inválido o expirado');
            }

            const validatedData = await tokenValidation.json();

            await createInvoiceWithParticipant({
                orderNumber,
                fullName: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                status: PaymentStatus.COMPLETED,
                paymentMethod: PaymentMethod.PAYPAL,
                province: formData.province,
                city: formData.city,
                address: formData.address,
                amount: purchaseData!.amount,
                totalPrice: purchaseData!.price,
                referral_code: reffer || undefined
            }, validatedData.tenantId);

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
            return {
                success: false,
                error: error.message || 'Error al procesar el pago'
            };
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