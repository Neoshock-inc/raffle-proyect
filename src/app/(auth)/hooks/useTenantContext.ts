import { useEffect, useState } from 'react'
import { tenantService } from '../services/tenantService'
import { authService } from '../services/authService'
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
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error initializing tenant context:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeTenantContext()
  }, [])

  return {
    isAdmin,
    currentTenant,
    availableTenants,
    loading,
    setCurrentTenant
  }
}