import React from 'react';
import { PersonalDataForm } from './PersonalDataForm';
import { OrderSummary } from './OrderSummary';
import { PaymentMethods } from './PaymentMethods';
import { useCheckoutForm } from '@/app/hooks/useCheckoutForm';
import { usePaymentMethods } from '@/app/hooks/usePaymentMethods';
import { useTokenValidation } from '@/app/hooks/useTokenValidation';
import { generateOrderNumber } from '@/app/services/invoiceService';
import { ExpirationWarning } from './ui/ExpirationWarning';
import { TokenExpiredModal } from './ui/TokenExpiredModal';
import { Header } from '../../components/Header';

interface CheckoutFormProps {
    token: string | null;
    reffer: string | null;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ token, reffer }) => {
    const [orderNumber, setOrderNumber] = React.useState<string>('');

    const {
        tokenExpired,
        timeRemaining,
        purchaseData,
        isLoading,
        setIsLoading,
        checkTokenValidity,
        validateAndSetPurchaseData,
        renewToken
    } = useTokenValidation(token);

    const {
        formData,
        isOfLegalAge,
        setIsOfLegalAge,
        handleInputChange
    } = useCheckoutForm();

    const generateNewOrderNumber = async (): Promise<string> => {
        try {
            const number = await generateOrderNumber();
            setOrderNumber(number);
            return number;
        } catch (error) {
            console.error('Failed to generate order number:', error);
            const fallbackNumber = `ORD-${Math.floor(Math.random() * 10000)}`;
            setOrderNumber(fallbackNumber);
            return fallbackNumber;
        }
    };

    const {
        method,
        setMethod,
        isProcessing,
        handleStripePayment,
        handlePayPhonePayment,
        handleTransferPayment
    } = usePaymentMethods(
        orderNumber,
        purchaseData,
        formData,
        isOfLegalAge,
        reffer,
        token,
        checkTokenValidity,
        (expired) => { }, // setTokenExpired is handled in useTokenValidation
        generateNewOrderNumber
    );

    // Inicialización
    React.useEffect(() => {
        async function initializeCheckout() {
            try {
                if (!token) {
                    alert('Token de compra no encontrado. Por favor, regresa a la página anterior.');
                    return;
                }

                await generateNewOrderNumber();
                await validateAndSetPurchaseData();
            } catch (error: any) {
                console.error('Error initializing checkout:', error);
                alert(`Error al inicializar el checkout: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        }

        initializeCheckout();
    }, [token, validateAndSetPurchaseData, setIsLoading]);

    // Mostrar loading mientras se inicializa
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
                    <p>Validando datos de compra...</p>
                </div>
            </div>
        );
    }

    // Si no hay datos de compra válidos, mostrar error
    if (!purchaseData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error de validación</h2>
                    <p className="text-gray-600 mb-6">Los datos de compra no son válidos o han expirado.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-[#800000] text-white px-6 py-3 rounded-md hover:bg-[#600000] transition"
                    >
                        Regresar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <ExpirationWarning
                timeRemaining={timeRemaining}
                tokenExpired={tokenExpired}
            />

            <TokenExpiredModal
                tokenExpired={tokenExpired}
                isLoading={isLoading}
                onRenewToken={renewToken}
                onGoHome={() => window.location.href = '/'}
            />

            <Header />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <p className="text-center text-gray-600">Cumpliendo sueños.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Columna izquierda: Datos de facturación (3 columnas) */}
                    <div className="md:col-span-3">
                        <PersonalDataForm
                            formData={formData}
                            onInputChange={handleInputChange}
                            isProcessing={isProcessing}
                        />
                    </div>

                    {/* Columna derecha: Resumen y Métodos de pago (2 columnas) */}
                    <div className="md:col-span-2 space-y-4">
                        <OrderSummary
                            purchaseData={purchaseData}
                            orderNumber={orderNumber}
                            reffer={reffer}
                        />

                        <PaymentMethods
                            method={method}
                            setMethod={setMethod}
                            isProcessing={isProcessing}
                            isOfLegalAge={isOfLegalAge}
                            setIsOfLegalAge={setIsOfLegalAge}
                            orderNumber={orderNumber}
                            onStripePayment={handleStripePayment}
                            onPayPhonePayment={handlePayPhonePayment}
                            onTransferPayment={handleTransferPayment}
                            purchaseData={purchaseData}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};