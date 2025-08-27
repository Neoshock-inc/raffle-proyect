// hooks/useCountdown.ts
import { useEffect, useState } from 'react';

export function useCountdown(endDate: string) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!endDate) return;
        const end = new Date(endDate).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("Expirado");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return timeLeft;
}
