
// 📁 types/plans.ts
import { Activity, Crown, Zap } from 'lucide-react'

export type PlanId = 'basic' | 'pro' | 'enterprise'

export interface Plan {
    id: PlanId
    name: string
    price: string
    description: string
    features: Record<string, boolean>
    tenantCount: string
    color: string
    subdomain: boolean
    icon: React.ElementType
}