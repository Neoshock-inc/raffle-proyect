// hooks/useTenantImpersonation.ts
import { useState, useEffect, useCallback } from 'react'
import { tenantService } from '../services/tenantService'

interface ImpersonationContext {
    isImpersonating: boolean
    originalContext: string
    impersonatedTenant: {
        id: string
        name: string
        slug: string
    }
    timestamp: string
}

export const useTenantImpersonation = () => {
    const [impersonationContext, setImpersonationContext] = useState<ImpersonationContext | null>(null)

    // Verificar contexto de impersonación al cargar
    useEffect(() => {
        const context = tenantService.getImpersonationContext()
        setImpersonationContext(context)
    }, [])

    // Impersonar tenant
    const startImpersonation = useCallback(async (tenantId: string) => {
        try {
            const result = await tenantService.impersonateTenant(tenantId)

            if (result.success) {
                const newContext = {
                    isImpersonating: true,
                    originalContext: 'super_admin',
                    impersonatedTenant: result.tenant,
                    timestamp: new Date().toISOString()
                }
                setImpersonationContext(newContext)
            }

            return result
        } catch (error) {
            console.error('Error starting impersonation:', error)
            throw error
        }
    }, [])

    // Salir del modo impersonación
    const stopImpersonation = useCallback(async () => {
        try {
            await tenantService.stopImpersonation()
            setImpersonationContext(null)
            return { success: true }
        } catch (error) {
            console.error('Error stopping impersonation:', error)
            throw error
        }
    }, [])

    return {
        impersonationContext,
        isImpersonating: !!impersonationContext?.isImpersonating,
        impersonatedTenant: impersonationContext?.impersonatedTenant || null,
        startImpersonation,
        stopImpersonation
    }
}