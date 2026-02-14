import React, { useState, useEffect } from 'react'
import { X, User, Mail, Calendar, DollarSign, FileText, Award, Clock, CheckCircle } from 'lucide-react'
import { ParticipantWithStats, getParticipantNumbers, getParticipantInvoices } from '../../services/participantsService'
import { useTenantContext } from '../../contexts/TenantContext'
import { formatTenantCurrency } from '../../utils/currency'

interface ParticipantDetailsProps {
    isOpen: boolean
    onClose: () => void
    participant: ParticipantWithStats | null
}

export const ParticipantDetails: React.FC<ParticipantDetailsProps> = ({
    isOpen,
    onClose,
    participant
}) => {
    const { tenantCountry } = useTenantContext()
    const [numbers, setNumbers] = useState<any[]>([])
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'numbers' | 'invoices'>('overview')

    useEffect(() => {
        if (participant && isOpen) {
            loadDetails()
        }
    }, [participant, isOpen])

    const loadDetails = async () => {
        if (!participant) return

        setLoading(true)
        try {
            const [numbersData, invoicesData] = await Promise.all([
                getParticipantNumbers(participant.id),
                getParticipantInvoices(participant.id)
            ])
            setNumbers(numbersData)
            setInvoices(invoicesData)
        } catch (error) {
            console.error('Error loading participant details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !participant) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-700 dark:bg-indigo-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{participant.name}</h2>
                            <p className="text-gray-600">{participant.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <div className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Resumen', icon: User },
                            { id: 'numbers', label: 'Números', icon: Award },
                            { id: 'invoices', label: 'Facturas', icon: FileText }
                        ].map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-700 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Total Números</p>
                                        <p className="text-2xl font-bold text-blue-900">{participant.total_numbers}</p>
                                    </div>
                                    <Award className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Facturas Pagadas</p>
                                        <p className="text-2xl font-bold text-green-900">{participant.paid_invoices}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-600">Facturas Pendientes</p>
                                        <p className="text-2xl font-bold text-yellow-900">{participant.pending_invoices}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Total Gastado</p>
                                        <p className="text-2xl font-bold text-purple-900">{formatTenantCurrency(participant.total_amount_spent, tenantCountry)}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-purple-500" />
                                </div>
                            </div>

                            <div className="md:col-span-2 lg:col-span-4 bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Información del Participante</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Email:</span>
                                        <span className="text-sm font-medium">{participant.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Registrado:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(participant.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'numbers' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Números Comprados ({numbers.length})
                            </h3>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Cargando números...</p>
                                </div>
                            ) : numbers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Número
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Rifa
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Estado Pago
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Ganador
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Fecha Compra
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {numbers.map((number) => (
                                                <tr key={number.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {number.number}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {number.raffles?.title || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${number.payment_status === 'PAID'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {number.payment_status === 'PAID' ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${number.is_winner
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {number.is_winner ? 'Ganador' : 'No Ganador'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(number.purchased_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron números comprados
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Facturas ({invoices.length})
                            </h3>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Cargando facturas...</p>
                                </div>
                            ) : invoices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Orden
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Estado
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Método Pago
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Cantidad
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Fecha
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {invoice.order_number}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'PAID'
                                                            ? 'bg-green-100 text-green-800'
                                                            : invoice.status === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {invoice.status === 'PAID' ? 'Pagado' :
                                                                invoice.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {invoice.payment_method === 'STRIPE' ? 'Tarjeta' :
                                                            invoice.payment_method === 'BANK_TRANSFER' ? 'Transferencia' : invoice.payment_method}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {invoice.amount}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatTenantCurrency(parseFloat(invoice.total_price), tenantCountry)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(invoice.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron facturas
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}