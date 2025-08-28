// components/templates/LuxuryTemplate/molecules/CountdownTimer/index.tsx
import { Trophy } from 'lucide-react';
import { LuxuryCountdownUnit } from '../../atoms/CountdownUnit';

interface LuxuryCountdownTimerProps {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}

export const LuxuryCountdownTimer: React.FC<LuxuryCountdownTimerProps> = ({ 
  timeLeft 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 mb-12 inline-block border-2 border-amber-200/50">
      <p className="text-2xl font-bold text-amber-800 mb-6 flex items-center justify-center space-x-2">
        <Trophy className="w-8 h-8" />
        <span>Próximo Gran Sorteo en:</span>
      </p>
      <div className="grid grid-cols-4 gap-6 text-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <LuxuryCountdownUnit 
            key={unit} 
            value={value} 
            unit={unit === 'days' ? 'Días' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min' : 'Seg'}
          />
        ))}
      </div>
    </div>
  );
};