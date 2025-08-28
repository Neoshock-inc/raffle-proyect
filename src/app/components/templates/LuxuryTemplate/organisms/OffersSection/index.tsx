// components/templates/LuxuryTemplate/organisms/OffersSection/index.tsx
import { LuxuryOfferCard } from '../../molecules/OfferCard';

interface LuxuryOffersSectionProps {
  offers: any[];
}

export const LuxuryOffersSection: React.FC<LuxuryOffersSectionProps> = ({ 
  offers 
}) => {
  return (
    <section id="ofertas" className="py-24 px-6 bg-gradient-to-br from-amber-100/30 to-yellow-100/30">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
            💎 Ofertas Exclusivas VIP
          </span>
          <h3 className="text-5xl font-bold text-gray-900 mb-6">Descuentos Premium</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mientras más números compres, mayor será tu descuento y tus posibilidades de ganar
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {offers.map((offer) => (
            <LuxuryOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
};