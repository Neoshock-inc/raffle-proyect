'use client'

import { useState, useCallback } from 'react'
import { FileText } from 'lucide-react'
import classNames from 'classnames'
import { useInvoices } from '../../hooks/useInvoices'
import { InvoiceFormModal } from './InvoiceFormModal'
import { Invoice } from '@/app/types/invoices'

const ITEMS_PER_PAGE = 10

export default function FacturasPage() {
    const [showModal, setShowModal] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [search, setSearch] = useState('')
    const {
        paginatedInvoices,
        filteredInvoices,
        pagination,
        setPage,
        loading,
        create,
        update,
    } = useInvoices(search)

    const handleNewInvoice = useCallback(() => {
        setEditingInvoice(null)
        setShowModal(true)
    }, [])

    const handleEditInvoice = useCallback((invoice: Invoice) => {
        setEditingInvoice(invoice)
        setShowModal(true)
    }, [])

    const handleCloseModal = useCallback(() => {
        setShowModal(false)
        setEditingInvoice(null)
    }, [])

    const handleSaveInvoice = useCallback(async (data: any) => {
        try {
            if (editingInvoice?.id) {
                await update({ ...data, id: editingInvoice.id })
            } else {
                await create(data)
            }
            setShowModal(false)
            setEditingInvoice(null)
        } catch (error) {
            console.error('Error saving invoice:', error)
            // Aquí podrías mostrar un toast de error
        }
    }, [editingInvoice, create, update])

    return (
        <div className="space-y-6">
            {/* Header con ícono */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-700 text-white p-2 rounded-full">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Facturas</h2>
                        <p className="text-gray-600">Listado de facturas generadas por los usuarios</p>
                    </div>
                </div>
                <button
                    onClick={handleNewInvoice}
                    className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-[#990000] transition"
                >
                    Nueva factura
                </button>
            </div>

            {/* Buscador */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, nombre o teléfono"
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-700 focus:border-sky-700 transition"
            />

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de orden</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(7)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginatedInvoices.length > 0 ? (
                                paginatedInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${inv.total_price?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={classNames(
                                                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                                inv.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : inv.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            )}>
                                                {inv.status === 'completed' ? 'Pagado' : inv.status === 'pending' ? 'Pendiente' : 'Fallido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <button
                                                onClick={() => handleEditInvoice(inv)}
                                                className="text-sky-700 hover:underline text-sm"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {filteredInvoices.length > ITEMS_PER_PAGE && (
                <div className="flex justify-end items-center space-x-2 mt-2">
                    <button
                        onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Anterior
                    </button>
                    <span className="px-2">Página {pagination.page} de {pagination.totalPages}</span>
                    <button
                        onClick={() => setPage(Math.min(pagination.page + 1, pagination.totalPages))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <InvoiceFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveInvoice}
                initialData={editingInvoice || undefined}
            />
        </div>
    )
}