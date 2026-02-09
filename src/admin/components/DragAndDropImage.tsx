import { useState, useRef, useCallback } from 'react'
import { UploadMediaData, RaffleMedia, MediaUploadResponse } from '../types/raffle'

interface DragAndDropImageProps {
    label: string
    value?: string | null
    onChange: (val: string) => void
    raffleId?: string  // 👈 NUEVO
    onUpload?: (uploadData: UploadMediaData) => Promise<MediaUploadResponse>
    mediaList?: RaffleMedia[]
    loading?: boolean
    error?: string | null
}


export default function DragAndDropImage({ label, value, onChange, onUpload, raffleId }: DragAndDropImageProps) {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            if (onUpload) {
                try {
                    if (onUpload && raffleId) {
                        const uploadResult = await onUpload({
                            raffle_id: raffleId,
                            file,
                            media_type: 'image',
                        })
                        onChange(uploadResult.file_url) // o .url dependiendo de tu respuesta
                    }

                } catch {
                    // manejar error si quieres
                }
            } else {
                onChange(file.name) // solo cambia a nombre, como ahora
            }
        }
    }


    const handleClick = () => {
        fileInputRef.current?.click()
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            onChange(file.name)
        }
    }

    return (
        <div className="mb-6 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`cursor-pointer border-2 border-dashed rounded p-6 text-center transition ${isDragging ? 'border-indigo-600 bg-gray-50 dark:bg-gray-800' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                    }`}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt={`Preview ${label.toLowerCase()}`}
                            className="mx-auto max-h-40 object-contain rounded border border-gray-300 dark:border-gray-600 mb-2"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible'
                            }}
                        />
                        <p className="text-gray-400 dark:text-gray-500 text-xs">Haz clic o arrastra otra imagen para cambiar</p>
                    </>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        Arrastra una imagen aquí o haz clic para seleccionar un archivo
                    </p>
                )}
            </div>
            <input
                type="file"
                placeholder='Selecciona una imagen'
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}
