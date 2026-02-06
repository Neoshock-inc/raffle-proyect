import { ComparisonData } from '@/types/landing'
import { TrendingDown, Clock, AlertCircle, DollarSign, X, TrendingUp, Zap, CheckCircle2, Gift, Rocket } from 'lucide-react'

export const comparisonData: ComparisonData = {
  before: {
    title: 'Antes de My Fortuna Cloud',
    items: [
      { icon: TrendingDown, text: 'Vendes 50-100 boletos al mes', color: 'text-red-400' },
      { icon: Clock, text: 'Pierdes 15+ horas en gestión manual', color: 'text-red-400' },
      { icon: AlertCircle, text: 'Errores constantes en sorteos', color: 'text-red-400' },
      { icon: DollarSign, text: 'Sin sistema de referidos = $0 extra', color: 'text-red-400' },
      { icon: X, text: 'Landing genérica que no convierte', color: 'text-red-400' }
    ]
  },
  after: {
    title: 'Después de My Fortuna Cloud',
    items: [
      { icon: TrendingUp, text: 'Escalas a 1,000+ boletos mensuales', color: 'text-green-400' },
      { icon: Zap, text: 'Automatización total = más tiempo libre', color: 'text-green-400' },
      { icon: CheckCircle2, text: 'Selección de ganadores 100% transparente', color: 'text-green-400' },
      { icon: Gift, text: 'Ingresos pasivos con comisiones', color: 'text-green-400' },
      { icon: Rocket, text: 'Landing profesional que genera confianza', color: 'text-green-400' }
    ]
  }
}
