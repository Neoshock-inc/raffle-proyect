// src/types/raffle.ts

export interface Raffle {
    id: string
    title: string
    description?: string
    price: number
    total_numbers: number
    draw_date: string
    is_active: boolean
    created_at: string
    updated_at?: string

    // Campos de personalización
    primary_color: string
    secondary_color: string
    background_color: string
    text_color: string
    logo_url?: string
    banner_url?: string

    // Configuraciones
    show_countdown: boolean
    show_progress_bar: boolean
    max_tickets_per_user?: number
    min_tickets_to_activate: number

    // Metadatos
    status: RaffleStatus
    category_id?: string
    organization_id?: string
    MARKETING_BOOST_PERCENTAGE?: number

    // Relaciones
    category?: RaffleCategory
    media?: RaffleMedia[]
    carousel?: RaffleCarouselSlide[]
    design_config?: RaffleDesignConfig
}

export type RaffleStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'

export interface RaffleCategory {
    id: string
    name: string
    description?: string
    icon_name: string
    color: string
    is_active: boolean
    created_at: string
}

export interface RaffleMedia {
    id: string
    raffle_id: string
    media_type: 'image' | 'video' | 'document'
    file_url: string
    file_name?: string
    file_size?: number
    mime_type?: string
    alt_text?: string
    caption?: string
    display_order: number
    is_featured: boolean
    is_active: boolean
    created_at: string
}

export interface RaffleCarouselSlide {
    id: string
    raffle_id: string
    media_id: string
    slide_order: number
    title?: string
    subtitle?: string
    description?: string
    cta_text?: string
    cta_url?: string
    overlay_color?: string
    overlay_opacity: number
    text_position: 'left' | 'center' | 'right' | 'top' | 'bottom'
    is_active: boolean
    created_at: string

    // Relación
    media?: RaffleMedia
}

export interface RaffleTheme {
    id: string
    name: string
    description?: string
    primary_color: string
    secondary_color: string
    background_color: string
    text_color: string
    accent_color?: string
    font_family: string
    border_radius: number
    button_style: 'square' | 'rounded' | 'pill'
    preview_image_url?: string
    is_premium: boolean
    is_active: boolean
    created_at: string
}

export interface RaffleDesignConfig {
    id: string
    raffle_id: string
    theme_id?: string

    // Tipografía
    heading_font: string
    body_font: string
    font_size_base: number

    // Layout
    layout_style: 'classic' | 'modern' | 'minimal' | 'bold'
    card_shadow: boolean
    rounded_corners: boolean

    // Animaciones
    enable_animations: boolean
    transition_speed: 'slow' | 'normal' | 'fast'

    // Custom CSS
    custom_css?: string

    created_at: string
    updated_at: string

    // Relación
    theme?: RaffleTheme
}

export interface RaffleIcon {
    id: string
    name: string
    category?: string
    svg_content?: string
    unicode_char?: string
    is_premium: boolean
    created_at: string
}

// Tipos para formularios y operaciones
export interface CreateRaffleData {
    title: string
    description?: string
    price: number
    total_numbers: number
    draw_date: string
    primary_color?: string
    secondary_color?: string
    background_color?: string
    category_id?: string
    show_countdown?: boolean
    max_tickets_per_user?: number
}

export interface UpdateRaffleData extends Partial<CreateRaffleData> {
    id: string
}

export interface RaffleFilters {
    status?: RaffleStatus[]
    category_id?: string
    search?: string
    date_from?: string
    date_to?: string
}

export interface RafflePagination {
    page: number
    limit: number
    total: number
    total_pages: number
}

export interface RaffleListResponse {
    data: Raffle[]
    pagination: RafflePagination
}

// Tipos para upload de archivos
export interface UploadMediaData {
    raffle_id: string
    media_type: 'image' | 'video' | 'document'
    file: File
    alt_text?: string
    caption?: string
    is_featured?: boolean
}

export interface MediaUploadResponse {
    id: string
    file_url: string
    file_name: string
    media_type: string
    file_size: number
    mime_type: string
}

// Estados de la aplicación
export interface RaffleState {
    raffles: Raffle[]
    selectedRaffle: Raffle | null
    loading: boolean
    error: string | null
    filters: RaffleFilters
    pagination: RafflePagination
}

export interface RaffleFormState {
    data: CreateRaffleData | UpdateRaffleData
    errors: Record<string, string>
    touched: Record<string, boolean>
    submitting: boolean
}

// Tipos para hooks
export interface UseRafflesOptions {
    filters?: RaffleFilters
    enabled?: boolean
    refetchInterval?: number
}

export interface UseRaffleMediaOptions {
    raffleId: string
    mediaType?: 'image' | 'video' | 'document'
    enabled?: boolean
}