'use client'

import { useState } from 'react'
import { Settings, Save, AlertCircle, Users, Eye, TrendingUp } from 'lucide-react'
import type { Raffle, UpdateRaffleData } from '../../types/raffle'
import { toast } from 'sonner'

interface Props {
    raffle: Raffle
    onUpdate: (data: UpdateRaffleData) => Promise<any>
}

export default function RaffleConfigTab({ raffle, onUpdate }: Props) {
    const [isSaving, setIsSaving] = useState(false)
    const [localConfig, setLocalConfig] = useState({
        show_countdown: raffle.show_countdown || false,
        show_progress_bar: raffle.show_progress_bar || false,
        max_tickets_per_user: raffle.max_tickets_per_user || null,
        min_tickets_to_activate: raffle.min_tickets_to_activate || 1,
        MARKETING_BOOST_PERCENTAGE: raffle.MARKETING_BOOST_PERCENTAGE || 0
    })

    const handleConfigChange = (field: string, value: any) => {
        setLocalConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveConfig = async () => {
        try {
            setIsSaving(true)

            const updateData: UpdateRaffleData = {
                id: raffle.id,
                ...{
                    ...localConfig,
                    max_tickets_per_user: localConfig.max_tickets_per_user ?? undefined
                }
            }

            await onUpdate(updateData)
            toast.success('Configuración guardada exitosamente')
        } catch (error) {
            console.error('Error saving config:', error)
            toast.error('Error al guardar la configuración')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configuración y Límites</h3>
                </div>
                <button
                    onClick={handleSaveConfig}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Configuración de visualización */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    Elementos de Interfaz
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localConfig.show_countdown}
                                onChange={(e) => handleConfigChange('show_countdown', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cuenta Regresiva</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Muestra el tiempo restante hasta el sorteo</p>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localConfig.show_progress_bar}
                                onChange={(e) => handleConfigChange('show_progress_bar', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Barra de Progreso</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Muestra el progreso de tickets vendidos</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Configuración de límites */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    Límites y Restricciones
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Máximo de Tickets por Usuario
                        </label>
                        <input
                            type="number"
                            value={localConfig.max_tickets_per_user || ''}
                            onChange={(e) => handleConfigChange('max_tickets_per_user', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Sin límite"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500">Deja vacío para permitir compras ilimitadas</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mínimo para Activar Rifa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={localConfig.min_tickets_to_activate}
                            onChange={(e) => handleConfigChange('min_tickets_to_activate', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500">Mínimo de tickets que deben venderse para realizar el sorteo</p>
                    </div>
                </div>
            </div>

            {/* Configuración de marketing */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 space-y-6">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Marketing y Promociones
                </h4>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Marketing Boost Percentage
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={localConfig.MARKETING_BOOST_PERCENTAGE}
                                onChange={(e) => handleConfigChange('MARKETING_BOOST_PERCENTAGE', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex items-center gap-2 bg-white rounded-md border border-gray-300 px-2 py-1">
                                <input
                                    type="number"
                                    value={localConfig.MARKETING_BOOST_PERCENTAGE}
                                    onChange={(e) => handleConfigChange('MARKETING_BOOST_PERCENTAGE', parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                    className="w-16 text-center text-sm border-0 focus:ring-0 focus:outline-none"
                                />
                                <span className="text-sm text-gray-600 font-medium">%</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Sin boost</span>
                            <span>Boost máximo</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            El boost de marketing aumenta la visibilidad de tu rifa en el algoritmo de promoción automática.
                        </p>
                    </div>

                    {/* Indicadores visuales del boost */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className={`text-center p-2 rounded-md text-xs ${localConfig.MARKETING_BOOST_PERCENTAGE >= 0 ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'}`}>
                            <div className="font-medium">0-24%</div>
                            <div>Normal</div>
                        </div>
                        <div className={`text-center p-2 rounded-md text-xs ${localConfig.MARKETING_BOOST_PERCENTAGE >= 25 && localConfig.MARKETING_BOOST_PERCENTAGE <= 49 ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                            <div className="font-medium">25-49%</div>
                            <div>Moderado</div>
                        </div>
                        <div className={`text-center p-2 rounded-md text-xs ${localConfig.MARKETING_BOOST_PERCENTAGE >= 50 && localConfig.MARKETING_BOOST_PERCENTAGE <= 74 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                            <div className="font-medium">50-74%</div>
                            <div>Alto</div>
                        </div>
                        <div className={`text-center p-2 rounded-md text-xs ${localConfig.MARKETING_BOOST_PERCENTAGE >= 75 ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-400'}`}>
                            <div className="font-medium">75-100%</div>
                            <div>Máximo</div>
                        </div>
                    </div>

                    {localConfig.MARKETING_BOOST_PERCENTAGE > 75 && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-800">
                                <strong>Boost máximo activado:</strong> Este nivel de promoción está reservado para rifas especiales o eventos importantes. Puede generar costos adicionales significativos.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen visual de la configuración */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Resumen de Configuración Actual</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className={`font-semibold ${localConfig.show_countdown ? 'text-green-600' : 'text-gray-500'}`}>
                            {localConfig.show_countdown ? 'Activado' : 'Desactivado'}
                        </div>
                        <div className="text-gray-600 text-xs">Cuenta Regresiva</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className={`font-semibold ${localConfig.show_progress_bar ? 'text-green-600' : 'text-gray-500'}`}>
                            {localConfig.show_progress_bar ? 'Activado' : 'Desactivado'}
                        </div>
                        <div className="text-gray-600 text-xs">Barra Progreso</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {localConfig.max_tickets_per_user || '∞'}
                        </div>
                        <div className="text-gray-600 text-xs">Máx. por Usuario</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className={`font-semibold ${localConfig.MARKETING_BOOST_PERCENTAGE >= 75 ? 'text-red-600' :
                                localConfig.MARKETING_BOOST_PERCENTAGE >= 50 ? 'text-orange-600' :
                                    localConfig.MARKETING_BOOST_PERCENTAGE >= 25 ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                            {localConfig.MARKETING_BOOST_PERCENTAGE}%
                        </div>
                        <div className="text-gray-600 text-xs">Marketing Boost</div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <h5 className="font-medium mb-2">Notas importantes:</h5>
                        <ul className="space-y-1 text-xs">
                            <li>• Los cambios se aplicarán inmediatamente después de guardar</li>
                            <li>• Las modificaciones de límites afectan solo a nuevas compras</li>
                            <li>• El marketing boost puede generar costos promocionales adicionales</li>
                            <li>• Los elementos de interfaz mejoran la experiencia del usuario</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}