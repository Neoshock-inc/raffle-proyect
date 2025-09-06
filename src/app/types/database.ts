// src/types/database.ts
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  layout: 'default' | 'luxury' | 'minimal';
  created_at: string;
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  price: number;
  total_numbers: number;
  draw_date: string;
  is_active: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed';
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  logo_url?: string;
  banner_url?: string;
  show_countdown: boolean;
  show_progress_bar: boolean;
  max_tickets_per_user?: number;
  min_tickets_to_activate: number;
  category_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;

  MARKETING_BOOST_PERCENTAGE?: number
}

export interface RaffleMedia {
  id: string;
  raffle_id: string;
  media_type: 'image' | 'video' | 'document';
  file_url: string;
  file_name?: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

export interface TicketPackage {
  id: string;
  raffle_id: string;
  name: string;
  amount: number;
  price_multiplier: number;
  fixed_price?: number;
  badge_text?: string;
  badge_color: string;
  gradient_from: string;
  gradient_via?: string;
  gradient_to: string;
  is_limited_offer: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  discount_percentage: number;
  bonus_entries: number;
  subtitle?: string;
  description?: string;
  button_text: string;
  display_order: number;
  is_active: boolean;
  max_purchases_per_user?: number;
  stock_limit?: number;
  current_stock: number;
  available_from?: string;
  available_until?: string;
}

export interface TicketPackageTimeOffer {
  id: string;
  ticket_package_id: string;
  offer_name: string;
  start_date: string;
  end_date: string;
  special_discount_percentage: number;
  special_bonus_entries: number;
  special_badge_text?: string;
  special_badge_color?: string;
  special_gradient_from?: string;
  special_gradient_via?: string;
  special_gradient_to?: string;
  max_purchases_during_offer?: number;
  stock_limit_for_offer?: number;
  is_active: boolean;
}

export interface RaffleEntry {
  id: string;
  raffle_id: string;
  participant_id: string;
  number: string;
  is_winner: boolean;
  purchased_at: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  stripe_session_id?: string;
}

export interface BlessedNumber {
  id: string;
  raffle_id: string;
  number: string;
  assigned_to?: string;
  is_minor_prize: boolean;
  is_claimed: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  created_at: string;
}
