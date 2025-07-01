// components/TicketSearchSection.tsx
interface TicketSearchSectionProps {
    searchEmail: string;
    setSearchEmail: (email: string) => void;
    onSearchTickets: (e?: React.FormEvent) => void;
    searchLoading: boolean;
    searchError: string | null;
}

export function TicketSearchSection({
    searchEmail,
    setSearchEmail,
    onSearchTickets,
    searchLoading,
    searchError
}: TicketSearchSectionProps) {
    return (
        <section className="w-full mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Consulta tus números</h2>
            <p className="mb-4 text-center">Ingresa tu correo electrónico para ver tus números asignados.</p>

            <form onSubmit={onSearchTickets} className="flex flex-col items-center">
                <div className="flex justify-center mb-2 w-full max-w-md">
                    <input
                        type="email"
                        placeholder="ej. correo@ejemplo.com"
                        className="w-full text-center px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-r hover:bg-gray-800"
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Buscando...' : 'CONSULTAR'}
                    </button>
                </div>

                {searchError && (
                    <p className="text-red-500 text-sm mt-2">{searchError}</p>
                )}
            </form>

            <p className="text-gray-600 text-sm text-center mt-4">
                Recuerda que los números asignados son aleatorios y serán enviados a tu correo electrónico registrado.
                <br />
                Si no los encuentras, revisa tu bandeja de correo no deseado o spam.
            </p>
        </section>
    );
}