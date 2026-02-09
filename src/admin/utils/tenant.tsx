// 📁 utils/tenant.tsx

// 📁 utils/tenant.tsx (Actualizado para usar la nueva estructura)
import { PlanId, Plan } from '@/types/plans'
import { CheckCircle, XCircle, Clock, Activity, Crown, Zap } from 'lucide-react'

export const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    suspended: {
      label: 'Suspendido',
      className: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    },
    deleted: {
      label: 'Eliminado',
      className: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      <Icon className="h-4 w-4 mr-1" />
      {config.label}
    </span>
  )
}

export const getPlanInfo = (plan: string) => {
  const planData = PLANS[plan as PlanId] || PLANS.basic
  
  return {
    name: planData.name,
    color: planData.color,
    className: `bg-${planData.color}-100 text-${planData.color}-800`,
    icon: planData.icon,
    features: Object.keys(planData.features).filter(key => planData.features[key]),
    price: planData.price,
    description: planData.description
  }
}

export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://app.myfortunacloud.com'
}

export const getRaffleStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
    active: { label: 'Activa', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Completada', className: 'bg-blue-100 text-blue-800' },
    cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    name: "Básico",
    price: "$99",
    description: "Perfecto para empezar tu negocio de rifas",
    features: {
      "Hasta 10,000 boletos": true,
      "Rifas ilimitadas": true,
      "Dashboard básico": true,
      "Soporte por email": true,
      "Dominio personalizado": false,
      "Sistema de ganadores": false,
      "Sistema de referidos": false,
      "Números bendecidos": false,
    },
    tenantCount: "142 usuarios activos",
    color: "gray",
    subdomain: true,
    icon: Activity,
  },
  professional: {
    id: "professional",
    name: "Profesional",
    price: "$500",
    description: "Para negocios serios que buscan automatización",
    features: {
      "Hasta 10,000 boletos": true,
      "Rifas ilimitadas": true,
      "Dashboard avanzado": true,
      "Soporte prioritario": true,
      "Sistema de ganadores": true,
      "Sistema de referidos": true,
      "Números bendecidos": true,
      "API acceso": true,
    },
    tenantCount: "89 usuarios activos",
    color: "blue",
    subdomain: false,
    icon: Zap,
  },
  enterprise: {
    id: "enterprise",
    name: "Full Elite",
    price: "$1,000",
    description: "Todo incluido para empresas de alto volumen",
    features: {
      "Boletos ilimitados": true,
      "Rifas ilimitadas": true,
      "Dashboard completo": true,
      "Soporte VIP 24/7": true,
      "Dominio personalizado": true,
      "Sistema de ganadores": true,
      "Sistema de referidos": true,
      "Números bendecidos": true,
      "Landing customizable": true,
      "API acceso completo": true,
      "Branding personalizado": true,
      "Integración WhatsApp": true,
    },
    tenantCount: "34 usuarios elite",
    color: "purple",
    subdomain: false,
    icon: Crown,
  },
}

