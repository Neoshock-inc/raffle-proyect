'use client'

import { Info } from 'lucide-react'
import { Input, Checkbox, Select } from '@/admin/components/ui'
import type { WizardFormData } from '@/admin/hooks/useRaffleWizard'
import { useNumberPools } from '@/admin/hooks/useNumberPools'

const raffleTypeOptions = [
    { value: 'daily_am', label: 'Diaria AM' },
    { value: 'daily_pm', label: 'Diaria PM' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quincenal' },
]

interface StepConfigProps {
    formData: WizardFormData
    errors: Record<string, string>
    setField: (field: string, value: unknown) => void
}

export default function StepConfig({ formData, errors, setField }: StepConfigProps) {
    const { pools, loading: loadingPools } = useNumberPools()

    const poolOptions = [
        { value: '', label: loadingPools ? 'Cargando...' : 'Sin pool' },
        ...pools.map(p => ({
            value: p.id,
            label: `${p.name} (${p.total_numbers.toLocaleString()} numeros)`,
        })),
    ]

    const handleLeftoverToggle = (checked: boolean) => {
        setField('is_leftover_raffle', checked)
        if (checked) {
            setField('raffle_type', undefined)
            setField('pool_id', undefined)
        } else {
            setField('raffle_type', 'daily_am')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Configuracion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configura las reglas y limites de tu rifa</p>
            </div>

            {/* Leftover raffle toggle */}
            <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-900/10">
                <Checkbox
                    label="Rifa de números sobrantes"
                    checked={formData.is_leftover_raffle ?? false}
                    onChange={(e) => handleLeftoverToggle(e.target.checked)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Usa números sobrantes de una rifa física. Podrás cargar un Excel/CSV con los números disponibles.
                </p>
                {formData.is_leftover_raffle && (
                    <div className="flex items-start gap-2 mt-3 ml-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Se creará un pool personalizado automáticamente. Podrás cargar el Excel en la pestaña Números del detalle de la rifa.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!formData.is_leftover_raffle && (
                    <>
                        <Select
                            label="Tipo de rifa"
                            options={raffleTypeOptions}
                            value={formData.raffle_type || 'daily_am'}
                            onChange={(e) => setField('raffle_type', e.target.value)}
                        />

                        <Select
                            label="Pool de numeros"
                            options={poolOptions}
                            value={formData.pool_id || ''}
                            onChange={(e) => setField('pool_id', e.target.value || undefined)}
                        />
                    </>
                )}

                {/* Total de números: se oculta si es sobrantes o tiene pool vinculado */}
                {formData.is_leftover_raffle ? (
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total de números</span>
                        <span className="text-sm text-amber-600 dark:text-amber-400">
                            Se calculará al cargar el Excel
                        </span>
                    </div>
                ) : formData.pool_id ? (
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total de números</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Definido por el pool seleccionado
                        </span>
                    </div>
                ) : (
                    <Input
                        label="Total de números"
                        required
                        type="number"
                        placeholder='Ejemplo: "100"'
                        value={formData.total_numbers || ''}
                        onChange={(e) => setField('total_numbers', Number(e.target.value))}
                        error={errors.total_numbers}
                    />
                )}

                <Input
                    label="Tickets minimos para activar"
                    type="number"
                    placeholder="Ej: 10"
                    value={formData.min_tickets_to_activate ?? 1}
                    onChange={(e) => setField('min_tickets_to_activate', Number(e.target.value))}
                    error={errors.min_tickets_to_activate}
                />

                <Input
                    label="Max. tickets por usuario"
                    type="number"
                    placeholder="Sin limite"
                    value={formData.max_tickets_per_user ?? ''}
                    onChange={(e) =>
                        setField('max_tickets_per_user', e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    helperText="Dejar vacio para sin limite"
                />

                <Input
                    label="Marketing Boost %"
                    type="number"
                    placeholder="0"
                    value={formData.MARKETING_BOOST_PERCENTAGE ?? 0}
                    onChange={(e) => setField('MARKETING_BOOST_PERCENTAGE', Number(e.target.value))}
                    helperText="Porcentaje de incremento artificial del progreso"
                />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Opciones de visualizacion</h4>
                <div className="space-y-3">
                    <Checkbox
                        label="Mostrar cuenta regresiva"
                        checked={formData.show_countdown ?? true}
                        onChange={(e) => setField('show_countdown', e.target.checked)}
                    />
                    <Checkbox
                        label="Mostrar barra de progreso"
                        checked={formData.show_progress_bar ?? true}
                        onChange={(e) => setField('show_progress_bar', e.target.checked)}
                    />
                </div>
            </div>
        </div>
    )
}
