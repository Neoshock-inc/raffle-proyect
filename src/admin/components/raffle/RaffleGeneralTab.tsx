'use client'

import { useState, useEffect } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { UpdateRaffleData, RaffleStatus, Raffle } from '../../types/raffle'

interface Props {
    raffle: Raffle
    onUpdate: (data: UpdateRaffleData) => Promise<any>
}

interface EditableFieldProps {
    label: string
    value: string | number
    onChange: (value: string) => void
    type?: 'text' | 'number' | 'textarea' | 'date' | 'color'
    placeholder?: string
    required?: boolean
    min?: number
    max?: number
}

function EditableField({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required = false,
    min,
    max
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [internalValue, setInternalValue] = useState(String(value || ''))

    useEffect(() => {
        setInternalValue(String(value || ''))
    }, [value])

    const handleSave = async () => {
        if (required && !internalValue.trim()) {
            toast.error(`${label} es requerido`)
            return
        }

        if (type === 'number') {
            const numValue = parseFloat(internalValue)
            if (isNaN(numValue)) {
                toast.error(`${label} debe ser un número válido`)
                return
            }
            if (min !== undefined && numValue < min) {
                toast.error(`${label} debe ser mayor o igual a ${min}`)
                return
            }
            if (max !== undefined && numValue > max) {
                toast.error(`${label} debe ser menor o igual a ${max}`)
                return
            }
        }

        onChange(internalValue)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setInternalValue(String(value || ''))
        setIsEditing(false)
    }

    if (type === 'textarea') {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <textarea
                        value={internalValue}
                        onChange={(e) => setInternalValue(e.target.value)}
                        placeholder={placeholder}
                        readOnly={!isEditing}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md resize-vertical ${isEditing
                                ? 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'
                                : 'border-gray-300 bg-gray-50 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                            }`}
                        onClick={() => !isEditing && setIsEditing(true)}
                    />
                    {isEditing ? (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:text-green-800"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-1 text-red-600 hover:text-red-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={isEditing ? type : 'text'}
                    value={internalValue}
                    onChange={(e) => setInternalValue(e.target.value)}
                    placeholder={placeholder}
                    readOnly={!isEditing}
                    min={min}
                    max={max}
                    className={`w-full px-3 py-2 border rounded-md ${isEditing
                            ? 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                            : 'border-gray-300 bg-gray-50 cursor-pointer'
                        } ${type === 'color' ? 'h-12' : ''}`}
                    onClick={() => !isEditing && type !== 'color' && setIsEditing(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && isEditing) handleSave()
                        if (e.key === 'Escape' && isEditing) handleCancel()
                    }}
                />
                {type !== 'color' && (
                    isEditing ? (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:text-green-800"
                            >
                                <Save className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-1 text-red-600 hover:text-red-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )
                )}
            </div>
        </div>
    )
}

export default function RaffleGeneralTab({ raffle, onUpdate }: Props) {
    const [localRaffle, setLocalRaffle] = useState<Raffle>(raffle)

    useEffect(() => {
        setLocalRaffle(raffle)
    }, [raffle])

    const handleFieldUpdate = async (field: keyof Raffle, value: any) => {
        try {
            const updatedData: UpdateRaffleData = {
                id: raffle.id,
                [field]: value
            }

            await onUpdate(updatedData)
            setLocalRaffle(prev => ({ ...prev, [field]: value }))
            toast.success('Campo actualizado correctamente')
        } catch (error) {
            console.error('Error updating field:', error)
            toast.error('Error al actualizar el campo')
        }
    }

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        return new Date(dateString).toISOString().slice(0, 16)
    }

    const handleDateChange = (value: string) => {
        const isoString = new Date(value).toISOString()
        handleFieldUpdate('draw_date', isoString)
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información General</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">ID: {raffle.id}</span>
            </div>

            {/* Información básica de la rifa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                    label="Título"
                    value={localRaffle.title}
                    onChange={(value) => handleFieldUpdate('title', value)}
                    placeholder="Nombre de la rifa"
                    required
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={localRaffle.status}
                        onChange={(e) => handleFieldUpdate('status', e.target.value as RaffleStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                        <option value="draft">Borrador</option>
                        <option value="active">Activa</option>
                        <option value="paused">Pausada</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>

                <EditableField
                    label="Precio por Ticket"
                    value={localRaffle.price}
                    onChange={(value) => handleFieldUpdate('price', parseFloat(value))}
                    type="number"
                    placeholder="0.00"
                    required
                    min={0}
                />

                <EditableField
                    label="Total de Números"
                    value={localRaffle.total_numbers}
                    onChange={(value) => handleFieldUpdate('total_numbers', parseInt(value))}
                    type="number"
                    placeholder="1000"
                    required
                    min={1}
                />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha del Sorteo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={formatDateForInput(localRaffle.draw_date)}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Descripción */}
            <EditableField
                label="Descripción"
                value={localRaffle.description || ''}
                onChange={(value) => handleFieldUpdate('description', value)}
                type="textarea"
                placeholder="Describe los detalles de la rifa, premios, términos y condiciones..."
            />

            {/* URLs de imágenes */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Imágenes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                        label="URL del Logo"
                        value={localRaffle.logo_url || ''}
                        onChange={(value) => handleFieldUpdate('logo_url', value)}
                        placeholder="https://ejemplo.com/logo.jpg"
                    />
                    <EditableField
                        label="URL del Banner"
                        value={localRaffle.banner_url || ''}
                        onChange={(value) => handleFieldUpdate('banner_url', value)}
                        placeholder="https://ejemplo.com/banner.jpg"
                    />
                </div>
            </div>

            {/* Configuración visual */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Colores de la Interfaz</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <EditableField
                        label="Color Primario"
                        value={localRaffle.primary_color}
                        onChange={(value) => handleFieldUpdate('primary_color', value)}
                        type="color"
                    />
                    <EditableField
                        label="Color Secundario"
                        value={localRaffle.secondary_color}
                        onChange={(value) => handleFieldUpdate('secondary_color', value)}
                        type="color"
                    />
                    <EditableField
                        label="Color de Fondo"
                        value={localRaffle.background_color}
                        onChange={(value) => handleFieldUpdate('background_color', value)}
                        type="color"
                    />
                    <EditableField
                        label="Color de Texto"
                        value={localRaffle.text_color || '#212529'}
                        onChange={(value) => handleFieldUpdate('text_color', value)}
                        type="color"
                    />
                </div>
            </div>
        </div>
    )
}