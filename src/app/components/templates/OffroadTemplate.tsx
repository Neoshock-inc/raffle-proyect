// src/components/templates/OffroadTemplate.tsx
'use client';

import React from 'react';
import { Header } from '../offroad/Header';
import { HeroSection } from '../offroad/HeroSection';
import { CountdownSection } from '../offroad/CountdownSection';
import { StatsSection } from '../offroad/StatsSection';
import { PrizeSection } from '../offroad/PrizeSection';
import { PackagesSection } from '../offroad/PackagesSection';
import { TestimonialsSection } from '../offroad/TestimonialsSection';
import { WinnersSection } from '../offroad/WinnersSection';
import { FAQSection } from '../offroad/FAQSection';
import { CallToActionSection } from '../offroad/CallToActionSection';
import { Footer } from '../offroad/Footer';
import { OffroadTemplateProps } from '@/app/types/template-props';
import { WhatsAppButton } from '../WhatsAppButton';

export const OffroadTemplate: React.FC<OffroadTemplateProps> = ({
  raffleData,
  ticketOptions,
  tenantConfig
}) => {
  if (!raffleData || !tenantConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-xl text-white">Cargando experiencia offroad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Hero Section con Carrusel */}
      <HeroSection
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Estadísticas */}
      <StatsSection
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Premio Principal */}
      <PrizeSection
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Paquetes de Tickets */}
      <PackagesSection
        ticketOptions={ticketOptions}
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Testimonios */}
      {tenantConfig.features.testimonials && (
        <TestimonialsSection
          raffleData={raffleData}
          tenantConfig={tenantConfig}
        />
      )}

      {/* Ganadores Anteriores */}
      {/* <WinnersSection
        tenantConfig={tenantConfig}
      /> */}

      {/* FAQ */}
      <FAQSection
        tenantConfig={tenantConfig}
      />

      {/* Call to Action Final */}
      <CallToActionSection
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Footer */}
      <Footer
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {/* Botón flotante de WhatsApp parametrizado */}
      <WhatsAppButton
        tenantConfig={tenantConfig}
        className="animate-bounce"
      />
    </div>
  );
};