// components/templates/LuxuryTemplate/atoms/CountdownUnit/index.tsx
interface LuxuryCountdownUnitProps {
  value: number;
  unit: string;
}

export const LuxuryCountdownUnit: React.FC<LuxuryCountdownUnitProps> = ({ 
  value, 
  unit 
}) => {
  return (
    <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-sm uppercase tracking-wide font-medium mt-2">
        {unit}
      </div>
    </div>
  );
};