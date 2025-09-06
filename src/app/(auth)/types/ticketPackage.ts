// types/ticketPackage.ts

export type PromotionType = 'none' | 'discount' | 'bonus' | '2x1' | '3x2';

export interface TicketPackage {
  id: string;
  raffle_id: string;
  name: string;
  amount: number;
  base_price: number;
  
  // Promociones
  promotion_type: PromotionType;
  promotion_value: number; // porcentaje para discount, cantidad extra para bonus
  
  // Colores
  primary_color: string;
  secondary_color: string;
  
  // Configuración
  badge_text?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  
  // Límites
  max_purchases_per_user?: number;
  stock_limit?: number;
  current_stock: number;
  
  // Fechas de promoción
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

// Utility functions for promotions
export const getPromotionLabel = (type: PromotionType, value?: number): string => {
  switch (type) {
    case 'discount':
      return `${value}% OFF`;
    case 'bonus':
      return `+${value} GRATIS`;
    case '2x1':
      return '2x1';
    case '3x2':
      return '3x2';
    default:
      return '';
  }
};

export const calculateFinalPrice = (ticketPackage: TicketPackage): number => {
  const { base_price, promotion_type, promotion_value } = ticketPackage;

  switch (promotion_type) {
    case 'discount':
      return base_price * (1 - promotion_value / 100);
    case '2x1':
    case '3x2':
      // Para promociones de cantidad, el precio base se mantiene pero obtienes más tickets
      return base_price;
    default:
      return base_price;
  }
};

export const calculateTotalTickets = (ticketPackage: TicketPackage): number => {
  const { amount, promotion_type, promotion_value } = ticketPackage;
  
  switch (promotion_type) {
    case 'bonus':
      return amount + promotion_value;
    case '2x1':
      return amount * 2;
    case '3x2':
      return Math.floor(amount / 2) * 3 + (amount % 2);
    default:
      return amount;
  }
};

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
