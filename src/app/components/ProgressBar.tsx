// components/ProgressBar.tsx - Actualizado
import './css/ProgressBar.css';

interface ProgressBarProps {
    soldPercentage: number;
    animatedPercentage: number;
    soldTickets: number;
    totalNumbers: number;
    isEventFinalized?: boolean; // Nueva prop opcional
}

export function ProgressBar({
    soldPercentage,
    animatedPercentage,
    soldTickets,
    totalNumbers,
    isEventFinalized = false
}: ProgressBarProps) {
    return (
        <section className="w-full mb-5 mt-1">
            {/* Información del progreso */}
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <div>
                    {isEventFinalized ? 'Evento Finalizado' : 'Progreso de la venta'}
                </div>
                <div className={`font-bold ${isEventFinalized ? 'text-red-600' : ''}`}>
                    {Math.round(soldPercentage)}%
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-9 overflow-hidden shadow-inner relative">
                {/* Fondo base de la barra */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                        isEventFinalized ? 'opacity-75' : ''
                    }`}
                    style={{
                        width: `${Math.max(animatedPercentage, 0.5)}%`,
                        backgroundColor: isEventFinalized ? 'var(--color-red-600)' : 'var(--color-green-700)',
                    }}
                />

                {/* Capa de animación de rayas (encima del fondo) */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-full progress-bar-stripes pointer-events-none mix-blend-overlay ${
                        isEventFinalized ? 'opacity-50' : ''
                    }`}
                    style={{
                        width: `${Math.max(animatedPercentage, 0.5)}%`,
                    }}
                />

                {/* Overlay de finalizado si aplica */}
                {isEventFinalized && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                            FINALIZADO
                        </span>
                    </div>
                )}
            </div>

            <div className="text-xs mt-1">
                {isEventFinalized ? (
                    <p className="mb-4 text-center text-red-700 font-medium">
                        🏁 <strong>El evento ha finalizado.</strong><br />
                        Se vendieron <strong>{soldTickets.toLocaleString()}</strong> de <strong>{totalNumbers.toLocaleString()}</strong> boletos disponibles.
                    </p>
                ) : (
                    <p className="mb-4 text-center">
                        El evento terminará el <strong>04 de Septiembre de 2025 </strong>
                        Se tomarán los 4 números de la primera y segunda suerte del programa <strong>LOTERIA NACIONAL</strong>.
                    </p>
                )}
            </div>

            {/* Estadísticas adicionales cuando está finalizado */}
            {isEventFinalized && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                            <div className="font-bold text-lg text-blue-600">{soldTickets.toLocaleString()}</div>
                            <div className="text-gray-600">Boletos Vendidos</div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-green-600">{(totalNumbers - soldTickets).toLocaleString()}</div>
                            <div className="text-gray-600">Boletos Restantes</div>
                        </div>
                    </div>
                </div>
            )}

            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                    Debug: Vendidos: {soldTickets}, Total: {totalNumbers},
                    Porcentaje real: {soldPercentage.toFixed(2)}%,
                    Animado: {animatedPercentage.toFixed(2)}%,
                    Finalizado: {isEventFinalized ? 'Sí' : 'No'}
                </div>
            )}
        </section>
    );
}