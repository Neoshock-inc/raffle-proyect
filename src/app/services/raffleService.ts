// services/ticketPackageService.ts
import { supabase } from "../lib/supabase";
import { BlessedNumber, Raffle, RaffleMedia } from "../types/database";
import { RaffleData, Product, Testimonial } from "../types/template";
import { TicketPackage, TicketPackageTimeOffer, CalculatedTicketPackage } from "../types/ticketPackages";

export async function getActiveRaffle() {
    const { data, error } = await supabase
        .from("raffles")
        .select("*")
        .eq("is_active", true)
        .single();

    if (error) throw error;
    return data;
}

// Obtener todos los paquetes de tickets activos para la rifa activa
export async function getActiveTicketPackages(): Promise<CalculatedTicketPackage[]> {
    try {
        // Primero obtener la rifa activa
        const raffle = await getActiveRaffle();

        if (!raffle) {
            throw new Error("No hay rifa activa");
        }

        // Obtener los paquetes activos para esta rifa
        const { data: packages, error: packagesError } = await supabase
            .from("ticket_packages")
            .select(`
                    *,
                    ticket_package_time_offers(*)
                `)
            .eq("raffle_id", raffle.id)
            .eq("is_active", true)
            .order("display_order", { ascending: true });


        if (packagesError) throw packagesError;

        // Obtener ofertas temporales activas por separado para evitar problemas con el inner join
        const { data: timeOffers, error: offersError } = await supabase
            .from("ticket_package_time_offers")
            .select("*")
            .eq("is_active", true);

        if (offersError) throw offersError;

        // Calcular los paquetes finales
        const now = new Date();
        const calculatedPackages = packages?.map(pkg => {
            // Encontrar ofertas temporales activas para este paquete
            const activeOffers = timeOffers?.filter(offer =>
                offer.ticket_package_id === pkg.id &&
                now >= new Date(offer.start_date) &&
                now <= new Date(offer.end_date)
            ) || [];

            return calculatePackage(pkg, raffle, now, activeOffers);
        }).filter(pkg => pkg.is_available) || [];

        return calculatedPackages;

    } catch (error) {
        console.error("Error obteniendo paquetes de tickets:", error);
        throw error;
    }
}

// Obtener un paquete específico por ID
export async function getTicketPackageById(packageId: string): Promise<CalculatedTicketPackage | null> {
    try {
        const raffle = await getActiveRaffle();
        if (!raffle) throw new Error("No hay rifa activa");

        const { data: pkg, error } = await supabase
            .from("ticket_packages")
            .select("*")
            .eq("id", packageId)
            .eq("is_active", true)
            .single();

        if (error || !pkg) return null;

        // Obtener ofertas temporales activas
        const { data: timeOffers } = await supabase
            .from("ticket_package_time_offers")
            .select("*")
            .eq("ticket_package_id", packageId)
            .eq("is_active", true);

        const now = new Date();
        const activeOffers = timeOffers?.filter(offer =>
            now >= new Date(offer.start_date) &&
            now <= new Date(offer.end_date)
        ) || [];

        return calculatePackage(pkg, raffle, now, activeOffers);

    } catch (error) {
        console.error("Error obteniendo paquete por ID:", error);
        return null;
    }
}

