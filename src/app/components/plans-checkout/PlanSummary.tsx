// src/app/components/plans-checkout/PlanSummary.tsx

'use client'
import { PlanMarketing } from '@/app/types/landing'
import { Check, Activity, Zap, Crown } from 'lucide-react'

type Props = {
  plan: PlanMarketing
  type: 'subscription' | 'one_time'
}

// Map icon names to components
const ICON_MAP: Record<string, any> = {
  'Activity': Activity,
  'Zap': Zap,
  'Crown': Crown,
}

const PlanSummary = ({ plan, type }: Props) => {
  // Get the icon component based on icon_name
  const IconComponent = plan.icon_name ? ICON_MAP[plan.icon_name] : Activity

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${plan.color === 'purple'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600'
            : plan.color === 'blue'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
          <p className="text-sm text-gray-500">{plan.description}</p>
        </div>
      </div>

      <div className="border-t border-b border-gray-200 py-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tipo de plan</span>
          <span className="font-medium text-gray-800">
            {type === 'subscription' ? 'Suscripción mensual' : 'Pago único (lifetime)'}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Precio</span>
          <div className="text-right">
            {plan.originalPrice && (
              <span className="text-sm text-gray-400 line-through mr-2">
                {plan.originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-800">
              {plan.price}
            </span>
            <span className="text-gray-500 ml-1">
              {plan.period}
            </span>
          </div>
        </div>

        {plan.originalPrice && (
          <div className="mt-2 text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ahorras ${
                parseInt(plan.originalPrice.replace(/[^0-9]/g, '')) -
                parseInt(plan.price.replace(/[^0-9]/g, ''))
              }
            </span>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Características incluidas:
        </h4>
        <div className="space-y-2">
          {Object.entries(plan.features)
            .filter(([_, included]) => included)
            .slice(0, 8)
            .map(([feature]) => (
              <div key={feature} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))
          }
        </div>

        {Object.entries(plan.features).filter(([_, included]) => !included).length > 0 && (
          <>
            <h4 className="text-sm font-semibold text-gray-500 mt-4 mb-2">
              No incluido:
            </h4>
            <div className="space-y-1">
              {Object.entries(plan.features)
                .filter(([_, included]) => !included)
                .slice(0, 3)
                .map(([feature]) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">✕</span>
                    </div>
                    <span className="text-sm text-gray-400 line-through">{feature}</span>
                  </div>
                ))
              }
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-semibold">Total a pagar:</span>
          <span className="text-2xl font-bold text-sky-600">
            {plan.price}
            {type === 'subscription' && <span className="text-sm text-gray-500 font-normal">/mes</span>}
          </span>
        </div>
        {type === 'subscription' && (
          <p className="text-xs text-gray-500 mt-2">
            * Puedes cancelar en cualquier momento
          </p>
        )}
        {type === 'one_time' && (
          <p className="text-xs text-gray-500 mt-2">
            * Acceso de por vida, sin pagos adicionales
          </p>
        )}
      </div>

      {plan.highlight_label && (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {plan.highlight_label}
          </span>
        </div>
      )}
    </div>
  )
}

export default PlanSummary