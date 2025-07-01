'use client'

import { useEffect, useState } from 'react'
import { Plus, Ticket } from 'lucide-react'
import { raffleService } from '../../services/rafflesService';
import RaffleEntryModal from '../../components/RaffleEntryModal'

const ITEMS_PER_PAGE = 10

export default function EntradasRifaPage() {
    const [raffleEntries, setRaffleEntries] = useState<any[]>([])
    const [filteredEntries, setFilteredEntries] = useState<any[]>([])
    const [paginatedEntries, setPaginatedEntries] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const loadEntries = async () => {
        try {
            setLoading(true)
            const data = await raffleService.getRaffleEntries()
            setRaffleEntries(data)
            setFilteredEntries(data)
        } catch (error) {
            console.error('Error al cargar entradas de rifa:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEntries()
    }, [])

    useEffect(() => {
        const term = search.toLowerCase()
        const filtered = raffleEntries.filter((entry: any) =>
            `${entry.number}`.includes(term) ||
            new Date(entry.purchased_at).toLocaleDateString().includes(term)
        )
        setFilteredEntries(filtered)
        setCurrentPage(1)
    }, [search, raffleEntries])

    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setPaginatedEntries(filteredEntries.slice(startIndex, endIndex))
    }, [currentPage, filteredEntries])

    return (
        <div className="space-y-6">
            {/* Header con ícono */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-[#800000] text-white p-2 rounded-full">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Entradas de Rifa</h2>
                        <p className="text-gray-600">Lista de entradas registradas en las rifas</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Entrada
                </button>
            </div>

            {/* Buscador */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número o fecha"
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#800000] focus:border-[#800000] transition"
            />

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganador</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprado el</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
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
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {entry.is_winner ? (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Sí</span>
                                            ) : (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            {filteredEntries.length > ITEMS_PER_PAGE && (
                <div className="flex justify-end items-center space-x-2 mt-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm">
                        Página {currentPage} de {Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage >= Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal */}
            <RaffleEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    loadEntries()
                }}
            />
        </div>
    )
}
