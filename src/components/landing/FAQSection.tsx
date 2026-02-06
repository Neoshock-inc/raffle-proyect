'use client'

const faqs = [
  { q: '¿Cómo funciona el pago único en los planes Profesional y Full Elite?', a: 'Pagas una sola vez y obtienes acceso de por vida. No hay renovaciones, no hay cargos mensuales. Es tuyo para siempre.' },
  { q: '¿Qué pasa si supero los 10,000 boletos en el plan Básico o Profesional?', a: 'Puedes hacer upgrade a Full Elite en cualquier momento. El cambio es inmediato y solo pagas la diferencia. O puedes esperar a que tus rifas actuales terminen.' },
  { q: '¿El sistema de referidos genera ingresos reales?', a: 'Sí. Nuestros clientes generan entre $200 y $2,000 mensuales adicionales solo con el programa de afiliados. Es completamente automático.' },
  { q: '¿Puedo personalizar mi landing si estoy en el plan Básico o Profesional?', a: 'La personalización completa está disponible solo en Full Elite. Sin embargo, todos los planes incluyen plantillas pre-diseñadas profesionales.' },
  { q: '¿Qué tipo de soporte ofrecen?', a: 'Básico: Email en 24-48h. Profesional: Chat en 12h. Full Elite: WhatsApp prioritario con respuesta en menos de 2 horas, incluso fines de semana.' },
  { q: '¿Hay garantía de devolución?', a: 'Sí. Tienes 30 días para probar la plataforma. Si no estás satisfecho, te devolvemos el 100% de tu dinero sin preguntas.' }
]

const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Preguntas <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Frecuentes</span></h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Todo lo que necesitas saber antes de comenzar</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
              <p className="text-white/80 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-white/80 text-lg">¿Tienes más preguntas?</p>
          <button className="bg_white/10 backdrop_blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg_white/20 hover:border-yellow-400/50 transition-all duration-300">Hablar con un Experto</button>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
