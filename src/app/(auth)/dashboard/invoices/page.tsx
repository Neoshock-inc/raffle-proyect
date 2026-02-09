'use client'

import { useState, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { useInvoices } from '@/admin/hooks/useInvoices'
import { InvoiceFormModal } from './InvoiceFormModal'
import { Invoice } from '@/types/invoices'
import { Button, Input, Badge } from '@/admin/components/ui'

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
        }
    }, [editingInvoice, create, update])

    const statusVariantMap: Record<string, 'success' | 'warning' | 'danger'> = {
        completed: 'success',
        pending: 'warning',
        failed: 'danger',
    }

    const statusLabelMap: Record<string, string> = {
        completed: 'Pagado',
        pending: 'Pendiente',
        failed: 'Fallido',
    }

    return (
        <div className="space-y-6">
            {/* Header con ícono */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white p-2 rounded-full">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Facturas</h2>
                        <p className="text-gray-600 dark:text-gray-400">Listado de facturas generadas por los usuarios</p>
                    </div>
                </div>
                <Button onClick={handleNewInvoice}>
                    Nueva factura
                </Button>
            </div>

            {/* Buscador */}
            <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, nombre o teléfono"
                className="w-full md:w-1/3"
            />

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Número de orden</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{inv.order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{inv.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{inv.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{inv.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${inv.total_price?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge variant={statusVariantMap[inv.status] || 'neutral'}>
                                                {statusLabelMap[inv.status] || inv.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <button
                                                onClick={() => handleEditInvoice(inv)}
                                                className="text-indigo-600 hover:underline text-sm"
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
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                        disabled={pagination.page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="px-2">Página {pagination.page} de {pagination.totalPages}</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(Math.min(pagination.page + 1, pagination.totalPages))}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Siguiente
                    </Button>
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
