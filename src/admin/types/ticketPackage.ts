// types/ticketPackage.ts

export type PromotionType = 'none' | 'discount' | 'bonus' | '2x1' | '3x2';

export interface TicketPackage {
  id: string;
  raffle_id: string;
  name: string;
  amount: number;
  base_price: number;
  promotion_type: PromotionType;
  promotion_value: number;
  primary_color: string;
  secondary_color: string;
  badge_text?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  max_purchases_per_user?: number;
  stock_limit?: number;
  current_stock: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPackageData {
  raffle_id: string;
  name: string;
  amount: number;
  base_price: number;
  promotion_type?: PromotionType;
  promotion_value?: number;
  primary_color?: string;
  secondary_color?: string;
  badge_text?: string;
  is_featured?: boolean;
  display_order?: number;
  max_purchases_per_user?: number;
  stock_limit?: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
}

export interface UpdateTicketPackageData extends CreateTicketPackageData {
  id: string;
}

export interface TicketPackageFilters {
  raffle_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  promotion_type?: PromotionType;
}

export interface UseTicketPackagesOptions {
  raffleId: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export interface TicketOption {
    id: string;
    name: string;
    amount: number;
    final_amount: number;
    original_price: number;
    final_price: number;
    total_discount: number;
    badge_text?: string;
    promotion_type?: string;
    promotion_value?: number;
    is_available: boolean;
    is_featured?: boolean;
}

// Re-exportar funciones utilitarias para compatibilidad de imports existentes
// @deprecated - Importar desde '@/utils/ticketPackageUtils' directamente
export { getPromotionLabel, calculateFinalPrice, calculateTotalTickets } from '@/utils/ticketPackageUtils';
