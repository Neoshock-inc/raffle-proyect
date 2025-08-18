import React from 'react'
import { X, User, Mail, Phone, MapPin, Calendar, Trophy, CreditCard } from 'lucide-react'
import { WinnerWithDetails } from '../../services/winnersService'

interface WinnerDetailsProps {
    isOpen: boolean
    onClose: () => void
    winner: WinnerWithDetails | null
}

export function WinnerDetails({ isOpen, onClose, winner }: WinnerDetailsProps) {
    if (!isOpen || !winner) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-sky-700 text-white px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6" />
                                <div>
                                    <h3 className="text-xl font-semibold">Detalles del Ganador</h3>
                                    <p className="text-red-100">Número ganador: {winner.number}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-red-200 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Información de la Rifa */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    Información de la Rifa
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm text-gray-600">Título:</span>
                                        <p className="font-medium">{winner.raffle_title}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Fecha de Sorteo:</span>
                                        <p className="font-medium">{formatDate(winner.raffle_draw_date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Número Ganador:</span>
                                        <p className="font-bold text-lg text-sky-700">{winner.number}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Fecha de Compra:</span>
                                        <p className="font-medium">{formatDate(winner.purchased_at)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Estado de Pago: </span>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${winner.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {winner.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Participante */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Información del Participante
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm text-gray-600">Nombre:</span>
                                        <p className="font-medium">{winner.participant_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Email:</span>
                                        <p className="font-medium">{winner.participant_email}</p>
                                    </div>
                                    {winner.full_name && winner.full_name !== winner.participant_name && (
                                        <div>
                                            <span className="text-sm text-gray-600">Nombre Completo (Factura):</span>
                                            <p className="font-medium">{winner.full_name}</p>
                                        </div>
                                    )}
                                    {winner.phone && (
                                        <div>
                                            <span className="text-sm text-gray-600">Teléfono:</span>
                                            <p className="font-medium flex items-center gap-1">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                {winner.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información de Ubicación */}
                            {(winner.country || winner.province || winner.city || winner.address) && (
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        Ubicación
                                    </h4>
                                    <div className="space-y-2">
                                        {winner.country && (
                                            <div>
                                                <span className="text-sm text-gray-600">País:</span>
                                                <p className="font-medium">{winner.country}</p>
                                            </div>
                                        )}
                                        {winner.province && (
                                            <div>
                                                <span className="text-sm text-gray-600">Provincia:</span>
                                                <p className="font-medium">{winner.province}</p>
                                            </div>
                                        )}
                                        {winner.city && (
                                            <div>
                                                <span className="text-sm text-gray-600">Ciudad:</span>
                                                <p className="font-medium">{winner.city}</p>
                                            </div>
                                        )}
                                        {winner.address && (
                                            <div>
                                                <span className="text-sm text-gray-600">Dirección:</span>
                                                <p className="font-medium">{winner.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Información de Facturación */}
                            {winner.invoice_details && (
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-purple-600" />
                                        Información de Facturación
                                    </h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Número de Orden:</span>
                                            <p className="font-medium">{winner.invoice_details.order_number}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Método de Pago:</span>
                                            <p className="font-medium">{winner.invoice_details.payment_method}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Cantidad:</span>
                                            <p className="font-medium">{winner.invoice_details.amount} números</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Total Pagado:</span>
                                            <p className="font-bold text-lg text-green-600">
                                                {formatCurrency(winner.invoice_details.total_price)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Estado de Factura: </span>
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${winner.invoice_details.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {winner.invoice_details.status === 'completed' ? 'Pagada' : 'Pendiente'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Fecha de Factura:</span>
                                            <p className="font-medium">{formatDate(winner.invoice_details.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4">
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}