// src/(auth)/types/invoice.ts
// Tipos de Invoice para admin - extienden los tipos base de invoices.ts

import { Invoice as BaseInvoice, InvoiceCreationData } from '@/app/types/invoices'

export type InvoiceStatus = 'paid' | 'pending' | 'failed'

// Invoice simplificado para listados admin (subset del tipo base)
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
