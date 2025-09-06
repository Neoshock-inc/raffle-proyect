// src/hooks/useTicketPackages.ts

import { useState, useEffect, useCallback } from 'react';
import { useTenantContext } from '../contexts/TenantContext';
import { ticketPackagesService } from '../services/ticketPackagesService';
import type {
  TicketPackage,
  CreateTicketPackageData,
  UpdateTicketPackageData,
  UseTicketPackagesOptions
} from '../types/ticketPackage';
import { toast } from 'sonner';

export const useTicketPackages = (options: UseTicketPackagesOptions) => {
  const { raffleId, enabled = true, refetchInterval } = options;
  
  const [packages, setPackages] = useState<TicketPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener contexto de tenant
  const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext();

  // Función de fetch
  const fetchPackages = useCallback(async (forceRefresh = false) => {
    if (!raffleId || tenantLoading || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📦 [PACKAGES] Loading packages for raffle:', raffleId);

      // Agregar pequeño delay si es force refresh para asegurar contexto
      if (forceRefresh) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const packagesData = await ticketPackagesService.getPackagesByRaffleId(raffleId);
      setPackages(packagesData);

      console.log('✅ [PACKAGES] Loaded packages:', packagesData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar paquetes';
      setError(errorMessage);
      console.error('❌ [PACKAGES] Error:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [raffleId, currentTenant, tenantLoading, enabled]);

  // Efecto inicial - se ejecuta cuando cambian rafleId, tenant o enabled
  useEffect(() => {
    console.log('🔄 [PACKAGES] Context changed:', {
      raffleId,
      tenantId: currentTenant?.id,
      tenantName: currentTenant?.name,
      isAdmin,
      tenantLoading
    });

    if (!tenantLoading && enabled && raffleId) {
      fetchPackages(true); // Force refresh cuando cambie el contexto
    }
  }, [raffleId, currentTenant?.id, tenantLoading, enabled, fetchPackages]);

  // Efecto para refetch interval
  useEffect(() => {
    if (refetchInterval && enabled && !tenantLoading && raffleId) {
      const interval = setInterval(() => {
        fetchPackages();
      }, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, tenantLoading, raffleId, fetchPackages]);

  const createPackage = async (data: Omit<CreateTicketPackageData, 'raffle_id'>): Promise<TicketPackage> => {
    try {
      console.log('📝 [PACKAGES] Creating package for raffle:', raffleId);

      // Calcular el siguiente display_order
      const maxOrder = packages.reduce((max, pkg) => Math.max(max, pkg.display_order), -1);
      
      const packageData: CreateTicketPackageData = {
        ...data,
        raffle_id: raffleId,
        display_order: data.display_order ?? maxOrder + 1
      };

      const newPackage = await ticketPackagesService.createPackage(packageData);
      setPackages(prev => [...prev, newPackage].sort((a, b) => a.display_order - b.display_order));
      toast.success('Paquete creado exitosamente');

      console.log('✅ [PACKAGES] Package created:', newPackage.id);
      return newPackage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear paquete';
      console.error('❌ [PACKAGES] Error creating package:', err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const updatePackage = async (data: UpdateTicketPackageData): Promise<TicketPackage> => {
    try {
      console.log('✏️ [PACKAGES] Updating package:', data.id);

      const updatedPackage = await ticketPackagesService.updatePackage(data);
      setPackages(prev => prev.map(pkg =>
        pkg.id === data.id ? updatedPackage : pkg
      ).sort((a, b) => a.display_order - b.display_order));
      toast.success('Paquete actualizado exitosamente');

      console.log('✅ [PACKAGES] Package updated:', updatedPackage.id);
      return updatedPackage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar paquete';
      console.error('❌ [PACKAGES] Error updating package:', err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const deletePackage = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ [PACKAGES] Deleting package:', id);

      await ticketPackagesService.deletePackage(id);
      setPackages(prev => prev.filter(pkg => pkg.id !== id));
      toast.success('Paquete eliminado exitosamente');

      console.log('✅ [PACKAGES] Package deleted:', id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar paquete';
      console.error('❌ [PACKAGES] Error deleting package:', err);
      toast.error(errorMessage);
      throw err;
    }
  };

  const reorderPackages = async (reorderedPackages: TicketPackage[]): Promise<void> => {
    try {
      console.log('🔄 [PACKAGES] Reordering packages...');

      // Optimistic update
      setPackages(reorderedPackages);

      // Prepare data for backend update
      const updates = reorderedPackages.map((pkg, index) => ({
        id: pkg.id,
        display_order: index
      }));

      await ticketPackagesService.updatePackageOrder(updates);
      toast.success('Orden actualizado exitosamente');

      console.log('✅ [PACKAGES] Packages reordered');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reordenar paquetes';
      console.error('❌ [PACKAGES] Error reordering packages:', err);
      
      // Revert optimistic update on error
      fetchPackages();
      toast.error(errorMessage);
      throw err;
    }
  };

  const refetch = useCallback(async () => {
    console.log('🔄 [PACKAGES] Manual refresh triggered');
    await fetchPackages(true);
  }, [fetchPackages]);

  return {
    packages,
    loading: loading || tenantLoading,
    error,
    createPackage,
    updatePackage,
    deletePackage,
    reorderPackages,
    refetch
  };
};