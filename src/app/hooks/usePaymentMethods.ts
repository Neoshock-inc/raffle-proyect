import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentMethod, PaymentStatus } from '../types/invoices';
import { createInvoiceWithParticipant, generateRaffleNumbers } from '../services/invoiceService';
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

        return { success: true };  // solo valida y activa loading
    };

    const handlePayPalApprove = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            // 1. Crear la factura primero
            const invoice = await createInvoiceWithParticipant({
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
            });

            // 2. Generar números de rifa después de crear la factura
            const raffleResult = await generateRaffleNumbers({
                name: `${formData.name} ${formData.lastName}`,
                email: formData.email,
                amount: purchaseData!.amount,
                orderNumber: orderNumber
            });

            if (!raffleResult.success) {
                console.error('Error al generar números de rifa:', raffleResult.error);
                // Opcional: Marcar la factura como problemática o enviar notificación
                throw new Error(`Error al asignar números: ${raffleResult.error}`);
            }

            console.log('Números asignados:', raffleResult.assigned);
            console.log('Total números:', raffleResult.total_assigned);

            // 3. Redireccionar incluyendo información de los números asignados
            const queryParams = new URLSearchParams({
                email: formData.email,
                amount: purchaseData!.amount.toString(),
                numbers: raffleResult.assigned?.join(',') || '',
                totalNumbers: raffleResult.total_assigned?.toString() || '0'
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