// 📁 components/PayPhoneModal.tsx (ACTUALIZADO)
'use client';

import React, { useEffect, useRef } from 'react';
import { LoadingSpinner } from './checkout/ui/LoadingSpinner';

interface PayPhoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: {
        token: string;
        storeId: string;
        amount: number;
        amountWithoutTax: number;
        clientTransactionId: string;
        reference: string;
        phoneNumber?: string;
        email?: string;
        documentId?: string;
    };
    onSuccess?: (transactionData: any) => void;
    onError?: (error: any) => void;
}

declare global {
    interface Window {
        PPaymentButtonBox: any;
    }
}

export const PayPhoneModal: React.FC<PayPhoneModalProps> = ({
    isOpen,
    onClose,
    config,
    onSuccess,
    onError
}) => {
    const [scriptsLoaded, setScriptsLoaded] = React.useState(false);
    const [isInitializing, setIsInitializing] = React.useState(false);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const payphoneInstanceRef = useRef<any>(null);

    // Cargar scripts de PayPhone
    useEffect(() => {
        if (!isOpen) return;

        const loadPayPhoneScripts = () => {
            // Verificar si ya están cargados
            if (window.PPaymentButtonBox) {
                setScriptsLoaded(true);
                return;
            }

            // Cargar CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css';
            document.head.appendChild(cssLink);

            // Cargar JS
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js';
            script.onload = () => {
                console.log('✅ Scripts de PayPhone cargados');
                setScriptsLoaded(true);
            };
            script.onerror = (error) => {
                console.error('❌ Error cargando scripts de PayPhone:', error);
                onError?.(new Error('No se pudieron cargar los scripts de PayPhone'));
            };
            document.head.appendChild(script);
        };

        loadPayPhoneScripts();
    }, [isOpen, onError]);

    // Inicializar Cajita de Pagos cuando los scripts estén listos
    useEffect(() => {
        if (!scriptsLoaded || !isOpen || isInitializing || payphoneInstanceRef.current) return;

        const initPayPhone = () => {
            try {
                setIsInitializing(true);

                if (!window.PPaymentButtonBox) {
                    throw new Error('PPaymentButtonBox no está disponible');
                }

                console.log('🚀 Inicializando Cajita de Pagos con config:', {
                    token: config.token.substring(0, 10) + '...',
                    storeId: config.storeId,
                    amount: config.amount,
                    clientTransactionId: config.clientTransactionId
                });

                // Limpiar contenedor
                if (buttonContainerRef.current) {
                    buttonContainerRef.current.innerHTML = '';
                }

                // Crear nueva instancia
                const ppb = new window.PPaymentButtonBox({
                    token: config.token,
                    clientTransactionId: config.clientTransactionId,
                    amount: config.amount,
                    amountWithoutTax: config.amountWithoutTax,
                    amountWithTax: 0,
                    tax: 0,
                    service: 0,
                    tip: 0,
                    currency: 'USD',
                    storeId: config.storeId,
                    reference: config.reference,
                    lang: 'es',
                    defaultMethod: 'card',
                    timeZone: -5,
                    ...(config.phoneNumber && { phoneNumber: config.phoneNumber }),
                    ...(config.email && { email: config.email }),
                    ...(config.documentId && { documentId: config.documentId }),
                    identificationType: 1
                });

                payphoneInstanceRef.current = ppb;
                ppb.render('pp-button-container-modal');

                console.log('✅ Cajita de Pagos renderizada en modal');

            } catch (error) {
                console.error('❌ Error inicializando PayPhone:', error);
                onError?.(error);
            } finally {
                setIsInitializing(false);
            }
        };

        // Pequeño delay para asegurar que el DOM esté listo
        const timer = setTimeout(initPayPhone, 150);
        return () => clearTimeout(timer);

    }, [scriptsLoaded, isOpen, config, isInitializing]);

    // Cleanup al cerrar
    useEffect(() => {
        if (!isOpen) {
            if (payphoneInstanceRef.current) {
                payphoneInstanceRef.current = null;
            }
            if (buttonContainerRef.current) {
                buttonContainerRef.current.innerHTML = '';
            }
            setIsInitializing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Pagar con PayPhone</h2>
                                    <p className="text-sm text-gray-500">Completa tu pago de forma segura</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Información de la transacción */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Monto a pagar:</span>
                                    <p className="font-bold text-indigo-900">${(config.amount / 100).toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Referencia:</span>
                                    <p className="font-medium text-indigo-900 truncate">{config.reference}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loading state */}
                        {!scriptsLoaded && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <LoadingSpinner />
                                <p className="text-gray-600 mt-4">Cargando PayPhone...</p>
                            </div>
                        )}

                        {/* Contenedor de la Cajita */}
                        <div
                            ref={buttonContainerRef}
                            id="pp-button-container-modal"
                            className={scriptsLoaded ? 'block min-h-[200px]' : 'hidden'}
                        />

                        {/* Instrucciones */}
                        {scriptsLoaded && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-amber-800">
                                        <p className="font-semibold mb-1">Importante:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Tienes 10 minutos para completar la transacción</li>
                                            <li>• No cierres esta ventana hasta finalizar el pago</li>
                                            <li>• Verifica que los datos sean correctos antes de confirmar</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};