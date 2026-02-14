// src/app/[tenant]/page.tsx - Fixed for Next.js 15
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DefaultTemplate } from '@/components/templates/DefaultTemplate';

import { RaffleService } from '@/services/raffleService';
import { TenantService } from '@/services/tenantService';
import { TicketPackageService } from '@/services/ticketPackageService';
import { VibrantTemplate } from '@/components/templates/VibrantTemplate';
import { OffroadTemplate } from '@/components/templates/OffroadTemplate';
import { getBaseUrl } from '@/admin/utils/tenant';

import { MetaPixel } from '@/components/components/analytics/MetaPixel';
import { TenantFullConfig } from '@/types/database';

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

    // Obtener rifas para información adicional
    const raffles = await RaffleService.getRafflesByTenant(tenant.id);

    // Construir metadatos
    const companyName = tenantFullConfig?.config?.company_name || tenant.name;
    const baseDescription = tenantFullConfig?.config?.company_description ||
      tenant.description ||
      'Sorteos transparentes y confiables';

    const faviconUrl = tenantFullConfig?.config?.favicon_url || '/favicon.ico';
    const logoUrl = tenantFullConfig?.config?.logo_url;

    // Título genérico para la página del tenant
    const title = `${companyName} - Rifas y Sorteos`;

    // Descripción genérica
    const description = `${baseDescription}. Explora todas nuestras rifas activas.`;

    // Palabras clave que incluyen los nombres de todas las rifas
    const raffleKeywords = raffles.map(r => r.title);

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
        ...raffleKeywords
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

    // 3. Obtener TODAS las rifas activas del tenant
    const raffles = await RaffleService.getRafflesByTenant(tenant.id);
    console.log(`Se encontraron ${raffles.length} rifas activas para el tenant ${tenantSlug}.`);

    // Extraer metaPixel del tenant
    const metaPixelId = tenant.metadata?.metaPixel?.enabled
      ? tenant.metadata.metaPixel.id
      : null;

    if (raffles.length === 0) {
      // Usar configuración del tenant si está disponible
      const companyName = tenantFullConfig?.config?.company_name || tenant.name;
      return (
        <>
          {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
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
        </>
      );
    }

    // 4. Procesar cada rifa activa en paralelo
    const renderedRaffles = await Promise.all(raffles.map(async (currentRaffle) => {
      // 5. Obtener datos adicionales para la rifa actual
      const [media, soldTickets, blessedNumbers, packages] = await Promise.all([
        RaffleService.getRaffleMedia(currentRaffle.id),
        RaffleService.getSoldTicketsCount(currentRaffle.id),
        RaffleService.getBlessedNumbers(currentRaffle.id),
        TicketPackageService.getTicketPackages(currentRaffle.id)
      ]);

      const calculatedPackages =
        packages.length > 0
          ? TicketPackageService.calculatePackages(packages, currentRaffle.price)
          : TicketPackageService.createFallbackPackages();

      // 6. Construir datos completos de la rifa actual
      const raffleData = await RaffleService.buildRaffleData(
        currentRaffle,
        soldTickets,
        media,
        blessedNumbers,
        raffles
      );

      // 7. Construir configuración del tenant
      const tenantConfig = TenantService.buildTenantConfig(
        tenantFullConfig!,
        currentRaffle
      );

      // Actualizar características basadas en datos de la rifa actual
      tenantConfig.features.blessedNumbers = blessedNumbers.length > 0;

      // 8. Seleccionar template
      const Template = templates[tenant.layout as keyof typeof templates] || DefaultTemplate;

      return (
        <Template
          key={currentRaffle.id} // Clave única para el renderizado de listas en React
          raffleData={raffleData}
          ticketOptions={calculatedPackages}
          tenantConfig={tenantConfig}
        />
      );
    }));

    // 9. Renderizar todos los templates con Meta Pixel
    return (
      <>
        {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
        <div className="flex flex-col gap-8"> {/* Contenedor para separar las rifas */}
          {renderedRaffles}
        </div>
      </>
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