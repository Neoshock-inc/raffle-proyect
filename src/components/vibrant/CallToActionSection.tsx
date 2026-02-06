// src/components/luxury/CallToActionSection.tsx
'use client';

import { RaffleData, TenantConfig } from '@/types/template';
import React from 'react';

interface CallToActionSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ 
  raffleData,
  tenantConfig 
}) => {
  const handleGetStarted = () => {
    // Scroll to packages section
    const packagesSection = document.getElementById('paquetes');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: '✅',
      title: '100% Seguro',
      subtitle: 'Pagos protegidos',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-400',
      textColor: 'text-green-700'
    },
    {
      icon: '⚡',
      title: 'Sorteos en Vivo',
      subtitle: 'Transparencia total',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-700'
    },
    {
      icon: '🎁',
      title: 'Premios Reales',
      subtitle: 'Entrega garantizada',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-12">
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            🎉 ¡TU MOMENTO ES AHORA! 🎉
          </h2>
          <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
            Únete a miles de latinos que ya cumplieron sus sueños. 
            <br />¡El próximo ganador podrías ser TÚ! 🌟
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`${feature.bgColor} border-2 ${feature.borderColor} rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300`}
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className={`font-bold ${feature.textColor}`}>{feature.title}</p>
                <p className={`${feature.textColor} text-sm opacity-80`}>{feature.subtitle}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black px-16 py-6 rounded-full text-2xl hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105 shadow-2xl mb-6"
          >
            🚀 ¡EMPEZAR A GANAR AHORA!
          </button>
          
          <p className="text-gray-500 text-sm mt-6">
            * Registro gratuito • Sin comisiones ocultas • Soporte 24/7
          </p>

          {/* Prize highlight */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gold-100 to-yellow-100 border-2 border-yellow-400 rounded-2xl">
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">
              🏆 Premio Principal: {raffleData.title}
            </h3>
            <p className="text-yellow-700 text-lg">
              Valor: ${(raffleData.price * raffleData.total_numbers).toLocaleString()}
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Solo {raffleData.total_numbers - raffleData.soldTickets} tickets disponibles
            </p>
          </div>

          {/* Urgency indicator */}
          {raffleData.timeRemaining && !raffleData.timeRemaining.days && raffleData.timeRemaining.hours < 24 && (
            <div className="mt-6 bg-red-100 border-2 border-red-400 rounded-2xl p-4 animate-pulse">
              <p className="text-red-700 font-bold">
                ⏰ ¡ÚLTIMAS HORAS! Solo quedan {raffleData.timeRemaining.hours}h {raffleData.timeRemaining.minutes}m
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};