// Función interna para calcular el paquete final
function calculatePackage(
    pkg: TicketPackage,
    raffle: any,
    currentDate: Date,
    activeOffers: TicketPackageTimeOffer[]
): CalculatedTicketPackage {

    // Encontrar la mejor oferta activa (mayor descuento)
    const bestOffer = activeOffers.reduce((best, current) => {
        if (!best) return current;
        return current.special_discount_percentage > best.special_discount_percentage ? current : best;
    }, null as TicketPackageTimeOffer | null);

    // Calcular precio final
    let final_price: number;
    if (pkg.fixed_price) {
        final_price = pkg.fixed_price;
    } else {
        final_price = pkg.amount * raffle.price * pkg.price_multiplier;
    }

    // Aplicar descuentos
    let discount = pkg.discount_percentage;
    if (bestOffer && bestOffer.special_discount_percentage > 0) {
        discount = Math.max(discount, bestOffer.special_discount_percentage);
    }

    if (discount > 0) {
        final_price = final_price * (1 - discount / 100);
    }

    // Calcular entradas finales (amount + bonus)
    let bonus = pkg.bonus_entries;
    if (bestOffer && bestOffer.special_bonus_entries > 0) {
        bonus += bestOffer.special_bonus_entries;
    }

    const final_amount = pkg.amount + bonus;

    // Verificar disponibilidad
    const is_available = checkAvailability(pkg, currentDate, bestOffer);

    // Generar displays
    const entries_display = `${(final_amount * 100).toLocaleString()} Entries`;
    const multiplier_display = pkg.custom_multiplier_text || `${Math.floor(final_amount / 10)}x`;

    return {
        ...pkg,
        final_price: Math.round(final_price * 100) / 100,
        final_amount,
        current_offer: bestOffer || undefined,
        is_available,
        entries_display,
        multiplier_display
    };
}

// Verificar disponibilidad del paquete
function checkAvailability(
    pkg: TicketPackage,
    currentDate: Date,
    activeOffer?: TicketPackageTimeOffer | null
): boolean {
    // Verificar si el paquete está activo
    if (!pkg.is_active) return false;

    // Verificar fechas de disponibilidad del paquete
    if (pkg.available_from && currentDate < new Date(pkg.available_from)) return false;
    if (pkg.available_until && currentDate > new Date(pkg.available_until)) return false;

    // Verificar stock del paquete
    if (pkg.stock_limit && pkg.current_stock !== undefined) {
        if (pkg.current_stock <= 0) return false;
    }

    // Verificar stock de oferta especial
    if (activeOffer && activeOffer.stock_limit_for_offer) {
        // Aquí podrías implementar lógica adicional para verificar stock de ofertas
        // Por ahora asumimos que está disponible
    }

    return true;
}

// Obtener estilos para el componente basado en el paquete
export function getPackageStyles(pkg: CalculatedTicketPackage) {
    let styles = {
        gradient: `from-[${pkg.gradient_from}]${pkg.gradient_via ? ` via-[${pkg.gradient_via}]` : ''} to-[${pkg.gradient_to}]`,
        badge: pkg.badge_text || 'STANDARD',
        badgeColor: `bg-[${pkg.badge_color || '#6B7280'}]`,
        textColor: 'text-white',
        buttonColor: 'bg-white text-gray-800 hover:bg-gray-100'
    };

    // Si hay oferta activa, usar estilos especiales
    if (pkg.current_offer) {
        if (pkg.current_offer.special_gradient_from && pkg.current_offer.special_gradient_to) {
            styles.gradient = `from-[${pkg.current_offer.special_gradient_from}]${pkg.current_offer.special_gradient_via ? ` via-[${pkg.current_offer.special_gradient_via}]` : ''
                } to-[${pkg.current_offer.special_gradient_to}]`;
        }
        if (pkg.current_offer.special_badge_text) {
            styles.badge = pkg.current_offer.special_badge_text;
        }
        if (pkg.current_offer.special_badge_color) {
            styles.badgeColor = `bg-[${pkg.current_offer.special_badge_color}]`;
        }
    }

    return styles;
}

// Convertir CalculatedTicketPackage a TicketOption para compatibilidad
export function packageToTicketOption(pkg: CalculatedTicketPackage): any {
    return {
        id: pkg.id,
        amount: pkg.final_amount,
        price: pkg.final_price,
        originalAmount: pkg.amount,
        package: pkg // Incluir toda la información del paquete
    };
}

export class RaffleService {
    static async getRafflesByTenant(tenantId: string): Promise<Raffle[]> {
        try {
            const { data, error } = await supabase
                .from('raffles')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching raffles:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Unexpected error in getRafflesByTenant:', error);
            return [];
        }
    }

