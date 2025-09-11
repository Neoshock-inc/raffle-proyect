// src/types/template.ts - Remover la definición duplicada y usar la de ticketPackages
import { Raffle, RaffleMedia, RafflePrizeComplete } from "./database";

export interface TemplateTheme {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent?: string;
    };
    fonts: {
        heading: string;
        body: string;
        size_base: number;
    };
    layout: {
        style: 'classic' | 'modern' | 'minimal' | 'bold';
        card_shadow: boolean;
        rounded_corners: boolean;
        enable_animations: boolean;
    };
}

export interface TemplateFeatures {
    countdown: boolean;
    progressBar: boolean;
    testimonials: boolean;
    customTickets: boolean;
    blessedNumbers: boolean;
    carousel: boolean;
    socialProof: boolean;
}

export interface TenantConfig {
    // Información básica
    company_name: string;
    company_description?: string;
    logo_url?: string;
    slug: string;

    // Colores y branding
    primary_color: string;
    secondary_color: string;
    accent_color: string;

    // Información de contacto
    contact_info: {
        phone?: string;
        email?: string;
        hours?: string;
        location?: string;
        address?: string;
        support_email?: string;
        support_phone?: string;
    };

    // Redes sociales
    social_media: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
        whatsapp?: string;
        telegram?: string;
        linkedin?: string;
    };

    // Características
    features: {
        countdown: boolean;
        progressBar: boolean;
        testimonials: boolean;
        blessedNumbers: boolean;
        referrals: boolean;
        notifications: boolean;
        guestCheckout: boolean;
    };

    // Configuración de tickets
    ticket_limits: {
        max_per_purchase: number;
        min_per_purchase: number;
        max_per_user?: number;
    };
}

// Remover esta definición duplicada:
// export interface CalculatedTicketPackage extends TicketPackage { ... }

export interface Product {
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    ticketPrice: number;
    totalTickets: number;
    soldTickets: number;
    endDate: string;
    featured: boolean;
    category: string;
    progress: number;
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

export interface RaffleData extends Raffle {
    soldTickets: number;
    images: string[];
    blessedNumbers: string[];
    media: RaffleMedia[];

    // Nuevos campos para premios
    prizes: RafflePrizeComplete[];
    mainPrize?: RafflePrizeComplete;
    secondaryPrizes: RafflePrizeComplete[];
    blessedPrizes: RafflePrizeComplete[];
    consolationPrizes: RafflePrizeComplete[];

    // Campos existentes
    products?: Product[];
    testimonials?: Testimonial[];
    progress: number;
    timeRemaining?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
}
