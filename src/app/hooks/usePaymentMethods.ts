import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod, PaymentStatus } from '../types/invoices';
import { createInvoiceWithParticipant } from '../services/invoiceService';
import { PurchaseData, CheckoutFormData, PaymentMethodType } from '../types/checkout';
import { validateCheckoutForm } from '../utils/validationUtils';

export const usePaymentMethods = (
    orderNumber: string,
    purchaseData: PurchaseData | null,
    formData: CheckoutFormData,
    isOfLegalAge: boolean,
    reffer: string | null,
    token: string | null,
    checkTokenValidity: () => Promise<boolean>,
    setTokenExpired: (expired: boolean) => void,
    generateNewOrderNumber: () => Promise<string>
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

        setIsProcessing(true);

        try {
            // Crear la factura primero
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
            });

            // Crear link de pago en PayPhone
            const res = await fetch('/api/payphone/create-link', {
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

            if (data.paymentLink) {
                // Limpiar comillas dobles si existen
                const cleanLink = data.paymentLink.trim().replace(/^"|"$/g, '');

                // Guardar info como antes ...
                const paymentInfo = {
                    linkId: data.linkId,
                    clientTransactionId: data.clientTransactionId,
                    orderNumber: orderNumber,
                    expirationDate: data.expirationDate || '',
                    paymentLink: cleanLink
                };

                (window as any).__payphonePaymentInfo = paymentInfo;

                try {
                    localStorage.setItem('payphone_link_id', data.linkId);
                    localStorage.setItem('payphone_client_transaction_id', data.clientTransactionId);
                    localStorage.setItem('payphone_order_number', orderNumber);
                    localStorage.setItem('payphone_expiration', data.expirationDate || '');
                } catch (e) {
                    console.warn('localStorage no disponible, usando almacenamiento en memoria');
                }

                // Abrir el link limpio en ventana nueva
                const paymentWindow = window.open(
                    cleanLink,
                    'payphone_payment',
                    'width=800,height=600,scrollbars=yes,resizable=yes'
                );

                if (!paymentWindow) {
                    console.warn('Popup bloqueado, redirigiendo en la misma ventana');
                    window.location.href = cleanLink;
                } else {
                    // Opcional: monitor ventana
                    const checkClosed = setInterval(() => {
                        if (paymentWindow.closed) {
                            clearInterval(checkClosed);
                            console.log('Ventana de pago cerrada');
                        }
                    }, 1000);
                }
            }
            else {
                throw new Error(data.error || 'No se pudo crear el link de pago PayPhone');
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
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            window.location.href = `/transfer-success?email=${formData.email}&name=${formData.name}&lastName=${formData.lastName}&phone=${formData.phone}&amount=${validatedData.amount}&price=${validatedData.price}&orderNumber=${orderNumber}`;
        } catch (error: any) {
            console.error('Error al crear factura para transferencia:', error);
            alert(`Hubo un error al procesar tu pedido: ${error.message}`);
            await generateNewOrderNumber();
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        method,
        setMethod,
        isProcessing,
        handleStripePayment,
        handlePayPhonePayment,
        handleTransferPayment
    };
};