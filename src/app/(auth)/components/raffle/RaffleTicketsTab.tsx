'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Package, Star, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { Raffle, UpdateRaffleData } from '../../types/raffle'
import { useTicketPackages } from '../../hooks/useTicketPackages'
import type {
    TicketPackage,
    CreateTicketPackageData,
    PromotionType,
    calculateFinalPrice,
    calculateTotalTickets
} from '../../types/ticketPackage'

// Import utility functions
const calculateFinalPriceLocal = (pkg: TicketPackage): number => {
    if (pkg.promotion_type === 'discount') {
        return pkg.base_price * (1 - pkg.promotion_value / 100)
    }
    return pkg.base_price
}

const calculateTotalTicketsLocal = (pkg: TicketPackage): number => {
    switch (pkg.promotion_type) {
        case 'bonus':
            return pkg.amount + pkg.promotion_value
        case '2x1':
            return pkg.amount * 2
        case '3x2':
            return Math.floor(pkg.amount / 2) * 3 + (pkg.amount % 2)
        default:
            return pkg.amount
    }
}

interface Props {
    raffle: Raffle
    onRaffleUpdate: (data: UpdateRaffleData) => Promise<any>
}

interface TicketPackageModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Omit<CreateTicketPackageData, 'raffle_id'>) => Promise<void>
    initialData?: TicketPackage
    rafflePrice: number
}

function TicketPackageModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    rafflePrice
}: TicketPackageModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        amount: 1,
        base_price: rafflePrice,
        promotion_type: 'none' as PromotionType,
        promotion_value: 0,
        primary_color: '#3B82F6',
        secondary_color: '#1D4ED8',
        badge_text: '',
        is_featured: false,
        display_order: 0,
        is_active: true
    })

    const [saving, setSaving] = useState(false)

    // Reset form when modal opens/closes or initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                amount: initialData.amount,
                base_price: initialData.base_price,
                promotion_type: initialData.promotion_type,
                promotion_value: initialData.promotion_value,
                primary_color: initialData.primary_color,
                secondary_color: initialData.secondary_color,
                badge_text: initialData.badge_text || '',
                is_featured: initialData.is_featured,
                display_order: initialData.display_order,
                is_active: initialData.is_active
            })
        } else if (isOpen) {
            setFormData({
                name: '',
                amount: 1,
                base_price: rafflePrice,
                promotion_type: 'none',
                promotion_value: 0,
                primary_color: '#3B82F6',
                secondary_color: '#1D4ED8',
                badge_text: '',
                is_featured: false,
                display_order: 0,
                is_active: true
            })
        }
    }, [initialData, rafflePrice, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('El nombre del paquete es requerido')
            return
        }

        if (formData.amount < 1) {
            toast.error('La cantidad debe ser mayor a 0')
            return
        }

        if (formData.base_price <= 0) {
            toast.error('El precio base debe ser mayor a 0')
            return
        }

        setSaving(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Error saving package:', error)
        } finally {
            setSaving(false)
        }
    }

    const calculateFinalPrice = () => {
        if (formData.promotion_type === 'discount') {
            return formData.base_price * (1 - formData.promotion_value / 100)
        }
        return formData.base_price
    }

    const calculateTotalTickets = () => {
        switch (formData.promotion_type) {
            case 'bonus':
                return formData.amount + formData.promotion_value
            case '2x1':
                return formData.amount * 2
            case '3x2':
                return Math.floor(formData.amount / 2) * 3 + (formData.amount % 2)
            default:
                return formData.amount
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                            {initialData ? 'Editar Paquete' : 'Nuevo Paquete de Tickets'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={saving}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Paquete *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej: Paquete Básico"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad de Tickets *
                                </label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio Base *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.base_price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                                    min="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Promoción
                                </label>
                                <select
                                    value={formData.promotion_type}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        promotion_type: e.target.value as PromotionType,
                                        promotion_value: 0
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    disabled={saving}
                                >
                                    <option value="none">Sin promoción</option>
                                    <option value="discount">Descuento (%)</option>
                                    <option value="bonus">Tickets bonus</option>
                                    <option value="2x1">2x1</option>
                                    <option value="3x2">3x2</option>
                                </select>
                            </div>

                            {(formData.promotion_type === 'discount' || formData.promotion_type === 'bonus') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.promotion_type === 'discount' ? 'Porcentaje de Descuento' : 'Tickets Bonus'}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.promotion_value}
                                        onChange={(e) => setFormData(prev => ({ ...prev, promotion_value: parseInt(e.target.value) || 0 }))}
                                        min="0"
                                        max={formData.promotion_type === 'discount' ? 100 : undefined}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                        disabled={saving}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color Primario
                                </label>
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="w-full h-10 border border-gray-300 rounded-md"
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Badge (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.badge_text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                                    placeholder="Ej: MÁS POPULAR"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                disabled={saving}
                            />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                                Destacar este paquete
                            </label>
                        </div>

                        {/* Preview */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Vista Previa</h4>
                            <div
                                className="border-2 rounded-lg p-4 text-center relative"
                                style={{ borderColor: formData.primary_color }}
                            >
                                {formData.is_featured && (
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            DESTACADO
                                        </span>
                                    </div>
                                )}

                                {formData.badge_text && (
                                    <div className="absolute -top-2 right-2">
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                                            style={{ backgroundColor: formData.secondary_color }}
                                        >
                                            {formData.badge_text}
                                        </span>
                                    </div>
                                )}

                                <h3 className="font-semibold text-gray-900">{formData.name || 'Nombre del paquete'}</h3>
                                <div className="text-2xl font-bold mt-2" style={{ color: formData.primary_color }}>
                                    ${calculateFinalPrice().toFixed(2)}
                                </div>
                                <div className="bg-gray-50 rounded p-2 mt-3">
                                    <div className="text-sm text-gray-600">Obtienes</div>
                                    <div className="text-lg font-semibold" style={{ color: formData.primary_color }}>
                                        {calculateTotalTickets()} tickets
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')} Paquete
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function RaffleTicketsTab({ raffle, onRaffleUpdate }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<TicketPackage | undefined>()

    // Use the real hook instead of mock data
    const {
        packages,
        loading,
        error,
        createPackage,
        updatePackage,
        deletePackage,
        reorderPackages,
        refetch
    } = useTicketPackages({
        raffleId: raffle.id,
        enabled: true
    })

    const handleCreatePackage = async (data: Omit<CreateTicketPackageData, 'raffle_id'>) => {
        try {
            await createPackage(data)
            setIsModalOpen(false)
        } catch (error) {
            // Error is already handled in the hook
        }
    }

    const handleUpdatePackage = async (data: Omit<CreateTicketPackageData, 'raffle_id'>) => {
        if (!editingPackage) return

        try {
            await updatePackage({
                id: editingPackage.id,
                raffle_id: editingPackage.raffle_id, // <- aquí
                ...data
            })
            setEditingPackage(undefined)
            setIsModalOpen(false)
        } catch (error) {
            // Error is already handled in the hook
        }
    }

    const handleEditPackage = (pkg: TicketPackage) => {
        setEditingPackage(pkg)
        setIsModalOpen(true)
    }

    const handleDeletePackage = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
            try {
                await deletePackage(id)
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPackage(undefined)
    }

    const handleMoveUp = async (pkg: TicketPackage) => {
        const currentIndex = packages.findIndex(p => p.id === pkg.id)
        if (currentIndex > 0) {
            const reordered = [...packages]
            reordered[currentIndex] = packages[currentIndex - 1]
            reordered[currentIndex - 1] = pkg

            // Update display_order
            const updated = reordered.map((p, index) => ({
                ...p,
                display_order: index
            }))

            try {
                await reorderPackages(updated)
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    }

    const handleMoveDown = async (pkg: TicketPackage) => {
        const currentIndex = packages.findIndex(p => p.id === pkg.id)
        if (currentIndex < packages.length - 1) {
            const reordered = [...packages]
            reordered[currentIndex] = packages[currentIndex + 1]
            reordered[currentIndex + 1] = pkg

            // Update display_order
            const updated = reordered.map((p, index) => ({
                ...p,
                display_order: index
            }))

            try {
                await reorderPackages(updated)
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Paquetes de Tickets</h3>
                    <p className="text-sm text-gray-600">
                        Gestiona los diferentes paquetes de tickets y promociones para tu rifa
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
                    disabled={loading}
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Paquete
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-64"></div>
                        </div>
                    ))}
                </div>
            ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg, index) => (
                        <div
                            key={pkg.id}
                            className="relative bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow"
                            style={{ borderColor: pkg.primary_color }}
                        >
                            {pkg.is_featured && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        DESTACADO
                                    </span>
                                </div>
                            )}

                            {pkg.badge_text && (
                                <div className="absolute -top-3 right-4">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                        style={{ backgroundColor: pkg.secondary_color }}
                                    >
                                        {pkg.badge_text}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                                    <p className="text-sm text-gray-600">{pkg.amount} tickets base</p>
                                </div>

                                <div className="text-center">
                                    <div className="text-3xl font-bold" style={{ color: pkg.primary_color }}>
                                        ${calculateFinalPriceLocal(pkg).toFixed(2)}
                                    </div>
                                    {pkg.promotion_type !== 'none' && calculateFinalPriceLocal(pkg) !== pkg.base_price && (
                                        <div className="text-sm text-gray-500 line-through">
                                            ${pkg.base_price.toFixed(2)}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-sm text-gray-600">Obtienes</div>
                                    <div className="text-xl font-semibold" style={{ color: pkg.primary_color }}>
                                        {calculateTotalTicketsLocal(pkg)} tickets
                                    </div>
                                </div>

                                <div className="flex justify-center items-center space-x-2 pt-4 border-t">
                                    {/* Order controls */}
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleMoveUp(pkg)}
                                            disabled={index === 0 || loading}
                                            className="p-1 text-gray-600 hover:text-sky-600 disabled:opacity-30"
                                            title="Mover arriba"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(pkg)}
                                            disabled={index === packages.length - 1 || loading}
                                            className="p-1 text-gray-600 hover:text-sky-600 disabled:opacity-30"
                                            title="Mover abajo"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Edit and delete controls */}
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEditPackage(pkg)}
                                            className="p-2 text-gray-600 hover:text-sky-600"
                                            title="Editar"
                                            disabled={loading}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePackage(pkg.id)}
                                            className="p-2 text-gray-600 hover:text-red-600"
                                            title="Eliminar"
                                            disabled={loading}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay paquetes creados
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Crea tu primer paquete de tickets para ofrecer diferentes opciones a tus usuarios
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                        disabled={loading}
                    >
                        <Plus className="h-4 w-4" />
                        Crear Primer Paquete
                    </button>
                </div>
            )}

            <TicketPackageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={editingPackage ? handleUpdatePackage : handleCreatePackage}
                initialData={editingPackage}
                rafflePrice={raffle.price}
            />
        </div>
    )
}