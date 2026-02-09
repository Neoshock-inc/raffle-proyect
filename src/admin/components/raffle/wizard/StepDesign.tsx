'use client'

import { Input, FormField } from '@/admin/components/ui'
import type { WizardFormData } from '@/admin/hooks/useRaffleWizard'

interface StepDesignProps {
    formData: WizardFormData
    errors: Record<string, string>
    setField: (field: string, value: unknown) => void
}

interface ColorPickerFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
}

function ColorPickerField({ label, value, onChange, error }: ColorPickerFieldProps) {
    return (
        <FormField label={label} error={error}>
            <div className="flex items-center gap-3 mt-1">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </FormField>
    )
}

export default function StepDesign({ formData, errors, setField }: StepDesignProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Diseño</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza la apariencia de tu rifa</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPickerField
                    label="Color Primario"
                    value={formData.primary_color || '#800000'}
                    onChange={(v) => setField('primary_color', v)}
                    error={errors.primary_color}
                />
                <ColorPickerField
                    label="Color Secundario"
                    value={formData.secondary_color || '#FFC107'}
                    onChange={(v) => setField('secondary_color', v)}
                    error={errors.secondary_color}
                />
                <ColorPickerField
                    label="Color de Fondo"
                    value={formData.background_color || '#FFFFFF'}
                    onChange={(v) => setField('background_color', v)}
                    error={errors.background_color}
                />
                <ColorPickerField
                    label="Color de Texto"
                    value={formData.text_color || '#333333'}
                    onChange={(v) => setField('text_color', v)}
                    error={errors.text_color}
                />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Imágenes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="URL del Logo"
                        type="url"
                        placeholder="https://ejemplo.com/logo.png"
                        value={formData.logo_url || ''}
                        onChange={(e) => setField('logo_url', e.target.value)}
                        helperText="URL de la imagen del logo de la rifa"
                    />
                    <Input
                        label="URL del Banner"
                        type="url"
                        placeholder="https://ejemplo.com/banner.jpg"
                        value={formData.banner_url || ''}
                        onChange={(e) => setField('banner_url', e.target.value)}
                        helperText="URL de la imagen del banner principal"
                    />
                </div>
            </div>

            {/* Mini Preview */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vista previa</h4>
                <div
                    className="rounded-xl p-6 border"
                    style={{
                        backgroundColor: formData.background_color || '#FFFFFF',
                        borderColor: formData.primary_color || '#800000',
                    }}
                >
                    <h4
                        className="text-lg font-bold mb-2"
                        style={{ color: formData.text_color || '#333333' }}
                    >
                        {formData.title || 'Título de la rifa'}
                    </h4>
                    <p
                        className="text-sm mb-3"
                        style={{ color: formData.text_color || '#333333', opacity: 0.7 }}
                    >
                        {formData.description || 'Descripción de la rifa'}
                    </p>
                    <div className="flex gap-2">
                        <span
                            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: formData.primary_color || '#800000' }}
                        >
                            Comprar
                        </span>
                        <span
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: formData.secondary_color || '#FFC107',
                                color: formData.text_color || '#333333',
                            }}
                        >
                            ${formData.price || '0.00'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
