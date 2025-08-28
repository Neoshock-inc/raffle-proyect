// components/templates/LuxuryTemplate/molecules/OfferCard/index.tsx
import { TicketOption } from '@/app/types';
import { Gem, Crown, Diamond } from 'lucide-react';

interface LuxuryOfferCardProps {
  offer: TicketOption;
}

export const LuxuryOfferCard: React.FC<LuxuryOfferCardProps> = ({ offer }) => {
  // Determinar icono basado en el precio (ya que no tienes isFeatured/isBestSeller)
  const getOfferIcon = () => {
    if (offer.price > 1000) return <Diamond className="w-16 h-16" />;
    if (offer.amount >= 50) return <Crown className="w-16 h-16" />;
    return <Gem className="w-16 h-16" />;
  };

  // Usar gradient si está disponible, sino usar colores por defecto
  const gradientClass = offer.gradient
    ? `bg-gradient-to-br`
    : 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700';

  // Estilos inline para gradientes dinámicos (ya que Tailwind no puede generar clases dinámicas)
  const gradientStyle = offer.gradient ? {
    background: `linear-gradient(to bottom right, ${offer.gradient.from}${offer.gradient.via ? `, ${offer.gradient.via}` : ''}, ${offer.gradient.to})`
  } : {};

  return (
    <div
      className={`${gradientClass} rounded-3xl p-8 text-white transform hover:scale-105 transition-all duration-500 shadow-2xl border border-amber-300/30 relative overflow-hidden`}
      style={gradientStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />

      {/* Badge de oferta especial */}
      {offer.badge && (
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">
          {offer.badge}
        </div>
      )}

      <div className="relative z-10">
        <div className="text-center">
          {/* Icono dinámico */}
          <div className="text-6xl mb-4 flex justify-center">
            {getOfferIcon()}
          </div>

          {/* Descuento */}
          {offer.discount && offer.discount > 0 && (
            <div className="text-4xl font-bold mb-2">{offer.discount}% OFF</div>
          )}

          {/* Información del paquete */}
          <div className="text-2xl font-semibold mb-4 tracking-wide">
            {offer.amount} Números
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border border-white/30">
              {offer.amount} tickets
            </span>
            {offer.originalPrice && offer.originalPrice !== offer.price && (
              <span className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold border border-white/30 line-through opacity-75">
                ${offer.originalPrice}
              </span>
            )}
          </div>

          {/* Precio final */}
          <div className="text-3xl font-bold mb-6">
            ${offer.price}
          </div>

          {/* Botón de acción */}
          <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-2xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Comprar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};