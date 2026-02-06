// src/utils/templateHelpers.ts - Utilidades para templates
export const getGradientStyle = (from: string, via?: string, to?: string) => {
  if (via) {
    return `linear-gradient(135deg, ${from}, ${via}, ${to})`;
  }
  return `linear-gradient(135deg, ${from}, ${to})`;
};

export const formatPrice = (price: number, locale: string = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date: string | Date, locale: string = 'es-ES') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateDiscountPercentage = (originalPrice: number, finalPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};
