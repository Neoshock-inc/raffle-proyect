// hooks/useTenantContext.ts
import { useEffect, useState } from 'react'
import { tenantService } from '../services/tenantService'
import { authService } from '../services/authService'
import { supabase } from '../lib/supabaseTenantClient'
import { Tenant } from '../types/tenant'

interface TenantContextData {
  isAdmin: boolean
  currentTenant: Tenant | null
  availableTenants: Tenant[]
  loading: boolean
  setCurrentTenant: (tenant: Tenant | null) => void
}

export const useTenantContext = (): TenantContextData => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  // Función para cambiar tenant que también actualiza el interceptor
  const setCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenantState(tenant)
    // Actualizar el contexto en el cliente de Supabase
    supabase.setTenantContext(tenant?.id || null, isAdmin)
  }

  useEffect(() => {
    const initializeTenantContext = async () => {
      try {
        const user = await authService.getUser()
        if (!user) return

        // Verificar si es admin
        const adminStatus = await tenantService.isUserAdmin(user.id)
        setIsAdmin(adminStatus)

        if (adminStatus) {
          // Si es admin, cargar todos los tenants
          const tenants = await tenantService.getAllTenants()
          setAvailableTenants(tenants)
          // Por defecto, no seleccionar ningún tenant (vista global)
          setCurrentTenant(null)
        } else {
          // Si es customer, obtener su tenant
          const userTenant = await tenantService.getUserTenant(user.id)
          setCurrentTenant(userTenant)
          setAvailableTenants(userTenant ? [userTenant] : [])
        }

        // Establecer el contexto inicial en el cliente de Supabase
        supabase.setTenantContext(
          adminStatus ? null : (await tenantService.getUserTenant(user.id))?.id || null,
          adminStatus
        )
      } catch (error) {
        console.error('Error initializing tenant context:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeTenantContext()
  }, [])

  // Actualizar el interceptor cuando cambie isAdmin
  useEffect(() => {
    supabase.setTenantContext(currentTenant?.id || null, isAdmin)
  }, [isAdmin, currentTenant])

  return {
    isAdmin,
    currentTenant,
    availableTenants,
    loading,
    setCurrentTenant
  }
}