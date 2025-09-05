'use client'

import { useState, useEffect, useCallback } from 'react'

import { toast } from 'sonner'
import { setTenantContext } from '../services/blessedService'
import { Referido, getReferidos, ReferidoInput, createReferido, updateReferido, deleteReferido, toggleReferidoStatus } from '../services/referidoService'
import { useTenantContext } from './useTenantContext'

export function useReferidos() {
    const [referidos, setReferidos] = useState<Referido[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Cargar referidos
    const loadReferidos = useCallback(async () => {
        if (tenantLoading) return

        try {
            setLoading(true)
            
            console.log('📋 [REFERIDOS-HOOK] Loading referidos for tenant:', currentTenant?.name || 'Global')
            
            // CRÍTICO: Establecer contexto antes de las consultas
            setTenantContext(currentTenant?.id || null, isAdmin)
            
            const data = await getReferidos()
            setReferidos(data)
            
            console.log('✅ [REFERIDOS-HOOK] Referidos loaded:', data.length)
        } catch (error) {
            console.error('❌ [REFERIDOS-HOOK] Error loading referidos:', error)
            toast.error('Error al cargar los referidos')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, isAdmin, tenantLoading])

    // Crear referido
    const handleCreate = useCallback(async (input: ReferidoInput) => {
        try {
            setCreating(true)
            
            console.log('➕ [REFERIDOS-HOOK] Creating referido for tenant:', currentTenant?.name || 'Global')
            
            // Establecer contexto antes de crear
            setTenantContext(currentTenant?.id || null, isAdmin)
            
            await createReferido(input)
            toast.success('Referido creado correctamente')
            
            // Recargar lista
            await loadReferidos()
        } catch (error: any) {
            console.error('❌ [REFERIDOS-HOOK] Error creating referido:', error)
            
            if (error.message === 'email_already_exists') {
                toast.error('Ya existe un referido con ese email')
            } else if (error.message === 'duplicate_referral_code') {
                toast.error('El código de referido ya existe')
            } else {
                toast.error('Error al crear el referido')
            }
            throw error
        } finally {
            setCreating(false)
        }
    }, [currentTenant, isAdmin, loadReferidos])

    // Actualizar referido
    const handleUpdate = useCallback(async (id: string, input: ReferidoInput) => {
        try {
            setUpdating(true)
            
            console.log('✏️ [REFERIDOS-HOOK] Updating referido for tenant:', currentTenant?.name || 'Global')
            
            // Establecer contexto antes de actualizar
            setTenantContext(currentTenant?.id || null, isAdmin)
            
            await updateReferido(id, input)
            toast.success('Referido actualizado correctamente')
            
            // Recargar lista
            await loadReferidos()
        } catch (error: any) {
            console.error('❌ [REFERIDOS-HOOK] Error updating referido:', error)
            
            if (error.message === 'duplicate_referral_code') {
                toast.error('El código de referido ya existe')
            } else {
                toast.error('Error al actualizar el referido')
            }
            throw error
        } finally {
            setUpdating(false)
        }
    }, [currentTenant, isAdmin, loadReferidos])

    // Eliminar referido
    const handleDelete = useCallback(async (id: string) => {
        try {
            setDeleting(true)
            
            console.log('🗑️ [REFERIDOS-HOOK] Deleting referido for tenant:', currentTenant?.name || 'Global')
            
            // Establecer contexto antes de eliminar
            setTenantContext(currentTenant?.id || null, isAdmin)
            
            await deleteReferido(id)
            toast.success('Referido eliminado correctamente')
            
            // Actualizar lista local sin recargar
            setReferidos(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error('❌ [REFERIDOS-HOOK] Error deleting referido:', error)
            toast.error('Error al eliminar el referido')
            throw error
        } finally {
            setDeleting(false)
        }
    }, [currentTenant, isAdmin])

    // Cambiar estado activo/inactivo
    const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
        try {
            console.log('🔄 [REFERIDOS-HOOK] Toggling status for tenant:', currentTenant?.name || 'Global')
            
            // Establecer contexto antes de actualizar
            setTenantContext(currentTenant?.id || null, isAdmin)
            
            await toggleReferidoStatus(id, currentStatus)
            
            // Actualizar estado local
            setReferidos(prev => 
                prev.map(r => 
                    r.id === id 
                        ? { ...r, is_active: !currentStatus }
                        : r
                )
            )
            
            toast.success(`Referido ${currentStatus ? 'desactivado' : 'activado'} correctamente`)
        } catch (error) {
            console.error('❌ [REFERIDOS-HOOK] Error toggling status:', error)
            toast.error('Error al cambiar el estado del referido')
            throw error
        }
    }, [currentTenant, isAdmin])

    // Copiar enlace de referido
    const copyReferralLink = useCallback(async (code: string) => {
        // Usar el dominio del tenant si está disponible
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

    // Abrir enlace de referido
    const openReferralLink = useCallback((code: string) => {
        const baseUrl = currentTenant?.slug 
            ? `https://${currentTenant.slug}`
            : window.location.origin
            
        const link = `${baseUrl}/?ref=${code}`
        window.open(link, '_blank')
    }, [currentTenant])

    // Refrescar datos
    const refreshData = useCallback(() => {
        console.log('🔄 [REFERIDOS-HOOK] Manual refresh triggered')
        loadReferidos()
    }, [loadReferidos])

    // Cargar datos cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [REFERIDOS-HOOK] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            loadReferidos()
        }
    }, [currentTenant?.id, tenantLoading, loadReferidos])

    // Estadísticas agregadas
    const stats = {
        totalReferidos: referidos.length,
        totalSales: referidos.reduce((sum, r) => sum + (r.total_sales || 0), 0),
        totalParticipants: referidos.reduce((sum, r) => sum + (r.total_participants || 0), 0),
        totalCommission: referidos.reduce((sum, r) => sum + (r.total_commission || 0), 0),
        activeReferidos: referidos.filter(r => r.is_active).length,
        inactiveReferidos: referidos.filter(r => !r.is_active).length
    }

    return {
        // Datos
        referidos,
        stats,
        
        // Estados
        loading: loading || tenantLoading,
        creating,
        updating,
        deleting,
        
        // Acciones
        loadReferidos,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleToggleStatus,
        copyReferralLink,
        openReferralLink,
        refreshData,
        
        // Info del tenant
        currentTenant,
        isAdmin
    }
}