// components/TicketsGrid.tsx
import { TicketOption } from '../types/tickets';
import { TicketCard } from './TicketCard';

interface TicketsGridProps {
    ticketOptions: TicketOption[];
    referralCode: string | null;
}

export function TicketsGrid({ ticketOptions, referralCode }: TicketsGridProps) {
    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {ticketOptions.map((option) => {
                const isBestSeller = option.amount === 50;
                return (
                    <TicketCard
                        key={option.amount}
                        option={option}
                        bestSeller={isBestSeller}
                        referralCode={referralCode}
                    />
                );
            })}
        </section>
    );
}
