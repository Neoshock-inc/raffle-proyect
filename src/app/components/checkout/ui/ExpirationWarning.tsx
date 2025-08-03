import { formatTimeRemaining } from '@/app/utils/timeUtils';
import React from 'react';

interface ExpirationWarningProps {
    timeRemaining: number | null;
    tokenExpired: boolean;
}

export const ExpirationWarning: React.FC<ExpirationWarningProps> = ({
    timeRemaining,
    tokenExpired
}) => {
    if (!timeRemaining || tokenExpired) return null;

    const isUrgent = timeRemaining <= 300; // 5 minutos o menos

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${isUrgent
                ? 'bg-red-100 border-red-500 text-red-800'
                : 'bg-yellow-100 border-yellow-500 text-yellow-800'
            } border`}>
            <div className="flex items-center space-x-2">
                <span className="text-lg">⏰</span>
                <div>
                    <p className="font-semibold">
                        {isUrgent ? '¡Tiempo limitado!' : 'Sesión activa'}
                    </p>
                    <p className="text-sm">
                        Tiempo restante: {formatTimeRemaining(timeRemaining)}
                    </p>
                </div>
            </div>
        </div>
    );
};