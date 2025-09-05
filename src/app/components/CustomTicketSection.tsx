// components/CustomTicketSection.tsx - Actualizado
interface CustomTicketSectionProps {
    customAmount: number | null;
    setCustomAmount: (amount: number | null) => void;
    onCustomBuy: () => void;
    isEventFinalized?: boolean; // Nueva prop opcional
}

export function CustomTicketSection({ 
    customAmount, 
    setCustomAmount, 
    onCustomBuy,
    isEventFinalized = false 
}: CustomTicketSectionProps) {
    
    // Si el evento está finalizado, no mostrar la sección
    if (isEventFinalized) {
        return (
            <section className="w-full mt-6">
                <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-6 shadow text-center flex flex-col items-center opacity-75">
                    <h3 className="text-xl font-bold tracking-wide mb-4 text-gray-600">
                        🚫 Compras Deshabilitadas
                    </h3>
                    <p className="text-gray-600 mb-4">
                        El evento ha finalizado y ya no se pueden comprar más boletos.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md">
                        <p className="text-red-700 text-sm">
                            <strong>📧 Importante:</strong> Revisa tu email para ver tus boletos comprados.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full mt-6">
            <div className="bg-gray-100 border rounded-2xl p-6 shadow hover:shadow-lg transition text-center flex flex-col items-center">
                <h3 className="text-xl font-bold tracking-wide mb-4">¿Deseas más números?</h3>
                
                <label className="mb-2 text-sm text-gray-700" htmlFor="customAmount">
                    Ingresa la cantidad de boletos que deseas comprar:
                </label>
                
                <div className="mb-4">
                    <input
                        id="customAmount"
                        type="number"
                        min={20}
                        max={10000}
                        placeholder="Ej. 250"
                        className="w-32 text-center px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customAmount ?? ""}
                        onChange={(e) => setCustomAmount(parseInt(e.target.value))}
                        disabled={isEventFinalized}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Mínimo: 20 boletos | Máximo: 10,000 boletos
                    </div>
                </div>

                {/* Mostrar precio estimado si hay cantidad válida */}
                {customAmount && customAmount >= 20 && (
                    <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700 text-sm">
                            💰 Precio estimado: <strong>${(customAmount * 1.50).toFixed(2)}</strong>
                        </p>
                    </div>
                )}
                
                <button
                    onClick={onCustomBuy}
                    disabled={isEventFinalized || !customAmount || customAmount < 20}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        isEventFinalized || !customAmount || customAmount < 20
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800 transform hover:scale-105 shadow-md'
                    }`}
                >
                    {isEventFinalized ? 'EVENTO FINALIZADO' : 'COMPRAR'}
                </button>

                {/* Mensaje de información */}
                <div className="mt-3 text-xs text-gray-600">
                    {isEventFinalized ? (
                        <p>🔒 Las compras han sido deshabilitadas</p>
                    ) : (
                        <p>🔒 Pago 100% seguro | ⚡ Proceso instantáneo</p>
                    )}
                </div>
            </div>
        </section>
    );
}