'use client'
import { PlanMarketing } from '@/app/types/landing'
import { Check } from 'lucide-react'

type Props = { plan: PlanMarketing; type: 'subscription' | 'one_time' }

const PlanSummary = ({ plan, type }: Props) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl">
      <div className="flex items-center mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${plan.color === 'purple' ? 'bg-purple-600' : plan.color === 'blue' ? 'bg-blue-600' : 'bg-gray-600'}`}>
          <plan.icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
      </div>
      <div className="pb-4">
        <div className="flex justify-between font-semibold text-gray-600 mb-3"><span>Plan</span><span>Precio</span></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-medium text-gray-800">{type === 'subscription' ? 'Suscripción' : 'Pago único'}</p>
            <p className="text-gray-500 text-sm">{plan.period}</p>
          </div>
          <div className="text-right">
            {plan.originalPrice && <div className="text-gray-400 line-through text-sm mb-1">{plan.originalPrice}</div>}
            <span className="font-semibold text-gray-800">{plan.price}</span>
          </div>
        </div>
        <div className="h-px bg-gray-100"></div>
      </div>
      <div className="py-4">
        <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-sky-600">{plan.price}</span></div>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600"><span className="font-semibold">Incluye:</span></p>
          <div className="mt-2 space-y-2">
            {Object.entries(plan.features).slice(0, 5).map(([feature, included]) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${included ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {included && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`${included ? 'text-gray-800' : 'text-gray-400'}`}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanSummary