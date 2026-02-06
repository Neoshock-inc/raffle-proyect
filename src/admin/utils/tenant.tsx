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
    price: "$199",
    description: "Plan básico con funcionalidades esenciales",
    features: {
      "Rifas ilimitadas": true,
      "Dominio personalizado": false,
      "Reportes avanzados": false,
      "API acceso": false,
      "Soporte prioritario": false,
      "Branding personalizado": false,
    },
    tenantCount: "45 tenants",
    color: "gray",
    subdomain: true,
    icon: Activity,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$1000",
    description: "Plan profesional para pequeñas empresas",
    features: {
      "Rifas ilimitadas": true,
      "Dominio personalizado": true,
      "Reportes avanzados": true,
      "API acceso": false,
      "Soporte prioritario": false,
      "Branding personalizado": false,
    },
    tenantCount: "78 tenants",
    color: "blue",
    subdomain: false,
    icon: Zap,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "$1299",
    description: "Plan empresarial con todas las funcionalidades",
    features: {
      "Rifas ilimitadas": true,
      "Dominio personalizado": true,
      "Reportes avanzados": true,
      "API acceso": true,
      "Soporte prioritario": true,
      "Branding personalizado": true,
    },
    tenantCount: "22 tenants",
    color: "purple",
    subdomain: false,
    icon: Crown,
  },
}

