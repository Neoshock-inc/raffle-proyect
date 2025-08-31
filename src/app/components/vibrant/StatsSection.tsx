// src/components/luxury/StatsSection.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface StatsSectionProps {
  tenantConfig: TenantConfig;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ tenantConfig }) => {
  const stats = [
    {
      icon: '🎁',
      value: '$2.5M+',
      label: 'En Premios Entregados',
      color: 'text-red-500'
    },
    {
      icon: '👥',
      value: '150K+',
      label: 'Participantes Felices',
      color: 'text-orange-500'
    },
    {
      icon: '🏆',
      value: '8,500+',
      label: 'Ganadores',
      color: 'text-green-500'
    },
    {
      icon: '🌎',
      value: '20+',
      label: 'Países Participando',
      color: 'text-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce">{stat.icon}</div>
              <h3 className={`text-4xl font-black ${stat.color} mb-2 group-hover:text-opacity-80 transition-colors`}>
                {stat.value}
              </h3>
              <p className="text-gray-600 text-lg font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Additional animated elements */}
        <div className="mt-16 text-center">
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-2xl animate-pulse">🎉</div>
            <div className="text-2xl animate-bounce">💰</div>
            <div className="text-2xl animate-pulse">🏅</div>
            <div className="text-2xl animate-bounce">🎊</div>
          </div>
          
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-orange-800 mb-3">
              ¡Únete a la Comunidad Ganadora!
            </h3>
            <p className="text-orange-700">
              Miles de personas ya han cumplido sus sueños con {tenantConfig.name}. 
              ¡Tu momento puede ser ahora!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
