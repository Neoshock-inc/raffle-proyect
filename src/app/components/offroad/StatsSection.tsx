// src/components/offroad/StatsSection.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface StatsSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

export function StatsSection({ raffleData, tenantConfig }: StatsSectionProps) {

  return (
    <section className="py-6 px-4 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Progreso adicional si está habilitado */}
        {tenantConfig.features.progressBar && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl border border-gray-600">
              {/* Título Principal */}
              <h2 className="text-white font-black text-3xl md:text-4xl mb-6 text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                ¡Si pero las cantidades son limitadas!
              </h2>

              {/* Barra de Progreso Mejorada */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  {/* Barra de fondo con efectos */}
                  <div className="bg-gray-900 rounded-full h-8 overflow-hidden shadow-inner border-2 border-gray-500 relative">
                    {/* Efecto de brillo en el fondo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

                    {/* Barra de progreso principal */}
                    <div
                      className="relative h-full transition-all duration-1000 ease-out bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg"
                      style={{ width: `${Math.min(raffleData.progress || 0, 100)}%` }}
                    >
                      {/* Efecto de brillo en movimiento */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>

                      {/* Texto del porcentaje */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-black font-black text-lg drop-shadow-lg">
                          {Math.round(raffleData.progress || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Efecto de partículas flotantes */}
                  <div className="absolute -top-2 -bottom-2 left-0 right-0 pointer-events-none overflow-hidden rounded-full">
                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-60"></div>
                    <div className="absolute top-1/2 left-2/4 w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-red-300 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>

              {/* Subtítulo con información */}
              <div className="text-center space-y-4">
                <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
                  Cuando la barra llegue el 100% daremos por finalizado y procederemos a realizar el sorteo entre todos los participantes. Se tomarán los 5 números de la primera y segunda suerte del programa <span className="font-bold text-yellow-400">LOTO NACIONAL</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}