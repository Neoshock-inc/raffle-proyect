// src/components/common/Footer.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface FooterProps {
  tenantConfig: TenantConfig;
}

export const Footer: React.FC<FooterProps> = ({ tenantConfig }) => {
  return (
    <footer 
      className="py-16"
      style={{ backgroundColor: tenantConfig.theme.colors.primary }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {tenantConfig.branding.logo && (
                <img 
                  src={tenantConfig.branding.logo} 
                  alt={`${tenantConfig.name} Logo`}
                  className="h-8 w-auto"
                />
              )}
              <div 
                className="text-xl font-bold"
                style={{ color: tenantConfig.theme.colors.background }}
              >
                {tenantConfig.name}
              </div>
            </div>
            <p 
              className="leading-relaxed opacity-90"
              style={{ color: tenantConfig.theme.colors.background }}
            >
              La plataforma de rifas más confiable. ¡Cumple tus sueños con nosotros!
            </p>
          </div>
          
          <div>
            <h4 
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.theme.colors.background }}
            >
              Rifas
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>Activas</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>Próximamente</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>Ganadores</a></li>
            </ul>
          </div>
          
          <div>
            <h4 
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.theme.colors.background }}
            >
              Ayuda
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>¿Cómo funciona?</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>FAQ</a></li>
              <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>Soporte</a></li>
            </ul>
          </div>
          
          <div>
            <h4 
              className="font-bold mb-4 text-lg"
              style={{ color: tenantConfig.theme.colors.background }}
            >
              Síguenos
            </h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>
                Facebook
              </a>
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>
                Instagram
              </a>
              <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity" style={{ color: tenantConfig.theme.colors.background }}>
                Twitter
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center" style={{ borderColor: `${tenantConfig.theme.colors.background}20` }}>
          <p style={{ color: tenantConfig.theme.colors.background }} className="opacity-80">
            © 2024 {tenantConfig.name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
