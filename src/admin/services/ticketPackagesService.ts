// src/services/ticketPackagesService.ts

import { supabase } from '../lib/supabaseTenantClient';
import type { TicketPackage, CreateTicketPackageData, UpdateTicketPackageData } from '../types/ticketPackage';

class TicketPackagesService {

  // ============ TICKET PACKAGES ============
  async getPackagesByRaffleId(raffleId: string): Promise<TicketPackage[]> {
    try {
      console.log('📦 Getting ticket packages for raffle:', raffleId);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context:', { tenantId, isAdmin });

      const { data, error } = await supabase
        .from('ticket_packages')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Error al obtener paquetes: ${error.message}`);
      }

      console.log('✅ Ticket packages fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getPackagesByRaffleId:', error);
      throw error;
    }
  }

  async createPackage(packageData: CreateTicketPackageData): Promise<TicketPackage> {
    try {
      console.log('📝 Creating ticket package...');
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during creation:', { tenantId, isAdmin });

      const { data, error } = await supabase
        .from('ticket_packages')
        .insert(packageData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating package:', error);
        throw new Error(error.message);
      }

      console.log('✅ Ticket package created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in createPackage:', error);
      throw error;
    }
  }

  async updatePackage(packageData: UpdateTicketPackageData): Promise<TicketPackage> {
    try {
      console.log('✏️ Updating ticket package:', packageData.id);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during update:', { tenantId, isAdmin });

      const { id, ...updateData } = packageData;

      const { data, error } = await supabase
        .from('ticket_packages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating package:', error);
        throw new Error(error.message);
      }

      console.log('✅ Ticket package updated:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Error in updatePackage:', error);
      throw error;
    }
  }

  async deletePackage(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting ticket package:', id);
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during deletion:', { tenantId, isAdmin });

      const { error } = await supabase
        .from('ticket_packages')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting package:', error);
        throw new Error(error.message);
      }

      console.log('✅ Ticket package deleted successfully');
    } catch (error) {
      console.error('❌ Error in deletePackage:', error);
      throw error;
    }
  }

  async updatePackageOrder(packages: { id: string; display_order: number }[]): Promise<void> {
    try {
      console.log('🔄 Updating package order...');
      const { tenantId, isAdmin } = supabase.getTenantContext();
      console.log('🔍 Current context during order update:', { tenantId, isAdmin });

      // Update each package's display_order
      const updates = packages.map(pkg => 
        supabase
          .from('ticket_packages')
          .update({ display_order: pkg.display_order })
          .eq('id', pkg.id)
      );

      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('❌ Errors updating order:', errors);
        throw new Error('Error updating package order');
      }

      console.log('✅ Package order updated successfully');
    } catch (error) {
      console.error('❌ Error in updatePackageOrder:', error);
      throw error;
    }
  }
}

export const ticketPackagesService = new TicketPackagesService();