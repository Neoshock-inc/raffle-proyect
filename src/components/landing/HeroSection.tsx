'use client'
import { Shield, ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import { DashboardMetrics } from '@/services/metricsService'
import { formatCurrency } from '@/utils/landing/format'

type Props = {
  metrics: DashboardMetrics
  onStartFreeTrial?: () => void
  onOpenDemo?: () => void
}

const HeroSection = ({ metrics, onStartFreeTrial, onOpenDemo }: Props) => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
            <Shield className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">Plataforma verificada y segura • +265 empresas activas</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Transforma Tu Pasión por las Rifas en un
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">Imperio de $10,000+ al Mes</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            La única plataforma todo-en-uno que combina <span className="text-yellow-400 font-bold">automatización inteligente</span>, sistema de <span className="text-yellow-400 font-bold">referidos rentable</span> y
            <span className="text-yellow-400 font-bold"> landing personalizable</span> para escalar tu negocio sin límites.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">{formatCurrency(metrics.monthlyRevenue)}</div>
              <div className="text-white/70 text-sm">Ingresos mensuales</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">{metrics.totalParticipants.toLocaleString()}+</div>
              <div className="text-white/70 text-sm">Participantes activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">{metrics.successRate}%</div>
              <div className="text-white/70 text-sm">Tasa de éxito</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button onClick={onStartFreeTrial} className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 flex items-center">
              Comenzar Mi Prueba Gratis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onOpenDemo} className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center">
              <Play className="mr-2 w-5 h-5" />
              Ver Demo (2 min)
            </button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /><span>Sin tarjeta de crédito</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /><span>Configuración en 5 minutos</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-400" /><span>Soporte en español 24/7</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
