// src/services/invoicesService.ts
import { Invoice } from '@/app/types/invoices'
import type { CreateInvoiceInput, UpdateInvoiceInput } from '../types/invoice'
import { supabase } from '../lib/supabaseTenantClient'

export async function getInvoicesList(): Promise<Invoice[]> {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error('Error al obtener las facturas')
    return data as Invoice[]
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const { data, error } = await supabase
        .from('invoices')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error('Error al crear la factura')
    return data as Invoice
}

export async function updateInvoice(input: UpdateInvoiceInput): Promise<Invoice> {
    const { id, ...rest } = input
    console.log('Actualizando factura con ID:', id, 'y datos:', rest)
    const { data, error } = await supabase
        .from('invoices')
        .update(rest)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(`Error al actualizar la factura, ${error.message}`)
    return data as Invoice
}