'use client'
import { Trophy } from 'lucide-react'

type Props = { activeRaffles: number }

const Footer = ({ activeRaffles }: Props) => {
  return (
    <footer className="bg-black/30 backdrop-blur-sm py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"><Trophy className="w-7 h-7 text-white" /></div>
              <span className="text-2xl font-bold text-white">My Fortuna Cloud</span>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">La plataforma más avanzada y confiable para gestionar rifas digitales. Construye tu imperio con tecnología de vanguardia y soporte excepcional.</p>
            <div className="flex items-center gap-3"><div className="flex items-center gap-2 text-green-400 text-sm"><div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div><span className="font-medium">{activeRaffles} rifas activas ahora</span></div></div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Producto</h4>
            <ul className="space-y-3 text-white/70"><li><a href="#features" className="hover:text-yellow-400 transition-colors">Características</a></li><li><a href="#pricing" className="hover:text-yellow-400 transition-colors">Precios</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">API</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Integraciones</a></li></ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Soporte</h4>
            <ul className="space-y-3 text-white/70"><li><a href="#" className="hover:text-yellow-400 transition-colors">Centro de Ayuda</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Tutoriales</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Contacto</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Status</a></li></ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Empresa</h4>
            <ul className="space-y-3 text-white/70"><li><a href="#" className="hover:text-yellow-400 transition-colors">Sobre Nosotros</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Carreras</a></li><li><a href="#" className="hover:text-yellow-400 transition-colors">Afiliados</a></li></ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/70 text-sm">© 2025 My Fortuna Cloud. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6"><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Privacidad</a><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Términos</a><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Cookies</a></div>
          <div className="flex items-center gap-2 text-white/70 text-sm"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div><span>Datos actualizados • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span></div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
