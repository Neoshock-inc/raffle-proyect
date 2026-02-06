// src/components/offroad/CountdownSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RaffleData, TenantConfig } from '@/types/template';

interface CountdownSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownSection({ raffleData, tenantConfig }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(raffleData.draw_date).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [raffleData.draw_date]);

  if (isExpired) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-red-800 to-red-900">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl sm:text-6xl font-black mb-6">
            ¡SORTEO REALIZADO!
          </h2>
          <p className="text-2xl mb-8">
            El sorteo ya se realizó. ¡Mantente atento para futuros sorteos!
          </p>
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-lg">
              📅 Fecha del sorteo: {new Date(raffleData.draw_date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const scrollToPackages = () => {
    const packagesSection = document.getElementById('packages-section');
    packagesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto text-center text-white">
        <h2 className="text-3xl sm:text-5xl font-black mb-4">
          ⏰ TIEMPO RESTANTE PARA EL SORTEO
        </h2>
        
        <p className="text-xl text-gray-300 mb-8">
          ¡No te pierdas esta oportunidad única!
        </p>

        {/* Contador principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 max-w-2xl mx-auto">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div 
              key={unit} 
              className="bg-black/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/20 hover:border-yellow-400 transition-colors"
            >
              <div className="text-3xl md:text-5xl font-black text-yellow-300 mb-2">
                {value.toString().padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base uppercase tracking-wider font-bold">
                {unit === 'days' ? 'Días' : 
                 unit === 'hours' ? 'Horas' : 
                 unit === 'minutes' ? 'Minutos' : 'Segundos'}
              </div>
            </div>
          ))}
        </div>

        {/* Información del sorteo */}
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/20 mb-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">📅 Información del Sorteo</h3>
          <div className="grid md:grid-cols-2 gap-4 text-lg">
            <div>
              <p className="mb-2">
                <span className="text-yellow-400 font-bold">📅 Fecha:</span> {
                  new Date(raffleData.draw_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                }
              </p>
              <p>
                <span className="text-yellow-400 font-bold">🕐 Hora:</span> {
                  new Date(raffleData.draw_date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="text-yellow-400 font-bold">📱 Transmisión:</span> Instagram Live
              </p>
              <p>
                <span className="text-yellow-400 font-bold">👨‍⚖️ Supervisor:</span> Notario Público
              </p>
            </div>
          </div>
        </div>

        {/* Urgencia basada en tiempo restante */}
        {timeLeft.days <= 7 && (
          <div className="bg-red-800/80 backdrop-blur-sm p-6 rounded-xl border border-red-400 mb-8">
            <div className="text-4xl mb-3">🔥</div>
            <h3 className="text-2xl font-black mb-2">
              {timeLeft.days <= 1 ? '¡ÚLTIMAS HORAS!' : '¡ÚLTIMA SEMANA!'}
            </h3>
            <p className="text-lg">
              {timeLeft.days <= 1 
                ? 'Solo quedan horas para el sorteo. ¡No te quedes sin participar!'
                : 'Solo queda una semana para el sorteo. ¡Asegura tu participación!'
              }
            </p>
          </div>
        )}

        {/* Llamada a la acción */}
        <div className="space-y-4">
          <button 
            onClick={scrollToPackages}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            ¡COMPRAR NÚMEROS AHORA!
          </button>
          
          <p className="text-gray-300">
            Cada segundo cuenta. ¡No dejes pasar esta oportunidad!
          </p>
        </div>

        {/* Progreso del sorteo */}
        {tenantConfig.features.progressBar && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h4 className="text-xl font-bold mb-4">📊 Progreso del Sorteo</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vendidos: {raffleData.soldTickets.toLocaleString()}</span>
                  <span>Restantes: {(raffleData.total_numbers - raffleData.soldTickets).toLocaleString()}</span>
                </div>
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
                <div className="text-center text-gray-300">
                  {Math.round(raffleData.progress || 0)}% de números vendidos
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}