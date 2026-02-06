// 📁 components/tenant-details/tabs/RafflesTab.tsx
import { BasicRaffle } from '@/admin/types/tenant'
import { Gift, Plus, Eye, MoreHorizontal } from 'lucide-react'
import { JSX } from 'react'

interface RafflesTabProps {
    raffles: BasicRaffle[]
    loading: boolean
    onCreateRaffle: () => void
    onViewRaffle: (raffleId: string) => void
    getRaffleStatusBadge: (status: string) => JSX.Element
}

export function RafflesTab({
    raffles,
    loading,
    onCreateRaffle,
    onViewRaffle,
    getRaffleStatusBadge
}: RafflesTabProps) {
    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando rifas...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Rifas del Tenant
                </h3>
                <button
                    type="button"
                    onClick={onCreateRaffle}
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                >
                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Nueva Rifa
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
                {raffles && raffles.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {raffles.map((raffle) => (
                            <div key={raffle.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1">
                                        <Gift className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {raffle.title}
                                                </p>
                                                {getRaffleStatusBadge(raffle.status)}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                                                <span>${raffle.price}</span>
                                                <span>{raffle.total_numbers} números</span>
                                                <span>
                                                    Sorteo: {new Date(raffle.draw_date).toLocaleDateString('es-ES')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => onViewRaffle(raffle.id)}
                                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No hay rifas creadas
                        </h4>
                        <p className="text-gray-500 mb-4">
                            Crea la primera rifa para este tenant y comienza a generar ingresos.
                        </p>
                        <button
                            type="button"
                            onClick={onCreateRaffle}
                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                        >
                            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Crear Primera Rifa
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
