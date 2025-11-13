'use client'
import { comparisonData } from '@/app/components/landing/data/comparisonData'

const BeforeAfterSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">La Transformación es <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Real</span></h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Descubre cómo My Fortuna Cloud revoluciona tu forma de hacer negocios</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                {(() => {
                  const Icon = comparisonData.before.items[0].icon as any
                  return <Icon className="w-6 h-6 text-red-400" />
                })()}
              </div>
              <h3 className="text-2xl font-bold text-white">{comparisonData.before.title}</h3>
            </div>
            <div className="space-y-4">
              {comparisonData.before.items.map((item, index) => {
                const Icon = item.icon as any
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-1`} />
                    <span className="text-white/80">{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                {(() => {
                  const Icon = comparisonData.after.items[0].icon as any
                  return <Icon className="w-6 h-6 text-green-400" />
                })()}
              </div>
              <h3 className="text-2xl font-bold text-white">{comparisonData.after.title}</h3>
            </div>
            <div className="space-y-4">
              {comparisonData.after.items.map((item, index) => {
                const Icon = item.icon as any
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-1`} />
                    <span className="text-white/80 font-medium">{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 inline-flex items-center gap-2">Quiero Esta Transformación Ahora</button>
        </div>
      </div>
    </section>
  )
}

export default BeforeAfterSection
