'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Eye, Edit, Trash2, Copy } from 'lucide-react'
import type { Raffle } from '@/admin/types/raffle'
import { Badge } from '@/admin/components/ui/Badge'
import { cn } from '@/admin/components/ui/cn'

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
    single: 'Única',
}

interface RaffleCardProps {
    raffle: Raffle
    onDelete: (id: string) => void
    onDuplicate: (raffle: Raffle) => void
}

export default function RaffleCard({ raffle, onDelete, onDuplicate }: RaffleCardProps) {
    const router = useRouter()

    const soldCount = 0 // TODO: get from raffle entries count
    const progressPercent = raffle.total_numbers > 0
        ? Math.min((soldCount / raffle.total_numbers) * 100, 100)
        : 0

    const drawDate = new Date(raffle.draw_date)
    const isExpired = drawDate < new Date() && raffle.status !== 'completed'

    // raffle_type is UI-only for now, cast safely
    const raffleType = (raffle as Raffle & { raffle_type?: string }).raffle_type

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow">
            {/* Color bar */}
            <div
                className="h-1.5"
                style={{ backgroundColor: raffle.primary_color || '#4f46e5' }}
            />

            <div className="p-5">
                {/* Header: Title + Status */}
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3
                        className="text-base font-semibold text-gray-900 dark:text-gray-50 line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => router.push(`/dashboard/raffles/${raffle.id}`)}
                    >
                        {raffle.title}
                    </h3>
                    <Badge variant={statusVariantMap[raffle.status] || 'neutral'} className="shrink-0">
                        {statusLabels[raffle.status] || raffle.status}
                    </Badge>
                </div>

                {/* Type tag */}
                {raffleType && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {raffleTypeLabels[raffleType] || raffleType}
                    </span>
                )}

                {/* Info rows */}
                <div className="space-y-2 mb-4 mt-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Precio</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">${raffle.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Números</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{raffle.total_numbers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Sorteo
                        </span>
                        <span className={cn(
                            'font-medium',
                            isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                        )}>
                            {drawDate.toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progreso</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all"
                            style={{
                                width: `${progressPercent}%`,
                                backgroundColor: raffle.primary_color || '#4f46e5',
                            }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => router.push(`/dashboard/raffles/${raffle.id}`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                        title="Ver detalles"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDuplicate(raffle)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                        title="Duplicar"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => router.push(`/dashboard/raffles/${raffle.id}/edit`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(raffle.id)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="Eliminar"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
