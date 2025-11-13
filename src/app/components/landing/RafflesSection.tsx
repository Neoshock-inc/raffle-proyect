'use client'
import { AlertCircle, Users, ArrowRight, ChevronRight, Flame } from 'lucide-react'
import { FeaturedRaffleCard } from '@/app/types/landing'
import { calculateProgress } from '@/app/utils/landing/progress'

type Props = { featuredRaffles: FeaturedRaffleCard[] }

const RafflesSection = ({ featuredRaffles }: Props) => {
  return (
    <section id="raffles" className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
            <Flame className="w-5 h-5 text-yellow-400 mr-2 animate-pulse" />
            <span className="text-yellow-400 font-semibold">Rifas en Vivo Ahora</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Oportunidades <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Activas</span></h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Únete a miles de participantes que ya están compitiendo por premios increíbles</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredRaffles.map((raffle) => {
            const progress = calculateProgress(raffle.ticketsSold, raffle.totalTickets)
            const isAlmostSoldOut = progress > 85
            return (
              <div key={raffle.id} className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img src={raffle.image} alt={raffle.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3"><span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">{raffle.badge}</span></div>
                  {isAlmostSoldOut && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-2 animate-pulse"><AlertCircle className="w-4 h-4" />¡Casi agotado!</div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">{raffle.category}</span>
                    <div className="flex items-center gap-1 text-yellow-400"><Users className="w-4 h-4" /><span className="text-xs font-semibold">{raffle.participants}</span></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{raffle.name}</h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/70 mb-2"><span>{raffle.ticketsSold.toLocaleString()} vendidos</span><span>{raffle.totalTickets.toLocaleString()} total</span></div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
                    <div className="text-center mt-2"><span className="text-xs font-semibold text-yellow-400">{progress.toFixed(1)}% vendido</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><div className="text-2xl font-bold text-white">${raffle.price}</div><div className="text-xs text-white/70">por boleto</div></div>
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm">Participar<ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2">Ver Todas las Rifas Activas<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
        </div>
      </div>
    </section>
  )
}

export default RafflesSection
