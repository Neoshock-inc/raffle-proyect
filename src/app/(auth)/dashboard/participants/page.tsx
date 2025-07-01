'use client'
import { useEffect, useState } from 'react'
import { getWinners } from '../../services/winnersService'
import DataTable from '../../components/DataTable'

export default function ParticipantesPage() {
    const [winners, setWinners] = useState<any[]>([])
    useEffect(() => {
        getWinners().then(setWinners).catch(console.error)
    }, [])

    return (
        <DataTable
            title="Ganadores"
            data={winners}
            columns={[
                { key: 'name', label: 'Nombre' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Teléfono' },
                { key: 'total', label: 'Cant. Números' },
            ]}
            actions={{ read: false, edit: false, delete: false }}
            searchable
        />
    )
}
