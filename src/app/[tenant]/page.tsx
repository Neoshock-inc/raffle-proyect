// app/[tenant]/page.tsx
import { notFound } from 'next/navigation';
import { DefaultTemplate } from '../components/templates/DefaultTemplate';
import { LuxuryTemplate } from '../components/templates/LuxuryTemplate';
import { supabase } from '../lib/supabase';
import { CalculatedTicketPackage } from '../types';

// Mapeo de templates disponibles
const templates = {
  'default': DefaultTemplate,
  'luxury': LuxuryTemplate,
} as const;

interface PageProps {
  params: { tenant: string };
}

export default async function TenantPage({ params }: PageProps) {
  const { tenant: tenantSlug } = params;

  try {
    // 1. Buscar tenant por slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError);
      notFound();
    }

    // 2. Obtener TODAS las rifas activas del tenant (products)
    const { data: raffles, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (rafflesError || !raffles || raffles.length === 0) {
      console.error('No active raffles found:', rafflesError);
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {tenant.name}
            </h1>
            <p className="text-gray-600">
              No hay rifas activas en este momento. ¡Mantente atento!
            </p>
          </div>
        </div>
      );
    }

    // 3. Tomar la rifa principal (primera) para el template actual
    const mainRaffle = raffles[0];

    // 4. Obtener paquetes de tickets para la rifa principal (offers)
    const { data: ticketPackages, error: packagesError } = await supabase
      .from('ticket_packages')
      .select(`
        *,
        ticket_package_time_offers(*)
      `)
      .eq('raffle_id', mainRaffle.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (packagesError) {
      console.error('Error fetching ticket packages:', packagesError);
    }

    // 5. Obtener medios de la rifa principal
    const { data: media, error: mediaError } = await supabase
      .from('raffle_media')
      .select('*')
      .eq('raffle_id', mainRaffle.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    }

    // 6. Contar entradas vendidas para la rifa principal
    const { count: soldTickets, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('raffle_id', mainRaffle.id)
      .eq('payment_status', 'completed');

    if (entriesError) {
      console.error('Error fetching sold tickets:', entriesError);
    }

    // 7. Obtener números bendecidos para la rifa principal
    const { data: blessedNumbers, error: blessedError } = await supabase
      .from('blessed_numbers')
      .select('*')
      .eq('raffle_id', mainRaffle.id)
      .eq('is_claimed', false);

    if (blessedError) {
      console.error('Error fetching blessed numbers:', blessedError);
    }

    // 8. Calcular ofertas actuales con descuentos temporales
    const currentTime = new Date();
    const calculatedPackages = (ticketPackages || []).map(pkg => {
      // Buscar oferta temporal activa
      const activeOffer = pkg.ticket_package_time_offers?.find((offer: { is_active: any; start_date: string | number | Date; end_date: string | number | Date; }) => 
        offer.is_active && 
        new Date(offer.start_date) <= currentTime && 
        new Date(offer.end_date) >= currentTime
      );

      // Calcular precio final
      const basePrice = pkg.fixed_price || (pkg.amount * mainRaffle.price * pkg.price_multiplier);
      const totalDiscount = pkg.discount_percentage + (activeOffer?.special_discount_percentage || 0);
      const finalPrice = basePrice * (1 - totalDiscount / 100);

      // Calcular cantidad final con bonus
      const totalBonusEntries = pkg.bonus_entries + (activeOffer?.special_bonus_entries || 0);
      const finalAmount = pkg.amount + totalBonusEntries;

      // Compose button text (customize as needed)
      const buttonText = `Comprar ${finalAmount} por $${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        ...pkg,
        final_price: finalPrice,
        final_amount: finalAmount,
        current_offer: activeOffer,
        is_available: true, // Lógica adicional si es necesaria
        entries_display: `${finalAmount.toLocaleString()} Entries`,
        multiplier_display: `${Math.round(finalAmount / pkg.amount)}x`,
        // Mantener compatibilidad con templates existentes
        price: finalPrice,
        amount: finalAmount,
        originalPrice: basePrice,
        discount: totalDiscount,
        badge: activeOffer?.special_badge_text || pkg.badge_text,
        badgeColor: activeOffer?.special_badge_color || pkg.badge_color,
        gradient: {
          from: activeOffer?.special_gradient_from || pkg.gradient_from,
          via: activeOffer?.special_gradient_via || pkg.gradient_via,
          to: activeOffer?.special_gradient_to || pkg.gradient_to
        },
        // Add required TicketOption property
        buttonText,
      } as CalculatedTicketPackage & {
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
        buttonText: string;
      };
    });

    // 9. Preparar productos (todas las rifas) para luxury template
    const products = raffles.map(raffle => ({
      id: raffle.id,
      name: raffle.title,
      image: raffle.banner_url || '/default-raffle-image.jpg',
      originalPrice: raffle.price * raffle.total_numbers, // Valor total del premio
      ticketPrice: raffle.price,
      totalTickets: raffle.total_numbers,
      soldTickets: 0, // TODO: Contar por cada rifa
      endDate: raffle.draw_date,
      featured: false, // TODO: Lógica de destacado
      category: 'raffle' // TODO: Usar raffle_categories
    }));

    // 10. Preparar datos para el template
    const raffleData = {
      // Datos de la rifa principal
      ...mainRaffle,
      soldTickets: soldTickets || 0,
      images: media?.map(m => m.file_url) || [],
      blessedNumbers: blessedNumbers?.map(bn => bn.number) || [],
      media: media || [],
      
      // Para luxury template - múltiples rifas como productos
      products: products,
      
      // Testimonios mock para luxury template
      testimonials: tenant.layout === 'luxury' ? [
        {
          id: 1,
          name: "María González",
          location: "Madrid, España",
          product: mainRaffle.title,
          comment: "¡No puedo creer que gané! El proceso fue muy transparente y confiable.",
          rating: 5,
          avatar: "https://plus.unsplash.com/premium_photo-1690086519096-0594592709d3?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          prize_value: mainRaffle.price * mainRaffle.total_numbers * 0.1 // 10% del valor total
        },
        {
          id: 2,
          name: "Juan Pérez",
          location: "Barcelona, España",
          product: mainRaffle.title,
          comment: "La experiencia fue increíble. ¡Definitivamente participaré de nuevo!",
          rating: 4,
          avatar: "https://plus.unsplash.com/premium_photo-1679888488670-4b4bf8e05bfc?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          prize_value: mainRaffle.price * mainRaffle.total_numbers * 0.1 // 10% del valor total
        },
        {
          id: 3,
          name: "Laura Martínez",
          location: "Valencia, España",
          product: mainRaffle.title,
          comment: "Una experiencia única. ¡Gracias por la oportunidad!",
          rating: 5,
          avatar: "https://plus.unsplash.com/premium_photo-1670884441012-c5cf195c062a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          prize_value: mainRaffle.price * mainRaffle.total_numbers * 0.1 // 10% del valor total
        }
      ] : []
    };

    // 11. Configuración del tenant
    const tenantConfig = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      layout: tenant.layout,
      features: {
        countdown: mainRaffle.show_countdown,
        progressBar: mainRaffle.show_progress_bar,
        testimonials: tenant.layout === 'luxury',
        customTickets: true,
        blessedNumbers: (blessedNumbers?.length || 0) > 0,
      },
      colors: {
        primary: mainRaffle.primary_color,
        secondary: mainRaffle.secondary_color,
        background: mainRaffle.background_color,
        text: mainRaffle.text_color
      },
      branding: {
        logo: mainRaffle.logo_url,
        banner: mainRaffle.banner_url
      }
    };

    // 12. Seleccionar template basado en el layout del tenant
    const Template = templates[tenant.layout as keyof typeof templates] || DefaultTemplate;

    // 13. Renderizar template
    return (
      <Template 
        raffleData={raffleData}
        ticketOptions={calculatedPackages} // Paquetes de tickets como ofertas
        tenantConfig={tenantConfig}
      />
    );

  } catch (error) {
    console.error('Error in TenantPage:', error);
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error del Servidor
          </h1>
          <p className="text-gray-600">
            Ha ocurrido un error. Por favor, intenta más tarde.
          </p>
        </div>
      </div>
    );
  }
}

// Para generar metadata dinámico
export async function generateMetadata({ params }: PageProps) {
  const { tenant: tenantSlug } = params;
  
  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('slug', tenantSlug)
      .single();

    if (!tenant) {
      return {
        title: 'Tenant Not Found',
      };
    }

    const { data: raffle } = await supabase
      .from('raffles')
      .select('title, description')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .single();

    return {
      title: `${raffle?.title || 'Rifa'} - ${tenant.name}`,
      description: raffle?.description || `Participa en las rifas de ${tenant.name}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Rifa',
    };
  }
}