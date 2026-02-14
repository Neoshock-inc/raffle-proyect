// src/types/database.ts

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  layout: 'default' | 'latina' | 'offroad' | 'minimal';
  status: 'active' | 'suspended' | 'deleted';
  description?: string;
  plan: 'basic' | 'professional' | 'enterprise';
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  metadata?: Record<string, any>;
}

export interface TenantConfig {
  id: string;
  tenant_id: string;
  company_name?: string;
  company_description?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export interface TenantContactInfo {
  id: string;
  tenant_id: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  business_hours?: string;
  support_email?: string;
  support_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantSocialMedia {
  id: string;
  tenant_id: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  whatsapp_number?: string;
  telegram_url?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantFeatures {
  id: string;
  tenant_id: string;
  show_countdown: boolean;
  show_progress_bar: boolean;
  show_testimonials: boolean;
  show_blessed_numbers: boolean;
  enable_referrals: boolean;
  enable_notifications: boolean;
  allow_guest_checkout: boolean;
  max_tickets_per_purchase: number;
  min_tickets_per_purchase: number;
  created_at: string;
  updated_at: string;
}

// Tipo compuesto para toda la configuración del tenant
export interface TenantFullConfig {
  tenant: Tenant;
  config: TenantConfig;
  contact_info: TenantContactInfo;
  social_media: TenantSocialMedia;
  features: TenantFeatures;
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  price: number;
  total_numbers: number;
  draw_date: string;
  is_active: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
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
  MARKETING_BOOST_PERCENTAGE?: number;
  pool_id?: string;
  raffle_type?: 'daily_am' | 'daily_pm' | 'weekly' | 'biweekly';
}

export interface NumberPool {
  id: string;
  tenant_id: string;
  name: string;
  total_numbers: number;
  pool_type: 'range' | 'custom';
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface NumberPoolNumber {
  id: string;
  pool_id: string;
  number: number;
  created_at: string;
}

export interface RaffleNumberAssignment {
  id: string;
  raffle_id: string;
  referral_id: string;
  range_start: number;
  range_end: number;
  status: 'assigned' | 'returned';
  assigned_at: string;
  returned_at?: string;
  referral?: {
    id: string;
    name: string;
    referral_code: string;
  };
}

export interface RaffleNumberStatus {
  referral_id: string;
  referral_name: string;
  referral_code: string;
  range_start: number;
  range_end: number;
  total_in_range: number;
  sold_in_range: number;
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

// src/types/database.ts - Agregar estas interfaces

export interface RafflePrize {
  id: string;
  raffle_id: string;
  prize_type: 'main' | 'secondary' | 'blessed' | 'consolation';
  title: string;
  description?: string;
  value: number;
  currency: string;
  quantity: number;
  image_url?: string;
  is_cash: boolean;
  is_physical_item: boolean;
  delivery_method?: string;
  terms_and_conditions?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RafflePrizeSpecification {
  id: string;
  prize_id: string;
  specification_name: string;
  specification_value: string;
  display_order: number;
  created_at: string;
}

export interface RafflePrizeImage {
  id: string;
  prize_id: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

// Tipo completo con relaciones
export interface RafflePrizeComplete {
  prize: RafflePrize;
  specifications: RafflePrizeSpecification[];
  images: RafflePrizeImage[];
}