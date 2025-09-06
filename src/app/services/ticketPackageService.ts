// services/TicketPackageService.ts
import { calculateFinalPrice, calculateTotalTickets, TicketPackage } from "../(auth)/types/ticketPackage";
import { supabase } from "../lib/supabase";

export interface CalculatedTicketPackage extends TicketPackage {
  final_price: number;
  final_amount: number;
  original_price: number;
  total_discount: number;
  is_available: boolean;
  entries_display: string;
  multiplier_display: string;
  current_offer?: any; // Puedes tiparlo si manejas ofertas temporales
}

export class TicketPackageService {
  static async getTicketPackages(raffleId: string): Promise<TicketPackage[]> {
    try {
      const { data, error } = await supabase
        .from('ticket_packages')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching ticket packages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getTicketPackages:', error);
      return [];
    }
  }

  static calculatePackages(packages: TicketPackage[]): CalculatedTicketPackage[] {
    const currentTime = new Date();

    return packages.map(pkg => {
      const final_price = calculateFinalPrice(pkg);
      const final_amount = calculateTotalTickets(pkg);
      const original_price = pkg.base_price;
      const total_discount = pkg.promotion_type === 'discount' ? pkg.promotion_value : 0;

      const is_available = pkg.is_active && (pkg.stock_limit ? pkg.current_stock < pkg.stock_limit : true);

      return {
        ...pkg,
        final_price,
        final_amount,
        original_price,
        total_discount,
        is_available,
        entries_display: `${final_amount.toLocaleString()} Entries`,
        multiplier_display: `${Math.round(final_amount / pkg.amount)}x`,
      };
    });
  }

  static createFallbackPackages(): CalculatedTicketPackage[] {
    const baseAmounts = [20, 30, 40, 50, 75, 100];

    return baseAmounts.map((amount, index) => {
      const now = new Date().toISOString();

      const pkg: TicketPackage = {
        id: `fallback-${index}`,
        raffle_id: '',
        name: `${amount} Tickets`,
        amount,
        base_price: amount * 10, // ejemplo de precio base
        promotion_type: 'none',
        promotion_value: 0,
        primary_color: '#3B82F6',
        secondary_color: '#1D4ED8',
        badge_text: undefined,
        is_featured: false,
        is_active: true,
        display_order: index,
        current_stock: 0,
        created_at: now,
        updated_at: now,
      };

      return this.calculatePackages([pkg])[0];
    });
  }
}
