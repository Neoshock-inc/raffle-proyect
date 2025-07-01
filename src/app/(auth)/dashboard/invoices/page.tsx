'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { getInvoicesList } from '../../services/invoicesService'
import classNames from 'classnames'

const ITEMS_PER_PAGE = 10

export default function FacturasPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [filteredInvoices, setFilteredInvoices] = useState<any[]>([])
    const [paginatedInvoices, setPaginatedInvoices] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        async function loadInvoices() {
            try {
                setLoading(true)
                const data = await getInvoicesList()
                setInvoices(data)
                setFilteredInvoices(data)
            } catch (error) {
                console.error('Error al cargar facturas:', error)
            } finally {
                setLoading(false)
            }
        }
        loadInvoices()
    }, [])

    useEffect(() => {
        const term = search.toLowerCase()
        const filtered = invoices.filter((inv: any) =>
            `${inv.order_number}`.includes(term) ||
            `${inv.full_name}`.toLowerCase().includes(term) ||
            `${inv.phone}`.includes(term)
        )
        setFilteredInvoices(filtered)
        setCurrentPage(1)
    }, [search, invoices])

    useEffect(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        setPaginatedInvoices(filteredInvoices.slice(start, end))
    }, [currentPage, filteredInvoices])

    return (
        <div className="space-y-6">
            {/* Header con ícono */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-[#800000] text-white p-2 rounded-full">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Facturas</h2>
                        <p className="text-gray-600">Listado de facturas generadas por los usuarios</p>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número, nombre o teléfono"
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#800000] focus:border-[#800000] transition"
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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(6)].map((__, j) => (
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
                                                inv.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : inv.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            )}>
                                                {inv.status === 'paid' ? 'Pagado' : inv.status === 'pending' ? 'Pendiente' : 'Fallido'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm">
                        Página {currentPage} de {Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage >= Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    )
}
