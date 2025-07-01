// src/hooks/useInvoices.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { getInvoicesList } from '../services/invoicesService'
import type { UpdateInvoiceInput } from '../types/invoice'
import { Invoice, InvoiceCreationData } from '@/app/types/invoices'
import { createInvoiceWithParticipant, updateInvoice } from '@/app/services/invoiceService'

const ITEMS_PER_PAGE = 10

export const useInvoices = (searchTerm: string = '') => {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Fetch invoices - solo se ejecuta una vez al montar
    useEffect(() => {
        let mounted = true

        const fetchInvoices = async () => {
            try {
                setLoading(true)
                const data = await getInvoicesList()
                if (mounted) {
                    setInvoices(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError('Error al obtener facturas')
                    console.error(err)
                    toast.error('Error al cargar las facturas')
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchInvoices()

        return () => {
            mounted = false
        }
    }, []) // Sin dependencias - solo se ejecuta al montar

    // Filtrar invoices
    const filteredInvoices = useMemo(() => {
        if (!searchTerm.trim()) return invoices

        const term = searchTerm.toLowerCase().trim()
        return invoices.filter((inv) =>
            String(inv.order_number).includes(term) ||
            inv.full_name.toLowerCase().includes(term) ||
            inv.phone.includes(term)
        )
    }, [invoices, searchTerm])

    // Reset page cuando cambia el search
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Calcular paginación
    const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE))
    const validPage = Math.min(currentPage, totalPages)

    const pagination = useMemo(() => ({
        page: validPage,
        limit: ITEMS_PER_PAGE,
        totalPages
    }), [validPage, totalPages])

    // Invoices paginadas
    const paginatedInvoices = useMemo(() => {
        const start = (validPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return filteredInvoices.slice(start, end)
    }, [filteredInvoices, validPage])

    // Funciones de acción
    const setPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    // Nueva función create que usa los servicios actualizados
    const create = useCallback(async (input: InvoiceCreationData) => {
        try {
            // El orderNumber ya viene del modal, solo necesitamos crear el invoiceData
            const invoiceData: Omit<InvoiceCreationData, 'participantId'> = {
                ...input
            }

            // Crear factura con participante
            const newInvoice = await createInvoiceWithParticipant(invoiceData)
            setInvoices(prev => [newInvoice, ...prev])

            toast.success('Factura creada exitosamente')
            return newInvoice
        } catch (err) {
            console.error('Error creating invoice:', err)
            toast.error('Error al crear la factura')
            throw err
        }
    }, [])

    const update = useCallback(async (input: UpdateInvoiceInput) => {
        try {
            const { id, ...invoiceData } = input
            const updated = await updateInvoice(id, invoiceData)
            setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv))

            toast.success('Factura actualizada exitosamente')
            return updated
        } catch (err) {
            console.error('Error updating invoice:', err)
            toast.error('Error al actualizar la factura')
            throw err
        }
    }, [])

    const refetch = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getInvoicesList()
            setInvoices(data)
            setError(null)
        } catch (err) {
            setError('Error al obtener facturas')
            console.error(err)
            toast.error('Error al recargar las facturas')
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        filteredInvoices,
        paginatedInvoices,
        pagination,
        setPage,
        create,
        update,
        refetch
    }
}