import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod, PaymentStatus } from '../types/invoices';
import { createInvoiceWithParticipant, generateRaffleNumbers } from '../services/invoiceService';
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
            alert('Error: Token de compra no válido. Por favor, regresa a la página anterior.');
            return;
        }

        if (!payphoneConfig) {
            alert('Error: Configuración de PayPhone no disponible.');
            return;
        }

        setIsProcessing(true);

        try {
            // Validar token para obtener tenantId
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

            // Crear la factura con el tenantId
            await createInvoiceWithParticipant({
                orderNumber: orderNumber,
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

            // Limpiar y formatear número de teléfono (593984111222)
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const phoneNumber = cleanPhone.startsWith('593')
                ? cleanPhone.slice(3)
                : cleanPhone.startsWith('0')
                    ? cleanPhone.slice(1)
                    : cleanPhone;

            const totalAmount = purchaseData.price;
            const amountWithoutTax = totalAmount;
            const tax = 0;
            const service = 0;
            const tip = 0;

            // Convertir a centavos
            const payphonePayload = {
                phoneNumber: phoneNumber,
                countryCode: "593",
                amount: Math.round(totalAmount * 100), // ✅ centavos
                amountWithoutTax: Math.round(amountWithoutTax * 100),
                tax: Math.round(tax * 100),
                service: Math.round(service * 100),
                tip: Math.round(tip * 100),
                clientTransactionId: `${orderNumber}-${Date.now()}`,
                reference: `Compra ${purchaseData.amount} boletos - ${formData.name}`,
                storeId: payphoneConfig.public_key,
                currency: payphoneConfig.extra?.currency || "USD",
                responseUrl: `https://app.myfortunacloud.com/api/payphone/webhook`,
            };


            console.log('Enviando pago a PayPhone:', payphonePayload);

            // Llamar directamente a la API de PayPhone
            const payphoneResponse = await fetch('https://pay.payphonetodoesposible.com/api/Sale', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${payphoneConfig.secret_key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payphonePayload)
            });

            const payphoneData = await payphoneResponse.json();

            console.log('Respuesta de PayPhone:', payphoneData);

            if (!payphoneResponse.ok) {
                throw new Error(payphoneData.message || 'Error al procesar el pago con PayPhone');
            }

            // PayPhone responde con diferentes estructuras según el resultado
            // Caso exitoso típico: { transactionId, transactionStatus, ... }
            if (payphoneData.transactionId) {
                // Guardar información del pago
                const paymentInfo = {
                    transactionId: payphoneData.transactionId,
                    clientTransactionId: payphonePayload.clientTransactionId,
                    orderNumber: orderNumber,
                    status: payphoneData.transactionStatus
                };

                (window as any).__payphonePaymentInfo = paymentInfo;

                try {
                    localStorage.setItem('payphone_transaction_id', payphoneData.transactionId);
                    localStorage.setItem('payphone_client_transaction_id', payphonePayload.clientTransactionId);
                    localStorage.setItem('payphone_order_number', orderNumber);
                } catch (e) {
                    console.warn('localStorage no disponible');
                }

                // Redirigir a página de éxito o espera
                alert('¡Pago iniciado! Revisa tu teléfono para confirmar la transacción.');

                // Puedes redirigir a una página de estado o hacer polling
                // window.location.href = `/payphone-status?orderId=${orderNumber}`;

            } else if (payphoneData.payWithCard) {
                // Si PayPhone devuelve un enlace para pagar con tarjeta
                window.open(payphoneData.payWithCard, '_blank');
                alert('Se ha abierto una ventana para completar el pago con tarjeta.');
            } else {
                throw new Error('Respuesta inesperada de PayPhone');
            }

        } catch (error: any) {
            console.error('Error en el pago con PayPhone:', error);
            alert(`Hubo un error al procesar tu pago con PayPhone: ${error.message || 'Error desconocido'}`);
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
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

            const raffleResult = await generateRaffleNumbers({
                name: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                amount: purchaseData!.amount,
                orderNumber: orderNumber,
                tenantId: validatedData.tenantId
            });

            if (!raffleResult.success) {
                console.error('Error al generar números de rifa:', raffleResult.error);
                throw new Error(`Error al asignar números: ${raffleResult.error}`);
            }

            const queryParams = new URLSearchParams({
                email: formData.email,
                amount: purchaseData!.amount.toString(),
                participantId: raffleResult.participantId!.toString()
            });

            window.location.href = `/success?${queryParams.toString()}`;

            return { success: true };

        } catch (error: any) {
            console.error('Error al procesar PayPal y generar números:', error);
            await generateNewOrderNumber();
            return {
                success: false,
                error: error.message || 'Error al procesar el pago y generar números'
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
        handleStripePayment,
        handlePayPhonePayment,
        handleTransferPayment,
        handlePayPalPayment,
        handlePayPalApprove,
        handlePayPalError
    };
};