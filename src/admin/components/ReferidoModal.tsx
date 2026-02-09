// src/admin/components/ReferidoModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    createReferido,
    updateReferido,
    ReferidoInput,
    Referido,
} from '../services/referidoService'
import { buildReferralLink } from '../utils/tenantUrl'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Checkbox } from './ui/Checkbox'
import { Button } from './ui/Button'

interface ReferidoModalProps {
    isOpen: boolean
    onClose: () => void
    referido?: Referido | null
    onSuccess: () => void
}

export default function ReferidoModal({ isOpen, onClose, referido, onSuccess }: ReferidoModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        referral_code: '',
        commission_rate: 0.10,
        is_active: true
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [previewUrl, setPreviewUrl] = useState('')

    useEffect(() => {
        if (referido) {
            setFormData({
                name: referido.name || '',
                email: referido.email || '',
                phone: referido.phone || '',
                referral_code: referido.referral_code || '',
                commission_rate: referido.commission_rate || 0.10,
                is_active: referido.is_active ?? true
            })
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                referral_code: '',
                commission_rate: 0.10,
                is_active: true
            })
        }
        setErrors({})
        updatePreviewUrl('')
    }, [referido, isOpen])

    const updatePreviewUrl = async (code: string) => {
        if (!code) {
            setPreviewUrl('')
            return
        }

        try {
            const url = await buildReferralLink(code)
            setPreviewUrl(url)
        } catch (error) {
            console.error('Error building referral link:', error)
            setPreviewUrl(`[Error generando enlace]/?ref=${code}`)
        }
    }

    const generateReferralCode = () => {
        const name = formData.name.trim()
        if (!name) {
            toast.error('Ingresa un nombre primero')
            return
        }

        const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 5)

        const randomPart = Array.from({ length: 10 }, () =>
            Math.random().toString(36)[2].toUpperCase()
        ).join('')

        const code = (cleanName + randomPart).substring(0, 20)
        setFormData(prev => ({ ...prev, referral_code: code }))
        updatePreviewUrl(code)
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio'
        }

        if (formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres'
        } else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/i.test(formData.name)) {
            newErrors.name = 'El nombre solo puede contener letras y espacios'
        }

        if (formData.phone && !/^\+?\d{7,15}$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono no es válido'
        }

        if (!formData.referral_code.trim()) {
            newErrors.referral_code = 'El código de referido es obligatorio'
        } else if (formData.referral_code.length < 3) {
            newErrors.referral_code = 'El código debe tener al menos 3 caracteres'
        } else if (!/^[A-Z0-9]+$/.test(formData.referral_code)) {
            newErrors.referral_code = 'El código solo puede contener letras mayúsculas y números'
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido'
        }

        if (formData.commission_rate < 0 || formData.commission_rate > 1) {
            newErrors.commission_rate = 'La comisión debe estar entre 0% y 100%'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const input: ReferidoInput = {
                ...formData,
                referral_code: formData.referral_code.toUpperCase(),
            }

            if (referido) {
                await updateReferido(referido.id, input)
                toast.success('Referido actualizado correctamente')
            } else {
                console.log('Creating new referido with input:', input)
                await createReferido(input)
                toast.success('Referido creado correctamente')
            }

            onSuccess()
        } catch (error: any) {
            if (error.message === 'duplicate_referral_code') {
                setErrors({ referral_code: 'Este código ya existe' })
            } else if (error.message === 'email_already_exists') {
                setErrors({ email: 'Este email ya está registrado' })
            } else {
                console.error('Error saving referido:', error)
                toast.error(error.message || 'Error al guardar referido')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleReferralCodeChange = (value: string) => {
        const upperValue = value.toUpperCase()
        setFormData(prev => ({ ...prev, referral_code: upperValue }))
        updatePreviewUrl(upperValue)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={referido ? 'Editar Referido' : 'Nuevo Referido'}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                        loading={loading}
                    >
                        {referido ? 'Actualizar' : 'Crear'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre"
                    required
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={errors.name}
                    placeholder="Nombre del referido"
                />

                <Input
                    label="Email"
                    required
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email}
                    placeholder="email@ejemplo.com"
                />

                <Input
                    label="Teléfono"
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    error={errors.phone}
                    placeholder="+593 99 999 9999"
                />

                {/* Código de Referido */}
                <div>
                    <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código de Referido <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text"
                            id="referral_code"
                            value={formData.referral_code}
                            onChange={(e) => handleReferralCodeChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-l-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 ${errors.referral_code ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="CODIGO2025"
                        />
                        <button
                            type="button"
                            onClick={generateReferralCode}
                            className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium text-sm bg-white dark:bg-gray-800 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Generar
                        </button>
                    </div>
                    {errors.referral_code && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.referral_code}</p>
                    )}
                    {previewUrl && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Enlace de referido:</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 break-all font-mono">
                                {previewUrl}
                            </p>
                        </div>
                    )}
                </div>

                <Input
                    label="Comisión (%)"
                    type="number"
                    id="commission_rate"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.commission_rate * 100}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        commission_rate: parseFloat(e.target.value) / 100
                    }))}
                    error={errors.commission_rate}
                />

                <Checkbox
                    label="Referido activo"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
            </form>
        </Modal>
    )
}
