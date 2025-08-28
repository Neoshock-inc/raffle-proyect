// components/templates/LuxuryTemplate/atoms/ProgressBar/index.tsx
interface LuxuryProgressBarProps {
    current: number;
    total: number;
    className?: string;
}

export const LuxuryProgressBar: React.FC<LuxuryProgressBarProps> = ({
    current,
    total,
    className = ''
}) => {
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div className={`w-full bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full h-3 overflow-hidden shadow-inner ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};