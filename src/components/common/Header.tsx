// src/components/common/Header.tsx
'use client';

import { TenantConfig } from '@/types/template';
import React from 'react';

interface HeaderProps {
  tenantConfig: TenantConfig;
}

export const Header: React.FC<HeaderProps> = ({ tenantConfig }) => {
  return (
    <header
      className="shadow-lg"
      style={{ backgroundColor: tenantConfig.primary_color }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {tenantConfig.logo_url && (
              <img
                src={tenantConfig.logo_url}
                alt={`${tenantConfig.company_name} Logo`}
                className="h-10 w-auto"
              />
            )}
            <div
              className="text-2xl font-bold"
              style={{ color: tenantConfig.accent_color }}
            >
              {tenantConfig.company_name}
            </div>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a
              href="#prizes"
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.accent_color }}
            >
              Premios
            </a>
            <a
              href="#packages"
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.accent_color }}
            >
              Paquetes
            </a>
            <a
              href="#search"
              className="hover:opacity-80 transition-opacity"
              style={{ color: tenantConfig.accent_color }}
            >
              Buscar Tickets
            </a>
          </nav>

          <button
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: tenantConfig.secondary_color,
              color: tenantConfig.accent_color
            }}
          >
            Participar
          </button>
        </div>
      </div>
    </header>
  );
};
