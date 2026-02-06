'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tenantService } from '@/admin/services/tenantService';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    layout: 'default' | 'latina' | 'offroad' | 'minimal';
    status: 'active' | 'suspended' | 'deleted';
    description?: string;
    plan: 'basic' | 'pro' | 'enterprise';
    owner_name?: string;
    owner_email?: string;
    owner_phone?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export default function TransferSuccessClient() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTenantAndRedirect = async () => {
            try {
                // Obtener parámetros de la URL
                const name = searchParams.get('name') ?? '';
                const lastName = searchParams.get('lastName') ?? '';
                const email = searchParams.get('email') ?? '';
                const phone = searchParams.get('phone') ?? '';
                const amount = searchParams.get('amount') ?? '1';
                const price = searchParams.get('price') ?? '0';
                const orderNumber = searchParams.get('orderNumber') ?? '';
                const tenantId = searchParams.get('tenantId') ?? '';

                if (!tenantId) {
                    throw new Error('No se encontró el ID del tenant');
                }

                const tenant: Tenant = await tenantService.getTenantById(tenantId);

                console.log(tenant);

                if (!tenant.owner_phone) {
                    throw new Error('No se encontró el teléfono del propietario');
                }

                // Preparar el mensaje para WhatsApp
                const productDetails = `${tenant.name}, Boletos`;
                const totalAmount = parseFloat(price);

                const message = encodeURIComponent(
                    `*¡Nuevo pedido de ${tenant.name}!*\n\n` +
                    `Número de pedido: *${orderNumber}*\n` +
                    `Cliente: ${name} ${lastName}\n` +
                    `Email: ${email}\n` +
                    `Teléfono: ${phone}\n\n` +
                    `*DETALLES DEL PEDIDO:*\n` +
                    `Producto: ${productDetails}\n` +
                    `Cantidad: ${amount}\n` +
                    `Total: $${totalAmount.toFixed(2)}\n\n` +
                    `Voy a realizar la transferencia y enviar el comprobante. Por favor, confirmar recepción.`
                );

                // Limpiar el número de teléfono (remover espacios, guiones, etc.)
                const phoneNumber = tenant.owner_phone.replace(/[^\d+]/g, '');

                setIsLoading(false);

                // Redirigir a WhatsApp después de 2 segundos
                const timeout = setTimeout(() => {
                    window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
                }, 2000);

                return () => clearTimeout(timeout);

            } catch (error: any) {
                console.error('Error al cargar tenant:', error);
                setError(error.message || 'Error inesperado');
                setIsLoading(false);
            }
        };

        loadTenantAndRedirect();
    }, [searchParams]);

    if (error) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p className="mb-4 text-red-600">{error}</p>
                <a
                    href="/"
                    className="mt-2 text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                    Volver al inicio
                </a>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-2xl font-bold mb-4 text-blue-600">¡Gracias por tu compra! 🧾</h1>

            <p className="mb-4">
                Hemos recibido tu solicitud de participación mediante <strong>transferencia bancaria</strong>.
            </p>

            <p className="text-sm text-gray-700 max-w-md mb-4">
                Debido a la alta demanda de compras, tu pedido será verificado y confirmado manualmente por nuestro equipo.
                Recibirás una respuesta dentro de un plazo máximo de <strong>24 horas</strong>.
            </p>

            <p className="text-sm text-gray-700 max-w-md mb-4">
                Te enviaremos un correo electrónico una vez que tu participación haya sido validada. Revisa tu bandeja de entrada y también la carpeta de spam.
            </p>

            {/* Mensaje de redirección */}
            {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
                    <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Preparando redirección a WhatsApp...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
                    <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Redirigiendo a WhatsApp...</span>
                </div>
            )}

            <a
                href="/"
                className="mt-2 text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
                Volver al inicio
            </a>
        </main>
    );
}