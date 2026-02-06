// hooks/useTicketPackages.ts
import { useMemo } from 'react';
import { CalculatedTicketPackage } from '@/types/ticketPackages';
import { getActiveTicketPackages, packageToTicketOption } from '@/services/raffleService';
import { useAsyncData } from './shared';

interface UseTicketPackagesReturn {
    ticketPackages: CalculatedTicketPackage[];
    ticketOptions: any[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useTicketPackages(): UseTicketPackagesReturn {
    const { data, loading, error, refetch } = useAsyncData<CalculatedTicketPackage[]>(
        () => getActiveTicketPackages(),
        []
    );

    const ticketPackages = data ?? [];
    const ticketOptions = useMemo(
        () => ticketPackages.map(packageToTicketOption),
        [ticketPackages]
    );

    return {
        ticketPackages,
        ticketOptions,
        loading,
        error,
        refetch,
    };
}
