// src/components/offroad/Header.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  tenantConfig: TenantConfig;
}

export function Header({ tenantConfig }: HeaderProps) {
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
    { label: 'Premio', action: () => scrollToSection('prize-section') },
    { label: 'Paquetes', action: () => scrollToSection('packages-section') },
    { label: 'Testimonios', action: () => scrollToSection('testimonials-section') },
    { label: 'Ganadores', action: () => scrollToSection('winners-section') },
    { label: 'FAQ', action: () => scrollToSection('faq-section') }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            {tenantConfig.logo_url ? (
              <img
                src={tenantConfig.logo_url}
                alt={tenantConfig.company_name}
                className="h-8 md:h-10 w-auto"
              />
            ) : (
              <div className="text-white font-black text-xl md:text-2xl">
                🏎️ {tenantConfig.company_name || 'RIFA EXTREMA'}
              </div>
            )}
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="text-white hover:text-yellow-400 font-bold transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection('packages-section')}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
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
                  className="text-pink-400 hover:text-pink-300 text-xl transition-colors"
                >
                  📸
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
              <span className={`block h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="block w-full text-left text-white hover:text-yellow-400 font-bold py-2 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    scrollToSection('packages-section');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded-full transition-all duration-300"
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
                      className="text-pink-400 hover:text-pink-300 text-2xl transition-colors"
                    >
                      📸
                    </a>
                  )}
                  {tenantConfig.social_media?.facebook && (
                    <a
                      href={tenantConfig.social_media.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-2xl transition-colors"
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
}