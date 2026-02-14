'use client'

import { useState } from 'react'
import { Upload, CheckCircle, AlertTriangle, Trash2, RefreshCw, FileSpreadsheet, ChevronDown, ChevronUp, AlertCircle as AlertCircleIcon } from 'lucide-react'
import FileDropZone from './FileDropZone'
import { parseNumberFile, type ParseResult } from '@/admin/utils/excelParser'
import { Button } from '@/admin/components/ui/Button'
import { ConfirmDialog } from '@/admin/components/ui/ConfirmDialog'
import { toast } from 'sonner'

interface ExcelUploadSectionProps {
    poolId: string
    existingCount: number
    soldCount: number
    onUpload: (numbers: number[]) => Promise<void>
    onClear: () => Promise<void>
}

export default function ExcelUploadSection({
    poolId,
    existingCount,
    soldCount,
    onUpload,
    onClear,
}: ExcelUploadSectionProps) {
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [uploading, setUploading] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [showUploadForm, setShowUploadForm] = useState(false)

    const hasExisting = existingCount > 0
    const hasSold = soldCount > 0

    const handleFileSelect = async (file: File) => {
        try {
            const result = await parseNumberFile(file)
            setParseResult(result)
        } catch {
            toast.error('Error al leer el archivo')
        }
    }

    const handleConfirmUpload = async () => {
        if (!parseResult?.success || !parseResult.numbers.length) return

        // If replacing and there are sold numbers, require extra confirmation
        if (hasExisting && hasSold) {
            setShowReplaceConfirm(true)
            return
        }

        await doUpload()
    }

    const doUpload = async () => {
        if (!parseResult?.success) return

        setUploading(true)
        setShowReplaceConfirm(false)
        try {
            // If replacing, clear first
            if (hasExisting) {
                await onClear()
            }
            await onUpload(parseResult.numbers)
            toast.success(`${parseResult.numbers.length.toLocaleString()} números cargados exitosamente`)
            setParseResult(null)
            setShowUploadForm(false)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cargar números')
        } finally {
            setUploading(false)
        }
    }

    const handleClear = async () => {
        setClearing(true)
        try {
            await onClear()
            toast.success('Números eliminados')
            setParseResult(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al eliminar números')
        } finally {
            setClearing(false)
            setShowClearConfirm(false)
        }
    }

    // --- STATE 1: No numbers loaded yet → show upload prominently ---
    if (!hasExisting) {
        return (
            <div className="space-y-4">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Cargar números sobrantes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sube un Excel (.xlsx) o CSV con los números en la primera columna
                    </p>
                </div>

                <FileDropZone
                    accept=".xlsx,.xls,.csv"
                    onFileSelect={handleFileSelect}
                    label="Arrastra tu archivo Excel o CSV aquí"
                    description="o haz clic para seleccionar"
                />

                <ParseResultPreview
                    parseResult={parseResult}
                    uploading={uploading}
                    onConfirm={handleConfirmUpload}
                />
            </div>
        )
    }

    // --- STATE 2: Numbers already loaded → show summary, collapse upload ---
    return (
        <div className="space-y-4">
            {/* Current status summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {existingCount.toLocaleString()} números cargados
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {soldCount > 0
                                ? `${soldCount.toLocaleString()} vendidos, ${(existingCount - soldCount).toLocaleString()} disponibles`
                                : 'Ninguno vendido aún'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setShowUploadForm(!showUploadForm)
                            setParseResult(null)
                        }}
                        icon={showUploadForm ? <ChevronUp className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                    >
                        {showUploadForm ? 'Cancelar' : 'Reemplazar'}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowClearConfirm(true)}
                        icon={<Trash2 className="h-4 w-4" />}
                    >
                        Limpiar
                    </Button>
                </div>
            </div>

            {/* Collapsible upload form */}
            {showUploadForm && (
                <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50/30 dark:bg-amber-900/10 space-y-4">
                    {hasSold && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <AlertCircleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 dark:text-red-400">
                                Esta rifa tiene {soldCount} números vendidos. Al reemplazar se eliminarán los números actuales del pool.
                                Los números ya vendidos permanecerán en las entradas de la rifa.
                            </p>
                        </div>
                    )}

                    <FileDropZone
                        accept=".xlsx,.xls,.csv"
                        onFileSelect={handleFileSelect}
                        label="Arrastra el nuevo archivo aquí"
                        description="Esto reemplazará todos los números actuales"
                    />

                    <ParseResultPreview
                        parseResult={parseResult}
                        uploading={uploading}
                        onConfirm={handleConfirmUpload}
                        isReplacing
                    />
                </div>
            )}

            {/* Clear confirmation */}
            <ConfirmDialog
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClear}
                title="Eliminar números cargados"
                message={
                    hasSold
                        ? `Se eliminarán los ${existingCount.toLocaleString()} números del pool. Hay ${soldCount} números ya vendidos — las entradas existentes no se verán afectadas, pero el pool quedará vacío.`
                        : `Se eliminarán los ${existingCount.toLocaleString()} números del pool. Esta acción no se puede deshacer.`
                }
                confirmText="Eliminar todos"
                variant="danger"
                loading={clearing}
            />

            {/* Replace confirmation (when sold numbers exist) */}
            <ConfirmDialog
                isOpen={showReplaceConfirm}
                onClose={() => setShowReplaceConfirm(false)}
                onConfirm={doUpload}
                title="Reemplazar números con ventas existentes"
                message={`Hay ${soldCount} números vendidos. Se eliminarán los números actuales del pool y se cargarán ${parseResult?.count.toLocaleString() || 0} nuevos. Las entradas vendidas no se modifican. ¿Continuar?`}
                confirmText="Reemplazar"
                variant="danger"
                loading={uploading}
            />
        </div>
    )
}

// --- Subcomponent: Parse result preview ---
function ParseResultPreview({
    parseResult,
    uploading,
    onConfirm,
    isReplacing = false,
}: {
    parseResult: ParseResult | null
    uploading: boolean
    onConfirm: () => void
    isReplacing?: boolean
}) {
    if (!parseResult) return null

    return (
        <div className={`rounded-xl border p-4 ${
            parseResult.success
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
        }`}>
            <div className="flex items-center gap-2 mb-3">
                {parseResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {parseResult.success ? 'Archivo procesado correctamente' : 'Error en el archivo'}
                </span>
            </div>

            {parseResult.success && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Números válidos</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {parseResult.count.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Mínimo</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {parseResult.min}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Máximo</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {parseResult.max}
                        </p>
                    </div>
                    {(parseResult.duplicateCount > 0 || parseResult.invalidCount > 0) && (
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Omitidos</span>
                            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                                {(parseResult.duplicateCount + parseResult.invalidCount).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {parseResult.errors.length > 0 && (
                <div className="mb-3">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Advertencias ({parseResult.errors.length}):
                    </span>
                    <ul className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                        {parseResult.errors.map((err, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
                                {err}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {parseResult.success && (
                <Button
                    onClick={onConfirm}
                    loading={uploading}
                    icon={<Upload className="h-4 w-4" />}
                >
                    {isReplacing
                        ? `Reemplazar con ${parseResult.count.toLocaleString()} números`
                        : `Confirmar y cargar ${parseResult.count.toLocaleString()} números`
                    }
                </Button>
            )}
        </div>
    )
}
