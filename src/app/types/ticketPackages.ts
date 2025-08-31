// types/ticketPackages.ts
export interface TicketPackage {
    id: string;
    raffle_id: string;

    // Configuración básica
    name: string;
    amount: number;
    price_multiplier: number;
    fixed_price?: number;

    // Configuración visual
    badge_text?: string;
    badge_color?: string;
    gradient_from: string;
    gradient_via?: string;
    gradient_to: string;

    // Configuración de ofertas
    is_limited_offer: boolean;
    is_best_seller: boolean;
    is_featured: boolean;

    // Descuentos
    discount_percentage: number;
    bonus_entries: number;

    // Textos
    subtitle?: string;
    description?: string;
    button_text: string;

    // Display
    display_order: number;
    is_active: boolean;

    // Límites
    max_purchases_per_user?: number;
    stock_limit?: number;
    current_stock?: number;

    // Stats
    show_entry_count: boolean;
    show_multiplier: boolean;
    custom_multiplier_text?: string;

    // Temporal
    available_from?: string; // ISO string from database
    available_until?: string; // ISO string from database

    // Metadata
    created_at: string; // ISO string from database
    updated_at: string; // ISO string from database
    created_by?: string;

    // Relación con ofertas temporales (puede venir del JOIN)
    ticket_package_time_offers?: TicketPackageTimeOffer[];
}

export interface TicketPackageTimeOffer {
    id: string;
    ticket_package_id: string;
    offer_name: string;
    start_date: string; // ISO string from database
    end_date: string; // ISO string from database
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
    created_at: string; // ISO string from database
}

// Tipo para el cálculo final del paquete
export interface CalculatedTicketPackage extends TicketPackage {
    final_price: number;
    final_amount: number;
    current_offer?: TicketPackageTimeOffer;
    is_available: boolean;
    entries_display: string;
    multiplier_display: string;
    original_price: number;  // Agregar esta propiedad
    total_discount: number;  // Agregar esta propiedad
}

// Tipos para compatibilidad con el sistema actual
export interface EnhancedTicketOption {
    id: string;
    amount: number; // final_amount (con bonus)
    price: number; // final_price (con descuentos)
    originalAmount: number; // amount original sin bonus
    package: CalculatedTicketPackage; // Información completa del paquete
}

// Interfaz para estilos del componente
export interface PackageStyles {
    gradient: string;
    badge: string;
    badgeColor: string;
    textColor: string;
    buttonColor: string;
}