'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Package, Star, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { Raffle, UpdateRaffleData } from '../../types/raffle'
import { useTicketPackages } from '../../hooks/useTicketPackages'
import { Modal, Input, Select, Checkbox, Button, FormField } from '../ui'
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

const promotionTypeOptions = [
    { value: 'none', label: 'Sin promoción' },
    { value: 'discount', label: 'Descuento (%)' },
    { value: 'bonus', label: 'Tickets bonus' },
    { value: '2x1', label: '2x1' },
    { value: '3x2', label: '3x2' },
]

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Editar Paquete' : 'Nuevo Paquete de Tickets'}
            size="2xl"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving} loading={saving}>
                        {saving ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')} Paquete
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre del Paquete"
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Paquete Básico"
                        disabled={saving}
                    />

                    <Input
                        label="Cantidad de Tickets"
                        required
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                        min={1}
                        disabled={saving}
                    />

                    <Input
                        label="Precio Base"
                        required
                        type="number"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                        min={0.01}
                        disabled={saving}
                    />

                    <Select
                        label="Tipo de Promoción"
                        options={promotionTypeOptions}
                        value={formData.promotion_type}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            promotion_type: e.target.value as PromotionType,
                            promotion_value: 0
                        }))}
                        disabled={saving}
                    />

                    {(formData.promotion_type === 'discount' || formData.promotion_type === 'bonus') && (
                        <Input
                            label={formData.promotion_type === 'discount' ? 'Porcentaje de Descuento' : 'Tickets Bonus'}
                            type="number"
                            value={formData.promotion_value}
                            onChange={(e) => setFormData(prev => ({ ...prev, promotion_value: parseInt(e.target.value) || 0 }))}
                            min={0}
                            max={formData.promotion_type === 'discount' ? 100 : undefined}
                            disabled={saving}
                        />
                    )}

                    <FormField label="Color Primario">
                        <input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="w-full h-10 border border-gray-300 rounded-md"
                            disabled={saving}
                        />
                    </FormField>

                    <Input
                        label="Badge (Opcional)"
                        type="text"
                        value={formData.badge_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                        placeholder="Ej: MÁS POPULAR"
                        disabled={saving}
                    />
                </div>

                <Checkbox
                    label="Destacar este paquete"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    disabled={saving}
                />

                {/* Preview */}
                <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Vista Previa</h4>
                    <div
                        className="border-2 rounded-lg p-4 text-center relative dark:bg-gray-800"
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

                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{formData.name || 'Nombre del paquete'}</h3>
                        <div className="text-2xl font-bold mt-2" style={{ color: formData.primary_color }}>
                            ${calculateFinalPrice().toFixed(2)}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 mt-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Obtienes</div>
                            <div className="text-lg font-semibold" style={{ color: formData.primary_color }}>
                                {calculateTotalTickets()} tickets
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    )
}

export default function RaffleTicketsTab({ raffle, onRaffleUpdate }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<TicketPackage | undefined>()

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
                raffle_id: editingPackage.raffle_id,
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
                    <Button onClick={refetch}>
                        Reintentar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paquetes de Tickets</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gestiona los diferentes paquetes de tickets y promociones para tu rifa
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading}
                    icon={<Plus className="h-4 w-4" />}
                >
                    Nuevo Paquete
                </Button>
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
                            className="relative bg-white dark:bg-gray-900 border-2 rounded-lg p-6 hover:shadow-lg transition-shadow"
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
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pkg.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{pkg.amount} tickets base</p>
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

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Obtienes</div>
                                    <div className="text-xl font-semibold" style={{ color: pkg.primary_color }}>
                                        {calculateTotalTicketsLocal(pkg)} tickets
                                    </div>
                                </div>

                                <div className="flex justify-center items-center space-x-2 pt-4 border-t">
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleMoveUp(pkg)}
                                            disabled={index === 0 || loading}
                                            className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30"
                                            title="Mover arriba"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(pkg)}
                                            disabled={index === packages.length - 1 || loading}
                                            className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-30"
                                            title="Mover abajo"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleEditPackage(pkg)}
                                            className="p-2 text-gray-600 hover:text-indigo-600"
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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No hay paquetes creados
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Crea tu primer paquete de tickets para ofrecer diferentes opciones a tus usuarios
                    </p>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        disabled={loading}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Crear Primer Paquete
                    </Button>
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
