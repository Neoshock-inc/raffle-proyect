// src/components/offroad/CallToActionSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RaffleData, TenantConfig } from '@/types/template';

interface CallToActionSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-4 justify-center text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
          <div className="text-2xl sm:text-3xl font-black text-yellow-300">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="text-xs uppercase tracking-wider">
            {unit === 'days' ? 'días' :
              unit === 'hours' ? 'hrs' :
                unit === 'minutes' ? 'min' : 'seg'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CallToActionSection({ raffleData, tenantConfig }: CallToActionSectionProps) {
  const scrollToPackages = () => {
    const packagesSection = document.getElementById('packages-section');
    packagesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const isCountdownActive = new Date(raffleData.draw_date).getTime() > new Date().getTime();
  const remainingTickets = raffleData.total_numbers - raffleData.soldTickets;
  const isLowStock = remainingTickets < raffleData.total_numbers * 0.2; // Menos del 20%

  return (
    <section className="py-10 px-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-4xl sm:text-6xl font-black mb-8">
          ⏰ ¡NO PIERDAS ESTA OPORTUNIDAD!
        </h2>

        <p className="text-2xl mb-8 opacity-90">
          {isLowStock
            ? `¡Solo quedan ${remainingTickets.toLocaleString()} boletos disponibles!`
            : 'El sorteo se acerca y los boletos se están agotando'
          }
        </p>

        {/* Contador regresivo si está activo */}
        {isCountdownActive && tenantConfig.features.countdown && (
          <div className="mb-8">
            <p className="text-xl mb-4 font-bold">Tiempo restante para el sorteo:</p>
            <CountdownTimer endDate={raffleData.draw_date} />
          </div>
        )}

        {/* Progreso si hay pocos números */}
        {isLowStock && tenantConfig.features.progressBar && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-full p-2">
              <div className="flex justify-between text-sm mb-2">
                <span>Vendidos: {raffleData.soldTickets.toLocaleString()}</span>
                <span>Restantes: {remainingTickets.toLocaleString()}</span>
              </div>
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min(raffleData.progress || 0, 100)}%` }}
                />
              </div>
              <div className="text-center mt-2 font-bold">
                {Math.round(raffleData.progress || 0)}% vendido
              </div>
            </div>
          </div>
        )}

        {/* Urgencia si quedan pocos números */}
        {isLowStock && (
          <div className="mb-8 bg-red-800/80 backdrop-blur-sm p-6 rounded-xl border border-red-400">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="text-2xl font-black mb-2">¡ÚLTIMOS NÚMEROS DISPONIBLES!</h3>
            <p className="text-lg">
              Solo quedan {remainingTickets.toLocaleString()} números. ¡No te quedes sin participar!
            </p>
          </div>
        )}

        {/* Beneficios destacados */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 text-lg">
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold">Premio Garantizado</div>
            <div className="text-sm opacity-80">
              ${((raffleData.price * raffleData.total_numbers) - 95000).toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-bold">Sorteo en Vivo</div>
            <div className="text-sm opacity-80">100% Transparente</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
            <div className="text-3xl mb-2">📑</div>
            <div className="font-bold">Documentos al Día</div>
            <div className="text-sm opacity-80">Cumplimos con toda la normativa vigente</div>
          </div>
        </div>

        {/* Botón principal */}
        <button
          onClick={scrollToPackages}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl mb-6"
        >
          🚀 ¡COMPRAR NÚMEROS AHORA!
        </button>

        {/* Texto de confianza */}
        <p className="text-lg opacity-75 mb-4">
          Únete a los cientos de ganadores que ya confiaron en nosotros
        </p>
      </div>
    </section>
  );
}