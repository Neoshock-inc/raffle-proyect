'use client'

import { useState, useEffect } from 'react'
import { Ticket, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRaffles } from '../../../hooks/useRaffles'
import type { Raffle, RaffleStatus } from '../../../types/raffle'
import DragAndDropImage from '@/app/(auth)/components/DragAndDropImage'
import { useRaffleMedia } from '../../../hooks/useRaffleMedia'

interface Props {
    id: string
}

interface EditableInputProps {
    label: string
    value: string | number
    onChange: (val: string) => void
    type?: React.HTMLInputTypeAttribute
    textarea?: boolean
    placeholder?: string
    className?: string
}

function EditableInput({
    label,
    value,
    onChange,
    type = 'text',
    textarea = false,
    placeholder,
    className = '',
}: EditableInputProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [internalValue, setInternalValue] = useState(String(value))

    useEffect(() => {
        setInternalValue(String(value))
    }, [value])

    const handleSave = () => {
        setIsEditing(false)
        if (internalValue !== String(value)) {
            onChange(internalValue)
        }
    }

    return (
        <div className={`relative mb-5 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {textarea ? (
                <textarea
                    className={`block w-full rounded border px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none transition ${isEditing
                        ? 'border-sky-700 focus:ring-1 focus:ring-sky-700'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        } resize vertical min-h-[80px]`}
                    placeholder={placeholder}
                    value={internalValue}
                    onChange={(e) => setInternalValue(e.target.value)}
                    readOnly={!isEditing}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`block w-full rounded border px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none transition ${isEditing
                        ? 'border-sky-700 focus:ring-1 focus:ring-sky-700'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        }`}
                    value={internalValue}
                    onChange={(e) => setInternalValue(e.target.value)}
                    readOnly={!isEditing}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
            )}

            {/* Botón lápiz solo visible para modo readonly */}
            {!isEditing && (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="absolute right-2 top-[38px] p-1 text-gray-500 hover:text-sky-700 focus:outline-none"
                    aria-label={`Editar ${label.toLowerCase()}`}
                    tabIndex={0}
                >
                    <Pencil size={16} />
                </button>
            )}
        </div>
    )
}

export default function RaffleDetailPage({ id }: Props) {
    const router = useRouter()
    const { raffles, updateRaffle } = useRaffles()
    const [raffle, setRaffle] = useState<Raffle | null>(null)
    const [loading, setLoading] = useState(true)

    const { media, loading: mediaLoading, uploadMedia, deleteMedia, error: mediaError } = useRaffleMedia({
        raffleId: id,
        mediaType: 'image',
    })

    useEffect(() => {
        const found = raffles.find((r) => r.id === id) ?? null
        setRaffle(found)
        setLoading(false)
    }, [id, raffles])

    const handleFieldChange = (field: keyof Raffle, value: any) => {
        if (!raffle) return
        const updated = { ...raffle, [field]: value }
        setRaffle(updated)
        updateRaffle(updated)
    }

    if (loading) return <div>Cargando...</div>
    if (!raffle) return <div>Rifa no encontrada</div>

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center pb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-sky-700 text-white p-3 rounded-full">
                        <Ticket className="h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{raffle.title}</h1>
                </div>
                <button
                    onClick={() => router.push('/dashboard/raffles')}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Volver
                </button>
            </div>
            <div className="p-8 max-w-6xl mx-auto bg-white rounded-lg shadow-md space-y-8">
                {/* Logo y Banner con drag and drop */}
                <div className="flex flex-col md:flex-row md:gap-8">
                    <DragAndDropImage
                        label="Logo"
                        value={raffle.logo_url}
                        onChange={(v) => handleFieldChange('logo_url', v)}
                        raffleId={raffle.id} // ✅ ID real

                        onUpload={uploadMedia}       // <-- función subida aquí
                        mediaList={media}            // opcional, para mostrar lista o previews
                        loading={mediaLoading}
                        error={mediaError}
                    />
                    <DragAndDropImage
                        label="Banner"
                        value={raffle.banner_url}

                        onChange={(v) => handleFieldChange('banner_url', v)}
                        raffleId={raffle.id} // ✅ ID real

                        onUpload={uploadMedia}
                        mediaList={media}
                        loading={mediaLoading}
                        error={mediaError}
                    />
                </div>

                {/* Descripción ocupa 2 columnas */}
                <EditableInput
                    label="Descripción"
                    value={raffle.description || ''}
                    onChange={(v) => handleFieldChange('description', v)}
                    textarea
                    className="md:col-span-2"
                    placeholder="Describe la rifa aquí"
                />

                {/* Resto de campos en grid 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campos editables con lápiz */}
                    <EditableInput
                        label="Título"
                        value={raffle.title}
                        onChange={(v) => handleFieldChange('title', v)}
                        placeholder="Título de la rifa"
                    />
                    <EditableInput
                        label="Total números"
                        value={raffle.total_numbers.toString()}
                        type="number"
                        onChange={(v) => handleFieldChange('total_numbers', parseInt(v))}
                    />

                    {/* Campos sin lápiz - inputs siempre editables */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <input
                            type="number"
                            placeholder="Precio del ticket"

                            className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700 focus:outline-none"
                            value={raffle.price.toString()}
                            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha sorteo</label>
                        <input
                            type="date"
                            placeholder="Fecha del sorteo"
                            className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700 focus:outline-none"
                            value={new Date(raffle.draw_date).toISOString().slice(0, 10)}
                            onChange={(e) => handleFieldChange('draw_date', new Date(e.target.value).toISOString())}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            title="Selecciona una opción"
                            className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700 focus:outline-none"
                            value={raffle.status}
                            onChange={(e) => handleFieldChange('status', e.target.value as RaffleStatus)}
                        >
                            {['draft', 'active', 'paused', 'completed', 'cancelled'].map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color primario</label>
                        <input
                            type="color"
                            placeholder='Ejemplo: "#FF5733"'
                            className="block w-full h-10 rounded border border-gray-300 cursor-pointer"
                            value={raffle.primary_color}
                            onChange={(e) => handleFieldChange('primary_color', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color secundario</label>
                        <input
                            type="color"
                            placeholder='Ejemplo: "#33FF57"'
                            className="block w-full h-10 rounded border border-gray-300 cursor-pointer"
                            value={raffle.secondary_color}
                            onChange={(e) => handleFieldChange('secondary_color', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color fondo</label>
                        <input
                            type="color"
                            placeholder='Ejemplo: "#FFFFFF"'
                            className="block w-full h-10 rounded border border-gray-300 cursor-pointer"
                            value={raffle.background_color}
                            onChange={(e) => handleFieldChange('background_color', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar cuenta regresiva</label>
                        <select
                            title="Selecciona una opción"
                            className="block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700 focus:outline-none"
                            value={raffle.show_countdown ? 'Sí' : 'No'}
                            onChange={(e) => handleFieldChange('show_countdown', e.target.value === 'Sí')}
                        >
                            {['Sí', 'No'].map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Más campos editables con lápiz */}
                    <EditableInput
                        label="Tickets máximos por usuario"
                        value={raffle.max_tickets_per_user?.toString() || ''}
                        type="number"
                        placeholder="Opcional"
                        onChange={(v) => handleFieldChange('max_tickets_per_user', v ? parseInt(v) : undefined)}
                    />
                    <EditableInput
                        label="Tickets mínimos para activar"
                        value={raffle.min_tickets_to_activate.toString()}
                        type="number"
                        onChange={(v) => handleFieldChange('min_tickets_to_activate', parseInt(v))}
                    />
                    <EditableInput
                        label="ID Categoría"
                        value={raffle.category_id || ''}
                        placeholder="Opcional"
                        onChange={(v) => handleFieldChange('category_id', v)}
                    />
                    <EditableInput
                        label="ID Organización"
                        value={raffle.organization_id || ''}
                        placeholder="Opcional"
                        onChange={(v) => handleFieldChange('organization_id', v)}
                    />
                </div>
            </div>
        </>
    )
}
