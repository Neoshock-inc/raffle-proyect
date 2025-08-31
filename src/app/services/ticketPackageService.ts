import { supabase } from "../lib/supabase";
import { CalculatedTicketPackage, TicketPackage, TicketPackageTimeOffer } from "../types/ticketPackages";

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

  static async getTimeOffers(packageIds: string[]): Promise<TicketPackageTimeOffer[]> {
    if (packageIds.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('ticket_package_time_offers')
        .select('*')
        .in('ticket_package_id', packageIds)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching time offers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error in getTimeOffers:', error);
      return [];
    }
  }

  static calculatePackages(
    packages: TicketPackage[],
    offers: TicketPackageTimeOffer[],
    baseTicketPrice: number
  ): CalculatedTicketPackage[] {
    const currentTime = new Date();

    return packages.map(pkg => {
      // Find active time offer for this package
      const activeOffer = offers.find(offer => 
        offer.ticket_package_id === pkg.id &&
        offer.is_active &&
        new Date(offer.start_date) <= currentTime &&
        new Date(offer.end_date) >= currentTime
      );

      // Calculate base price
      const basePrice = pkg.fixed_price || (pkg.amount * baseTicketPrice * pkg.price_multiplier);

      // Calculate total discount
      const totalDiscount = pkg.discount_percentage + (activeOffer?.special_discount_percentage || 0);
      
      // Calculate final price
      const finalPrice = basePrice * (1 - totalDiscount / 100);

      // Calculate total bonus entries
      const totalBonusEntries = pkg.bonus_entries + (activeOffer?.special_bonus_entries || 0);
      
      // Calculate final amount
      const finalAmount = pkg.amount + totalBonusEntries;

      // Determine availability
      const isAvailable = this.checkAvailability(pkg, activeOffer, currentTime);

      return {
        ...pkg,
        final_price: finalPrice,
        final_amount: finalAmount,
        current_offer: activeOffer,
        is_available: isAvailable,
        entries_display: `${finalAmount.toLocaleString()} Entries`,
        multiplier_display: `${Math.round(finalAmount / pkg.amount)}x`,
        original_price: basePrice,
        total_discount: totalDiscount
      };
    });
  }

  private static checkAvailability(
    pkg: TicketPackage,
    activeOffer?: TicketPackageTimeOffer,
    currentTime?: Date
  ): boolean {
    // Check package availability window
    if (pkg.available_from && new Date(pkg.available_from) > (currentTime || new Date())) {
      return false;
    }
    
    if (pkg.available_until && new Date(pkg.available_until) < (currentTime || new Date())) {
      return false;
    }

    // Check stock limits
    if (pkg.stock_limit && (pkg.current_stock ?? 0) >= pkg.stock_limit) {
      return false;
    }

    // Check offer stock limits
    if (activeOffer?.stock_limit_for_offer) {
      // TODO: Implement offer stock tracking
    }

    return true;
  }

  static createFallbackPackages(baseTicketPrice: number): CalculatedTicketPackage[] {
    const baseAmounts = [20, 30, 40, 50, 75, 100];
    
    return baseAmounts.map((amount, index) => ({
      id: `fallback-${index}`,
      raffle_id: '',
      name: `${amount} Tickets`,
      amount,
      price_multiplier: 1,
      badge_color: '#6B7280',
      gradient_from: '#3B82F6',
      gradient_to: '#1D4ED8',
      is_limited_offer: false,
      is_best_seller: index === 1,
      is_featured: false,
      discount_percentage: 0,
      bonus_entries: 0,
      button_text: 'COMPRAR AHORA',
      display_order: index,
      is_active: true,
      current_stock: 0,
      final_price: amount * baseTicketPrice,
      final_amount: amount,
      is_available: true,
      entries_display: `${amount} Entries`,
      multiplier_display: '1x',
      original_price: amount * baseTicketPrice,
      total_discount: 0,
      show_entry_count: true,
      show_multiplier: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_offer: undefined
    }));
  }
}