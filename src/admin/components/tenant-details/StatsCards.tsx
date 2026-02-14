// 📁 components/tenant-details/StatsCards.tsx
import { Users, Gift, Target, DollarSign } from 'lucide-react'
import { TenantDetails } from '../../types/tenant'
import { useTenantContext } from '../../contexts/TenantContext'
import { formatTenantCurrency } from '../../utils/currency'

interface StatsCardsProps {
  tenant: TenantDetails
}

export function StatsCards({ tenant }: StatsCardsProps) {
  const { tenantCountry } = useTenantContext()

  const stats = [
    {
      title: 'Usuarios Totales',
      value: tenant.user_count,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Rifas Creadas',
      value: tenant.raffle_count,
      icon: Gift,
      color: 'green'
    },
    {
      title: 'Entradas Vendidas',
      value: tenant.entry_count.toLocaleString(),
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Ingresos Est.',
      value: formatTenantCurrency(tenant.entry_count * 10, tenantCountry),
      icon: DollarSign,
      color: 'yellow'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-8 w-8 text-${stat.color}-400`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}