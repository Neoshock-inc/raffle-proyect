
// src/components/common/TicketsGrid.tsx
'use client';

import React from 'react';
import { TicketCard } from '../TicketCard'; // Tu componente existente
import { useReferralCode } from '@/hooks/useReferralCode';
import { RaffleData, TenantConfig } from '@/types/template';
import { CalculatedTicketPackage } from '@/types/ticketPackages';

interface TicketsGridProps {
    ticketOptions: CalculatedTicketPackage[];
    raffleData: RaffleData;
    tenantConfig: TenantConfig;
}

// Función para convertir CalculatedTicketPackage a EnhancedTicketOption
const convertToEnhancedTicketOption = (pkg: CalculatedTicketPackage, index: number) => {
    return {
        // Propiedades requeridas por tu TicketCard y EnhancedTicketOption
        id: pkg.id,
        amount: pkg.amount,
        originalAmount: pkg.amount,
        price: pkg.final_price,

        // El paquete completo para que TicketCard tenga acceso a toda la data
        package: {
            ...pkg,
            // Asegurar que tenga las propiedades que espera tu TicketCard
            entries_display: `${pkg.final_amount.toLocaleString()} Entries`,
            multiplier_display: `${Math.round(pkg.final_amount / pkg.amount)}x`,
            show_entry_count: pkg.show_entry_count ?? true,
            show_multiplier: pkg.show_multiplier ?? true,
        }
    };
};

export const TicketsGrid: React.FC<TicketsGridProps> = ({
    ticketOptions,
    raffleData,
    tenantConfig
}) => {
    const referralCode = useReferralCode();

    return (
        <section id="packages" className="w-full py-8">
            <h2
                className="text-3xl font-bold text-center mb-8"
                style={{ color: tenantConfig.primary_color }}
            >
                Paquetes de Tickets
            </h2>

            <div className="flex flex-wrap justify-center gap-6 px-4">
                {ticketOptions.map((option, index) => {
                    const enhancedOption = convertToEnhancedTicketOption(option, index);

                    return (
                        <TicketCard
                            key={option.id}
                            option={enhancedOption}
                            referralCode={referralCode}
                            colorScheme={index % 5} // Rotar entre los 5 esquemas de colores
                        />
                    );
                })}
            </div>
        </section>
    );
};