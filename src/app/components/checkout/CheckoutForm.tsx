// 📁 components/CheckoutForm.tsx (Actualizado con PayPhone)
import React from 'react';
import { PersonalDataForm } from './PersonalDataForm';
import { OrderSummary } from './OrderSummary';
import { PaymentMethods } from './PaymentMethods';
import { useCheckoutForm } from '@/app/hooks/useCheckoutForm';
import { usePaymentMethods } from '@/app/hooks/usePaymentMethods';
import { useTokenValidation } from '@/app/hooks/useTokenValidation';
import { useTenantPaymentConfig } from '@/app/hooks/useTenantPaymentConfig';
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

    // 👇 NUEVO: Obtener la configuración de pagos del tenant
    const { config: paymentConfig } = useTenantPaymentConfig(purchaseData?.tenantId || '');

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
        handleTransferPayment,
        handlePayPalPayment,
        handlePayPalApprove,
        handlePayPalError
    } = usePaymentMethods(
        orderNumber,
        purchaseData,
        formData,
        isOfLegalAge,
        reffer,
        token,
        checkTokenValidity,
        () => { },
        generateNewOrderNumber,
        paymentConfig?.payphone as any 
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Validando datos de compra...</p>
                </div>
            </div>
        );
    }

    // Si no hay datos de compra válidos, mostrar error
    if (!purchaseData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error de validación</h2>
                    <p className="text-gray-600 mb-6">Los datos de compra no son válidos o han expirado.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-sky-600 text-white px-6 py-3 rounded-md hover:bg-sky-700 transition"
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

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header mejorado */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">FC</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">My Fortuna Cloud</h1>
                                <p className="text-gray-600">Payment Gateway</p>
                            </div>
                        </div>
                        <div className="w-24 h-1 bg-sky-600 rounded mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Columna izquierda: Datos de facturación (3 columnas) */}
                        <div className="lg:col-span-3">
                            <PersonalDataForm
                                formData={formData}
                                onInputChange={handleInputChange}
                                isProcessing={isProcessing}
                            />
                        </div>

                        {/* Columna derecha: Resumen y Métodos de pago (2 columnas) */}
                        <div className="lg:col-span-2 space-y-6">
                            <OrderSummary
                                purchaseData={purchaseData}
                                orderNumber={orderNumber}
                                reffer={reffer}
                                tenantName={purchaseData.tenantName}
                            />

                            <PaymentMethods
                                tenantId={purchaseData.tenantId}
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
                                onPayPalPayment={handlePayPalPayment}
                                onPayPalApprove={handlePayPalApprove}
                                onPayPalError={handlePayPalError}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center py-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Procesado de forma segura por My Fortuna Cloud
                        </p>
                        <div className="flex justify-center items-center mt-2 space-x-4">
                            <div className="flex items-center text-xs text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                SSL Seguro
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Pago Verificado
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};