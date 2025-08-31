// src/types/template.ts - Remover la definición duplicada y usar la de ticketPackages
import { Raffle, RaffleMedia } from "./database";

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
    id: string;
    name: string;
    slug: string;
    layout: string;
    features: TemplateFeatures;
    theme: TemplateTheme;
    branding: {
        logo?: string;
        banner?: string;
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
