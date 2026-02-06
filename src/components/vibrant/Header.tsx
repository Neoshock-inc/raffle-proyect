// src/components/luxury/Header.tsx
'use client';

import { TenantConfig } from '@/types/template';
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  tenantConfig: TenantConfig;
}

export const Header: React.FC<HeaderProps> = ({ tenantConfig }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Inicio', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Rifas', action: () => scrollToSection('prize-section') },
    { label: 'Paquetes', action: () => scrollToSection('packages-section') },
    { label: 'Ganadores', action: () => scrollToSection('testimonials-section') },
    { label: 'FAQ', action: () => scrollToSection('faq-section') }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-gradient-to-r from-red-500/95 via-pink-500/95 to-orange-500/95 backdrop-blur-md shadow-lg'
          : 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 shadow-lg'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {tenantConfig.logo_url ? (
              <img
                src={tenantConfig.logo_url}
                alt={tenantConfig.company_name}
                className="h-8 md:h-10 w-auto"
              />
            ) : (
              <>
                <div className="text-3xl md:text-4xl">🌴</div>
                <div className="text-2xl md:text-3xl font-black text-white">
                  {tenantConfig.company_name || 'RIFA LUXURY'}
                </div>
              </>
            )}
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="text-white hover:text-yellow-300 font-semibold transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection('packages-section')}
              className="bg-white text-red-500 font-bold px-6 py-3 rounded-full hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              PARTICIPAR
            </button>

            {/* Social Links */}
            <div className="flex space-x-2">
              {tenantConfig.social_media?.whatsapp && (
                <a
                  href={tenantConfig.social_media.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-xl transition-colors"
                >
                  📱
                </a>
              )}
              {tenantConfig.social_media?.instagram && (
                <a
                  href={tenantConfig.social_media.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-300 text-xl transition-colors"
                >
                  📸
                </a>
              )}
              {tenantConfig.social_media?.facebook && (
                <a
                  href={tenantConfig.social_media.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-blue-100 text-xl transition-colors"
                >
                  📘
                </a>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-red-600/95 via-pink-600/95 to-orange-600/95 backdrop-blur-md border-t border-white/20">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="block w-full text-left text-white hover:text-yellow-300 font-semibold py-2 transition-colors"
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    scrollToSection('packages-section');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-red-500 font-bold py-3 rounded-full hover:bg-yellow-100 transition-all duration-300 shadow-lg"
                >
                  PARTICIPAR AHORA
                </button>

                {/* Social Links Mobile */}
                <div className="flex justify-center space-x-6 pt-4">
                  {tenantConfig.social_media?.whatsapp && (
                    <a
                      href={tenantConfig.social_media.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-2xl transition-colors"
                    >
                      📱
                    </a>
                  )}
                  {tenantConfig.social_media?.instagram && (
                    <a
                      href={tenantConfig.social_media.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-yellow-300 text-2xl transition-colors"
                    >
                      📸
                    </a>
                  )}
                  {tenantConfig.social_media?.facebook && (
                    <a
                      href={tenantConfig.social_media.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-200 hover:text-blue-100 text-2xl transition-colors"
                    >
                      📘
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};