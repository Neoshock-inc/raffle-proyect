// hooks/useTenantSettings.ts
import { useState, useCallback } from 'react'
import { tenantService } from '@/app/(auth)/services/tenantService'

interface TenantSettingsForm {
    name: string
    description: string
    layout: string
}

interface UseTenantSettingsProps {
    tenantId: string
    initialData?: {
        name: string
        description?: string
        layout?: string
    }
}

export const useTenantSettings = ({ tenantId, initialData }: UseTenantSettingsProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [saveLoading, setSaveLoading] = useState(false)
    const [formData, setFormData] = useState<TenantSettingsForm>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        layout: initialData?.layout || 'default'
    })
    const [originalData, setOriginalData] = useState<TenantSettingsForm>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        layout: initialData?.layout || 'default'
    })

    // Actualizar los datos cuando cambie initialData
    const updateInitialData = useCallback((data: typeof initialData) => {
        if (data) {
            const newData = {
                name: data.name,
                description: data.description || '',
                layout: data.layout || 'default'
            }
            setFormData(newData)
            setOriginalData(newData)
        }
    }, [])

    // Verificar si hay cambios
    const hasChanges = useCallback(() => {
        return (
            formData.name !== originalData.name ||
            formData.description !== originalData.description ||
            formData.layout !== originalData.layout
        )
    }, [formData, originalData])

    // Actualizar un campo específico
    const updateField = useCallback((field: keyof TenantSettingsForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }, [])

    // Iniciar edición
    const startEditing = useCallback(() => {
        setIsEditing(true)
    }, [])

    // Cancelar edición
    const cancelEditing = useCallback(() => {
        setFormData(originalData)
        setIsEditing(false)
    }, [originalData])

    // Guardar cambios
    const saveChanges = useCallback(async () => {
        if (!hasChanges()) {
            setIsEditing(false)
            return { success: true, data: formData }
        }

        setSaveLoading(true)
        try {
            const updatedTenant = await tenantService.updateTenant(tenantId, formData)

            setOriginalData(formData)
            setIsEditing(false)

            return {
                success: true,
                data: updatedTenant,
                message: 'Configuración actualizada correctamente'
            }
        } catch (error) {
            console.error('Error updating tenant:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al actualizar la configuración'
            }
        } finally {
            setSaveLoading(false)
        }
    }, [tenantId, formData, hasChanges])

    // Validar formulario
    const validateForm = useCallback(() => {
        const errors: Partial<Record<keyof TenantSettingsForm, string>> = {}

        if (!formData.name.trim()) {
            errors.name = 'El nombre es requerido'
        }

        if (formData.name.trim().length < 3) {
            errors.name = 'El nombre debe tener al menos 3 caracteres'
        }

        if (formData.description.length > 500) {
            errors.description = 'La descripción no puede exceder 500 caracteres'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }, [formData])

    // Reset del formulario
    const resetForm = useCallback(() => {
        setFormData(originalData)
    }, [originalData])

    return {
        // Estados
        isEditing,
        saveLoading,
        formData,

        // Acciones
        updateInitialData,
        updateField,
        startEditing,
        cancelEditing,
        saveChanges,
        resetForm,

        // Utilidades
        hasChanges: hasChanges(),
        validation: validateForm()
    }
}