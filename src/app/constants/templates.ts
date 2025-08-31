// src/constants/templates.ts - Constantes para templates
export const TEMPLATE_THEMES = {
  default: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
  },
  luxury: {
    primary: '#ff6b35',
    secondary: '#ffc107',
    background: '#fff8f0',
    text: '#2d1810',
  },
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;