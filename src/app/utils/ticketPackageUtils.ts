// utils/ticketPackageUtils.ts
// Funciones utilitarias para ticket packages extraídas de (auth)/types/ticketPackage.ts

import type { TicketPackage, PromotionType } from '@/app/(auth)/types/ticketPackage';

export const getPromotionLabel = (type: PromotionType, value?: number): string => {
  switch (type) {
    case 'discount':
      return `${value}% OFF`;
    case 'bonus':
      return `+${value} GRATIS`;
    case '2x1':
      return '2x1';
    case '3x2':
      return '3x2';
    default:
      return '';
  }
};

export const calculateFinalPrice = (ticketPackage: TicketPackage): number => {
  const { base_price, promotion_type, promotion_value } = ticketPackage;

  switch (promotion_type) {
    case 'discount':
      return base_price * (1 - promotion_value / 100);
    case '2x1':
    case '3x2':
      return base_price;
    default:
      return base_price;
  }
};

export const calculateTotalTickets = (ticketPackage: TicketPackage): number => {
  const { amount, promotion_type, promotion_value } = ticketPackage;

  switch (promotion_type) {
    case 'bonus':
      return amount + promotion_value;
    case '2x1':
      return amount * 2;
    case '3x2':
      return Math.floor(amount / 2) * 3 + (amount % 2);
    default:
      return amount;
  }
};
