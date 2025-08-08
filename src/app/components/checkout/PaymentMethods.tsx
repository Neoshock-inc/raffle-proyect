import { PaymentMethodType } from '@/app/types/checkout';
import React from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface PaymentMethodsProps {
    method: PaymentMethodType;
    setMethod: (method: PaymentMethodType) => void;
    isProcessing: boolean;
    isOfLegalAge: boolean;
    setIsOfLegalAge: (value: boolean) => void;
    orderNumber: string;
    onStripePayment: () => void;
    onPayPhonePayment: () => void; // Nueva prop para PayPhone
    onTransferPayment: () => void;
    purchaseData: any;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
    method,
    setMethod,
    isProcessing,
    isOfLegalAge,
    setIsOfLegalAge,
    orderNumber,
    onStripePayment,
    onPayPhonePayment, // Nueva prop
    onTransferPayment,
    purchaseData
}) => {
    return (
        <div className="bg-white p-6 rounded-md shadow border">
            <h3 className="text-xl font-semibold mb-4">Selecciona tu método de pago</h3>

            <div className="space-y-4">
                {/* Stripe - Comentado temporalmente */}
                {/* <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={method === 'stripe'}
                        onChange={() => setMethod('stripe')}
                        disabled={isProcessing}
                        className="h-5 w-5 text-green-600"
                    />
                    <div>
                        <span className="font-medium">Pagar con tarjeta</span>
                        <p className="text-sm text-gray-500">Pago seguro con Stripe</p>
                    </div>
                </label> */}

                {/* PayPhone - Nueva opción */}
                {/* <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="payment"
                        value="payphone"
                        checked={method === 'payphone'}
                        onChange={() => setMethod('payphone')}
                        disabled={isProcessing}
                        className="h-5 w-5 text-green-600"
                    />
                    <div className="flex items-center">
                        <PayPhoneIcon className="mr-2" />
                        <div>
                            <span className="font-medium">Pagar con PayPhone</span>
                            <p className="text-sm text-gray-500">Pago rápido y seguro desde tu celular</p>
                        </div>
                    </div>
                </label> */}

                <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={method === 'transfer'}
                        onChange={() => setMethod('transfer')}
                        disabled={isProcessing}
                        className="h-5 w-5 text-green-600"
                    />
                    <div>
                        <span className="font-medium">Transferencia bancaria o depósito</span>
                        <p className="text-sm text-gray-500">Transfiere a nuestra cuenta bancaria</p>
                    </div>
                </label>
            </div>

            <div className="mt-4 flex items-start space-x-2 mx-1">
                <input
                    id="legal-age"
                    type="checkbox"
                    checked={isOfLegalAge}
                    onChange={(e) => setIsOfLegalAge(e.target.checked)}
                    disabled={isProcessing}
                    className="mt-1"
                />
                <label htmlFor="legal-age" className="text-sm text-gray-700">
                    Confirmo que soy mayor de 18 años y acepto los términos de participación.
                </label>
            </div>

            {method === 'transfer' && (
                <BankTransferInfo orderNumber={orderNumber} />
            )}

            <div className="mt-6">
                {/* Stripe - Comentado temporalmente */}
                {/* {method === 'stripe' && (
                    <button
                        onClick={onStripePayment}
                        disabled={isProcessing || !purchaseData}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition"
                    >
                        {isProcessing ? <LoadingSpinner /> : 'Pagar con tarjeta'}
                    </button>
                )} */}

                {method === 'payphone' && (
                    <button
                        onClick={onPayPhonePayment}
                        disabled={isProcessing || !purchaseData || !isOfLegalAge}
                        className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <PayPhoneIcon />
                                Pagar con PayPhone
                            </>
                        )}
                    </button>
                )}

                {method === 'transfer' && (
                    <button
                        onClick={onTransferPayment}
                        disabled={isProcessing || !purchaseData || !isOfLegalAge}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <WhatsAppIcon />
                                Contactar por WhatsApp
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const BankTransferInfo: React.FC<{ orderNumber: string }> = ({ orderNumber }) => (
    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="font-medium mb-2">Detalles de transferencia:</p>
        <p className="mb-1"><span className="font-semibold">Banco:</span> Banco Pichincha</p>
        <p className="mb-1"><span className="font-semibold">Tipo de cuenta:</span> Cuenta de ahorro transaccional</p>
        <p className="mb-1"><span className="font-semibold">N° de cuenta:</span> 2205210743</p>
        <p className="mb-1"><span className="font-semibold">Titular:</span> Irini Meza</p>
        <p className="mb-1"><span className="font-semibold">RUC/CI:</span> 0918736034</p>

        <div className="mt-4 text-gray-700">
            <p className="font-semibold text-red-600">IMPORTANTE:</p>
            <p>NO PROCEDAS SI NO ESTÁS SEGURO de que quieres realizar la compra.</p>
            <p className="mt-2">
                Realiza tu pago directamente con transferencia o depósito a nuestra cuenta bancaria.
                Usa el número del pedido ({orderNumber}) como referencia de pago.
            </p>
            <p className="mt-2">
                Tu pedido no se procesará hasta que se haya recibido el importe en nuestra cuenta.
            </p>
        </div>
    </div>
);

const PayPhoneIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
);

const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);