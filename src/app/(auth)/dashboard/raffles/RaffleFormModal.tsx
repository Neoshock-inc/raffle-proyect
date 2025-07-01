'use client'

import { useState } from 'react'
import { CreateRaffleData } from '../../types/raffle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRaffleData) => void
}

export default function RaffleFormModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState(0)
  const [totalNumbers, setTotalNumbers] = useState(100)

  const handleSubmit = () => {
    const data: CreateRaffleData = {
      title,
      price,
      total_numbers: totalNumbers,
      draw_date: new Date().toISOString(),
    }
    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Crear rifa</h3>

        <input
          type="text"
          placeholder="Título"
          className="w-full mb-2 border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          className="w-full mb-2 border px-3 py-2 rounded"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Total de números"
          className="w-full mb-4 border px-3 py-2 rounded"
          value={totalNumbers}
          onChange={(e) => setTotalNumbers(Number(e.target.value))}
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-[#800000] text-white"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
