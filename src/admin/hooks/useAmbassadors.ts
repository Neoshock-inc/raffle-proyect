'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
    Ambassador,
    AmbassadorInput,
} from '../types/ambassador'
import {
    getAmbassadors,
    createAmbassador,
    updateAmbassador,
    deleteAmbassador,
    toggleAmbassadorStatus,
} from '../services/ambassadorService'
import { useTenantContext } from './useTenantContext'

export function useAmbassadors() {
    const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    const loadAmbassadors = useCallback(async () => {
        if (tenantLoading) return

        try {
            setLoading(true)
            const data = await getAmbassadors()
            setAmbassadors(data)
        } catch (error) {
            console.error('Error loading ambassadors:', error)
            toast.error('Error al cargar los embajadores')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, isAdmin, tenantLoading])

    const handleCreate = useCallback(async (input: AmbassadorInput) => {
        try {
            setCreating(true)
            await createAmbassador(input)
            toast.success('Embajador creado correctamente')
            await loadAmbassadors()
        } catch (error: any) {
            if (error.message === 'email_already_exists') {
                toast.error('Ya existe un embajador con ese email')
            } else if (error.message === 'duplicate_ambassador_code') {
                toast.error('El código de embajador ya existe')
            } else {
                toast.error('Error al crear el embajador')
            }
            throw error
        } finally {
            setCreating(false)
        }
    }, [currentTenant, isAdmin, loadAmbassadors])

    const handleUpdate = useCallback(async (id: string, input: AmbassadorInput) => {
        try {
            setUpdating(true)
            await updateAmbassador(id, input)
            toast.success('Embajador actualizado correctamente')
            await loadAmbassadors()
        } catch (error: any) {
            if (error.message === 'duplicate_ambassador_code') {
                toast.error('El código de embajador ya existe')
            } else {
                toast.error('Error al actualizar el embajador')
            }
            throw error
        } finally {
            setUpdating(false)
        }
    }, [currentTenant, isAdmin, loadAmbassadors])

    const handleDelete = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            await deleteAmbassador(id)
            toast.success('Embajador eliminado correctamente')
            setAmbassadors(prev => prev.filter(a => a.id !== id))
        } catch (error) {
            console.error('Error deleting ambassador:', error)
            toast.error('Error al eliminar el embajador')
            throw error
        } finally {
            setDeleting(false)
        }
    }, [currentTenant, isAdmin])

    const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
        try {
            await toggleAmbassadorStatus(id, currentStatus)
            setAmbassadors(prev =>
                prev.map(a =>
                    a.id === id ? { ...a, is_active: !currentStatus } : a
                )
            )
            toast.success(`Embajador ${currentStatus ? 'desactivado' : 'activado'} correctamente`)
        } catch (error) {
            console.error('Error toggling status:', error)
            toast.error('Error al cambiar el estado del embajador')
            throw error
        }
    }, [currentTenant, isAdmin])

    const copyAmbassadorLink = useCallback(async (code: string) => {
        const baseUrl = currentTenant?.slug
            ? `https://${currentTenant.slug}`
            : window.location.origin
        const link = `${baseUrl}/?ref=${code}`

        try {
            await navigator.clipboard.writeText(link)
            toast.success('Enlace copiado al portapapeles')
        } catch (error) {
            toast.error('Error al copiar el enlace')
        }
    }, [currentTenant])

    const refreshData = useCallback(() => {
        loadAmbassadors()
    }, [loadAmbassadors])

    useEffect(() => {
        if (!tenantLoading) {
            loadAmbassadors()
        }
    }, [currentTenant?.id, tenantLoading, loadAmbassadors])

    const stats = {
        totalAmbassadors: ambassadors.length,
        totalTeamSales: ambassadors.reduce((sum, a) => sum + (a.total_team_sales || 0), 0),
        totalCommissions: ambassadors.reduce((sum, a) => sum + (a.total_personal_commission || 0) + (a.total_team_commission || 0), 0),
        totalTeamMembers: ambassadors.reduce((sum, a) => sum + (a.team_count || 0), 0),
        activeAmbassadors: ambassadors.filter(a => a.is_active).length,
    }

    return {
        ambassadors,
        stats,
        loading: loading || tenantLoading,
        creating,
        updating,
        deleting,
        loadAmbassadors,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleToggleStatus,
        copyAmbassadorLink,
        refreshData,
        currentTenant,
        isAdmin,
    }
}
