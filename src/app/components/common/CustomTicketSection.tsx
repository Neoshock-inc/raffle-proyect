// src/components/common/CustomTicketSection.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReferralCode } from '@/app/hooks/useReferralCode';
import { createPurchaseToken } from '@/app/services/purchaseTokenService';
import { RaffleData, TenantConfig } from '@/app/types/template';

interface CustomTicketSectionProps {
  raffleData: RaffleData;
  tenantConfig: TenantConfig;
}

export const CustomTicketSection: React.FC<CustomTicketSectionProps> = ({ 
  raffleData,
  tenantConfig 
}) => {
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const referralCode = useReferralCode();
  const router = useRouter();

  const handleCustomPurchase = async () => {
    try {
      setLoading(true);
      
      // Calcular precio total (cantidad * precio por ticket)
      const totalPrice = customAmount * raffleData.price;
      
      // Usar tu servicio existente para crear el token
      const token = await createPurchaseToken(customAmount, totalPrice);
      
      // Construir URL de checkout
      const checkoutUrl = referralCode
        ? `/checkout?token=${token}&ref=${encodeURIComponent(referralCode)}`
        : `/checkout?token=${token}`;

      router.push(checkoutUrl);
    } catch (error) {
      alert('Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = customAmount * raffleData.price;
  const maxTickets = raffleData.total_numbers - raffleData.soldTickets;

  return (
    <section className="w-full py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h3 
          className="text-2xl font-bold text-center mb-6"
          style={{ color: tenantConfig.primary_color }}
        >
          Cantidad Personalizada
        </h3>
        
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: tenantConfig.accent_color }}
          >
            Cantidad de tickets
          </label>
          <input
            placeholder='Cantidad de tickets'
            type="number"
            min="1"
            max={maxTickets}
            value={customAmount}
            onChange={(e) => setCustomAmount(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxTickets)))}
            className="w-full p-3 border-2 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2"
            style={{ 
              borderColor: tenantConfig.primary_color
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo {maxTickets.toLocaleString()} tickets disponibles
          </p>
        </div>
        
        <div className="text-center mb-6">
          <p 
            className="text-3xl font-black"
            style={{ color: tenantConfig.secondary_color }}
          >
            ${totalPrice.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            ${raffleData.price} por ticket
          </p>
        </div>
        
        <button
          onClick={handleCustomPurchase}
          disabled={loading || customAmount <= 0}
          className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: tenantConfig.primary_color }}
        >
          {loading ? 'Procesando...' : 'Comprar Ahora'}
        </button>
      </div>
    </section>
  );
};