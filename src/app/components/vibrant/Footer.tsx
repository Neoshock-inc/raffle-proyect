// src/components/luxury/Footer.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React from 'react';

interface FooterProps {
    tenantConfig: TenantConfig;
}

export const Footer: React.FC<FooterProps> = ({ tenantConfig }) => {
    return (
        <footer className="bg-gray-800 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="text-4xl">🌴</div>
                            <div className="text-2xl font-black">
                                <span className="text-white">{tenantConfig.company_name.split(' ')[0]}</span>{' '}
                                <span className="text-yellow-300">{tenantConfig.company_name.split(' ')[1] || ''}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            La plataforma de rifas más confiable y divertida de Latinoamérica.
                            ¡Cumple tus sueños con nosotros!
                        </p>
                    </div>

                    <div>
                        <h4 className="text-yellow-300 font-bold mb-4 text-lg">🎁 Rifas</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Activas</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Próximamente</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Finalizadas</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Ganadores</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-yellow-300 font-bold mb-4 text-lg">🛟 Ayuda</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">¿Cómo funciona?</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Términos y condiciones</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-yellow-300 font-bold mb-4 text-lg">📱 Síguenos</h4>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                <span className="mr-3">📘</span> Facebook
                            </a>
                            <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                <span className="mr-3">📷</span> Instagram
                            </a>
                            <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors">
                                <span className="mr-3">🐦</span> Twitter
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 text-center">
                    <p className="text-gray-400">
                        © 2024 {tenantConfig.company_name}. Todos los derechos reservados.
                        <span className="text-yellow-300"> Hecho con ❤️ para Latinoamérica</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};