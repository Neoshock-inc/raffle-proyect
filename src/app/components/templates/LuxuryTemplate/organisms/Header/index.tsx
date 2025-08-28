// components/templates/LuxuryTemplate/organisms/Header/index.tsx
import { Crown } from 'lucide-react';

interface LuxuryHeaderProps {
  tenantConfig: any;
}

export const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({ tenantConfig }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b-2 border-amber-200/50 shadow-lg">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg border border-amber-300">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                {tenantConfig.name}
              </h1>
              <p className="text-xs text-amber-700 font-medium uppercase tracking-widest">Premium Luxury Raffles</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#productos" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
              Colección
            </a>
            <a href="#ofertas" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
              Ofertas VIP
            </a>
            <a href="#testimonios" className="text-gray-700 hover:text-amber-600 font-semibold transition-colors text-lg">
              Ganadores
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};