'use client';

import { useTicketSearch } from '@/app/hooks/useTicketSearch';
import { TenantConfig } from '@/app/types/template';
import React from 'react';
import { TicketSearchModal } from '../TicketSearchModal';

interface TicketSearchSectionProps {
    raffleId: string;
    tenantConfig: TenantConfig;
}

export const TicketSearchSection: React.FC<TicketSearchSectionProps> = ({
    raffleId,
    tenantConfig
}) => {
    const {
        searchEmail,
        setSearchEmail,
        isModalOpen,
        searchLoading,
        searchError,
        handleSearchTickets,
        closeModal
    } = useTicketSearch();

    return (
        <>
            <section id="search" className="w-full py-8">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
                    <h3
                        className="text-2xl font-bold text-center mb-6"
                        style={{ color: tenantConfig.primary_color }}
                    >
                        Buscar Mis Tickets
                    </h3>

                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Ingresa tu email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full p-3 border-2 rounded-lg"
                            style={{ borderColor: tenantConfig.primary_color }}
                        />
                    </div>

                    {searchError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {searchError}
                        </div>
                    )}

                    <button
                        onClick={handleSearchTickets}
                        disabled={searchLoading || !searchEmail.trim()}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                        style={{ backgroundColor: tenantConfig.primary_color }}
                    >
                        {searchLoading ? 'Buscando...' : 'Buscar Tickets'}
                    </button>
                </div>
            </section>

            <TicketSearchModal
                isOpen={isModalOpen}
                onClose={closeModal} tickets={[]} />
        </>
    );
};