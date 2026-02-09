'use client'

import { Input, Textarea, Select } from '@/admin/components/ui'
import type { WizardFormData } from '@/admin/hooks/useRaffleWizard'
import type { RaffleStatus } from '@/admin/types/raffle'

const statusOptions = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Finalizada' },
    { value: 'cancelled', label: 'Cancelada' },
]

interface StepBasicInfoProps {
    formData: WizardFormData
    errors: Record<string, string>
    setField: (field: string, value: unknown) => void
}

export default function StepBasicInfo({ formData, errors, setField }: StepBasicInfoProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Información Básica</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Define los datos principales de tu rifa</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Input
                        label="Título"
                        required
                        type="text"
                        placeholder='Ejemplo: "Rifa de un coche"'
                        value={formData.title}
                        onChange={(e) => setField('title', e.target.value)}
                        error={errors.title}
                    />
                </div>

                <div className="md:col-span-2">
                    <Textarea
                        label="Descripción"
                        placeholder="Descripción de la rifa"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setField('description', e.target.value)}
                    />
                </div>

                <Input
                    label="Precio"
                    required
                    type="number"
                    placeholder="Precio del ticket"
                    value={formData.price || ''}
                    onChange={(e) => setField('price', Number(e.target.value))}
                    error={errors.price}
                />

                <Input
                    label="Total de números"
                    required
                    type="number"
                    placeholder='Ejemplo: "100"'
                    value={formData.total_numbers || ''}
                    onChange={(e) => setField('total_numbers', Number(e.target.value))}
                    error={errors.total_numbers}
                />

                <Input
                    label="Fecha del sorteo"
                    required
                    type="date"
                    value={formData.draw_date ? formData.draw_date.split('T')[0] : ''}
                    onChange={(e) => setField('draw_date', e.target.value)}
                    error={errors.draw_date}
                />

                <Select
                    label="Estado"
                    options={statusOptions}
                    value={formData.status || 'draft'}
                    onChange={(e) => setField('status', e.target.value as RaffleStatus)}
                />
            </div>
        </div>
    )
}
