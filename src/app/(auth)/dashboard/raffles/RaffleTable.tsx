import { Raffle } from '../../types/raffle'

interface Props {
    raffles: Raffle[]
    loading: boolean
}

export default function RaffleTable({ raffles, loading }: Props) {
    if (loading) return <p>Cargando rifas...</p>

    return (
        <div className="overflow-auto bg-white rounded shadow">
            <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Título</th>
                        <th className="px-4 py-2 text-left">Precio</th>
                        <th className="px-4 py-2 text-left">Números</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {raffles.map((r) => (
                        <tr key={r.id} className="border-b">
                            <td className="px-4 py-2">{r.title}</td>
                            <td className="px-4 py-2">${r.price}</td>
                            <td className="px-4 py-2">{r.total_numbers}</td>
                            <td className="px-4 py-2 capitalize">{r.status}</td>
                            <td className="px-4 py-2">
                                {/* Puedes agregar botones de editar/eliminar aquí */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
