'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RaffleData, TenantConfig } from '@/types/template';

interface PrizeSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

export const PrizeSection: React.FC<PrizeSectionProps> = ({
  raffleData,
  tenantConfig
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = raffleData.images.length > 0 ? raffleData.images : [raffleData.banner_url || '/default-prize.jpg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section
      id="prizes"
      className="py-16"
      style={{ backgroundColor: tenantConfig.accent_color }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: tenantConfig.primary_color }}
          >
            {raffleData.title}
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: tenantConfig.accent_color }}
          >
            {raffleData.description}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative h-80 overflow-hidden rounded-3xl shadow-2xl">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${index === currentImageIndex ? 'translate-x-0' :
                    index < currentImageIndex ? '-translate-x-full' : 'translate-x-full'
                  }`}
              >
                <img
                  src={image}
                  alt={`Prize ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" style={{ color: tenantConfig.primary_color }} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronRight className="w-6 h-6" style={{ color: tenantConfig.primary_color }} />
              </button>

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex
                        ? 'bg-white shadow-lg scale-125'
                        : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <p
            className="text-3xl font-bold"
            style={{ color: tenantConfig.accent_color }}
          >
            Precio por ticket: ${raffleData.price}
          </p>
        </div>
      </div>
    </section>
  );
};