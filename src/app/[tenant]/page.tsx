// src/app/[tenant]/page.tsx - Fixed for Next.js 15
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DefaultTemplate } from '../components/templates/DefaultTemplate';

import { RaffleService } from '../services/raffleService';
import { TenantService } from '../services/tenantService';
import { TicketPackageService } from '../services/ticketPackageService';
import { VibrantTemplate } from '../components/templates/VibrantTemplate';
import { OffroadTemplate } from '../components/templates/OffroadTemplate';
import { getBaseUrl } from '../(auth)/utils/tenant';

// Mapeo de templates con nombres más descriptivos
const templates = {
  'default': DefaultTemplate,      // Diseño limpio y funcional
  'latina': VibrantTemplate,      // Diseño llamativo con animaciones (antes luxury)
  'classic': DefaultTemplate,      // Alias para default
  'offroad': OffroadTemplate,     // Diseño 4x4 extremo con estética oscura
} as const;

interface PageProps {
  params: Promise<{ tenant: string }>; // Changed to Promise
}

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;

  try {
    // Obtener información del tenant
    const tenant = await TenantService.getTenantBySlug(tenantSlug);

    if (!tenant) {
      return {
        title: 'Tenant no encontrado',
        description: 'El tenant solicitado no existe'
      };
    }

    // Obtener configuración completa
    const tenantFullConfig = await TenantService.getTenantFullConfig(tenant.id);

    // Obtener rifa activa para información adicional
    const raffles = await RaffleService.getRafflesByTenant(tenant.id);
    const mainRaffle = raffles?.[0];

    // Construir metadatos
    const companyName = tenantFullConfig?.config?.company_name || tenant.name;
    const description = tenantFullConfig?.config?.company_description ||
      tenant.description ||
      'Sorteos transparentes y confiables';

    const faviconUrl = tenantFullConfig?.config?.favicon_url || '/favicon.ico';
    const logoUrl = tenantFullConfig?.config?.logo_url;

    // Título dinámico basado en la rifa activa
    let title = companyName;
    if (mainRaffle) {
      title = `${mainRaffle.title} - ${companyName}`;
    }

    return {
      title,
      description,
      icons: {
        icon: faviconUrl,
        apple: logoUrl || faviconUrl,
      },
      openGraph: {
        title,
        description,
        url: `${getBaseUrl()}/${tenantSlug}`,
        siteName: companyName,
        images: logoUrl ? [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: companyName,
          }
        ] : [],
        locale: 'es_ES',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: logoUrl ? [logoUrl] : [],
      },
      // Metadatos adicionales para SEO
      keywords: [
        'rifas',
        'sorteos',
        'premios',
        companyName,
        ...(mainRaffle ? [mainRaffle.title] : [])
      ].join(', '),
      authors: [{ name: companyName }],
      robots: {
        index: true,
        follow: true,
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Sorteos Online',
      description: 'Plataforma de sorteos transparentes'
    };
  }
}

export default async function TenantPage({ params }: PageProps) {
  // Await the params Promise
  const { tenant: tenantSlug } = await params;

  try {
    // 1. Buscar tenant por slug
    const tenant = await TenantService.getTenantBySlug(tenantSlug);

    if (!tenant) {
      console.error('Tenant not found:', tenantSlug);
      notFound();
    }

    // 2. Obtener configuración completa del tenant
    const tenantFullConfig = await TenantService.getTenantFullConfig(tenant.id);

    // if (!tenantFullConfig) {
    //   // Intentar crear configuración por defecto
    //   const configCreated = await TenantService.createDefaultConfig(tenant.id);
    //   if (configCreated) {
    //     // Volver a intentar obtener la configuración
    //     const retryConfig = await TenantService.getTenantFullConfig(tenant.id);
    //     if (!retryConfig) {
    //       console.error('Failed to create or retrieve tenant config');
    //       notFound();
    //     }
    //   } else {
    //     notFound();
    //   }
    // }

    // 3. Obtener TODAS las rifas activas del tenant
    const raffles = await RaffleService.getRafflesByTenant(tenant.id);

    if (raffles.length === 0) {
      // Usar configuración del tenant si está disponible
      const companyName = tenantFullConfig?.config?.company_name || tenant.name;
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {companyName}
            </h1>
            <p className="text-gray-600">
              No hay rifas activas en este momento. ¡Mantente atento!
            </p>
          </div>
        </div>
      );
    }

    // 4. Tomar la rifa principal (primera)
    const mainRaffle = raffles[0];

    // 5. Obtener datos adicionales para la rifa principal
    const [media, soldTickets, blessedNumbers] = await Promise.all([
      RaffleService.getRaffleMedia(mainRaffle.id),
      RaffleService.getSoldTicketsCount(mainRaffle.id),
      RaffleService.getBlessedNumbers(mainRaffle.id)
    ]);

    // 6. Obtener paquetes de tickets
    const packages = await TicketPackageService.getTicketPackages(mainRaffle.id);

    const calculatedPackages =
      packages.length > 0
        ? TicketPackageService.calculatePackages(packages, mainRaffle.price)
        : TicketPackageService.createFallbackPackages();

    console.log('Calculated Packages:', calculatedPackages);

    // 7. Construir datos completos de la rifa
    const raffleData = await RaffleService.buildRaffleData(
      mainRaffle,
      soldTickets,
      media,
      blessedNumbers,
      raffles
    );

    // 8. Construir configuración del tenant para los templates
    const tenantConfig = TenantService.buildTenantConfig(
      tenantFullConfig!,
      mainRaffle
    );

    // Actualizar características basadas en datos disponibles
    tenantConfig.features.blessedNumbers = blessedNumbers.length > 0;

    console.log('Tenant Config:', tenantConfig);

    // 9. Seleccionar template basado en el layout del tenant
    const Template = templates[tenant.layout as keyof typeof templates] || DefaultTemplate;

    console.log(`Using template: ${tenant.layout} for tenant: ${tenant.slug}`);

    // 10. Renderizar template con props tipados
    return (
      <Template
        raffleData={raffleData}
        ticketOptions={calculatedPackages}
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}