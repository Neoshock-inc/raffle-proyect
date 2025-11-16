'use client'
import { Check, X, Shield } from 'lucide-react'
import { PlanMarketing } from '@/app/types/landing'

type Props = {
  plan: PlanMarketing
  onSelect: (code: string) => void
  Icon: any
}

const PlanCard = ({ plan, onSelect, Icon }: Props) => {
  const isPopular = plan.popular

  return (
    <div
      className={`relative bg-white/10 backdrop-blur-sm border-2 ${isPopular ? 'border-yellow-400 shadow-2xl shadow-yellow-400/30' : 'border-white/20'
        } rounded-3xl p-8 hover:border-yellow-400/50 transition-all duration-300 ${isPopular ? 'transform scale-105' : 'hover:transform hover:scale-105'
        }`}
    >
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
            {plan.highlight}
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div
          className={`w-20 h-20 bg-gradient-to-r ${plan.color === 'purple'
              ? 'from-purple-400 to-purple-600'
              : plan.color === 'blue'
                ? 'from-blue-400 to-blue-600'
                : 'from-gray-400 to-gray-600'
            } rounded-2xl flex items-center justify-center mx-auto mb-6`}
        >
          {/* 🔥 Aquí ya usamos Icon */}
          <Icon className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>

        <div className="mb-2">
          {plan.originalPrice && (
            <div className="text-white/50 text-lg line-through mb-1">{plan.originalPrice}</div>
          )}

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold text-white">{plan.price}</span>
            <span className="text-white/70 text-lg">{plan.period}</span>
          </div>
        </div>

        {plan.originalPrice && (
          <div className="text-green-400 font-semibold text-sm mb-3">
            Ahorras{' '}
            {parseInt(plan.originalPrice.replace('$', '')) -
              parseInt(plan.price.replace('$', '').replace(',', ''))}
            $
          </div>
        )}

        <p className="text-white/70 text-sm mb-3">{plan.description}</p>

        <div className="text-yellow-400 text-sm font-medium">{plan.tenantCount}</div>
      </div>

      <div className="space-y-4 mb-8">
        {Object.entries(plan.features).map(([feature, included]) => (
          <div key={feature} className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${included ? 'bg-green-500' : 'bg-white/10'
                }`}
            >
              {included ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <X className="w-4 h-4 text-white/40" />
              )}
            </div>
            <span className={`${included ? 'text-white' : 'text-white/50'} text-sm`}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelect(plan.code)}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isPopular
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-yellow-400/50'
          }`}
      >
        {plan.cta_text}
      </button>

      {plan.code !== 'basic' && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-green-400 text-xs font-medium">
            <Shield className="w-4 h-4" />
            Garantía de devolución 30 días
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanCard
