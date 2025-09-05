// src/app/[tenant]/page.tsx - Fixed for Next.js 15
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DefaultTemplate } from '../components/templates/DefaultTemplate';

import { RaffleService } from '../services/raffleService';
import { TenantService } from '../services/tenantService';
import { TicketPackageService } from '../services/ticketPackageService';
import { VibrantTemplate } from '../components/templates/VibrantTemplate';

// Mapeo de templates con nombres más descriptivos
const templates = {
  'default': DefaultTemplate,      // Diseño limpio y funcional
  'vibrant': VibrantTemplate,      // Diseño llamativo con animaciones (antes luxury)
  'classic': DefaultTemplate,      // Alias para default
} as const;

interface PageProps {
  params: Promise<{ tenant: string }>; // Changed to Promise
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

    // 2. Obtener TODAS las rifas activas del tenant
    const raffles = await RaffleService.getRafflesByTenant(tenant.id);

    if (raffles.length === 0) {
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

    // 3. Tomar la rifa principal (primera)
    const mainRaffle = raffles[0];

    // 4. Obtener datos adicionales para la rifa principal
    const [media, soldTickets, blessedNumbers] = await Promise.all([
      RaffleService.getRaffleMedia(mainRaffle.id),
      RaffleService.getSoldTicketsCount(mainRaffle.id),
      RaffleService.getBlessedNumbers(mainRaffle.id)
    ]);

    // 5. Obtener paquetes de tickets
    const packages = await TicketPackageService.getTicketPackages(mainRaffle.id);
    const packageIds = packages.map(p => p.id);
    const offers = packageIds.length > 0
      ? await TicketPackageService.getTimeOffers(packageIds)
      : [];

    // 6. Calcular paquetes finales con ofertas
    const calculatedPackages = packages.length > 0
      ? TicketPackageService.calculatePackages(packages, offers, mainRaffle.price)
      : TicketPackageService.createFallbackPackages(mainRaffle.price);

    // 7. Construir datos completos de la rifa
    const raffleData = await RaffleService.buildRaffleData(
      mainRaffle,
      soldTickets,
      media,
      blessedNumbers,
      raffles
    );

    // 8. Construir configuración del tenant
    const tenantConfig = await TenantService.getTenantConfig(tenant, mainRaffle);

    // Update features based on available data
    tenantConfig.features.blessedNumbers = blessedNumbers.length > 0;

    // 9. Seleccionar template basado en el layout del tenant
    const Template = templates[tenant.layout as keyof typeof templates] || DefaultTemplate;

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