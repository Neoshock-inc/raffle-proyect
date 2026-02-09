'use client'

import { InvoiceCreationData, Invoice, PaymentStatus, PaymentMethod } from '@/types/invoices'
import { generateOrderNumber } from '@/services/invoiceService'
import { useState, useEffect, useMemo } from 'react'
import { Modal, Input, Select, Button } from '@/admin/components/ui'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSave: (data: InvoiceCreationData) => void
    initialData?: Partial<Invoice>
}

const DEFAULT_FORM: Omit<InvoiceCreationData, 'orderNumber'> = {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    province: '',
    city: '',
    address: '',
    paymentMethod: PaymentMethod.CASH,
    amount: 1,
    totalPrice: 0,
    status: PaymentStatus.PENDING,
    referral_code: '',
}

const paymentMethodOptions = [
    { value: PaymentMethod.CASH, label: 'Efectivo' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Transferencia Bancaria' },
    { value: PaymentMethod.CREDIT_CARD, label: 'Tarjeta de Crédito' },
    { value: PaymentMethod.PAYPAL, label: 'PayPal' },
    { value: PaymentMethod.CRYPTO, label: 'Criptomonedas' },
    { value: PaymentMethod.PAYPHONE, label: 'Pago por Teléfono' },
    { value: PaymentMethod.OTHER, label: 'Otro' },
]

const paymentStatusOptions = [
    { value: PaymentStatus.PENDING, label: 'Pendiente' },
    { value: PaymentStatus.COMPLETED, label: 'Pagado' },
    { value: PaymentStatus.FAILED, label: 'Fallido' },
]

export function InvoiceFormModal({ isOpen, onClose, onSave, initialData }: Props) {
    const [isGeneratingOrderNumber, setIsGeneratingOrderNumber] = useState(false)
    const [generatedOrderNumber, setGeneratedOrderNumber] = useState<string>('')

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

    useEffect(() => {
        if (isOpen && !initialData?.id) {
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
            setGeneratedOrderNumber(initialData.order_number || '')
        }
    }, [isOpen, initialData?.id, initialData?.order_number])

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

        if (!generatedOrderNumber) {
            console.error('El número de orden no está disponible')
            return
        }

        const formDataWithOrderNumber: InvoiceCreationData = {
            ...form,
            orderNumber: generatedOrderNumber
        }

        onSave(formDataWithOrderNumber)
        onClose()
    }

    const handleClose = () => {
        onClose()
        setTimeout(() => {
            setForm(DEFAULT_FORM)
            setGeneratedOrderNumber('')
            setIsGeneratingOrderNumber(false)
        }, 200)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={initialData?.id ? 'Editar Factura' : 'Nueva Factura'}
            size="2xl"
            footer={
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mr-auto">
                        Los campos marcados con * son obligatorios
                    </p>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        {initialData?.id ? 'Actualizar Factura' : 'Crear Factura'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Número de Orden */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Input
                        label="Número de Orden"
                        value={isGeneratingOrderNumber ? 'Generando...' : generatedOrderNumber || 'Esperando generación...'}
                        placeholder="Número de orden"
                        className="bg-blue-100 text-blue-800 font-medium"
                        readOnly
                        helperText="Este número se genera automáticamente y es único para cada factura"
                    />
                </div>

                {/* Información Personal */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-300 pb-2">
                        Información Personal del Cliente
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                            label="Nombre Completo"
                            required
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez García"
                        />
                        <Input
                            label="Correo Electrónico"
                            required
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Ej: juan.perez@email.com"
                        />
                        <Input
                            label="Número de Teléfono"
                            required
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Ej: +593 99 123 4567"
                        />
                        <Input
                            label="País"
                            required
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            placeholder="Ej: Ecuador"
                        />
                    </div>
                </div>

                {/* Información de Dirección */}
                <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-green-300 pb-2">
                        Dirección de Envío
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                            label="Provincia/Estado"
                            required
                            name="province"
                            value={form.province}
                            onChange={handleChange}
                            placeholder="Ej: Manabí"
                        />
                        <Input
                            label="Ciudad"
                            required
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Ej: Manta"
                        />
                    </div>
                    <div className="mt-6">
                        <Input
                            label="Dirección Completa"
                            required
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Ej: Av. Principal 123, entre Calle A y Calle B, Edificio XYZ, Apto 456"
                            helperText="Incluye referencias para facilitar la entrega"
                        />
                    </div>
                </div>

                {/* Información de Pago y Pedido */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-yellow-300 pb-2">
                        Información de Pago y Pedido
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Select
                            label="Método de Pago"
                            required
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                            options={paymentMethodOptions}
                        />
                        <Select
                            label="Estado del Pago"
                            required
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            options={paymentStatusOptions}
                        />
                        <Input
                            label="Cantidad de Números"
                            required
                            name="amount"
                            type="number"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="Ej: 2"
                            min={1}
                        />
                        <Input
                            label="Precio Total (USD)"
                            required
                            name="totalPrice"
                            type="number"
                            step="0.01"
                            value={form.totalPrice}
                            onChange={handleChange}
                            placeholder="Ej: 150.00"
                            min={0}
                        />
                    </div>
                </div>

                {/* Información de Referidos (Opcional) */}
                <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-purple-300 pb-2">
                        Información de Referidos (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Input
                            label="Código de Referido"
                            name="referral_code"
                            value={form.referral_code || ''}
                            onChange={handleChange}
                            placeholder="Ej: AMIGO2024"
                            helperText="Código promocional o de descuento aplicado"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
