// hooks/useRaffleData.ts
import { useState, useEffect } from 'react';
import { getBlessedNumbers, getSoldTicketsCount } from '../services/numberService';
import { getActiveRaffle } from '../services/raffleService';
import { BlessedNumber } from '../types/tickets';
import { Raffle } from '../types/raffles';

export const useRaffleData = () => {
    const [soldTickets, setSoldTickets] = useState(350);
    const [blessedNumbers, setBlessedNumbers] = useState<BlessedNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [raffle, setRaffle] = useState<Raffle | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const raffle = await getActiveRaffle();
                const blessedData = await getBlessedNumbers(raffle.id);
                const soldCount = await getSoldTicketsCount(raffle.id);

                setBlessedNumbers(blessedData);
                setSoldTickets(soldCount);
                setRaffle(raffle);
            } catch (err: any) {
                console.error("Error cargando datos:", err);
                setError("No se pudieron cargar los datos. Intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleNumberClaimed = (updatedNumber: BlessedNumber) => {
        setBlessedNumbers(prevNumbers =>
            prevNumbers.map(number =>
                number.id === updatedNumber.id ? updatedNumber : number
            )
        );
    };

    return {
        soldTickets,
        blessedNumbers,
        loading,
        error,
        raffle,
        handleNumberClaimed
    };
};