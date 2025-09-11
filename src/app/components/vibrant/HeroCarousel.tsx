// src/components/vibrant/HeroCarousel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, TenantConfig } from '@/app/types/template';

interface HeroCarouselProps {
  products: Product[];
  tenantConfig: TenantConfig;
}

export const HeroCarousel = ({
  products,
  tenantConfig
}: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  const nextSlide = () => {
    if (products.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    if (products.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  // Fallback si no hay productos
  if (!products || products.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
              ¡GANA EN GRANDE! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-yellow-100 max-w-3xl mx-auto mb-8">
              Las rifas más emocionantes. Premios increíbles, precios accesibles, ¡y mucha diversión!
            </p>
            <div className="flex justify-center space-x-4 text-4xl mb-8">
              <span>🏖️</span><span>🎊</span><span>🎁</span><span>💰</span><span>🏆</span>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="relative h-80 overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
              <div className="h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 h-full flex items-center justify-center px-12">
                  <div className="text-center text-white">
                    <h3 className="text-5xl font-black mb-4 drop-shadow-lg">
                      {tenantConfig.company_name}
                    </h3>
                    <p className="text-xl text-yellow-200 mb-6">
                      ¡Próximamente nuevas rifas increíbles!
                    </p>
                    <button className="bg-white text-red-500 font-bold px-8 py-4 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg">
                      ¡Mantente Atento! 🎯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg">
            ¡GANA EN GRANDE! 🎉
          </h1>
          <p className="text-xl md:text-2xl text-yellow-100 max-w-3xl mx-auto mb-8">
            Las rifas más emocionantes. Premios increíbles, precios accesibles, ¡y mucha diversión!
          </p>
          <div className="flex justify-center space-x-4 text-4xl mb-8">
            <span>🏖️</span><span>🎊</span><span>🎁</span><span>💰</span><span>🏆</span>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-80 overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' :
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <div className="h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <div className="relative z-10 h-full flex items-center justify-between px-12">
                    <div className="text-left text-white">
                      <p className="text-yellow-200 text-2xl mb-2 font-semibold">¡Premio Increíble!</p>
                      <h3 className="text-5xl font-black mb-4 drop-shadow-lg">{product.name}</h3>
                      <p className="text-4xl font-black text-yellow-300 mb-2">
                        ${product.originalPrice.toLocaleString()}
                      </p>
                      <p className="text-yellow-200 text-lg mb-4">
                        Tickets desde ${product.ticketPrice}
                      </p>
                      <button className="bg-white text-red-500 font-bold px-8 py-4 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg">
                        ¡Participar Ahora! 🎯
                      </button>
                    </div>
                    <div className="text-9xl drop-shadow-2xl">
                      🏆
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles del carrusel solo si hay más de un producto */}
          {products.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-red-500" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-red-500" />
              </button>

              {/* Indicadores */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white shadow-lg' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};