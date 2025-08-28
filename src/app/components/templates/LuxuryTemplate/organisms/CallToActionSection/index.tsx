// components/templates/LuxuryTemplate/organisms/CallToActionSection/index.tsx
import { Crown } from 'lucide-react';
import { LuxuryButton } from '../../atoms/Button';

export const LuxuryCallToActionSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center text-white relative z-10">
        <Crown className="w-20 h-20 mx-auto mb-8 text-yellow-200" />
        <h3 className="text-5xl font-bold mb-8">Tu Momento de Lujo Ha Llegado</h3>
        <p className="text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
          No esperes más para vivir la experiencia de poseer los productos más exclusivos del mundo. 
          <br />
          <strong>Rolex, Cartier, Hermès</strong> y mucho más te esperan.
        </p>
        <LuxuryButton variant="white" size="xl">
          Comenzar Mi Sueño de Lujo
        </LuxuryButton>
      </div>
    </section>
  );
};