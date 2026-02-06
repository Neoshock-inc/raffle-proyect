// src/components/vibrant/VibrantTicketCard.tsx
'use client';

import { calculateFinalPrice, calculateTotalTickets, TicketOption, TicketPackage } from '@/admin/types/ticketPackage';
import { useTenantPurchase } from '@/hooks/useTenantPurchase';


interface CalculatedTicketPackage extends TicketPackage {
  final_price: number;
  final_amount: number;
  original_price: number;
  total_discount: number;
  is_available: boolean;
}

interface VibrantTicketCardProps {
  option: TicketOption;
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
  selectedPackage,
  onSelect,
  tenantSlug,
  raffleId
}) => {
  const { purchaseTickets, loading } = useTenantPurchase(tenantSlug, raffleId);

  console.log('CalculatedTicketPackage:', option);

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
      className={`relative bg-white rounded-3xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-4 ${option.is_featured
        ? 'border-yellow-400 transform scale-110 shadow-2xl'
        : selectedPackage === option.id
          ? 'border-red-400 transform scale-105'
          : 'border-gray-200 hover:border-orange-300 hover:shadow-xl'
        }`}
      onClick={handleSelect}
    >
      {/* Badge destacado */}
      {option.is_featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          ¡DESTACADO! ⭐
        </div>
      )}

      {/* Badge de descuento */}
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

        {/* Bonus o badge */}
        {(option.badge_text || option.promotion_type === 'bonus') && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-3 mb-4">
            <p className="text-green-700 font-bold text-sm">
              {option.badge_text ||
                `¡${option.promotion_value} números GRATIS!`}
            </p>
          </div>
        )}

        {/* Botón */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePurchase();
          }}
          disabled={loading || !option.is_available}
          className={`w-full font-bold py-3 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${selectedPackage === option.id
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            : option.is_featured
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400'
            }`}
        >
          {loading ? 'PROCESANDO...' :
            selectedPackage === option.id ? '¡Seleccionado! ✅' :
              '¡Elegir Paquete! 🎁'}
        </button>
      </div>
    </div>
  );
};

// === Helper para mapear TicketPackage del admin a CalculatedTicketPackage ===
export const mapToCalculatedTicketPackage = (pkg: TicketPackage): CalculatedTicketPackage => {
  const final_price = calculateFinalPrice(pkg) ?? 0;
  const final_amount = calculateTotalTickets(pkg) ?? pkg.amount ?? 0;

  const original_price = pkg.base_price ?? 0;
  const total_discount = pkg.promotion_type === 'discount' ? pkg.promotion_value ?? 0 : 0;

  return {
    ...pkg,
    final_price,
    final_amount,
    original_price,
    total_discount,
    is_available: pkg.is_active && (pkg.stock_limit ? (pkg.current_stock ?? 0) < pkg.stock_limit : true)
  };
};

