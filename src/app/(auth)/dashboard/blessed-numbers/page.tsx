'use client'
import { useEffect, useState } from 'react'
import { getBlessedNumbers } from '../../services/blessedService'
import DataTable from '../../components/DataTable'

export default function BendecidosPage() {
    const [blessed, setBlessed] = useState<any[]>([])
    useEffect(() => {
        getBlessedNumbers().then(setBlessed).catch(console.error)
    }, [])

    return (
        <DataTable
            title="Números Bendecidos"
            data={blessed}
            columns={[
                { key: 'number', label: 'Número' },
                { key: 'name', label: 'Participante' },
                { key: 'email', label: 'Email' },
                { key: 'is_minor_prize', label: 'Premio Menor' },
            ]}
            actions={{ read: false, edit: false, delete: false }}
            searchable
        />
    )
}
