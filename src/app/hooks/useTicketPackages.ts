// hooks/useTicketPackages.ts
import { useState, useEffect } from 'react';
import { CalculatedTicketPackage } from '../types/ticketPackages';
import { getActiveTicketPackages, packageToTicketOption } from '../services/raffleService';

interface UseTicketPackagesReturn {
    ticketPackages: CalculatedTicketPackage[];
    ticketOptions: any[]; // Compatible con tu TicketOption actual
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTicketPackages(): UseTicketPackagesReturn {
    const [ticketPackages, setTicketPackages] = useState<CalculatedTicketPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTicketPackages = async () => {
        try {
            setLoading(true);
            setError(null);

            const packages = await getActiveTicketPackages();
            setTicketPackages(packages);

        } catch (err) {
            console.error('Error fetching ticket packages:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');

            // En caso de error, crear paquetes por defecto como fallback
            setTicketPackages([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketPackages();
    }, []);

    // Convertir a formato compatible con TicketOption
    const ticketOptions = ticketPackages.map(packageToTicketOption);

    const refetch = async () => {
        await fetchTicketPackages();
    };

    return {
        ticketPackages,
        ticketOptions,
        loading,
        error,
        refetch
    };
}