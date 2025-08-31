// src/components/common/Header.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface HeaderProps {
  tenantConfig: TenantConfig;
}

export const Header: React.FC<HeaderProps> = ({ tenantConfig }) => {
  return (
    <header 
      className="shadow-lg"
      style={{ backgroundColor: tenantConfig.theme.colors.primary }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tenantConfig.branding.logo && (
              <img 
                src={tenantConfig.branding.logo} 
                alt={`${tenantConfig.name} Logo`}
                className="h-10 w-auto"
              />
            )}
            <div 
              className="text-2xl font-bold"
              style={{ color: tenantConfig.theme.colors.text }}
            >
              {tenantConfig.name}
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a 
              href="#prizes" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.theme.colors.text }}
            >
              Premios
            </a>
            <a 
              href="#packages" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.theme.colors.text }}
            >
              Paquetes
            </a>
            <a 
              href="#search" 
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.theme.colors.text }}
            >
              Buscar Tickets
            </a>
          </nav>

          <button 
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: tenantConfig.theme.colors.secondary,
              color: tenantConfig.theme.colors.background 
            }}
          >
            Participar
          </button>
        </div>
      </div>
    </header>
  );
};
