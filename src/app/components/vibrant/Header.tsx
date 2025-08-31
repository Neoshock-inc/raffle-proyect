// src/components/luxury/Header.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface HeaderProps {
  tenantConfig: TenantConfig;
}

export const Header: React.FC<HeaderProps> = ({ tenantConfig }) => {
  return (
    <header className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🌴</div>
            <div className="text-3xl font-black text-white">
              {tenantConfig.name.split(' ').map((word, index) => (
                <span key={index}>
                  {word}{' '}
                  {index === 0 && <span className="text-yellow-300">{tenantConfig.name.split(' ')[1] || ''}</span>}
                </span>
              ))}
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-white">
            <a href="#inicio" className="hover:text-yellow-300 transition-colors font-semibold">Inicio</a>
            <a href="#rifas" className="hover:text-yellow-300 transition-colors font-semibold">Rifas</a>
            <a href="#paquetes" className="hover:text-yellow-300 transition-colors font-semibold">Paquetes</a>
            <a href="#testimonios" className="hover:text-yellow-300 transition-colors font-semibold">Ganadores</a>
          </nav>
          <button className="bg-white text-red-500 font-bold px-6 py-3 rounded-full hover:bg-yellow-100 transition-all transform hover:scale-105 shadow-lg">
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
};
