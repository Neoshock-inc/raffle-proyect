// src/components/offroad/Footer.tsx
'use client';

import React from 'react';
import { RaffleData, TenantConfig } from '@/types/template';

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
        <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center space-y-4">
                    {/* Disclaimer legal */}
                    <div className="text-gray-400 text-sm leading-relaxed">
                        <p className="mb-3">
                            Este sitio web no forma parte de Meta Platforms, Inc. (Facebook™️), Google LLC (Google™️/YouTube™️) ni de TikTok Inc. (TikTok™️).
                        </p>
                        <p className="mb-3">
                            Adicionalmente, este sitio NO está respaldado ni afiliado de ninguna manera con Meta, Google o TikTok.
                        </p>
                        <p className="text-xs text-gray-500">
                            META™️ y FACEBOOK™️ son marcas registradas de Meta Platforms, Inc. GOOGLE™️ y YOUTUBE™️ son marcas registradas de Google LLC. TIKTOK™️ es una marca registrada de TikTok Inc.
                        </p>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <p className="text-gray-400 text-sm">
                            &copy; {currentYear} {tenantConfig.company_name || 'Rifa Extrema'}. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}