// types/index.ts - Tipos unificados para el sistema multi-tenant

// ============================================
// TIPOS BASE DE DATABASE
// ============================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  layout: 'default' | 'luxury' | string;
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
  created_at: string;
  updated_at: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  logo_url: string | null;
  banner_url: string | null;
  show_countdown: boolean;
  show_progress_bar: boolean;
  max_tickets_per_user: number | null;
  min_tickets_to_activate: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  category_id: string | null;
  organization_id: string | null;
  tenant_id: string;
}

export interface RaffleMedia {
  id: string;
  raffle_id: string;
  media_type: 'image' | 'video' | 'document';
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

// ============================================
// TIPOS DE TICKETS Y PAQUETES
// ============================================

export interface TicketPackage {
  id: string;
  raffle_id: string;
  name: string;
  amount: number;
  price_multiplier: number;
  fixed_price: number | null;
  badge_text: string | null;
  badge_color: string;
  gradient_from: string;
  gradient_via: string | null;
  gradient_to: string;
  is_limited_offer: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  discount_percentage: number;
  bonus_entries: number;
  subtitle: string | null;
  description: string | null;
  button_text: string;
  display_order: number;
  is_active: boolean;
  max_purchases_per_user: number | null;
  stock_limit: number | null;
  current_stock: number;
  show_entry_count: boolean;
  show_multiplier: boolean;
  custom_multiplier_text: string | null;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  ticket_package_time_offers?: TicketPackageTimeOffer[];
}

export interface TicketPackageTimeOffer {
  id: string;
  ticket_package_id: string;
  offer_name: string;
  start_date: string;
  end_date: string;
  special_discount_percentage: number;
  special_bonus_entries: number;
  special_badge_text: string | null;
  special_badge_color: string | null;
  special_gradient_from: string | null;
  special_gradient_via: string | null;
  special_gradient_to: string | null;
  max_purchases_during_offer: number | null;
  stock_limit_for_offer: number | null;
  is_active: boolean;
  created_at: string;
}

// Tipo calculado para los paquetes con ofertas aplicadas
export interface CalculatedTicketPackage extends TicketPackage {
  final_price: number;
  final_amount: number;
  current_offer?: TicketPackageTimeOffer;
  is_available: boolean;
  entries_display: string;
  multiplier_display: string;
  // Compatibilidad con templates existentes
  price: number;
  amount: number;
  originalPrice: number;
  discount: number;
  badge: string | null;
  badgeColor: string;
  gradient: {
    from: string;
    via: string | null;
    to: string;
  };
}

// ============================================
// TIPOS PARA TEMPLATES
// ============================================

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  layout: string;
  features: {
    countdown: boolean;
    progressBar: boolean;
    testimonials: boolean;
    customTickets: boolean;
    blessedNumbers: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  branding: {
    logo: string | null;
    banner: string | null;
  };
}

// Para Luxury Template - Representación de rifas como productos
export interface RaffleProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number; // Valor total del premio
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  endDate: string;
  featured?: boolean;
  category: string;
}

// Datos extendidos de rifa para templates
export interface ExtendedRaffleData extends Raffle {
  soldTickets: number;
  images: string[];
  blessedNumbers: string[];
  media: RaffleMedia[];
  // Para luxury template
  products?: RaffleProduct[];
  testimonials?: Testimonial[];
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  product: string;
  comment: string;
  rating: number;
  avatar: string;
  prize_value: number;
}

// ============================================
// TIPOS DE PAGOS Y FACTURAS
// ============================================

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPHONE = 'payphone',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export interface Invoice {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  address: string;
  payment_method: string;
  amount: number;
  status: string;
  total_price: number;
  created_at: string;
  participant_id: string;
  referral_id: string | null;
  tenant_id: string;
}

export interface InvoiceCreationData {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  status: PaymentStatus;
  city: string;
  address: string;
  paymentMethod: PaymentMethod;
  amount: number;
  totalPrice: number;
  participantId?: string;
  referral_id?: string;
  referral_code?: string;
}

export interface PayPhoneTransactionData {
  payphone_transaction_id?: string;
  payphone_status?: string;
  payphone_status_code?: string;
  phone_number?: string;
  callback_received_at?: string;
  callback_method?: 'GET' | 'POST';
}

// ============================================
// TIPOS DE COMPRA Y CHECKOUT
// ============================================

export interface PurchaseData {
  amount: number;
  price: number;
  raffleId: string;
  expiresAt?: number;
}

export interface TokenPayload {
  amount: number;
  price: number;
  raffleId: string;
  createdAt: number;
  exp: number;
}

export interface CheckoutFormData {
  name: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  address: string;
}

// ============================================
// TIPOS DE PARTICIPANTES Y ENTRADAS
// ============================================

export interface Participant {
  id: string;
  email: string;
  name: string;
  created_at: string;
  tenant_id: string;
}

export interface RaffleEntry {
  id: string;
  raffle_id: string;
  participant_id: string;
  number: string;
  is_winner: boolean;
  purchased_at: string;
  payment_status: string;
  stripe_session_id: string | null;
}

export interface BlessedNumber {
  id: string;
  raffle_id: string;
  number: string;
  assigned_to: string | null;
  created_at: string;
  is_minor_prize: boolean;
  is_claimed: boolean;
}

export interface TicketNumber {
  number: string;
  isWinner: boolean;
}

export interface TicketPurchase {
  id: string;
  email: string;
  numbers: TicketNumber[];
  paymentStatus: 'pending' | 'completed' | 'failed';
  purchaseDate: string;
}

// ============================================
// TIPOS DE CONFIGURACIÓN
// ============================================

export interface EmailConfig {
  id: string;
  tenant_id: string;
  provider: string;
  username: string;
  password: string;
  host: string;
  port: number;
  created_at: string;
}

export interface PaymentConfig {
  id: string;
  tenant_id: string;
  provider: string;
  public_key: string;
  secret_key: string;
  extra: Record<string, any> | null;
  created_at: string;
}

export interface TenantDomain {
  id: string;
  tenant_id: string;
  domain: string;
  verified: boolean;
  created_at: string;
}

// ============================================
// TIPOS PARA COMPONENTES LEGACY
// ============================================

// Mantener compatibilidad con componentes existentes
export interface TicketOption {
  amount: number;
  price: number;
  id?: string;
  originalPrice?: number;
  discount?: number;
  badge?: string | null;
  badgeColor?: string;
  gradient?: {
    from: string;
    via?: string | null;
    to: string;
  };
}

export interface EnhancedTicketOption {
  id: string;
  amount: number;
  price: number;
  originalAmount: number;
  package: CalculatedTicketPackage;
}

export type PaymentMethodType = 'stripe' | 'payphone' | 'transfer' | null;