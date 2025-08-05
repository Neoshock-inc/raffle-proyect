import './css/ProgressBar.css';

interface ProgressBarProps {
    soldPercentage: number;
    animatedPercentage: number;
    soldTickets: number;
    totalNumbers: number;
}

export function ProgressBar({
    soldPercentage,
    animatedPercentage,
    soldTickets,
    totalNumbers
}: ProgressBarProps) {
    return (
        <section className="w-full mb-5 mt-1">
            {/* Título de la sección */}
            <h2 className="text-2xl font-bold mb-4 text-center">Si Pero Las Cantidades Son Limitadas</h2>

            {/* Información del progreso */}
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <div>Progreso de la venta</div>
                <div>{Math.round(soldPercentage)}%</div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-9 overflow-hidden shadow-inner relative">
                {/* Fondo base de la barra */}
                <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${Math.max(animatedPercentage, 0.5)}%`,
                        backgroundColor: 'var(--color-green-700)',
                    }}
                />

                {/* Capa de animación de rayas (encima del fondo) */}
                <div
                    className="absolute top-0 left-0 h-full rounded-full progress-bar-stripes pointer-events-none mix-blend-overlay"
                    style={{
                        width: `${Math.max(animatedPercentage, 0.5)}%`,
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
