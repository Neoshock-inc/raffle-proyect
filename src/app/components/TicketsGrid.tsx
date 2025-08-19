// components/TicketsGrid.tsx
import { TicketOption } from '../types/tickets';
import { EnhancedTicketOption } from '../types/ticketPackages';
import { TicketCard } from './TicketCard';
import { LegacyTicketCard } from './LegacyTicketCard';

interface TicketsGridProps {
    ticketOptions: (TicketOption | EnhancedTicketOption)[];
    referralCode: string | null;
    isUsingPackages?: boolean;
}

export function TicketsGrid({ ticketOptions, referralCode, isUsingPackages = false }: TicketsGridProps) {

    // Función para determinar si una opción es EnhancedTicketOption
    const isEnhancedOption = (option: any): option is EnhancedTicketOption => {
        return option.package !== undefined;
    };

    return (
        <section className="w-full py-8">
            <div className="container mx-auto px-4">
                {/* Grid responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  justify-items-center">
                    {ticketOptions.map((option, index) => {
                        return (
                            <div
                                key={isEnhancedOption(option) ? option.id : `legacy-${option.amount}`}
                                className="w-full max-w-sm"
                            >
                                {isUsingPackages && isEnhancedOption(option) ? (
                                    // Usar el nuevo TicketCard para paquetes de la DB
                                    <TicketCard
                                        option={option}
                                        referralCode={referralCode}
                                        colorScheme={index % 5} // Ciclo de 5 esquemas de color
                                    />
                                ) : (
                                    // Usar el sistema legacy para compatibilidad
                                    <LegacyTicketCard
                                        option={option as TicketOption}
                                        bestSeller={option.amount === 50}
                                        limitedOffer={index === 0}
                                        referralCode={referralCode}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}