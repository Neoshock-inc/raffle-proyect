'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, Settings, Package, BarChart3, ArrowLeft } from 'lucide-react'
import { useRaffle } from '../../../hooks/useRaffles'
import type { UpdateRaffleData } from '../../../types/raffle'
import classNames from 'classnames'

import RaffleGeneralTab from '@/app/(auth)/components/raffle/RaffleGeneralTab'
import RaffleTicketsTab from '@/app/(auth)/components/raffle/RaffleTicketsTab'
import RaffleStatsTab from '@/app/(auth)/components/raffle/RaffleStatsTab'
import RaffleConfigTab from '@/app/(auth)/components/raffle/RaffleConfigTab'

interface Props {
    id: string
}

type TabType = 'general' | 'tickets' | 'config' | 'stats'

export default function RaffleDetailPage({ id }: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('general')

    const { raffle, loading, error, updateRaffle, updating } = useRaffle(id)

    const tabs = [
        { id: 'general' as TabType, name: 'General', icon: Ticket },
        { id: 'tickets' as TabType, name: 'Paquetes de Tickets', icon: Package },
        { id: 'config' as TabType, name: 'Configuración', icon: Settings },
        { id: 'stats' as TabType, name: 'Estadísticas', icon: BarChart3 },
    ]

    const handleUpdate = async (data: UpdateRaffleData) => {
        try {
            await updateRaffle(data)
            // updateRaffle ya actualiza el estado local, no necesitamos refetch
        } catch (error) {
            console.error('Error updating raffle:', error)
            // El error ya se muestra en el hook, pero podemos agregar lógica adicional aquí si es necesario
            throw error // Re-throw para que los componentes hijos puedan manejarlo
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        )
    }

    if (error || !raffle) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                    {error || 'Rifa no encontrada'}
                </div>
                <button
                    onClick={() => router.push('/dashboard/raffles')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
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
                        className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        disabled={updating}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm">Volver a Rifas</span>
                    </button>
                </div>
                {updating && (
                    <div className="flex items-center gap-2 text-sky-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                        <span className="text-sm">Actualizando...</span>
                    </div>
                )}
            </div>

            {/* Header de la rifa */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-sky-700 text-white p-3 rounded-full">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{raffle.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>ID: {raffle.id}</span>
                                <span>•</span>
                                <span className={classNames(
                                    'px-2 py-1 rounded-full text-xs font-semibold',
                                    {
                                        'bg-green-100 text-green-800': raffle.status === 'active',
                                        'bg-yellow-100 text-yellow-800': raffle.status === 'draft',
                                        'bg-blue-100 text-blue-800': raffle.status === 'paused',
                                        'bg-gray-100 text-gray-800': raffle.status === 'completed',
                                        'bg-red-100 text-red-800': raffle.status === 'cancelled'
                                    }
                                )}>
                                    {raffle.status}
                                </span>
                                <span>•</span>
                                <span>${raffle.price} por ticket</span>
                                <span>•</span>
                                <span>{raffle.total_numbers.toLocaleString()} números</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Sorteo</div>
                        <div className="font-semibold text-gray-900">
                            {new Date(raffle.draw_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    disabled={updating}
                                    className={classNames(
                                        'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap',
                                        activeTab === tab.id
                                            ? 'border-sky-500 text-sky-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
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