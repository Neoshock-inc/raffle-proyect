// components/CustomTicketSection.tsx
interface CustomTicketSectionProps {
    customAmount: number | null;
    setCustomAmount: (amount: number | null) => void;
    onCustomBuy: () => void;
}

export function CustomTicketSection({ customAmount, setCustomAmount, onCustomBuy }: CustomTicketSectionProps) {
    return (
        <section className="w-full mt-6">
            <div className="bg-gray-100 border rounded-2xl p-6 shadow hover:shadow-lg transition text-center flex flex-col items-center">
                <h3 className="text-xl font-bold tracking-wide mb-4">¿Deseas más números?</h3>
                <label className="mb-2 text-sm text-gray-700" htmlFor="customAmount">
                    Ingresa la cantidad de boletos que deseas comprar:
                </label>
                <input
                    id="customAmount"
                    type="number"
                    min={1}
                    placeholder="Ej. 250"
                    className="w-32 text-center px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customAmount ?? ""}
                    onChange={(e) => setCustomAmount(parseInt(e.target.value))}
                />
                <button
                    onClick={onCustomBuy}
                    className="bg-black text-white text-sm font-semibold px-4 py-2 rounded hover:bg-gray-800"
                >
                    COMPRAR
                </button>
            </div>
        </section>
    );
}
