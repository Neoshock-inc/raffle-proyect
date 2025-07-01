// types/invoice.ts

import { InvoiceCreationData } from "@/app/types/invoices"

export type InvoiceStatus = 'paid' | 'pending' | 'failed'

export interface Invoice {
  id: string
  order_number: string
  full_name: string
  phone: string
  amount: number
  total_price: number
  status: InvoiceStatus
  created_at: string
}

export type CreateInvoiceInput = Omit<Invoice, 'id' | 'created_at'>
export type UpdateInvoiceInput = Partial<InvoiceCreationData> & { id: string }
