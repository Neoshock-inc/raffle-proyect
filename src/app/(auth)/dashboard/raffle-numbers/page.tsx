'use client'

import { useState } from 'react'
import { Plus, Ticket } from 'lucide-react'
import { useRaffleEntries } from '@/admin/hooks/useRaffleEntries'
import RaffleEntryModal from '@/admin/components/RaffleEntryModal'
import { Button, Input, Badge } from '@/admin/components/ui'

export default function EntradasRifaPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState('')

    const {
        paginatedEntries,
        pagination,
        setPage,
        loading,
        createEntryFromOrder,
        refetch
    } = useRaffleEntries(search)

    const handleModalSuccess = async () => {
        setIsModalOpen(false)
        await refetch()
    }

    return (
        <div className="space-y-6">
            {/* Header con ícono */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-700 text-white p-2 rounded-full">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entradas de Rifa</h2>
                        <p className="text-gray-600 dark:text-gray-400">Lista de entradas registradas en las rifas</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    icon={<Plus className="h-4 w-4" />}
                >
                    Nueva Entrada
                </Button>
            </div>

            {/* Buscador */}
            <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número o fecha"
                className="w-full md:w-1/3"
            />

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Número</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ganador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comprado el</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
                                    </tr>
                                ))
                            ) : paginatedEntries.length > 0 ? (
                                paginatedEntries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{entry.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge variant={entry.is_winner ? 'success' : 'neutral'}>
                                                {entry.is_winner ? 'Sí' : 'No'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(entry.purchased_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-end items-center space-x-2 mt-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(Math.max(pagination.page - 1, 1))}
                        disabled={pagination.page === 1}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
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

            {/* Modal */}
            <RaffleEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                createEntryFromOrder={createEntryFromOrder}
            />
        </div>
    )
}
