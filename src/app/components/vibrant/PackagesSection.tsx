// src/components/vibrant/PackagesSection.tsx - Actualizada para pasar props
'use client';

import React, { useState } from 'react';
import { VibrantTicketCard } from './VibrantTicketCard';
import { useReferralCode } from '@/app/hooks/useReferralCode';
import { RaffleData, TenantConfig } from '@/app/types/template';
import { TicketOption } from '@/app/(auth)/types/ticketPackage';

interface PackagesSectionProps {
    ticketOptions: TicketOption[];
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
    ticketOptions,
    raffleData,
    tenantConfig
}) => {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const referralCode = useReferralCode();

    const handlePackageSelect = (packageId: string) => {
        setSelectedPackage(packageId);
    };

    return (
        <section id="paquetes" className="py-20 bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    📦 PAQUETES ESPECIALES 📦
                </h2>
                <p className="text-xl text-gray-600 text-center mb-12">¡Más números = Mayor probabilidad de ganar!</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {ticketOptions.map((option, index) => (
                        <VibrantTicketCard
                            key={option.id}
                            option={option}
                            referralCode={referralCode}
                            index={index}
                            selectedPackage={selectedPackage}
                            onSelect={handlePackageSelect}
                            tenantSlug={tenantConfig.slug}
                            raffleId={raffleData.id}
                        />
                    ))}
                </div>

                {/* Botón de compra final */}
                {selectedPackage && (
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Has seleccionado el paquete. Haz clic en el botón del paquete para proceder.
                        </p>
                    </div>
                )}

                {/* Información adicional */}
                <div className="text-center mt-12">
                    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-200">
                        <h3 className="text-2xl font-bold text-orange-800 mb-3">
                            💡 ¿Por qué elegir paquetes?
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-orange-700">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🎯</span>
                                <span>Más oportunidades de ganar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💰</span>
                                <span>Mejores precios por ticket</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🎁</span>
                                <span>Números bonus incluidos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};