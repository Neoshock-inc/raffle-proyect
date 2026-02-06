// src/components/templates/DefaultTemplate.tsx
'use client';

import { DefaultTemplateProps } from '@/types/template-props';
import React from 'react';
import { BlessedNumbersSection } from '../BlessedNumbersSection';
import { CustomTicketSection } from '../common/CustomTicketSection';
import { Footer } from '../common/Footer';
import { Header } from '../common/Header';
import { InstructionsSection } from '../InstructionsSection';
import { PrizeSection } from '../common/PrizeSection';
import { ProgressBar } from '../common/ProgressBar';
import { TicketSearchSection } from '../common/TicketSearchSection';
import { TicketsGrid } from '../common/TicketsGrid';
import { WhatsAppButton } from '../WhatsAppButton';

export const DefaultTemplate: React.FC<DefaultTemplateProps> = ({
    raffleData,
    ticketOptions,
    tenantConfig,
    simpleMode = false
}) => {
    if (!raffleData || !tenantConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: tenantConfig.accent_color }}>
            <Header tenantConfig={tenantConfig} />

            <PrizeSection
                raffleData={raffleData}
                tenantConfig={tenantConfig}
            />

            <main className="flex flex-col items-center p-4 max-w-4xl mx-auto">
                {tenantConfig.features.progressBar && (
                    <ProgressBar
                        soldTickets={raffleData.soldTickets}
                        totalTickets={raffleData.total_numbers}
                        progress={raffleData.progress}
                        tenantConfig={tenantConfig}
                    />
                )}

                <TicketsGrid
                    ticketOptions={[]}
                    raffleData={raffleData}
                    tenantConfig={tenantConfig}
                />

                {!simpleMode && (
                    <>
                        {tenantConfig.features.blessedNumbers && raffleData.blessedNumbers.length > 0 && (
                            <BlessedNumbersSection
                                blessedNumbers={[]}
                            />
                        )}

                        {/* {tenantConfig.features.customTickets && (
                            <CustomTicketSection
                                raffleData={raffleData}
                                tenantConfig={tenantConfig}
                            />
                        )} */}

                        <InstructionsSection
                            onVideoClick={
                                () => console.log('Video clicked')
                            }
                        />

                        <TicketSearchSection
                            raffleId={raffleData.id}
                            tenantConfig={tenantConfig}
                        />
                    </>
                )}
            </main>

            <Footer tenantConfig={tenantConfig} />
            {/* <WhatsAppButton /> */}
        </div>
    );
};
