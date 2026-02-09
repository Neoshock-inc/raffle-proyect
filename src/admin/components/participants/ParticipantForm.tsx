import React, { useState, useEffect } from 'react'
import { CreateParticipantData, ParticipantWithStats, UpdateParticipantInput } from '../../services/participantsService'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface ParticipantFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateParticipantData | UpdateParticipantInput) => Promise<void>
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={participant ? 'Editar Participante' : 'Crear Participante'}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                        loading={loading}
                    >
                        {participant ? 'Actualizar' : 'Crear'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre completo"
                    placeholder="Nombre del participante"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                />

                <Input
                    label="Correo electrónico"
                    placeholder="ejemplo@correo.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                />
            </form>
        </Modal>
    )
}
