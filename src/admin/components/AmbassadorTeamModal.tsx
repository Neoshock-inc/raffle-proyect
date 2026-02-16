'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { getReferidosByAmbassador, Referido } from '@/admin/services/referidoService'
import type { Ambassador } from '@/admin/types/ambassador'
import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { toast } from 'sonner'

interface Props {
    isOpen: boolean
    onClose: () => void
    ambassador: Ambassador
}

export default function AmbassadorTeamModal({ isOpen, onClose, ambassador }: Props) {
    const [referidos, setReferidos] = useState<Referido[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && ambassador) {
            setLoading(true)
            getReferidosByAmbassador(ambassador.id)
                .then(setReferidos)
                .catch(() => toast.error('Error al cargar equipo'))
                .finally(() => setLoading(false))
        }
    }, [isOpen, ambassador])

    const totalSales = referidos.reduce((sum, r) => sum + (r.total_sales || 0), 0)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Equipo de ${ambassador.name}`}
            size="lg"
        >
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg px-3 py-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {referidos.length} referidos
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                    </div>
                ) : referidos.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Este embajador aún no tiene referidos en su equipo
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Código</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ventas</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comisión</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {referidos.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{r.name}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400">{r.referral_code}</td>
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                            ${(r.total_sales || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                            ${(r.total_commission || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Badge variant={r.is_active ? 'success' : 'danger'}>
                                                {r.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    )
}
