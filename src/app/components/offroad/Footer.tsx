// src/components/offroad/Footer.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface FooterProps {
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

export function Footer({ raffleData, tenantConfig }: FooterProps) {
    const currentYear = new Date().getFullYear();

    const formatDrawDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const drawInfo = formatDrawDate(raffleData.draw_date);

    return (
        <footer className="bg-gray-900 border-t border-gray-700 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 text-gray-400">

                    {/* Redes sociales detalladas */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-xl">Síguenos</h4>
                        <div className="space-y-2 text-lg">
                            {tenantConfig.social_media?.instagram && (
                                <a
                                    href={tenantConfig.social_media.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-pink-400 hover:underline"
                                >
                                    📸 Instagram
                                </a>
                            )}
                            {tenantConfig.social_media?.facebook && (
                                <a
                                    href={tenantConfig.social_media.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-400 hover:underline"
                                >
                                    📘 Facebook
                                </a>
                            )}
                            {tenantConfig.social_media?.youtube && (
                                <a
                                    href={tenantConfig.social_media.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-red-400 hover:underline"
                                >
                                    📺 YouTube
                                </a>
                            )}
                            {tenantConfig.social_media?.tiktok && (
                                <a
                                    href={tenantConfig.social_media.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-gray-200 hover:underline"
                                >
                                    🎵 TikTok
                                </a>
                            )}
                        </div>
                    </div>


                </div>

                {/* Separador */}
                <div className="border-t border-gray-700 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-center md:text-left mb-4 md:mb-0">
                            &copy; {currentYear} {tenantConfig.company_name || 'Rifa Extrema'}. Todos los derechos reservados.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <a href="#terms" className="hover:text-white transition-colors">
                                Términos y Condiciones
                            </a>
                            <a href="#privacy" className="hover:text-white transition-colors">
                                Política de Privacidad
                            </a>
                            <a href="#support" className="hover:text-white transition-colors">
                                Soporte
                            </a>
                        </div>
                    </div>

                    {/* Información legal */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            🛡️ Sorteo autorizado y supervisado por notario público |
                            🏛️ Registro de la Superintendencia de Compañías |
                            ✅ 100% Legal y Transparente
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}