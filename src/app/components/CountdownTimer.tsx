// components/CountdownTimer.tsx
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    startDate: Date;
    endDate: Date;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function CountdownTimer({ startDate, endDate, className = '' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isActive, setIsActive] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = (): TimeLeft => {
            const now = new Date().getTime();
            const start = startDate.getTime();
            const end = endDate.getTime();

            // Si no ha comenzado la oferta
            if (now < start) {
                setIsActive(false);
                setHasEnded(false);
                const difference = start - now;
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                };
            }

            // Si la oferta está activa
            if (now >= start && now <= end) {
                setIsActive(true);
                setHasEnded(false);
                const difference = end - now;
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                };
            }

            // Si la oferta ha terminado
            setIsActive(false);
            setHasEnded(true);
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Calcular inmediatamente
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [startDate, endDate]);

    const formatNumber = (num: number): string => {
        return num.toString().padStart(2, '0');
    };

    if (hasEnded) {
        return (
            <div className={`text-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300 ${className}`}>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                    ⏰ Oferta Terminada
                </h3>
                <p className="text-gray-500">Esta promoción especial ha finalizado</p>
            </div>
        );
    }

    return (
        <div className={`text-center p-4 rounded-lg ${isActive
                ? 'bg-red-50 border-red-300'
                : 'bg-blue-50 border-blue-300'
            } ${className}`}>
            <h3 className="text-2xl font-bold mb-2 leading-none">
                {isActive ? (
                    <span className="text-red-600">Tres Ganadores de 100$ <br /> en Efectivo Cuando El Reloj Llegue a Cero</span>
                ) : (
                    <span className="text-blue-600">🚀 Oferta Especial Próxima</span>
                )}
            </h3>

            <p className="text-sm mb-3 text-gray-600">
                {isActive ? 'Tiempo restante:' : 'Comienza en:'}
            </p>

            <div className="flex justify-center items-center space-x-2 mb-3">
                <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.days)}</div>
                    <div className="text-xs text-gray-500">DÍAS</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.hours)}</div>
                    <div className="text-xs text-gray-500">HORAS</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.minutes)}</div>
                    <div className="text-xs text-gray-500">MIN</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">:</div>
                <div className="bg-white rounded-lg p-2 shadow-md min-w-[50px]">
                    <div className="text-2xl font-bold text-gray-800">{formatNumber(timeLeft.seconds)}</div>
                    <div className="text-xs text-gray-500">SEG</div>
                </div>
            </div>

            {isActive && (
                <p className="text-sm text-red-600 font-semibold">
                    ⚡ ¡Aprovecha antes de que termine!
                </p>
            )}
        </div>
    );
}