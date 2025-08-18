import React, { useState, useEffect } from 'react'
import { CreateParticipantData, UpdateParticipantData, ParticipantWithStats } from '../../services/participantsService'

interface ParticipantFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateParticipantData | UpdateParticipantData) => Promise<void>
    participant?: ParticipantWithStats | null
    loading: boolean
}

export const ParticipantForm: React.FC<ParticipantFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    participant,
    loading
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        if (participant) {
            setFormData({
                name: participant.name,
                email: participant.email
            })
        } else {
            setFormData({
                name: '',
                email: ''
            })
        }
    }, [participant])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(formData)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                    {participant ? 'Editar Participante' : 'Crear Participante'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo
                        </label>
                        <input
                            placeholder='Nombre del participante'
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            placeholder='ejemplo@correo.com'
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-700 focus:border-sky-700"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-sky-700 text-white rounded-md hover:bg-[#900000] disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (participant ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}