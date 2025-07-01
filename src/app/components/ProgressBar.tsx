// components/ProgressBar.tsx
interface ProgressBarProps {
    soldPercentage: number;
    animatedPercentage: number;
    soldTickets: number;
    totalNumbers: number;
}

export function ProgressBar({ soldPercentage, animatedPercentage, soldTickets, totalNumbers }: ProgressBarProps) {
    return (
        <section className="w-full mb-5">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <div>Progreso de la venta</div>
                <div>{Math.round(soldPercentage)}%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden shadow-inner">
                <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-full text-sm text-white font-medium flex items-center justify-center transition-all duration-500 ease-out"
                    style={{
                        width: `${Math.max(animatedPercentage, 0.5)}%`,
                        boxShadow: '0 2px 4px rgba(0, 150, 0, 0.3)'
                    }}
                />
            </div>
            <div className="text-xs mt-1">
                <p className="mb-4 text-center">
                    Cuando la barra llegue al 100% daremos por finalizado y procederemos a realizar el sorteo entre todos los participantes.
                    Se tomarán los 5 números de la primera y segunda suerte del programa <strong>LOTERIA NACIONAL</strong>.
                </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                    Debug: Vendidos: {soldTickets}, Total: {totalNumbers},
                    Porcentaje real: {soldPercentage.toFixed(2)}%,
                    Animado: {animatedPercentage.toFixed(2)}%
                </div>
            )}
        </section>
    );
}