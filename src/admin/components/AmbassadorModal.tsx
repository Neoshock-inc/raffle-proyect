'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
    createAmbassador,
    updateAmbassador,
} from '../services/ambassadorService'
import type { Ambassador, AmbassadorInput } from '../types/ambassador'
import { buildReferralLink } from '../utils/tenantUrl'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Checkbox } from './ui/Checkbox'
import { Button } from './ui/Button'

interface AmbassadorModalProps {
    isOpen: boolean
    onClose: () => void
    ambassador?: Ambassador | null
    onSuccess: () => void
}

export default function AmbassadorModal({ isOpen, onClose, ambassador, onSuccess }: AmbassadorModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ambassador_code: '',
        commission_rate: 0.10,
        team_commission_rate: 0.05,
        is_active: true,
        max_referrals: 50,
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [previewUrl, setPreviewUrl] = useState('')

    useEffect(() => {
        if (ambassador) {
            setFormData({
                name: ambassador.name || '',
                email: ambassador.email || '',
                phone: ambassador.phone || '',
                ambassador_code: ambassador.ambassador_code || '',
                commission_rate: ambassador.commission_rate || 0.10,
                team_commission_rate: ambassador.team_commission_rate || 0.05,
                is_active: ambassador.is_active ?? true,
                max_referrals: ambassador.max_referrals || 50,
            })
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                ambassador_code: '',
                commission_rate: 0.10,
                team_commission_rate: 0.05,
                is_active: true,
                max_referrals: 50,
            })
        }
        setErrors({})
        updatePreviewUrl('')
    }, [ambassador, isOpen])

    const updatePreviewUrl = async (code: string) => {
        if (!code) {
            setPreviewUrl('')
            return
        }
        try {
            const url = await buildReferralLink(code)
            setPreviewUrl(url)
        } catch {
            setPreviewUrl(`/?ref=${code}`)
        }
    }

    const generateCode = () => {
        const name = formData.name.trim()
        if (!name) {
            toast.error('Ingresa un nombre primero')
            return
        }
        const cleanName = name.replace(/\s+/g, '').toUpperCase().substring(0, 4)
        const randomPart = Array.from({ length: 10 }, () =>
            Math.random().toString(36)[2].toUpperCase()
        ).join('')
        const code = ('AMB' + cleanName + randomPart).substring(0, 20)
        setFormData(prev => ({ ...prev, ambassador_code: code }))
        updatePreviewUrl(code)
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim() || formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres'
        }

        if (!formData.ambassador_code.trim() || formData.ambassador_code.length < 3) {
            newErrors.ambassador_code = 'El código debe tener al menos 3 caracteres'
        } else if (!/^[A-Z0-9]+$/.test(formData.ambassador_code)) {
            newErrors.ambassador_code = 'Solo letras mayúsculas y números'
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email no válido'
        }

        if (formData.commission_rate < 0 || formData.commission_rate > 1) {
            newErrors.commission_rate = 'La comisión debe estar entre 0% y 100%'
        }

        if (formData.team_commission_rate < 0 || formData.team_commission_rate > 1) {
            newErrors.team_commission_rate = 'La comisión de equipo debe estar entre 0% y 100%'
        }

        if (formData.max_referrals < 1) {
            newErrors.max_referrals = 'El máximo de referidos debe ser al menos 1'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const input: AmbassadorInput = {
                ...formData,
                ambassador_code: formData.ambassador_code.toUpperCase(),
            }

            if (ambassador) {
                await updateAmbassador(ambassador.id, input)
                toast.success('Embajador actualizado correctamente')
            } else {
                await createAmbassador(input)
                toast.success('Embajador creado correctamente')
            }

            onSuccess()
        } catch (error: any) {
            if (error.message === 'duplicate_ambassador_code') {
                setErrors({ ambassador_code: 'Este código ya existe' })
            } else if (error.message === 'email_already_exists') {
                setErrors({ email: 'Este email ya está registrado' })
            } else {
                toast.error(error.message || 'Error al guardar embajador')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={ambassador ? 'Editar Embajador' : 'Nuevo Embajador'}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={(e) => handleSubmit(e as unknown as React.FormEvent)} loading={loading}>
                        {ambassador ? 'Actualizar' : 'Crear'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre" required type="text" id="amb-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={errors.name} placeholder="Nombre del embajador"
                />

                <Input
                    label="Email" type="email" id="amb-email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email} placeholder="email@ejemplo.com"
                />

                <Input
                    label="Teléfono" type="tel" id="amb-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+593 99 999 9999"
                />

                {/* Código de embajador */}
                <div>
                    <label htmlFor="ambassador_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código de Embajador <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text" id="ambassador_code"
                            value={formData.ambassador_code}
                            onChange={(e) => {
                                const v = e.target.value.toUpperCase()
                                setFormData(prev => ({ ...prev, ambassador_code: v }))
                                updatePreviewUrl(v)
                            }}
                            className={`w-full px-3 py-2 border rounded-l-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 ${errors.ambassador_code ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="AMBCODIGO2025"
                        />
                        <button
                            type="button" onClick={generateCode}
                            className="inline-flex items-center px-4 py-2 border border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400 font-medium text-sm bg-white dark:bg-gray-800 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Generar
                        </button>
                    </div>
                    {errors.ambassador_code && <p className="mt-1 text-sm text-red-600">{errors.ambassador_code}</p>}
                    {previewUrl && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Enlace:</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 break-all font-mono">{previewUrl}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Comisión Personal (%)" type="number" id="amb-commission"
                        min={0} max={100} step={0.1}
                        value={formData.commission_rate * 100}
                        onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) / 100 }))}
                        error={errors.commission_rate}
                    />
                    <Input
                        label="Comisión Equipo (%)" type="number" id="amb-team-commission"
                        min={0} max={100} step={0.1}
                        value={formData.team_commission_rate * 100}
                        onChange={(e) => setFormData(prev => ({ ...prev, team_commission_rate: parseFloat(e.target.value) / 100 }))}
                        error={errors.team_commission_rate}
                    />
                </div>

                <Input
                    label="Máx. Referidos" type="number" id="amb-max-referrals"
                    min={1} max={1000}
                    value={formData.max_referrals}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_referrals: parseInt(e.target.value) || 50 }))}
                    error={errors.max_referrals}
                />

                <Checkbox
                    label="Embajador activo" id="amb-is-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
            </form>
        </Modal>
    )
}