    static async getRaffleById(id: string): Promise<Raffle | null> {
        try {
            const { data, error } = await supabase
                .from('raffles')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error('Error fetching raffle:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Unexpected error in getRaffleById:', error);
            return null;
        }
    }

    static async getRaffleMedia(raffleId: string): Promise<RaffleMedia[]> {
        try {
            const { data, error } = await supabase
                .from('raffle_media')
                .select('*')
                .eq('raffle_id', raffleId)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching raffle media:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Unexpected error in getRaffleMedia:', error);
            return [];
        }
    }

    static async getSoldTicketsCount(raffleId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('raffle_entries')
                .select('*', { count: 'exact', head: true })
                .eq('raffle_id', raffleId)
                .eq('payment_status', 'completed');

            if (error) {
                console.error('Error counting sold tickets:', error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error('Unexpected error in getSoldTicketsCount:', error);
            return 0;
        }
    }

    static async getBlessedNumbers(raffleId: string): Promise<BlessedNumber[]> {
        try {
            const { data, error } = await supabase
                .from('blessed_numbers')
                .select('*')
                .eq('raffle_id', raffleId)
                .eq('is_claimed', false);

            if (error) {
                console.error('Error fetching blessed numbers:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Unexpected error in getBlessedNumbers:', error);
            return [];
        }
    }

    static async buildRaffleData(
        raffle: Raffle,
        soldTickets: number,
        media: RaffleMedia[],
        blessedNumbers: BlessedNumber[],
        allRaffles?: Raffle[]
    ): Promise<RaffleData> {
        const images = media
            .filter(m => m.media_type === 'image')
            .map(m => m.file_url);

        const progress = raffle.total_numbers > 0
            ? Math.min((soldTickets / raffle.total_numbers) * 100, 100)
            : 0;

        // Calculate time remaining
        const timeRemaining = this.calculateTimeRemaining(raffle.draw_date);

        // Build products for luxury template (all raffles as products)
        const products: Product[] = (allRaffles || [raffle]).map(r => ({
            id: r.id,
            name: r.title,
            image: r.banner_url || '/default-raffle-image.jpg',
            originalPrice: r.price * r.total_numbers,
            ticketPrice: r.price,
            totalTickets: r.total_numbers,
            soldTickets: r.id === raffle.id ? soldTickets : 0, // TODO: Calculate for each raffle
            endDate: r.draw_date,
            featured: r.id === raffle.id,
            category: 'raffle',
            progress: r.id === raffle.id ? progress : 0
        }));

        // Mock testimonials for luxury template
        const testimonials: Testimonial[] = [
            {
                id: 1,
                name: "María González",
                location: "Madrid, España",
                product: raffle.title,
                comment: "¡No puedo creer que gané! El proceso fue muy transparente y confiable.",
                rating: 5,
                avatar: "https://plus.unsplash.com/premium_photo-1690086519096-0594592709d3?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: raffle.price * raffle.total_numbers * 0.1
            },
            {
                id: 2,
                name: "Juan Pérez",
                location: "Barcelona, España",
                product: raffle.title,
                comment: "La experiencia fue increíble. ¡Definitivamente participaré de nuevo!",
                rating: 4,
                avatar: "https://plus.unsplash.com/premium_photo-1679888488670-4b4bf8e05bfc?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: raffle.price * raffle.total_numbers * 0.1
            },
            {
                id: 3,
                name: "Laura Martínez",
                location: "Valencia, España",
                product: raffle.title,
                comment: "Una experiencia única. ¡Gracias por la oportunidad!",
                rating: 5,
                avatar: "https://plus.unsplash.com/premium_photo-1670884441012-c5cf195c062a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                prize_value: raffle.price * raffle.total_numbers * 0.1
            }
        ];

        return {
            ...raffle,
            soldTickets,
            images,
            blessedNumbers: blessedNumbers.map(bn => bn.number),
            media,
            products,
            testimonials,
            progress,
            timeRemaining
        };
    }

    private static calculateTimeRemaining(drawDate: string) {
        const now = new Date();
        const end = new Date(drawDate);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }
}