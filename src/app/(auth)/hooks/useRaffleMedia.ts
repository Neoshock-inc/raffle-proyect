
// src/hooks/useRaffleMedia.ts

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { raffleService } from '../services/rafflesService'
import type { RaffleMedia, UploadMediaData, UseRaffleMediaOptions } from '../types/raffle'

export const useRaffleMedia = (options: UseRaffleMediaOptions) => {
    const { raffleId, mediaType, enabled = true } = options

    const [media, setMedia] = useState<RaffleMedia[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchMedia = useCallback(async () => {
        if (!enabled || !raffleId) return

        setLoading(true)
        setError(null)

        try {
            const mediaData = await raffleService.getRaffleMedia(raffleId, mediaType)
            setMedia(mediaData)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar multimedia'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [raffleId, mediaType, enabled])

    useEffect(() => {
        fetchMedia()
    }, [fetchMedia])

    const uploadMedia = async (uploadData: UploadMediaData) => {
        setUploading(true)
        try {
            const result = await raffleService.uploadMedia(uploadData)
            await fetchMedia() // Recargar lista
            toast.success('Archivo subido exitosamente')
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al subir archivo'
            toast.error(errorMessage)
            throw err
        } finally {
            setUploading(false)
        }
    }

    const deleteMedia = async (mediaId: string) => {
        try {
            await raffleService.deleteMedia(mediaId)
            setMedia(prev => prev.filter(item => item.id !== mediaId))
            toast.success('Archivo eliminado exitosamente')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar archivo'
            toast.error(errorMessage)
            throw err
        }
    }

    return {
        media,
        loading,
        uploading,
        error,
        uploadMedia,
        deleteMedia,
        refetch: fetchMedia
    }
}
