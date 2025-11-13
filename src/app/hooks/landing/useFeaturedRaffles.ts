'use client'
import { FeaturedRaffleCard } from '@/app/types/landing'
import { DashboardMetrics } from '@/app/services/metricsService'

export const useFeaturedRaffles = (metrics: DashboardMetrics): FeaturedRaffleCard[] => {
  const staticFeatured: FeaturedRaffleCard[] = [
    {
      id: 'proyecto-colorado',
      name: 'Proyecto Colorado',
      image: 'https://www.proyectocolorado.com/_next/image?url=%2Fimages%2F1.png&w=1200&q=75',
      ticketsSold: 100000,
      totalTickets: 100000,
      price: 1.5,
      status: 'finalizing',
      participants: 3842,
      category: 'Vehículos y Más',
      badge: 'Finalizando'
    },
    {
      id: 'gana-con-trix',
      name: 'Gana con el Trix',
      image: 'https://ganaconeltrix.com/wp-content/uploads/2025/09/IMG_1739.webp',
      ticketsSold: 10000,
      totalTickets: 10000,
      price: 2,
      status: 'new',
      participants: 1520,
      category: 'Electrodomésticos',
      badge: 'Finalizando'
    }
  ]

  const mapped: FeaturedRaffleCard[] = (metrics.topRaffles || []).slice(0, 2).map((raffle) => ({
    id: raffle.id,
    name: raffle.title,
    image: raffle.bannerUrl || 'https://placehold.co/1200x630?text=Rifa',
    ticketsSold: Math.floor(raffle.soldNumbers * 20),
    totalTickets: raffle.totalNumbers,
    price: Number(raffle.totalPrice),
    status: 'active',
    participants: Math.floor(raffle.participants * 0.6),
    category: 'Premium',
    badge: '✨ Popular'
  }))

  return [...staticFeatured, ...mapped.filter((r): r is FeaturedRaffleCard => r.image !== undefined)]
}
