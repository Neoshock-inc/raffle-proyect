'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/admin/components/ui/cn'

interface FileDropZoneProps {
    accept: string
    onFileSelect: (file: File) => void
    label?: string
    description?: string
}

export default function FileDropZone({
    accept,
    onFileSelect,
    label = 'Arrastra un archivo aquí',
    description = 'o haz clic para seleccionar',
}: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            setSelectedFile(file)
            onFileSelect(file)
        }
    }, [onFileSelect])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            onFileSelect(file)
        }
    }, [onFileSelect])

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                isDragging
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-10 w-10 text-green-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Upload className={cn(
                        'h-10 w-10',
                        isDragging ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'
                    )} />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Formatos aceptados: .xlsx, .csv
                    </p>
                </div>
            )}
        </div>
    )
}
