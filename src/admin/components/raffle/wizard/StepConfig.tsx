'use client'

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

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Configuracion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configura las reglas y limites de tu rifa</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
