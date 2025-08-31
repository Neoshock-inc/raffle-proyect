// src/components/common/ProgressBar.tsx
'use client';

import { useProgressAnimation } from '@/app/hooks/useProgressAnimation';
import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface ProgressBarProps {
  soldTickets: number;
  totalTickets: number;
  progress: number;
  tenantConfig: TenantConfig;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  soldTickets, 
  totalTickets, 
  progress,
  tenantConfig 
}) => {
  const animatedProgress = useProgressAnimation(progress, false);

  return (
    <section className="w-full py-8">
      <div className="max-w-4xl mx-auto">
        <h2 
          className="text-2xl font-bold text-center mb-6"
          style={{ color: tenantConfig.theme.colors.primary }}
        >
          Progreso de la Rifa
        </h2>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between text-sm mb-2" style={{ color: tenantConfig.theme.colors.text }}>
            <span>Vendidos: {soldTickets.toLocaleString()}</span>
            <span>Total: {totalTickets.toLocaleString()}</span>
          </div>
          
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 relative"
              style={{ 
                width: `${animatedProgress}%`,
                backgroundColor: tenantConfig.theme.colors.primary 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>
          
          <p 
            className="text-right text-sm font-bold mt-2"
            style={{ color: tenantConfig.theme.colors.primary }}
          >
            {animatedProgress.toFixed(1)}% completado
          </p>
        </div>
      </div>
    </section>
  );
};
