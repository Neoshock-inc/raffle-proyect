// src/components/templates/LuxuryTemplate.tsx
'use client';

import { LuxuryTemplateProps } from '@/app/types/template-props';
import React from 'react';
import { Footer } from '../vibrant/Footer';
import { Header } from '../vibrant/Header';
import { CountdownSection } from '../vibrant/CountdownSection';
import { HeroCarousel } from '../vibrant/HeroCarousel';
import { ProductsGrid } from '../vibrant/ProductsGrid';
import { TestimonialsSection } from '../vibrant/TestimonialsSection';
import { CallToActionSection } from '../vibrant/CallToActionSection';
import { PackagesSection } from '../vibrant/PackagesSection';
import { StatsSection } from '../vibrant/StatsSection';

export const VibrantTemplate: React.FC<LuxuryTemplateProps> = ({ 
  raffleData, 
  ticketOptions, 
  tenantConfig,
  premiumFeatures = { vipSection: true, exclusiveOffers: true }
}) => {
  if (!raffleData || !tenantConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gradient-to-r from-red-500 to-pink-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading luxury experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <Header tenantConfig={tenantConfig} />
      
      <HeroCarousel 
        products={raffleData.products || []}
        tenantConfig={tenantConfig}
      />

      {tenantConfig.features.countdown && raffleData.draw_date && (
        <CountdownSection 
          endDate={raffleData.draw_date}
          tenantConfig={tenantConfig}
        />
      )}

      <ProductsGrid
        products={raffleData.products || []}
        tenantConfig={tenantConfig}
      />

      <PackagesSection
        ticketOptions={ticketOptions}
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      {tenantConfig.features.testimonials && (
        <TestimonialsSection
          testimonials={raffleData.testimonials || []}
          tenantConfig={tenantConfig}
        />
      )}

      <StatsSection tenantConfig={tenantConfig} />

      <CallToActionSection 
        raffleData={raffleData}
        tenantConfig={tenantConfig}
      />

      <Footer tenantConfig={tenantConfig} />
    </div>
  );
};