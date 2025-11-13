import { Activity, Zap, Crown } from 'lucide-react'
import { PlanMarketing } from '@/app/types/landing'

export const plans: PlanMarketing[] = [
  {
    id: 'basic',
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
    popular: false,
    cta: 'Comenzar Gratis',
    highlight: null
  },
  {
    id: 'medium',
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
    popular: true,
    cta: 'Comprar Ahora',
    highlight: 'Más popular'
  },
  {
    id: 'enterprise',
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
    popular: false,
    cta: 'Activar Full Elite',
    highlight: 'Mejor valor'
  }
]
