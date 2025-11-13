'use client'
import { Zap, Target, Users, Globe, BarChart3, Shield, CheckCircle2 } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Automatización Total', description: 'Sistema inteligente que gestiona rifas, sorteos y notificaciones 24/7 sin intervención humana.', benefit: 'Ahorra 20+ horas semanales', color: 'from-yellow-400 to-orange-500' },
  { icon: Target, title: 'Sistema de Ganadores', description: 'Algoritmo transparente y verificable que selecciona ganadores de forma 100% aleatoria y justa.', benefit: 'Confianza = más ventas', color: 'from-blue-400 to-blue-600' },
  { icon: Users, title: 'Referidos Rentables', description: 'Programa de afiliados integrado que convierte a tus clientes en tu fuerza de ventas.', benefit: 'Ingresos pasivos garantizados', color: 'from-purple-400 to-purple-600' },
  { icon: Globe, title: 'Landing Personalizable', description: 'Crea tu marca profesional con landing pages customizables sin código. Tu dominio, tu identidad.', benefit: 'Aumenta conversión 3x', color: 'from-green-400 to-green-600' },
  { icon: BarChart3, title: 'Analytics en Tiempo Real', description: 'Dashboard completo con métricas de ventas, participación y ROI actualizadas al segundo.', benefit: 'Decisiones basadas en datos', color: 'from-pink-400 to-pink-600' },
  { icon: Shield, title: 'Seguridad Bancaria', description: 'Encriptación de nivel militar y cumplimiento PCI DSS. Tus transacciones 100% protegidas.', benefit: 'Cero fraudes', color: 'from-red-400 to-red-600' }
]

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Todo lo que Necesitas para <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Dominar el Mercado</span></h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Herramientas profesionales que te dan ventaja competitiva desde el día uno</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">{feature.title}</h3>
              <p className="text-white/80 mb-4 leading-relaxed">{feature.description}</p>
              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm"><CheckCircle2 className="w-5 h-5" />{feature.benefit}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
