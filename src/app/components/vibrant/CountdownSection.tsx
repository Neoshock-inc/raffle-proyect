// src/components/luxury/CountdownSection.tsx
'use client';

import { useCountdown } from '@/app/hooks/useCountdown';
import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface CountdownSectionProps {
  endDate: string;
  tenantConfig: TenantConfig;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ 
  endDate, 
  tenantConfig 
}) => {
  const timeLeft = useCountdown(endDate);

  if (timeLeft.isExpired) {
    return (
      <section className="py-12 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center">
            <h2 className="text-4xl font-black text-red-600 mb-4">
              ¡Rifa Finalizada!
            </h2>
            <p className="text-xl text-gray-600">
              Esta rifa ha terminado. ¡Mantente atento a nuestras próximas rifas!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-black text-center mb-8 text-gray-800">
            ⏰ ¡RIFA ESPECIAL TERMINA EN! ⏰
          </h2>
          <div className="flex justify-center space-x-6 md:space-x-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 min-w-20">
                <div className="text-4xl font-black text-white">
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 mt-3">Días</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 min-w-20">
                <div className="text-4xl font-black text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 mt-3">Horas</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 min-w-20">
                <div className="text-4xl font-black text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 mt-3">Minutos</div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg p-6 min-w-20">
                <div className="text-4xl font-black text-white">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-700 mt-3">Segundos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
