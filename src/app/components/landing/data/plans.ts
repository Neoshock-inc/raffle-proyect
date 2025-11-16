// src/app/components/landing/data/plans.ts

import { Activity, Zap, Crown } from 'lucide-react'
import { PlanMarketing } from '@/app/types/landing'

/**
 * Static fallback plans data
 * This will be replaced by API data when available
 */
export const plans: PlanMarketing[] = [
  {
    id: 'basic',
    code: 'basic',
    name: 'Básico',
    price: '$99',
    period: '/mes',
    originalPrice: null,
    description: 'Perfecto para empezar tu negocio de rifas',
    features: {
      'Hasta 10,000 boletos': true,
      'Rifas ilimitadas': true,
      'Dashboard básico': true,
      'Soporte por email': true,
      'Dominio personalizado': false,
      'Sistema de ganadores': false,
      'Sistema de referidos': false,
      'Números bendecidos': false,
      'Landing customizable': false,
      'Soporte prioritario': false
    },
    tenantCount: '142 usuarios activos',
    color: 'gray',
    icon: Activity,
    icon_name: 'Activity',
    popular: false,
    is_popular: false,
    is_featured: false,
    cta: 'Comenzar Gratis',
    cta_text: 'Comenzar Gratis',
    highlight: null,
    highlight_label: null
  },
  {
    id: 'professional',
    code: 'professional',
    name: 'Profesional',
    price: '$500',
    period: 'pago único',
    originalPrice: '$899',
    description: 'Para negocios serios que buscan automatización',
    features: {
      'Hasta 10,000 boletos': true,
      'Rifas ilimitadas': true,
      'Dashboard avanzado': true,
      'Soporte prioritario': true,
      'Dominio personalizado': false,
      'Sistema de ganadores': true,
      'Sistema de referidos': true,
      'Números bendecidos': true,
      'Landing customizable': false,
      'API acceso': true
    },
    tenantCount: '89 usuarios activos',
    color: 'blue',
    icon: Zap,
    icon_name: 'Zap',
    popular: true,
    is_popular: true,
    is_featured: true,
    cta: 'Comprar Ahora',
    cta_text: 'Comprar Ahora',
    highlight: 'Más popular',
    highlight_label: 'Más popular'
  },
  {
    id: 'enterprise',
    code: 'enterprise',
    name: 'Full Elite',
    price: '$1,000',
    period: 'pago único',
    originalPrice: '$1,899',
    description: 'Todo incluido para empresas de alto volumen',
    features: {
      'Boletos ilimitados': true,
      'Rifas ilimitadas': true,
      'Dashboard completo': true,
      'Soporte VIP 24/7': true,
      'Dominio personalizado': true,
      'Sistema de ganadores': true,
      'Sistema de referidos': true,
      'Números bendecidos': true,
      'Landing customizable': true,
      'API acceso completo': true,
      'Branding personalizado': true,
      'Integración WhatsApp': true
    },
    tenantCount: '34 usuarios elite',
    color: 'purple',
    icon: Crown,
    icon_name: 'Crown',
    popular: false,
    is_popular: false,
    is_featured: false,
    cta: 'Activar Full Elite',
    cta_text: 'Activar Full Elite',
    highlight: 'Mejor valor',
    highlight_label: 'Mejor valor'
  }
]

/**
 * Get plan by code
 */
export function getPlanByCode(code: string): PlanMarketing | undefined {
  return plans.find(p => p.code === code)
}

/**
 * Get plan by ID (legacy support)
 */
export function getPlanById(id: string): PlanMarketing | undefined {
  return plans.find(p => p.id === id || p.code === id)
}