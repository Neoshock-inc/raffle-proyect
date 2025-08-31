// src/components/vibrant/VibrantTicketCard.tsx - Actualizada
'use client';

import { useTenantPurchase } from '@/app/hooks/useTenantPurchase';
import { CalculatedTicketPackage } from '@/app/types/ticketPackages';

interface VibrantTicketCardProps {
  option: CalculatedTicketPackage;
  referralCode: string | null;
  index: number;
  selectedPackage: string | null;
  onSelect: (packageId: string) => void;
  tenantSlug: string;
  raffleId: string;
}

export const VibrantTicketCard: React.FC<VibrantTicketCardProps> = ({
  option,
  referralCode,
  index,
  selectedPackage,
  onSelect,
  tenantSlug,
  raffleId
}) => {
  const { purchaseTickets, loading } = useTenantPurchase(tenantSlug, raffleId);

  const handlePurchase = async () => {
    await purchaseTickets(
      option.final_amount,
      option.final_price,
      referralCode,
      option.id
    );
  };

  const handleSelect = () => {
    onSelect(option.id);
  };

  return (
    <div
      className={`relative bg-white rounded-3xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-4 ${
        option.is_best_seller
          ? 'border-yellow-400 transform scale-110 shadow-2xl'
          : selectedPackage === option.id
            ? 'border-red-400 transform scale-105'
            : 'border-gray-200 hover:border-orange-300 hover:shadow-xl'
      }`}
      onClick={handleSelect}
    >
      {/* Badge popular */}
      {option.is_best_seller && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          ¡MÁS POPULAR! ⭐
        </div>
      )}

      {/* Descuento badge */}
      {option.total_discount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
          -{option.total_discount}%
        </div>
      )}

      <div className="text-center">
        {/* Cantidad de números */}
        <div className="text-6xl font-black text-gray-800 mb-2">{option.final_amount}</div>
        <p className="text-lg text-gray-600 mb-4">números</p>

        {/* Precio */}
        <div className="mb-4">
          {option.total_discount > 0 && (
            <p className="text-gray-400 line-through text-lg">
              ${option.original_price.toLocaleString()}
            </p>
          )}
          <p className="text-4xl font-black text-green-600">
            ${option.final_price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            ${(option.final_price / option.final_amount).toFixed(1)} por número
          </p>
        </div>

        {/* Bonus */}
        {(option.badge_text || (option.bonus_entries > 0)) && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-3 mb-4">
            <p className="text-green-700 font-bold text-sm">
              {option.badge_text || `¡${option.bonus_entries} números GRATIS!`}
            </p>
          </div>
        )}

        {/* Información de oferta actual */}
        {option.current_offer && (
          <div className="bg-orange-100 border-2 border-orange-400 rounded-xl p-3 mb-4">
            <p className="text-orange-800 font-bold text-xs mb-1">
              {option.current_offer.offer_name}
            </p>
            {option.current_offer.special_discount_percentage > 0 && (
              <p className="text-orange-700 text-xs">
                {option.current_offer.special_discount_percentage}% descuento extra
              </p>
            )}
          </div>
        )}

        {/* Botón */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePurchase();
          }}
          disabled={loading || !option.is_available}
          className={`w-full font-bold py-3 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedPackage === option.id
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : option.is_best_seller
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400'
          }`}
        >
          {loading ? 'PROCESANDO...' :
           selectedPackage === option.id ? '¡Seleccionado! ✅' :
           option.button_text || '¡Elegir Paquete! 🎁'}
        </button>
      </div>
    </div>
  );
};