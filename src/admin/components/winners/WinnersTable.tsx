import React from 'react'
import { Eye, UserMinus, Trophy, Calendar, Phone, MapPin, DollarSign } from 'lucide-react'
import { WinnerWithDetails } from '../../services/winnersService'
import { Badge } from '../ui/Badge'

interface WinnersTableProps {
    winners: WinnerWithDetails[]
    loading: boolean
    onViewDetails: (winner: WinnerWithDetails) => void
    onRemoveWinner: (winnerId: string) => void
    updating: boolean
}

/**
 * Componente que muestra una tabla de ganadores con detalles y acciones.
 * @param winners Lista de ganadores con detalles.
 * @param loading Indica si los datos están cargando.
 * @param onViewDetails Función para manejar la visualización de detalles del ganador.
 * @param onRemoveWinner Función para manejar la eliminación de un ganador.
 * @param updating Indica si se está actualizando el estado de un ganador.
 */

export function WinnersTable({
    winners,
    loading,
    onViewDetails,
    onRemoveWinner,
    updating
}: WinnersTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                    <div className="animate-pulse">

                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (winners.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay ganadores</h3>
                    <p className="text-gray-600 dark:text-gray-400">Aún no se han registrado ganadores en el sistema.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Vista de escritorio */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                                Número
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Participante
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Rifa
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                                Fecha Sorteo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {winners.map((winner) => (
                            <tr key={winner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold text-sm text-center">
                                        {winner.number}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {winner.participant_name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {winner.participant_email}
                                        </div>
                                        {winner.full_name && winner.full_name !== winner.participant_name && (
                                            <div className="text-xs text-gray-400 truncate">
                                                Factura: {winner.full_name}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="max-w-xs">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {winner.raffle_title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Comprado: {formatDate(winner.purchased_at)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-xs">{formatDate(winner.raffle_draw_date)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                                        {winner.phone && (
                                            <div className="flex items-center mb-1 truncate">
                                                <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                                <span className="text-xs">{winner.phone}</span>
                                            </div>
                                        )}
                                        {winner.city && (
                                            <div className="flex items-center mb-1 truncate">
                                                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                                <span className="text-xs">{winner.city}</span>
                                                {winner.province && <span className="text-xs">, {winner.province}</span>}
                                            </div>
                                        )}
                                        {winner.invoice_details && (
                                            <div className="flex items-center text-xs text-green-600">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                {formatCurrency(winner.invoice_details.total_price)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="space-y-1">
                                        <Badge variant={winner.payment_status === 'paid' ? 'success' : 'warning'}>
                                            {winner.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </Badge>
                                        {winner.invoice_details && (
                                            <div>
                                                <Badge variant={winner.invoice_details.status === 'completed' ? 'success' : 'danger'}>
                                                    F: {winner.invoice_details.status === 'completed' ? 'Ok' : 'Pend'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => onViewDetails(winner)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onRemoveWinner(winner.id)}
                                            disabled={updating}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                            title="Remover como ganador"
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vista móvil/tablet */}
            <div className="lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {winners.map((winner) => (
                        <div key={winner.id} className="p-4 hover:bg-gray-50">
                            {/* Header con número y acciones */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
                                    Número {winner.number}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onViewDetails(winner)}
                                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                        title="Ver detalles"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveWinner(winner.id)}
                                        disabled={updating}
                                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 disabled:opacity-50"
                                        title="Remover como ganador"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Información principal */}
                            <div className="space-y-2 mb-3">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{winner.participant_name}</div>
                                    <div className="text-sm text-gray-500">{winner.participant_email}</div>
                                    {winner.full_name && winner.full_name !== winner.participant_name && (
                                        <div className="text-xs text-gray-400">Factura: {winner.full_name}</div>
                                    )}
                                </div>

                                <div className="text-sm">
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{winner.raffle_title}</div>
                                    <div className="text-gray-500 text-xs">
                                        Sorteo: {formatDate(winner.raffle_draw_date)} • Comprado: {formatDate(winner.purchased_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Información de contacto */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                                {winner.phone && (
                                    <div className="flex items-center">
                                        <Phone className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-gray-600">{winner.phone}</span>
                                    </div>
                                )}
                                {winner.city && (
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                                        <span className="text-gray-600">
                                            {winner.city}{winner.province && `, ${winner.province}`}
                                        </span>
                                    </div>
                                )}
                                {winner.invoice_details && (
                                    <div className="flex items-center">
                                        <DollarSign className="h-3 w-3 text-green-600 mr-2" />
                                        <span className="text-green-600 font-medium">
                                            {formatCurrency(winner.invoice_details.total_price)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Estados */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={winner.payment_status === 'PAID' ? 'success' : 'warning'}>
                                    Pago: {winner.payment_status === 'PAID' ? 'Pagado' : 'Pendiente'}
                                </Badge>
                                {winner.invoice_details && (
                                    <Badge variant={winner.invoice_details.status === 'PAID' ? 'success' : 'danger'}>
                                        Factura: {winner.invoice_details.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}