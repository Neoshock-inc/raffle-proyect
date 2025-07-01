'use client'

import { InvoiceCreationData, Invoice, PaymentStatus, PaymentMethod } from '@/app/types/invoices'
import { generateOrderNumber } from '@/app/services/invoiceService'
import { useState, useEffect, useMemo } from 'react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSave: (data: InvoiceCreationData) => void
    initialData?: Partial<Invoice>
}

// Formulario basado en InvoiceCreationData (sin orderNumber ya que se genera automáticamente)
const DEFAULT_FORM: Omit<InvoiceCreationData, 'orderNumber'> = {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    province: '',
    city: '',
    address: '',
    paymentMethod: PaymentMethod.CASH, // Método de pago por defecto
    amount: 1,
    totalPrice: 0,
    status: PaymentStatus.PENDING,
    referral_code: '',
}

export function InvoiceFormModal({ isOpen, onClose, onSave, initialData }: Props) {
    // State for tracking order number generation
    const [isGeneratingOrderNumber, setIsGeneratingOrderNumber] = useState(false)
    const [generatedOrderNumber, setGeneratedOrderNumber] = useState<string>('')

    // Memoizar el form inicial para evitar recreaciones
    const initialForm = useMemo(() => {
        if (!initialData) return DEFAULT_FORM

        return {
            ...DEFAULT_FORM,
            fullName: initialData.full_name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            country: initialData.country || '',
            province: initialData.province || '',
            city: initialData.city || '',
            address: initialData.address || '',
            paymentMethod: initialData.payment_method as PaymentMethod || PaymentMethod.CASH,
            amount: initialData.amount || 1,
            totalPrice: initialData.total_price || 0,
            status: (initialData.status as PaymentStatus) || PaymentStatus.PENDING
        }
    }, [initialData])

    const [form, setForm] = useState<Omit<InvoiceCreationData, 'orderNumber'>>(initialForm)

    // Generar número de orden para nuevas facturas
    useEffect(() => {
        if (isOpen && !initialData?.id) {
            // Solo generar para nuevas facturas
            const generateNumber = async () => {
                setIsGeneratingOrderNumber(true)
                try {
                    const orderNumber = await generateOrderNumber()
                    setGeneratedOrderNumber(orderNumber)
                } catch (error) {
                    console.error('Error generando número de orden:', error)
                    setGeneratedOrderNumber('Error al generar')
                } finally {
                    setIsGeneratingOrderNumber(false)
                }
            }
            generateNumber()
        } else if (isOpen && initialData?.id) {
            // Si es edición, usar el número existente
            setGeneratedOrderNumber(initialData.order_number || '')
        }
    }, [isOpen, initialData?.id, initialData?.order_number])

    // Solo actualizar el form cuando cambie el initialData y el modal esté abierto
    useEffect(() => {
        if (isOpen) {
            setForm(initialForm)
        }
    }, [isOpen, initialForm])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: name === 'amount' || name === 'totalPrice'
                ? parseFloat(value) || 0
                : value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que el número de orden esté generado
        if (!generatedOrderNumber) {
            console.error('El número de orden no está disponible')
            return
        }

        // Crear los datos completos incluyendo el número de orden
        const formDataWithOrderNumber: InvoiceCreationData = {
            ...form,
            orderNumber: generatedOrderNumber
        }

        // ✅ Enviar los datos completos con el número de orden
        onSave(formDataWithOrderNumber)
        onClose()
    }

    const handleClose = () => {
        onClose()
        // Reset form cuando se cierra
        setTimeout(() => {
            setForm(DEFAULT_FORM)
            setGeneratedOrderNumber('')
            setIsGeneratingOrderNumber(false)
        }, 200) // Pequeño delay para la animación
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {initialData?.id ? 'Editar Factura' : 'Nueva Factura'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {initialData?.id ? 'Modifica los datos de la factura existente' : 'Completa todos los campos para crear una nueva factura'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Número de Orden */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <label className="block text-sm font-semibold text-blue-800 mb-2">
                                Número de Orden
                            </label>
                            <input
                                value={isGeneratingOrderNumber ? 'Generando...' : generatedOrderNumber || 'Esperando generación...'}
                                placeholder="Número de orden"
                                className="w-full border border-blue-300 px-3 py-2 rounded-md bg-blue-100 text-blue-800 font-medium"
                                readOnly
                            />
                            <p className="text-xs text-blue-600 mt-1">
                                Este número se genera automáticamente y es único para cada factura
                            </p>
                        </div>

                        {/* Información Personal */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                                📋 Información Personal del Cliente
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Pérez García"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Ej: juan.perez@email.com"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Teléfono *
                                    </label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Ej: +593 99 123 4567"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        País *
                                    </label>
                                    <input
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        placeholder="Ej: Ecuador"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de Dirección */}
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-green-300 pb-2">
                                📍 Dirección de Envío
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Provincia/Estado *
                                    </label>
                                    <input
                                        name="province"
                                        value={form.province}
                                        onChange={handleChange}
                                        placeholder="Ej: Manabí"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ciudad *
                                    </label>
                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Ej: Manta"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección Completa *
                                </label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Ej: Av. Principal 123, entre Calle A y Calle B, Edificio XYZ, Apto 456"
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Incluye referencias para facilitar la entrega
                                </p>
                            </div>
                        </div>

                        {/* Información de Pago y Pedido */}
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-yellow-300 pb-2">
                                💳 Información de Pago y Pedido
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Método de Pago *
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        title="Método de pago"
                                    >
                                        <option value={PaymentMethod.CASH}>💵 Efectivo</option >
                                        <option value={PaymentMethod.BANK_TRANSFER}>🏦 Transferencia Bancaria</option>
                                        <option value={PaymentMethod.CREDIT_CARD}>💳 Tarjeta de Crédito</option>
                                        <option value={PaymentMethod.PAYPAL}>💳 PayPal</option>
                                        <option value={PaymentMethod.CRYPTO}>💰 Criptomonedas</option>
                                        <option value={PaymentMethod.PAYPHONE}>📞 Pago por Teléfono</option>
                                        <option value={PaymentMethod.OTHER}>🔧 Otro</option>
                                    </select>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Selecciona el método de pago preferido
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado del Pago *
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        title="Estado del pago"
                                    >
                                        <option value={PaymentStatus.PENDING}>🟡 Pendiente</option>
                                        <option value={PaymentStatus.COMPLETED}>🟢 Pagado</option>
                                        <option value={PaymentStatus.FAILED}>🔴 Fallido</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cantidad de Números *
                                    </label>
                                    <input
                                        name="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={handleChange}
                                        placeholder="Ej: 2"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio Total (USD) *
                                    </label>
                                    <input
                                        name="totalPrice"
                                        type="number"
                                        step="0.01"
                                        value={form.totalPrice}
                                        onChange={handleChange}
                                        placeholder="Ej: 150.00"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de Referidos (Opcional) */}
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-purple-300 pb-2">
                                🎁 Información de Referidos (Opcional)
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código de Referido
                                    </label>
                                    <input
                                        name="referral_code"
                                        value={form.referral_code || ''}
                                        onChange={handleChange}
                                        placeholder="Ej: AMIGO2024"
                                        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Código promocional o de descuento aplicado
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Los campos marcados con * son obligatorios
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-[#800000] text-white rounded-md hover:bg-[#990000] transition-colors font-medium shadow-md"
                            >
                                {initialData?.id ? 'Actualizar Factura' : 'Crear Factura'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}