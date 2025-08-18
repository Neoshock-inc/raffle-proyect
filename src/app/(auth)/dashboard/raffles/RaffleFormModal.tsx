'use client'

import { useEffect, useState } from 'react'
import { CreateRaffleData, RaffleStatus, UpdateRaffleData } from '../../types/raffle'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateRaffleData) => void
  initialData?: CreateRaffleData | UpdateRaffleData
}

const defaultStatus: RaffleStatus = 'draft'

export default function RaffleFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [totalNumbers, setTotalNumbers] = useState(100)
  const [drawDate, setDrawDate] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#800000')
  const [secondaryColor, setSecondaryColor] = useState('#FFC107')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [showCountdown, setShowCountdown] = useState(true)
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState<number | undefined>(undefined)
  const [minTicketsToActivate, setMinTicketsToActivate] = useState(1)
  const [status, setStatus] = useState<RaffleStatus>(defaultStatus)
  const [categoryId, setCategoryId] = useState<string>('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setPrice(initialData.price || 0)
      setTotalNumbers(initialData.total_numbers || 100)
      setDrawDate(initialData.draw_date ? initialData.draw_date.split('T')[0] : '')
      setPrimaryColor(initialData.primary_color || '#800000')
      setSecondaryColor(initialData.secondary_color || '#FFC107')
      setBackgroundColor(initialData.background_color || '#FFFFFF')
      setShowCountdown(initialData.show_countdown ?? true)
      setMaxTicketsPerUser(initialData.max_tickets_per_user ?? undefined)
      // Estos son internos, puedes ajustarlos si decides pasarlos también por initialData
      setMinTicketsToActivate(1)
      setStatus('draft')
      setShowProgressBar(true)
    }
  }, [initialData, isOpen])


  const handleSubmit = () => {
    if (!title || !price || !totalNumbers || !drawDate) {
      alert('Por favor, completa todos los campos obligatorios.')
      return
    }

    const data: CreateRaffleData = {
      title,
      description,
      price,
      total_numbers: totalNumbers,
      draw_date: new Date(drawDate).toISOString(),
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      background_color: backgroundColor,
      show_countdown: showCountdown,
      max_tickets_per_user: maxTicketsPerUser,
    }

    onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Crear rifa</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Título *</label>
              <input
                type="text"
                placeholder='Ejemplo: "Rifa de un coche"'
                className="w-full border px-3 py-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Precio *</label>
              <input
                type="number"
                placeholder="Precio del ticket"
                className="w-full border px-3 py-2 rounded"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                placeholder="Descripción de la rifa"
                className="w-full border px-3 py-2 rounded"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Total de números *</label>
              <input
                type="number"
                placeholder='Ejemplo: "100"'
                className="w-full border px-3 py-2 rounded"
                value={totalNumbers}
                onChange={(e) => setTotalNumbers(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha del sorteo *</label>
              <input
                type="date"
                placeholder="Fecha del sorteo"
                className="w-full border px-3 py-2 rounded"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Máx. tickets por usuario</label>
              <input
                type="number"
                placeholder="Máximo por usuario"
                className="w-full border px-3 py-2 rounded"
                value={maxTicketsPerUser ?? ''}
                onChange={(e) =>
                  setMaxTicketsPerUser(e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tickets mínimos para activar *</label>
              <input
                type="number"
                placeholder="Ej: 10"
                className="w-full border px-3 py-2 rounded"
                value={minTicketsToActivate}
                onChange={(e) => setMinTicketsToActivate(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Estado *</label>
              <select
                title='Selecciona el estado de la rifa'
                className="w-full border px-3 py-2 rounded"
                value={status}
                onChange={(e) => setStatus(e.target.value as RaffleStatus)}
              >
                <option value="draft">Borrador</option>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="completed">Finalizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Colores</label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" title="Primario" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                <input type="color" title="Secundario" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                <input type="color" title="Fondo" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-gray-700">Opciones</label>
              <div className="flex items-center gap-2">
                <input
                  id="countdown"
                  type="checkbox"
                  checked={showCountdown}
                  onChange={(e) => setShowCountdown(e.target.checked)}
                />
                <label htmlFor="countdown" className="text-sm">Mostrar cuenta regresiva</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="progressBar"
                  type="checkbox"
                  checked={showProgressBar}
                  onChange={(e) => setShowProgressBar(e.target.checked)}
                />
                <label htmlFor="progressBar" className="text-sm">Mostrar barra de progreso</label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-sky-700 text-white hover:bg-[#6a0000]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
