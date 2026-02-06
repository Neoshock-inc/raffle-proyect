'use client'
import { Heart, Star, TrendingUp, CheckCircle2 } from 'lucide-react'
import { testimonials } from '@/components/landing/data/testimonials'

type Props = { currentIndex: number; onSelectIndex: (i: number) => void }

const TestimonialsSection = ({ currentIndex, onSelectIndex }: Props) => {
  const t = testimonials[currentIndex]
  return (
    <section id="testimonials" className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6"><Heart className="w-5 h-5 text-red-400 mr-2 animate-pulse" /><span className="text-yellow-400 font-semibold">Amado por emprendedores como tú</span></div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Historias Reales de <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Éxito</span></h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">No confíes solo en nuestras palabras. Escucha a quienes ya transformaron sus vidas.</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center">
              <div className="flex justify-center mb-6">{[...Array(5)].map((_, i) => (<Star key={i} className="w-7 h-7 text-yellow-400 fill-current" />))}</div>
              <blockquote className="text-2xl md:text-3xl text-white font-medium mb-6 leading-relaxed">"{t.content}"</blockquote>
              <div className="inline-block bg-gradient-to-r from-green-400/20 to-green-600/20 border border-green-400/30 rounded-full px-6 py-2 mb-8">
                <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" /><span className="text-green-400 font-bold text-lg">{t.results}</span></div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <img src={t.image} alt={t.name} className="w-20 h-20 rounded-full border-4 border-yellow-400/30" />
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1"><div className="text-white font-bold text-xl">{t.name}</div>{t.verified && (<span title="Usuario verificado"><CheckCircle2 className="w-5 h-5 text-blue-400" /></span>)}</div>
                  <div className="text-white/70 text-sm">{t.role}</div>
                  <div className="text-yellow-400 text-sm font-semibold">{t.company}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button key={index} onClick={() => onSelectIndex(index)} className={`transition-all duration-300 ${index === currentIndex ? 'w-12 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full' : 'w-3 h-3 bg-white/30 rounded-full hover:bg-white/50'}`} aria-label={`Ver testimonial ${index + 1}`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
          {[{ number: '4.9/5', label: 'Rating promedio' }, { number: '265+', label: 'Clientes activos' }, { number: '98%', label: 'Tasa de retención' }, { number: '24/7', label: 'Soporte disponible' }].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"><div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{stat.number}</div><div className="text-white/70 text-sm">{stat.label}</div></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
