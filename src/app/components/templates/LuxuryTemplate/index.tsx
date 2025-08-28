// components/templates/LuxuryTemplate/index.tsx
'use client';
import { useState, useEffect } from 'react';
import { LuxuryHeader } from './organisms/Header';
import { LuxuryHeroSection } from './organisms/HeroSection';
import { LuxuryProductsSection } from './organisms/ProductsSection';
import { LuxuryOffersSection } from './organisms/OffersSection';
import { LuxuryTestimonialsSection } from './organisms/TestimonialsSection';
import { LuxuryCallToActionSection } from './organisms/CallToActionSection';
import { LuxuryFooter } from './organisms/Footer';
import { ExtendedRaffleData, TicketOption, TenantConfig } from '@/app/types';

interface LuxuryTemplateProps {
  raffleData: ExtendedRaffleData;
  ticketOptions: TicketOption[]; // Paquetes de tickets como ofertas
  tenantConfig: TenantConfig;
}

export const LuxuryTemplate: React.FC<LuxuryTemplateProps> = ({
  raffleData,
  ticketOptions,
  tenantConfig
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  console.log('Tiempo restante:', raffleData);
  // Lógica del contador regresivo
  useEffect(() => {
    const targetDate = new Date(raffleData.draw_date).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raffleData.draw_date]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      <LuxuryHeader tenantConfig={tenantConfig} />

      <LuxuryHeroSection
        raffleData={raffleData}
        timeLeft={timeLeft}
      />

      {/* Solo mostrar productos si hay múltiples rifas */}
      {/* Cambiar de length > 1 a length > 0 */}
      {raffleData.products && raffleData.products.length > 0 && (
        <LuxuryProductsSection
          products={raffleData.products}
        />
      )}

      {/* Ofertas de tickets (paquetes) de la rifa principal */}
      <LuxuryOffersSection
        offers={ticketOptions} // Los paquetes de tickets como ofertas
      />

      {raffleData.testimonials && raffleData.testimonials.length > 0 && (
        <LuxuryTestimonialsSection
          testimonials={raffleData.testimonials}
        />
      )}

      <LuxuryCallToActionSection />

      <LuxuryFooter tenantConfig={tenantConfig} />
    </div>
  );
};