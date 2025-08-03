import { PurchaseData } from '@/app/types/checkout';
import React from 'react';

interface OrderSummaryProps {
    purchaseData: PurchaseData;
    orderNumber: string;
    reffer?: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    purchaseData,
    orderNumber,
    reffer
}) => {
    return (
        <div className="bg-white p-6 rounded-md shadow border">
            <h3 className="text-xl font-semibold mb-4">Tu pedido</h3>

            <div className="border-b pb-4">
                <div className="flex justify-between font-semibold text-gray-600 mb-2">
                    <span>Producto</span>
                    <span>Subtotal</span>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="font-medium">
                            Números Mazda 6 Full - Yamaha MT03 2025 | Actividad #1
                        </p>
                        <p className="text-gray-500 text-sm">x {purchaseData.amount}</p>
                    </div>
                    <span>${purchaseData.price.toFixed(2)}</span>
                </div>
            </div>

            <div className="py-4">
                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${purchaseData.price.toFixed(2)}</span>
                </div>
            </div>

            {/* Mostrar número de orden */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold">Número de pedido:</span> {orderNumber}
                </p>
            </div>

            {/* Mostrar mensaje de refferer si existe */}
            {reffer && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-600">
                        <span className="font-semibold">Referido:</span> {reffer}
                    </p>
                </div>
            )}
        </div>
    );
};