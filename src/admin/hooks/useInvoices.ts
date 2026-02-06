// src/hooks/useInvoices.ts - MIGRACIÓN MULTI-TENANT + HOOKS COMPARTIDOS
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { getInvoicesList, updateInvoice } from '../services/invoicesService'
import type { UpdateInvoiceInput } from '../types/invoice'
import { Invoice, InvoiceCreationData } from '@/types/invoices'
import { useTenantContext } from '../contexts/TenantContext'
import { createInvoiceWithParticipant } from '@/services/invoiceService'
import { usePaginatedFilter } from '@/hooks/shared'

const ITEMS_PER_PAGE = 10

export const useInvoices = (searchTerm: string = '') => {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Usar hook compartido para filtrado y paginación
    const { paginated: paginatedInvoices, filtered: filteredInvoices, pagination, setPage } = usePaginatedFilter(
        invoices,
        searchTerm,
        (inv, term) =>
            String(inv.order_number).includes(term) ||
            inv.full_name.toLowerCase().includes(term) ||
            inv.phone.includes(term),
        ITEMS_PER_PAGE
    )

    // Función para cargar facturas
    const fetchInvoices = useCallback(async (forceRefresh = false) => {
        if (tenantLoading) return

        try {
            setLoading(true)
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            const data = await getInvoicesList()
            setInvoices(data)
            setError(null)
        } catch (err) {
            setError('Error al obtener facturas')
            console.error('Error loading invoices:', err)
            toast.error('Error al cargar las facturas')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading])

    // Efecto para cargar facturas cuando cambie el tenant
    useEffect(() => {
        if (!tenantLoading) {
            fetchInvoices(true)
        }
    }, [currentTenant?.id, tenantLoading, fetchInvoices])

    // Función create
    const create = useCallback(async (input: InvoiceCreationData) => {
        try {
            const invoiceData: Omit<InvoiceCreationData, 'participantId'> = { ...input }
            const newInvoice = await createInvoiceWithParticipant(invoiceData)
            setInvoices(prev => [newInvoice, ...prev])
            toast.success('Factura creada exitosamente')
            return newInvoice
        } catch (err) {
            console.error('Error creating invoice:', err)
            toast.error('Error al crear la factura')
            throw err
        }
    }, [currentTenant])

    // Función update
    const update = useCallback(async (input: UpdateInvoiceInput) => {
        try {
            const updated = await updateInvoice(input)
            setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv))
            toast.success('Factura actualizada exitosamente')
            return updated
        } catch (err) {
            console.error('Error updating invoice:', err)
            toast.error('Error al actualizar la factura')
            throw err
        }
    }, [currentTenant])

    const refetch = useCallback(async () => {
        await fetchInvoices(true)
    }, [fetchInvoices])

    return {
        loading: loading || tenantLoading,
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
