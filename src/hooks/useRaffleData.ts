// hooks/useRaffleData.ts
import { useCallback } from 'react';
import { getBlessedNumbers, getSoldTicketsCount } from '@/services/numberService';
import { getActiveRaffle } from '@/services/raffleService';
import { BlessedNumber } from '@/types/tickets';
import { Raffle } from '@/types/database';
import { useAsyncData } from './shared';

interface RaffleDataResult {
    raffle: Raffle;
    blessedNumbers: BlessedNumber[];
    soldTickets: number;
}

export const useRaffleData = () => {
    const { data, loading, error, refetch } = useAsyncData<RaffleDataResult>(
        async () => {
            const raffle = await getActiveRaffle();
            const [blessedNumbers, soldTickets] = await Promise.all([
                getBlessedNumbers(raffle.id),
                getSoldTicketsCount(raffle.id),
            ]);
            return { raffle, blessedNumbers, soldTickets };
        },
        []
    );

    const handleNumberClaimed = useCallback((updatedNumber: BlessedNumber) => {
        // Note: this no longer updates local state since data comes from useAsyncData
        // If needed, refetch to get updated data
        refetch();
    }, [refetch]);

    return {
        soldTickets: data?.soldTickets ?? 350,
        blessedNumbers: data?.blessedNumbers ?? [],
        loading,
        error,
        raffle: data?.raffle ?? null,
        handleNumberClaimed,
    };
};
