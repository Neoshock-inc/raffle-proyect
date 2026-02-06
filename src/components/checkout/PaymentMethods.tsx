// 📁 components/PaymentMethods.tsx (VERSIÓN CON MODAL)
'use client';

import { PaymentMethodType } from '@/types/checkout'
import React, { useState } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useTenantPaymentConfig } from '@/hooks/useTenantPaymentConfig'
import { PayPhoneModal } from '../PayPhoneModal';

interface PaymentMethodsProps {
    tenantId: string
    method: PaymentMethodType
    setMethod: (method: PaymentMethodType) => void
    isProcessing: boolean
    isOfLegalAge: boolean
    setIsOfLegalAge: (value: boolean) => void
    orderNumber: string
    onStripePayment: () => void
    onPayPhonePayment: () => void
    onTransferPayment: () => void
    onPayPalPayment: () => Promise<{ success: boolean; error?: string; orderID?: string }>
    onPayPalApprove: (data: any) => Promise<{ success: boolean; error?: string }>
    onPayPalError: (error: any) => Promise<void>
    purchaseData: any
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
    tenantId,
    method,
    setMethod,
    isProcessing,
    isOfLegalAge,
    setIsOfLegalAge,
    orderNumber,
    onStripePayment,
    onPayPhonePayment,
    onTransferPayment,
    onPayPalPayment,
    onPayPalApprove,
    onPayPalError,
    purchaseData
}) => {
    const { config, loading, error } = useTenantPaymentConfig(tenantId)

    // Opciones de PayPal
    const getPayPalOptions = () => {
        if (!config?.paypal) return null

        return {
            "client-id": config.paypal.extra?.client_id || config.paypal.public_key,
            clientId: config.paypal.extra?.client_id || config.paypal.public_key,
            currency: "USD",
            intent: "capture",
            "enable-funding": "venmo,paylater,card",
            "disable-funding": "",
            components: "buttons,marks,messages,hosted-fields",
            ...(config.paypal.extra?.sandbox && {
                "data-sdk-integration-source": "sandbox"
            })
        }
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600">Cargando métodos de pago...</span>
                </div>
            </div>
        )
    }

    if (error || !config) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="text-center py-8">
                    <p className="text-red-600 font-medium">Error al cargar métodos de pago</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Por favor, contacta al administrador
                    </p>
                </div>
            </div>
        )
    }

    if (config.availableMethods.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="text-center py-8">
                    <p className="text-amber-600 font-medium">No hay métodos de pago configurados</p>
                    <p className="text-sm text-gray-500 mt-2">
                        El administrador debe configurar al menos un método de pago
                    </p>
                </div>
            </div>
        )
    }

    const paypalOptions = getPayPalOptions()

    return (
        <>

            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Selecciona tu método de pago
                </h3>

                <div className="space-y-4">
                    {/* Stripe */}
                    {config.availableMethods.includes('stripe') && (
                        <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
                            <input
                                type="radio"
                                name="payment"
                                value="stripe"
                                checked={method === 'stripe'}
                                onChange={() => setMethod('stripe')}
                                disabled={isProcessing}
                                className="h-5 w-5 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex items-center flex-1">
                                <div className="w-12 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center mr-3">
                                    <CreditCardIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Pagar con tarjeta</span>
                                    <p className="text-sm text-gray-500">Pago seguro con Stripe</p>
                                </div>
                            </div>
                        </label>
                    )}

                    {/* PayPal */}
                    {config.availableMethods.includes('paypal') && (
                        <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
                            <input
                                type="radio"
                                name="payment"
                                value="paypal"
                                checked={method === 'paypal'}
                                onChange={() => setMethod('paypal')}
                                disabled={isProcessing}
                                className="h-5 w-5 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex items-center flex-1">
                                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                                    <PayPalIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Pagar con Tarjeta</span>
                                    <p className="text-sm text-gray-500">
                                        Pago seguro con Tarjeta o PayPal
                                        {config.paypal?.extra?.sandbox && (
                                            <span className="text-amber-600 font-medium"> (Sandbox)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </label>
                    )}

                    {/* PayPhone */}
                    {config.availableMethods.includes('payphone') && (
                        <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
                            <input
                                type="radio"
                                name="payment"
                                value="payphone"
                                checked={method === 'payphone'}
                                onChange={() => setMethod('payphone')}
                                disabled={isProcessing}
                                className="h-5 w-5 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex items-center flex-1">
                                <div className="w-12 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded flex items-center justify-center mr-3">
                                    <PhoneIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">PayPhone</span>
                                    <p className="text-sm text-gray-500">Pago con tarjeta (Ecuador)</p>
                                </div>
                            </div>
                        </label>
                    )}

                    {/* Transferencia Bancaria */}
                    {config.availableMethods.includes('transfer') && (
                        <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
                            <input
                                type="radio"
                                name="payment"
                                value="transfer"
                                checked={method === 'transfer'}
                                onChange={() => setMethod('transfer')}
                                disabled={isProcessing}
                                className="h-5 w-5 text-sky-600 focus:ring-sky-500"
                            />
                            <div className="flex items-center flex-1">
                                <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                                    <BankIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Transferencia bancaria</span>
                                    <p className="text-sm text-gray-500">Transfiere a nuestra cuenta</p>
                                </div>
                            </div>
                        </label>
                    )}
                </div>

                {/* 📱 Instrucciones de PayPhone */}
                {method === 'payphone' && (
                    <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-indigo-900 mb-2">
                                    📱 Pago seguro con PayPhone
                                </h4>
                                <p className="text-sm text-indigo-800 mb-2">
                                    Al hacer clic en "Pagar con PayPhone", se abrirá un formulario seguro donde podrás ingresar los datos de tu tarjeta.
                                </p>
                                <ul className="space-y-1 text-sm text-indigo-800">
                                    <li>✓ Acepta tarjetas Visa, Mastercard, Diners y Discover</li>
                                    <li>✓ Conexión segura con encriptación SSL</li>
                                    <li>✓ Tienes 10 minutos para completar el pago</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Checkbox de términos */}
                <div className="mt-6 flex items-start space-x-2">
                    <input
                        id="legal-age"
                        type="checkbox"
                        checked={isOfLegalAge}
                        onChange={(e) => setIsOfLegalAge(e.target.checked)}
                        disabled={isProcessing}
                        className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="legal-age" className="text-sm text-gray-700">
                        Confirmo que soy mayor de 18 años y acepto los términos de participación.
                    </label>
                </div>

                {/* Información bancaria */}
                {method === 'transfer' && (config.bankAccounts?.length > 0 || config.bankInfo) && (
                    <BankTransferInfo
                        orderNumber={orderNumber}
                        bankAccounts={config.bankAccounts || []}
                        bankInfo={config.bankInfo}
                    />
                )}

                {/* Botones de pago */}
                <div className="mt-6">
                    {/* Stripe */}
                    {method === 'stripe' && (
                        <button
                            onClick={onStripePayment}
                            disabled={isProcessing || !purchaseData || !isOfLegalAge}
                            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                        >
                            {isProcessing ? <LoadingSpinner /> : 'Pagar con tarjeta'}
                        </button>
                    )}

                    {/* PayPal */}
                    {method === 'paypal' && purchaseData && isOfLegalAge && paypalOptions && (
                        <div className="paypal-container" style={{ minHeight: '150px', position: 'relative', zIndex: 1 }}>
                            <PayPalScriptProvider options={paypalOptions} deferLoading={false}>
                                <PayPalButtons
                                    disabled={isProcessing}
                                    forceReRender={[purchaseData.price]}
                                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45 }}
                                    createOrder={async (data, actions) => {
                                        const res = await onPayPalPayment()
                                        if (!res.success) throw new Error(res.error || 'Error creando la orden')
                                        return actions.order.create({
                                            intent: "CAPTURE",
                                            purchase_units: [{
                                                amount: { currency_code: "USD", value: purchaseData.price.toFixed(2) },
                                                description: `Pedido #${orderNumber}`,
                                                reference_id: orderNumber
                                            }],
                                            application_context: { shipping_preference: "NO_SHIPPING" }
                                        })
                                    }}
                                    onApprove={async (data, actions) => {
                                        if (actions.order) await actions.order.capture()
                                        const result = await onPayPalApprove(data)
                                        if (!result.success) throw new Error(result.error)
                                    }}
                                    onError={onPayPalError}
                                />
                            </PayPalScriptProvider>
                        </div>
                    )}

                    {/* 🆕 PayPhone - SOLO BOTÓN */}
                    {method === 'payphone' && (
                        <button
                            onClick={onPayPhonePayment}
                            disabled={isProcessing || !purchaseData || !isOfLegalAge}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                        >
                            {isProcessing ? <LoadingSpinner /> : 'Pagar con PayPhone'}
                        </button>
                    )}

                    {/* Transferencia */}
                    {method === 'transfer' && (
                        <button
                            onClick={onTransferPayment}
                            disabled={isProcessing || !purchaseData || !isOfLegalAge}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {isProcessing ? <LoadingSpinner /> : (
                                <>
                                    <WhatsAppIcon />
                                    Contactar por WhatsApp
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}

// Componente para información bancaria dinámica con múltiples cuentas
interface BankTransferInfoProps {
    orderNumber: string
    bankAccounts: {
        id?: string
        bank_name: string
        account_number: string
        account_holder: string
        routing_number?: string
        swift_code?: string
    }[]
    bankInfo?: {
        id?: string
        bank_name: string
        account_number: string
        account_holder: string
        routing_number?: string
        swift_code?: string
    }
}

const BankTransferInfo: React.FC<BankTransferInfoProps> = ({
    orderNumber,
    bankAccounts = [],
    bankInfo
}) => {
    const accounts = bankAccounts && bankAccounts.length > 0 ? bankAccounts : (bankInfo ? [bankInfo] : [])

    if (accounts.length === 0) {
        return (
            <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-600 font-medium">No hay cuentas bancarias configuradas</p>
            </div>
        )
    }

    return (
        <div className="mt-4 bg-sky-50 p-4 rounded-lg border border-sky-200">
            <p className="font-medium mb-3 text-sky-900">
                {accounts.length === 1 ? 'Detalles de transferencia:' : 'Elige una cuenta para transferir:'}
            </p>

            {accounts.length === 1 ? (
                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700">Banco:</span> {accounts[0].bank_name}</p>
                    <p><span className="font-semibold text-gray-700">Titular:</span> {accounts[0].account_holder}</p>
                    <p><span className="font-semibold text-gray-700">N° de cuenta:</span> {accounts[0].account_number}</p>
                    {accounts[0].routing_number && (
                        <p><span className="font-semibold text-gray-700">Routing:</span> {accounts[0].routing_number}</p>
                    )}
                    {accounts[0].swift_code && (
                        <p><span className="font-semibold text-gray-700">SWIFT:</span> {accounts[0].swift_code}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {accounts.map((account, index) => (
                        <div key={account.id || `account-${index}`} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{account.bank_name}</h4>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Opción {index + 1}
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Titular:</span> {account.account_holder}</p>
                                <p><span className="font-medium">N° de cuenta:</span> {account.account_number}</p>
                                {account.routing_number && (
                                    <p><span className="font-medium">Routing:</span> {account.routing_number}</p>
                                )}
                                {account.swift_code && (
                                    <p><span className="font-medium">SWIFT:</span> {account.swift_code}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="font-semibold text-amber-800 mb-2">IMPORTANTE:</p>
                <div className="text-sm text-amber-700 space-y-1">
                    <p>• NO PROCEDAS SI NO ESTÁS SEGURO de que quieres realizar la compra</p>
                    <p>• Usa el número de pedido <strong>{orderNumber}</strong> como referencia</p>
                    <p>• Tu pedido se procesará una vez confirmado el pago</p>
                    <p>• Guarda el comprobante de transferencia</p>
                    {accounts.length > 1 && (
                        <p>• Puedes transferir a cualquiera de las cuentas mostradas arriba</p>
                    )}
                    <p>• DA CLIK EN EL BOTÓN DE WHATSAPP PARA ENVIAR TU ORDEN DE COMPRA</p>
                </div>
            </div>
        </div>
    )
}

// Iconos
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
)

const PayPalIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
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
        <path d="M7 21h10l2-12H5l2 12z" />
        <path d="M12 2v7" />
        <path d="M8 2v7" />
        <path d="M16 2v7" />
    </svg>
)

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
)

const BankIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
)

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)