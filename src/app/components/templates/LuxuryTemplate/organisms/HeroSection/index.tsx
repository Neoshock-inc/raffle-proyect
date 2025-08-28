// components/templates/LuxuryTemplate/organisms/HeroSection/index.tsx
import { Trophy, Shield, Users } from 'lucide-react';
import { LuxuryCountdownTimer } from '../../molecules/CountdownTimer';
import { LuxuryButton } from '../../atoms/Button';

interface LuxuryHeroSectionProps {
  raffleData: any;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}

export const LuxuryHeroSection: React.FC<LuxuryHeroSectionProps> = ({ 
  raffleData, 
  timeLeft 
}) => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-yellow-100/30" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
              ✨ Rifas de Lujo Premium ✨
            </span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
              Vive el Lujo
            </span>
            <br />
            <span className="text-gray-800">Que Mereces</span>
          </h2>
          
          <p className="text-2xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
            Participa en nuestras rifas exclusivas de productos de lujo auténticos.
            <br />
            <strong className="text-amber-700">Rolex, Cartier, Hermès</strong> y las marcas más prestigiosas del mundo.
          </p>
          
          <LuxuryCountdownTimer timeLeft={timeLeft} />
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <LuxuryButton variant="primary" size="xl">
              Explorar Colección Premium
            </LuxuryButton>
            <div className="flex items-center space-x-6 text-gray-700">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-amber-600" />
                <span className="font-semibold">Autenticidad Garantizada</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-amber-600" />
                <span className="font-semibold">+5,000 ganadores VIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};