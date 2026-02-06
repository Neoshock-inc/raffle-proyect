'use client'
import { Sparkles, Clock, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react'
import { DashboardMetrics } from '@/services/metricsService'

type Props = { metrics: DashboardMetrics; onActivate?: () => void }

const FinalCTASection = ({ metrics, onActivate }: Props) => {
  return (
    <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6"><span className="text-white font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 animate-pulse" />¡Última oportunidad para el descuento de lanzamiento!</span></div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Tu Imperio de Rifas Comienza Hoy</h2>
          <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed">Únete a {metrics.totalTenants}+ emprendedores que están generando ${metrics.monthlyRevenue}+ mensuales.<span className="block mt-2 font-bold">No dejes pasar esta oportunidad.</span></p>
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-4 mb-4"><Clock className="w-8 h-8 text-white animate-pulse" /><span className="text-white text-lg font-bold">Oferta especial termina en:</span></div>
            <div className="grid grid-cols-4 gap-4 text-center">{[{ value: '02', label: 'Días' }, { value: '14', label: 'Horas' }, { value: '37', label: 'Min' }, { value: '52', label: 'Seg' }].map((time, index) => (<div key={index} className="bg-white/10 rounded-xl p-4"><div className="text-4xl font-bold text-white mb-1">{time.value}</div><div className="text-white/70 text-sm">{time.label}</div></div>))}</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <button onClick={onActivate} className="group bg-white text-orange-500 px-12 py-6 rounded-xl font-bold text-xl hover:bg-white/90 transition-all duration-300 shadow-2xl hover:shadow-white/50 transform hover:scale-105 flex items-center gap-3"><Rocket className="w-6 h-6" />Activar Mi Cuenta Ahora<ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/95">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" /><span className="font-medium">Setup en 5 minutos</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" /><span className="font-medium">Sin tarjeta requerida</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" /><span className="font-medium">Garantía 30 días</span></div>
          </div>
          <div className="mt-10 pt-10 border-t border-white/30">
            <p className="text-white/90 text-sm mb-4">⭐⭐⭐⭐⭐ 4.9/5 basado en 483 reseñas verificadas</p>
            <div className="flex items-center justify-center gap-4 flex-wrap"><img src="https://via.placeholder.com/120x40/ffffff/000000?text=Stripe" alt="Stripe" className="h-8 opacity-80 hover:opacity-100 transition-opacity" /><img src="https://via.placeholder.com/120x40/ffffff/000000?text=PayPal" alt="PayPal" className="h-8 opacity-80 hover:opacity-100 transition-opacity" /><img src="https://via.placeholder.com/120x40/ffffff/000000?text=SSL" alt="SSL Secure" className="h-8 opacity-80 hover:opacity-100 transition-opacity" /></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
