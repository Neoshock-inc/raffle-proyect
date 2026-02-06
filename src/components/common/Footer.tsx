// src/components/common/Footer.tsx
'use client';

import { TenantConfig } from '@/types/template';
import React from 'react';

interface FooterProps {
  tenantConfig: TenantConfig;
}

export const Footer: React.FC<FooterProps> = ({ tenantConfig }) => {
  return (
    <footer
      className="py-16"
      style={{ backgroundColor: tenantConfig.primary_color }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {tenantConfig.logo_url && (
                <img
                  src={tenantConfig.logo_url}
                  alt={`${tenantConfig.company_name} Logo`}
                  className="h-8 w-auto"
                />
              )}
              <div
                className="text-xl font-bold"
                style={{ color: tenantConfig.accent_color }}
              >
                {tenantConfig.logo_url}
              </div>
            </div>
            <p
              className="leading-relaxed opacity-90"
              style={{ color: tenantConfig.accent_color }}
            >
              La plataforma de rifas más confiable. ¡Cumple tus sueños con nosotros!
            </p>
          </div>

          <div>
            <h4
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.accent_color }}
            >
              Rifas
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>Activas</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>Próximamente</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>Ganadores</a></li>
            </ul>
          </div>

          <div>
            <h4
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.accent_color }}
            >
              Ayuda
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>¿Cómo funciona?</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>FAQ</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>Soporte</a></li>
            </ul>
          </div>

          <div>
            <h4
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.accent_color }}
            >
              Síguenos
            </h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>
                Facebook
              </a>
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>
                Instagram
              </a>
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.accent_color }}>
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 text-center" style={{ borderColor: `${tenantConfig.accent_color}20` }}>
          <p style={{ color: tenantConfig.accent_color }} className="opacity-80">
            © 2024 {tenantConfig.company_name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
