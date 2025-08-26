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
    console.log('🔄 Changing tenant to:', tenant?.name || 'Global View');
    setCurrentTenantState(tenant)

    // Actualizar el contexto en el cliente de Supabase
    supabase.setTenantContext(tenant?.id || null, isAdmin)

    console.log('✅ Tenant context updated in supabase client');
  }

  useEffect(() => {
    const initializeTenantContext = async () => {
      try {
        console.log('🚀 Initializing tenant context...');

        const user = await authService.getUser()
        if (!user) {
          console.warn('⚠️ No user found in initializeTenantContext');
          return;
        }

        console.log('👤 User found:', user.email);

        // Verificar si es admin
        const adminStatus = await tenantService.isUserAdmin(user.id)
        console.log('🔐 Admin status:', adminStatus);
        setIsAdmin(adminStatus)

        if (adminStatus) {
          // Si es admin, cargar todos los tenants
          const tenants = await tenantService.getAllTenants()
          console.log('🏢 Available tenants for admin:', tenants.length);
          setAvailableTenants(tenants)

          // Por defecto, no seleccionar ningún tenant (vista global)
          setCurrentTenantState(null)
          // Establecer contexto admin sin tenant
          supabase.setTenantContext(null, true)
        } else {
          // Si es customer, obtener su tenant
          const userTenant = await tenantService.getUserTenant(user.id)
          console.log('🏢 User tenant:', userTenant?.name || 'None');

          setCurrentTenantState(userTenant)
          setAvailableTenants(userTenant ? [userTenant] : [])

          // Establecer contexto del tenant del usuario
          supabase.setTenantContext(userTenant?.id || null, false)
        }

        console.log('✅ Tenant context initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing tenant context:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeTenantContext()
  }, [])

  // Efecto separado para actualizar el interceptor cuando cambie el estado
  useEffect(() => {
    if (!loading) {
      console.log('🔧 Updating supabase context:', {
        tenantId: currentTenant?.id || null,
        isAdmin
      });
      supabase.setTenantContext(currentTenant?.id || null, isAdmin)
    }
  }, [isAdmin, currentTenant, loading])

  return {
    isAdmin,
    currentTenant,
    availableTenants,
    loading,
    setCurrentTenant
  }
}