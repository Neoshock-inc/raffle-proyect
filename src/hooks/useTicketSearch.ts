// hooks/useTicketSearch.ts
import { useState } from 'react';
import { getUserTickets } from '@/services/numberService';
import { TicketPurchase } from '@/types/tickets';

export const useTicketSearch = () => {
    const [searchEmail, setSearchEmail] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ticketPurchases, setTicketPurchases] = useState<TicketPurchase[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearchTickets = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!searchEmail || !searchEmail.includes('@')) {
            setSearchError("Por favor, ingresa un correo electrónico válido");
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError(null);

            const tickets = await getUserTickets(searchEmail);
            setTicketPurchases(tickets);
            setIsModalOpen(true);
        } catch (err: any) {
            console.error("Error al buscar tickets:", err);
            setSearchError(err.message || "No se pudieron encontrar tus números. Intenta nuevamente.");
        } finally {
            setSearchLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return {
        searchEmail,
        setSearchEmail,
        isModalOpen,
        ticketPurchases,
        searchLoading,
        searchError,
        handleSearchTickets,
        closeModal
    };
};
