'use client'

import { useRouter } from 'next/navigation'
import { Layers, Settings, Plus } from 'lucide-react'
import type { NumberPool } from '@/types/database'
import { Button } from '@/admin/components/ui'

interface ActivePoolBannerProps {
    pool: NumberPool | null
    loading: boolean
}

export default function ActivePoolBanner({ pool, loading }: ActivePoolBannerProps) {
    const router = useRouter()

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                    </div>
                </div>
            </div>
        )
    }

    if (!pool) {
        return (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-xl">
                            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">Sin pool de numeros activo</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Crea un pool para definir el universo de numeros de tus rifas
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/raffles/pool')}
                        icon={<Plus className="h-4 w-4" />}
                        size="sm"
                    >
                        Crear Pool
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                        <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{pool.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                                Activo
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {pool.total_numbers.toLocaleString()} numeros disponibles
                        </p>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/dashboard/raffles/pool')}
                    icon={<Settings className="h-4 w-4" />}
                >
                    Gestionar
                </Button>
            </div>
        </div>
    )
}
