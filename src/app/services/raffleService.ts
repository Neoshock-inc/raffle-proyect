// services/ticketPackageService.ts
import { supabase } from "../lib/supabase";
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
    const raffle = await getActiveRaffle();
    if (!raffle) throw new Error('No hay rifa activa');

    // Paquetes + ofertas (como arreglo anidado)
    const { data: packages, error } = await supabase
        .from('ticket_packages')
        .select(`
      *,
      ticket_package_time_offers (
        id,
        ticket_package_id,
        offer_name,
        start_date,
        end_date,
        special_discount_percentage,
        special_bonus_entries,
        special_badge_text,
        special_badge_color,
        special_gradient_from,
        special_gradient_via,
        special_gradient_to,
        max_purchases_during_offer,
        stock_limit_for_offer,
        is_active,
        created_at
      )
    `)
        .eq('raffle_id', raffle.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) throw error;

    const now = new Date();
    const result: CalculatedTicketPackage[] = [];

    // Procesar cada paquete una sola vez
    (packages ?? []).forEach((pkg: any) => {
        const offers: TicketPackageTimeOffer[] = (pkg.ticket_package_time_offers ?? []) as TicketPackageTimeOffer[];

        // Solo ofertas activas en este instante
        const activeOffers = offers.filter(o =>
            o.is_active &&
            now >= new Date(o.start_date) &&
            now <= new Date(o.end_date)
        );

        // Calcular el paquete final (con o sin ofertas activas)
        const calculated = calculatePackage(pkg as TicketPackage, raffle, now, activeOffers);

        // Solo agregar si está disponible
        if (calculated.is_available) {
            result.push(calculated);
        }
    });

    return result;
}

// Obtener un paquete por ID (misma lógica de ofertas activas)
export async function getTicketPackageById(packageId: string): Promise<CalculatedTicketPackage | null> {
    const raffle = await getActiveRaffle();
    if (!raffle) throw new Error('No hay rifa activa');

    const { data: pkg, error } = await supabase
        .from('ticket_packages')
        .select(`
      *,
      ticket_package_time_offers (
        id,
        ticket_package_id,
        offer_name,
        start_date,
        end_date,
        special_discount_percentage,
        special_bonus_entries,
        special_badge_text,
        special_badge_color,
        special_gradient_from,
        special_gradient_via,
        special_gradient_to,
        max_purchases_during_offer,
        stock_limit_for_offer,
        is_active,
        created_at
      )
    `)
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

    if (error || !pkg) return null;

    const now = new Date();
    const offers: TicketPackageTimeOffer[] = (pkg.ticket_package_time_offers ?? []) as TicketPackageTimeOffer[];
    const activeOffers = offers.filter(o =>
        o.is_active &&
        now >= new Date(o.start_date) &&
        now <= new Date(o.end_date)
    );

    return calculatePackage(pkg as TicketPackage, raffle, now, activeOffers);
}

// Cálculo del paquete final - MEJORADO
function calculatePackage(
    pkg: TicketPackage,
    raffle: any,
    currentDate: Date,
    activeOffers: TicketPackageTimeOffer[]
): CalculatedTicketPackage {

    // Encontrar la mejor oferta activa (mayor descuento)
    const bestOffer = activeOffers.reduce<TicketPackageTimeOffer | null>((best, current) => {
        if (!best) return current;
        return (current.special_discount_percentage || 0) > (best.special_discount_percentage || 0)
            ? current : best;
    }, null);

    // Precio base
    let final_price = pkg.fixed_price ?? (pkg.amount * (raffle.price ?? 1) * (pkg.price_multiplier ?? 1));

    // Descuento mayor entre paquete y oferta
    const baseDiscount = pkg.discount_percentage || 0;
    const offerDiscount = bestOffer?.special_discount_percentage || 0;
    const discount = Math.max(baseDiscount, offerDiscount);
    if (discount > 0) final_price = final_price * (1 - discount / 100);

    // Bonus
    const bonus = (pkg.bonus_entries || 0) + (bestOffer?.special_bonus_entries || 0);
    const final_amount = pkg.amount + bonus;

    // Disponibilidad
    const is_available = checkAvailability(pkg, currentDate, bestOffer || undefined);

    // Displays
    const entries_display = `${(final_amount * 100).toLocaleString()} Entries`;
    const multiplier_display = pkg.custom_multiplier_text || `${Math.floor(final_amount / 10)}x`;

    return {
        ...pkg,
        final_price: Math.round(final_price * 100) / 100,
        final_amount,
        current_offer: bestOffer || undefined, // Solo la mejor oferta activa
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