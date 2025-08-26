// src/hooks/useInvoices.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { getInvoicesList, updateInvoice } from '../services/invoicesService' // CAMBIO: Usar el servicio actualizado
import type { UpdateInvoiceInput } from '../types/invoice'
import { Invoice, InvoiceCreationData } from '@/app/types/invoices'
import { useTenantContext } from '../contexts/TenantContext' // AGREGAR: Usar contexto de tenant
import { createInvoiceWithParticipant } from '@/app/services/invoiceService'

const ITEMS_PER_PAGE = 10

export const useInvoices = (searchTerm: string = '') => {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // AGREGAR: Obtener contexto de tenant
    const { currentTenant, isAdmin, loading: tenantLoading } = useTenantContext()

    // Función para cargar facturas
    const fetchInvoices = useCallback(async (forceRefresh = false) => {
        // No cargar si el tenant aún está cargando
        if (tenantLoading) return

        try {
            setLoading(true)
            console.log('📄 [INVOICES] Loading invoices for tenant:', currentTenant?.name || 'Global')

            // Agregar pequeño delay si es force refresh para asegurar contexto
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            const data = await getInvoicesList()
            setInvoices(data)
            setError(null)

            console.log('✅ [INVOICES] Loaded invoices:', data.length)
        } catch (err) {
            setError('Error al obtener facturas')
            console.error('❌ [INVOICES] Error:', err)
            toast.error('Error al cargar las facturas')
        } finally {
            setLoading(false)
        }
    }, [currentTenant, tenantLoading])

    // Efecto para cargar facturas cuando cambie el tenant
    useEffect(() => {
        console.log('🔄 [INVOICES] Tenant context changed:', {
            tenantId: currentTenant?.id,
            tenantName: currentTenant?.name,
            isAdmin,
            tenantLoading
        })

        if (!tenantLoading) {
            fetchInvoices(true) // Force refresh cuando cambie el tenant
        }
    }, [currentTenant?.id, tenantLoading, fetchInvoices])

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

    // Función create actualizada
    const create = useCallback(async (input: InvoiceCreationData) => {
        try {
            console.log('📝 [INVOICES] Creating invoice for tenant:', currentTenant?.name || 'Global')

            const invoiceData: Omit<InvoiceCreationData, 'participantId'> = {
                ...input
            }

            const newInvoice = await createInvoiceWithParticipant(invoiceData)
            setInvoices(prev => [newInvoice, ...prev])

            toast.success('Factura creada exitosamente')
            console.log('✅ [INVOICES] Invoice created:', newInvoice.id)
            return newInvoice
        } catch (err) {
            console.error('❌ [INVOICES] Error creating invoice:', err)
            toast.error('Error al crear la factura')
            throw err
        }
    }, [currentTenant])

    // Función update actualizada
    const update = useCallback(async (input: UpdateInvoiceInput) => {
        try {
            console.log('✏️ [INVOICES] Updating invoice for tenant:', currentTenant?.name || 'Global')

            const updated = await updateInvoice(input)
            setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv))

            toast.success('Factura actualizada exitosamente')
            console.log('✅ [INVOICES] Invoice updated:', updated.id)
            return updated
        } catch (err) {
            console.error('❌ [INVOICES] Error updating invoice:', err)
            toast.error('Error al actualizar la factura')
            throw err
        }
    }, [currentTenant])

    // Función refetch actualizada
    const refetch = useCallback(async () => {
        console.log('🔄 [INVOICES] Manual refresh triggered')
        await fetchInvoices(true)
    }, [fetchInvoices])

    return {
        loading: loading || tenantLoading, // Incluir tenant loading
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