// src/components/offroad/StatsSection.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface StatsSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

export function StatsSection({ raffleData, tenantConfig }: StatsSectionProps) {
  // Calcular estadísticas dinámicas basadas en datos reales
  const stats = [
    {
      value: raffleData.soldTickets.toLocaleString(),
      label: 'Números Vendidos',
      color: 'text-yellow-400',
      icon: '🎯'
    },
    {
      value: `$${(raffleData.price * raffleData.total_numbers).toLocaleString()}`,
      label: 'Valor del Premio',
      color: 'text-green-400',
      icon: '💰'
    },
    {
      value: raffleData.total_numbers.toLocaleString(),
      label: 'Total de Números',
      color: 'text-blue-400',
      icon: '🎟️'
    },
    {
      value: '100%',
      label: 'Transparencia',
      color: 'text-red-400',
      icon: '✅'
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index} className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className={`text-4xl sm:text-5xl font-black ${stat.color} mb-2 group-hover:animate-pulse`}>
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progreso adicional si está habilitado */}
        {tenantConfig.features.progressBar && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-bold text-xl mb-4 text-center">
                Progreso del Sorteo
              </h3>
              <div className="space-y-2">
                <div className="bg-gray-600 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-full transition-all duration-1000 flex items-center justify-center"
                    style={{ width: `${Math.min(raffleData.progress || 0, 100)}%` }}
                  >
                    <span className="text-black font-bold text-sm">
                      {Math.round(raffleData.progress || 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}