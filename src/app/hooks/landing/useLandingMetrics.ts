'use client'
import { useEffect, useState } from 'react'
import { MetricsService, DashboardMetrics } from '@/app/services/metricsService'

const initial: DashboardMetrics = {
  activeRaffles: 0,
  monthlyRevenue: 0,
  totalParticipants: 0,
  successRate: 0,
  totalTenants: 0,
  topRaffles: []
}

export const useLandingMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await MetricsService.getDashboardMetrics()
        setMetrics(data)
      } finally {
        setLoading(false)
      }
    }
    load()
    const unsubscribe = MetricsService.subscribeToMetricsUpdates((updated) => {
      setMetrics((prev) => ({ ...prev, ...updated }))
    })
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { metrics, loading }
}
