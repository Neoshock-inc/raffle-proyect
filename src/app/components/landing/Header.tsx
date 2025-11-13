'use client'
import { Trophy, Menu, X, Flame } from 'lucide-react'
import { useState } from 'react'

type Props = { onPrimaryCtaClick?: () => void }

const Header = ({ onPrimaryCtaClick }: Props) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
      <div className="relative z-20 bg-gradient-to-r from-yellow-400 to-orange-500 py-2">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm md:text-base font-semibold text-white flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 animate-pulse" />
            <span>🎉 Oferta de Lanzamiento: Ahorra hasta 47% en plan Full Elite • Solo quedan 12 cupos</span>
            <Flame className="w-4 h-4 animate-pulse" />
          </p>
        </div>
      </div>
      <nav className="relative z-10 container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">My Fortuna Cloud</span>
              <span className="text-xs text-yellow-400 font-medium">Trusted by 265+ businesses</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Características</a>
            <a href="#raffles" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Rifas Activas</a>
            <a href="#pricing" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Precios</a>
            <a href="#testimonials" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Testimonios</a>
            <button onClick={onPrimaryCtaClick} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">Comenzar Ahora</button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-6 pb-6 space-y-4 border-t border-white/10 pt-6">
            <a href="#features" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Características</a>
            <a href="#raffles" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Rifas Activas</a>
            <a href="#pricing" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Precios</a>
            <a href="#testimonials" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Testimonios</a>
            <button onClick={onPrimaryCtaClick} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold">Comenzar Ahora</button>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
