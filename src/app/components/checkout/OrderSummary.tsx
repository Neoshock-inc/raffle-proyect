// 📁 components/OrderSummary.tsx (Actualizado)
import { PurchaseData } from '@/app/types/checkout'
import React from 'react'

interface OrderSummaryProps {
    purchaseData: PurchaseData
    orderNumber: string
    reffer?: string | null
    tenantName?: string
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    purchaseData,
    orderNumber,
    reffer,
    tenantName
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">FC</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                    {tenantName || 'Tu pedido'}
                </h3>
            </div>

            <div className="border-b pb-4">
                <div className="flex justify-between font-semibold text-gray-600 mb-3">
                    <span>Producto</span>
                    <span>Subtotal</span>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="font-medium text-gray-800">
                            Boletos de rifa
                        </p>
                        <p className="text-gray-500 text-sm">Cantidad: {purchaseData.amount}</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                        ${purchaseData.price.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="py-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-sky-600">${purchaseData.price.toFixed(2)}</span>
                </div>
            </div>

            {/* Información del pedido */}
            <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">Pedido:</span> {orderNumber}
                    </p>
                </div>

                {reffer && (
                    <div className="p-3 bg-sky-50 rounded-md">
                        <p className="text-sm text-sky-700">
                            <span className="font-semibold">Referido:</span> {reffer}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}