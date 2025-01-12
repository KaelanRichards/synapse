export const colors = {
  // Natural Elements
  mist: {
    white: '#f8fafc',
    gray: '#f1f5f9',
    black: '#1f2937',
  },
  // Organic Hues
  garden: {
    moss: '#d8e3d8',
    water: '#c3dce3',
    silk: '#eaeaea',
  },
  // Depth & Flow
  water: {
    vapor: '#e5f0f3',
    surface: '#c3dce3',
    shallow: '#9fc9d6',
    deep: '#8db3bf',
  },
  paper: {
    light: '#FFFFFF',
    dark: '#1A1A1A',
  },
  text: {
    light: '#1f2937',
    dark: '#FFFFFF',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
} as const;

export const maturityStateColors = {
  SEED: {
    bg: 'rgba(229, 240, 243, 0.15)', // vapor-like
    border: 'rgba(229, 240, 243, 0.3)',
  },
  SAPLING: {
    bg: 'rgba(195, 220, 227, 0.25)', // surface water
    border: 'rgba(195, 220, 227, 0.4)',
  },
  GROWTH: {
    bg: 'rgba(159, 201, 214, 0.35)', // shallow water
    border: 'rgba(159, 201, 214, 0.5)',
  },
  MATURE: {
    bg: 'rgba(141, 179, 191, 0.45)', // deep water
    border: 'rgba(141, 179, 191, 0.6)',
  },
  EVOLVING: {
    bg: 'rgba(234, 234, 234, 0.15)', // silk-like
    border: 'rgba(234, 234, 234, 0.3)',
  },
} as const;

export const connectionColors = {
  related: { color: 'rgba(234, 234, 234, 0.6)', animated: true },
  prerequisite: { color: 'rgba(195, 220, 227, 0.7)', animated: true },
  refines: { color: 'rgba(159, 201, 214, 0.8)', animated: true },
} as const;

export const spacing = {
  '1.5': '0.375rem',
  '2.5': '0.625rem',
  '3.5': '0.875rem',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '15': '3.75rem',
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Merriweather, Georgia, serif',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    prose: '1.8',
  },
} as const;

export const shadows = {
  'light-mist': '0 4px 15px rgba(0, 0, 0, 0.04)',
  'deep-well': '0 10px 30px rgba(0, 0, 0, 0.15)',
} as const;

export const transitions = {
  duration: {
    ripple: '600ms',
    flow: '400ms',
    gentle: '800ms',
  },
  timing: {
    water: 'cubic-bezier(0.4, 0, 0.2, 1)',
    breeze: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
} as const;

export const gradients = {
  mist: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  water: 'linear-gradient(135deg, #e5f0f3 0%, #9fc9d6 100%)',
  depth: 'linear-gradient(135deg, #9fc9d6 0%, #8db3bf 100%)',
} as const;
