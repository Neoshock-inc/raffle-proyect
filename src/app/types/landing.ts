// src/app/types/landing.ts

import { LucideIcon } from 'lucide-react'

/**
 * Plan de marketing para mostrar en la landing page
 * Este tipo se usa para la UI, no para la base de datos
 */
export type PlanMarketing = {
  id: string           // Este será el 'code' de la BD
  code: string         // 'basic', 'professional', 'enterprise'
  name: string
  price: string
  period: string
  originalPrice: string | null
  description: string
  features: Record<string, boolean>
  tenantCount: string
  color: 'gray' | 'blue' | 'purple'
  icon: LucideIcon    // Para componente
  icon_name: string   // Para BD: 'Activity' | 'Zap' | 'Crown'
  popular: boolean
  cta: string
  cta_text: string    // Alias para compatibilidad
  highlight: string | null
  highlight_label?: string | null
  is_popular?: boolean
  is_featured?: boolean
}

/**
 * Otros tipos existentes de la landing
 */
export type Testimonial = {
  name: string
  role: string
  image: string
  content: string
  rating: number
  company: string
  results: string
  verified: boolean
}

export type ComparisonData = {
  before: { title: string; items: Array<{ icon: any; text: string; color: string }> }
  after: { title: string; items: Array<{ icon: any; text: string; color: string }> }
}

export type FeaturedRaffleCard = {
  id: string
  name: string
  image: string
  ticketsSold: number
  totalTickets: number
  price: number
  status: string
  participants: number
  category: string
  badge: string
}