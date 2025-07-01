'use client'

import { useState, useEffect } from 'react'
import { useRaffles } from '../../hooks/useRaffles'
import { Ticket } from 'lucide-react'
import classNames from 'classnames'
import type { Raffle } from '../../types/raffle'

export default function RafflesPage() {
    const [search, setSearch] = useState('')

    // Usar filtros en el hook para que la búsqueda se haga en el servidor
    const { raffles, loading, pagination, changePage, refetch } = useRaffles({
        filters: search ? { search } : {}
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-[#800000] text-white p-2 rounded-full">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Rifas</h2>
                        <p className="text-gray-600">Listado de rifas creadas</p>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o estado"
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#800000] focus:border-[#800000] transition"
            />

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Números</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha sorteo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(5)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : raffles.length > 0 ? (
                                raffles.map((raffle) => (
                                    <tr key={raffle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{raffle.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${raffle.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{raffle.total_numbers}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(raffle.draw_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={classNames(
                                                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                                                    {
                                                        'bg-green-100 text-green-800': raffle.status === 'active',
                                                        'bg-yellow-100 text-yellow-800': raffle.status === 'draft',
                                                        'bg-blue-100 text-blue-800': raffle.status === 'paused',
                                                        'bg-gray-100 text-gray-800': raffle.status === 'completed',
                                                        'bg-red-100 text-red-800': raffle.status === 'cancelled'
                                                    }
                                                )}
                                            >
                                                {raffle.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {search ? 'No se encontraron rifas con ese criterio de búsqueda' : 'No se encontraron rifas'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación del servidor */}
            {pagination.total_pages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} rifas
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => changePage(Math.max(pagination.page - 1, 1))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm">
                            Página {pagination.page} de {pagination.total_pages}
                        </span>
                        <button
                            onClick={() => changePage(Math.min(pagination.page + 1, pagination.total_pages))}
                            disabled={pagination.page >= pagination.total_pages}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}