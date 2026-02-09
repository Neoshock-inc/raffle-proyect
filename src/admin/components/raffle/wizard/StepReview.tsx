'use client'

import { Edit } from 'lucide-react'
import type { WizardFormData } from '@/admin/hooks/useRaffleWizard'
import { Badge } from '@/admin/components/ui/Badge'

const statusVariantMap: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
    active: 'success',
    draft: 'warning',
    paused: 'info',
    completed: 'neutral',
    cancelled: 'danger',
}

const statusLabels: Record<string, string> = {
    active: 'Activa',
    draft: 'Borrador',
    paused: 'Pausada',
    completed: 'Finalizada',
    cancelled: 'Cancelada',
}

const raffleTypeLabels: Record<string, string> = {
    daily_am: 'Diaria AM',
    daily_pm: 'Diaria PM',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
}

interface StepReviewProps {
    formData: WizardFormData
    onEditSection: (step: number) => void
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
                <button
                    type="button"
                    onClick={onEdit}
                    className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                </button>
            </div>
            {children}
        </div>
    )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{value || '—'}</dd>
        </div>
    )
}

export default function StepReview({ formData, onEditSection }: StepReviewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Revisión</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verifica la información antes de guardar</p>
            </div>

            {/* Basic Info */}
            <Section title="Información Básica" onEdit={() => onEditSection(0)}>
                <dl className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <Field label="Título" value={formData.title} />
                    </div>
                    {formData.description && (
                        <div className="col-span-2">
                            <Field label="Descripción" value={formData.description} />
                        </div>
                    )}
                    <Field label="Precio" value={`$${formData.price?.toFixed(2)}`} />
                    <Field label="Total de números" value={formData.total_numbers?.toLocaleString()} />
                    <Field label="Fecha del sorteo" value={formData.draw_date ? new Date(formData.draw_date).toLocaleDateString() : '—'} />
                    <Field
                        label="Estado"
                        value={
                            <Badge variant={statusVariantMap[formData.status || 'draft'] || 'neutral'}>
                                {statusLabels[formData.status || 'draft'] || formData.status}
                            </Badge>
                        }
                    />
                </dl>
            </Section>

            {/* Config */}
            <Section title="Configuración" onEdit={() => onEditSection(1)}>
                <dl className="grid grid-cols-2 gap-3">
                    <Field label="Tipo de rifa" value={raffleTypeLabels[formData.raffle_type || 'daily_am']} />
                    <Field label="Pool de numeros" value={formData.pool_id ? 'Vinculado' : 'Sin pool'} />
                    <Field label="Min. tickets para activar" value={formData.min_tickets_to_activate} />
                    <Field label="Max. tickets por usuario" value={formData.max_tickets_per_user ?? 'Sin limite'} />
                    <Field label="Marketing Boost" value={`${formData.MARKETING_BOOST_PERCENTAGE || 0}%`} />
                    <Field label="Cuenta regresiva" value={formData.show_countdown ? 'Sí' : 'No'} />
                    <Field label="Barra de progreso" value={formData.show_progress_bar ? 'Sí' : 'No'} />
                </dl>
            </Section>

            {/* Design */}
            <Section title="Diseño" onEdit={() => onEditSection(2)}>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">Colores</dt>
                        <div className="flex gap-2">
                            {[formData.primary_color, formData.secondary_color, formData.background_color, formData.text_color].map((color, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div
                                        className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
                                        style={{ backgroundColor: color || '#ccc' }}
                                    />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {formData.logo_url && <Field label="Logo" value={formData.logo_url} />}
                    {formData.banner_url && <Field label="Banner" value={formData.banner_url} />}
                </div>
            </Section>
        </div>
    )
}
