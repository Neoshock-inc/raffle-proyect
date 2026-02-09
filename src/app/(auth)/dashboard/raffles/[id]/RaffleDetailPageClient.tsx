'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Settings, Package, BarChart3, ArrowLeft, Hash } from 'lucide-react'
import { useRaffle } from '@/admin/hooks/useRaffles'
import type { UpdateRaffleData } from '@/admin/types/raffle'
import { cn } from '@/admin/components/ui/cn'
import { Badge } from '@/admin/components/ui/Badge'

import RaffleGeneralTab from '@/admin/components/raffle/RaffleGeneralTab'
import RaffleTicketsTab from '@/admin/components/raffle/RaffleTicketsTab'
import RaffleStatsTab from '@/admin/components/raffle/RaffleStatsTab'
import RaffleConfigTab from '@/admin/components/raffle/RaffleConfigTab'
import RaffleNumbersTab from '@/admin/components/raffle/RaffleNumbersTab'

interface Props {
    id: string
}

type TabType = 'general' | 'tickets' | 'numbers' | 'config' | 'stats'

export default function RaffleDetailPage({ id }: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('general')

    const { raffle, loading, error, updateRaffle, updating } = useRaffle(id)

    const tabs = [
        { id: 'general' as TabType, name: 'General', icon: Ticket },
        { id: 'tickets' as TabType, name: 'Paquetes de Tickets', icon: Package },
        { id: 'numbers' as TabType, name: 'Números', icon: Hash },
        { id: 'config' as TabType, name: 'Configuración', icon: Settings },
        { id: 'stats' as TabType, name: 'Estadísticas', icon: BarChart3 },
    ]

    const handleUpdate = async (data: UpdateRaffleData) => {
        try {
            await updateRaffle(data)
        } catch (error) {
            console.error('Error updating raffle:', error)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error || !raffle) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">
                    {error || 'Rifa no encontrada'}
                </div>
                <button
                    onClick={() => router.push('/dashboard/raffles')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                    Volver a Rifas
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header con navegación de regreso */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard/raffles')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        disabled={updating}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm">Volver a Rifas</span>
                    </button>
                </div>
                {updating && (
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                        <span className="text-sm">Actualizando...</span>
                    </div>
                )}
            </div>

            {/* Header de la rifa */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-700 dark:bg-indigo-600 text-white p-3 rounded-full">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{raffle.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span>ID: {raffle.id}</span>
                                <span>•</span>
                                <Badge variant={
                                    raffle.status === 'active' ? 'success'
                                    : raffle.status === 'draft' ? 'warning'
                                    : raffle.status === 'paused' ? 'info'
                                    : raffle.status === 'cancelled' ? 'danger'
                                    : 'neutral'
                                }>
                                    {raffle.status}
                                </Badge>
                                <span>•</span>
                                <span>${raffle.price} por ticket</span>
                                <span>•</span>
                                <span>{raffle.total_numbers.toLocaleString()} números</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Sorteo</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-50">
                            {new Date(raffle.draw_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    disabled={updating}
                                    className={cn(
                                        'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap',
                                        activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                                        updating && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-96">
                    {activeTab === 'general' && (
                        <RaffleGeneralTab
                            raffle={raffle}
                            onUpdate={handleUpdate}
                        />
                    )}
                    {activeTab === 'tickets' && (
                        <RaffleTicketsTab
                            raffle={raffle}
                            onRaffleUpdate={handleUpdate}
                        />
                    )}
                    {activeTab === 'numbers' && (
                        <RaffleNumbersTab raffle={raffle} />
                    )}
                    {activeTab === 'config' && (
                        <RaffleConfigTab
                            raffle={raffle}
                            onUpdate={handleUpdate}
                        />
                    )}
                    {activeTab === 'stats' && (
                        <RaffleStatsTab
                            raffle={raffle}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
