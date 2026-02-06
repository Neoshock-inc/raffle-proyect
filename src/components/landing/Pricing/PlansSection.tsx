'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Shield } from 'lucide-react'
import PlanCard from '@/components/landing/Pricing/PlanCard'
import type { PlanMarketing } from '@/types/landing'
import { Activity, Zap, Crown } from 'lucide-react'

const ICONS: Record<string, any> = {
  Activity,
  Zap,
  Crown
}

type Props = { onSelectPlan?: (id: string) => void }

const PlansSection = ({ onSelectPlan }: Props) => {
  const [plans, setPlans] = useState<PlanMarketing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/stripe/checkout')
        const json = await res.json()

        if (json.success && json.data) {
          setPlans(json.data)
        }
      } catch (error) {
        console.error('Error fetching plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return (
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-white/80 text-xl">Cargando planes...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
            <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">Planes que se pagan solos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Elige el Plan que{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Impulsará tu Negocio
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Sin trucos. Sin sorpresas. Solo resultados reales desde el primer día.
          </p>
        </div>

        {/* PLANES */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={(code) => onSelectPlan && onSelectPlan(code)}
              Icon={ICONS[plan.icon_name] ?? Activity}
            />
          ))}
        </div>

        {/* GARANTÍA */}
        <div className="mt-16 text-center">
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Garantía de Satisfacción 100%</h3>
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              Si en los primeros 30 días no estás completamente satisfecho con My Fortuna Cloud,
              te devolvemos el 100% de tu dinero.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/80 text-lg">
            ¿Necesitas más de 10,000 boletos?{' '}
            <span className="text-yellow-400 font-semibold cursor-pointer hover:underline">
              Hablemos de un plan Enterprise
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default PlansSection