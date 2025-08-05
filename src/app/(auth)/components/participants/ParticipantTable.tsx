import React from 'react'
import { User, Mail, Calendar, DollarSign, FileText, Clock, CheckCircle, Trash2Icon } from 'lucide-react'
import { ParticipantWithStats } from '../../services/participantsService'

interface ParticipantTableProps {
    participants: ParticipantWithStats[]
    loading: boolean
    onEdit: (participant: ParticipantWithStats) => void
    onDelete: (id: string) => void
    onViewDetails: (participant: ParticipantWithStats) => void
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
    participants,
    loading,
    onEdit,
    onDelete,
    onViewDetails
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Números</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gastado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(7)].map((__, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Números</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gastado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {participants.length > 0 ? (
                            participants.map((participant) => (
                                <tr key={participant.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-[#800000] flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {participant.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            {participant.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-semibold">
                                            {participant.total_numbers}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-xs text-gray-600">
                                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                                Pagadas: {participant.paid_invoices}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                                                Pendientes: {participant.pending_invoices}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                Total: {participant.total_invoices}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-semibold text-green-600">
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            {participant.total_amount_spent.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(participant.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onViewDetails(participant)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Ver detalles"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(participant)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Editar participante"
                                            >
                                                <User className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(participant.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar participante"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No se encontraron participantes
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}