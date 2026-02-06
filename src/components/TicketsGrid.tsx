// components/TicketsGrid.tsx
import { useState, useRef, useEffect } from 'react';
import { TicketOption } from '@/types/tickets';
import { EnhancedTicketOption } from '@/types/ticketPackages';
import { TicketCard } from './TicketCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LegacyTicketCard } from './LegacyTicketCard';

interface TicketsGridProps {
    ticketOptions: (TicketOption | EnhancedTicketOption)[];
    referralCode: string | null;
    isUsingPackages?: boolean;
}

export function TicketsGrid({ ticketOptions, referralCode, isUsingPackages = false }: TicketsGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        // Verificar estado inicial de los botones
        checkScrollButtons();
    }, [ticketOptions]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 340; // Ancho de tarjeta + gap + margen
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    // Función para determinar si una opción es EnhancedTicketOption
    const isEnhancedOption = (option: any): option is EnhancedTicketOption => {
        return option.package !== undefined;
    };

    return (
        <section className="relative w-full overflow-hidden">
            {/* Container con centrado mejorado */}
            <div className="mx-auto">
                {/* Navigation Buttons - Solo mostrar si hay más de 3 opciones */}
                {ticketOptions.length > 3 && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${canScrollLeft
                                    ? 'bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 text-gray-800'
                                    : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${canScrollRight
                                    ? 'bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 text-gray-800'
                                    : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Slider Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide px-8 justify-start items-center pb-4"
                    style={{
                        scrollSnapType: 'x mandatory',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        minHeight: '460px', // Altura suficiente para los cards + animación hover
                        maxHeight: '460px'
                    }}
                    onScroll={checkScrollButtons}
                >
                    {ticketOptions.map((option, index) => {
                        return (
                            <div
                                key={isEnhancedOption(option) ? option.id : `legacy-${option.amount}`}
                                className="flex-shrink-0"
                                style={{ scrollSnapAlign: 'center' }}
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