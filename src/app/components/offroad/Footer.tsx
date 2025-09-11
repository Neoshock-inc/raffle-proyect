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
                    {/* Información de la empresa */}
                    <div>
                        <h3 className="text-2xl font-black text-white mb-6">
                            {tenantConfig.logo_url ? (
                                <img
                                    src={tenantConfig.logo_url}
                                    alt={tenantConfig.company_name}
                                    className="h-8 w-auto"
                                />
                            ) : (
                                `🏎️ ${tenantConfig.company_name || 'RIFA EXTREMA'}`
                            )}
                        </h3>
                        <p className="text-lg mb-4">
                            {tenantConfig.company_description || 'El sorteo más confiable y transparente del país'}
                        </p>
                        <div className="flex space-x-4">
                            {tenantConfig.social_media?.instagram && (
                                <a
                                    href={tenantConfig.social_media.instagram}
                                    className="text-2xl hover:text-pink-400 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📸
                                </a>
                            )}
                            {tenantConfig.social_media?.facebook && (
                                <a
                                    href={tenantConfig.social_media.facebook}
                                    className="text-2xl hover:text-blue-400 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📘
                                </a>
                            )}
                            {tenantConfig.social_media?.whatsapp && (
                                <a
                                    href={tenantConfig.social_media.whatsapp}
                                    className="text-2xl hover:text-green-400 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📱
                                </a>
                            )}
                            {tenantConfig.social_media?.youtube && (
                                <a
                                    href={tenantConfig.social_media.youtube}
                                    className="text-2xl hover:text-red-400 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📺
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-xl">Contacto</h4>
                        <div className="space-y-2 text-lg">
                            {tenantConfig.contact_info?.phone && (
                                <p>📱 {tenantConfig.contact_info.phone}</p>
                            )}
                            {tenantConfig.contact_info?.email && (
                                <p>✉️ {tenantConfig.contact_info.email}</p>
                            )}
                            {tenantConfig.contact_info?.hours && (
                                <p>🕐 {tenantConfig.contact_info.hours}</p>
                            )}
                            {tenantConfig.contact_info?.location && (
                                <p>📍 {tenantConfig.contact_info.location}</p>
                            )}
                        </div>
                    </div>

                    {/* Redes sociales detalladas */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-xl">Síguenos</h4>
                        <div className="space-y-2 text-lg">
                            {tenantConfig.social_media?.instagram && (
                                <p>📸 @{tenantConfig.social_media.instagram.split('/').pop()}</p>
                            )}
                            {tenantConfig.social_media?.facebook && (
                                <p>📘 /{tenantConfig.social_media.facebook.split('/').pop()}</p>
                            )}
                            {tenantConfig.social_media?.youtube && (
                                <p>📺 YouTube: {tenantConfig.company_name}</p>
                            )}
                            {tenantConfig.social_media?.tiktok && (
                                <p>🎵 TikTok: @{tenantConfig.social_media.tiktok.split('/').pop()}</p>
                            )}
                        </div>
                    </div>

                    {/* Información del sorteo */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-xl">Sorteo</h4>
                        <div className="space-y-2 text-lg">
                            <p className="text-yellow-400 font-bold">📅 {drawInfo.date}</p>
                            <p>🕐 {drawInfo.time}</p>
                            <p>📍 Live Instagram</p>
                            <p>👨‍⚖️ Con Notario</p>
                            <p>💰 ${(raffleData.price * raffleData.total_numbers).toLocaleString()}</p>
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

                    {/* Información adicional de la rifa */}
                    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                        <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
                            <div>
                                <div className="text-yellow-400 font-bold">🎟️ Total Números</div>
                                <div className="text-white text-lg">{raffleData.total_numbers.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-green-400 font-bold">✅ Vendidos</div>
                                <div className="text-white text-lg">{raffleData.soldTickets.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-blue-400 font-bold">⏳ Restantes</div>
                                <div className="text-white text-lg">
                                    {(raffleData.total_numbers - raffleData.soldTickets).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}