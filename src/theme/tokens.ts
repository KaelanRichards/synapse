export const colors = {
  accent: {
    50: 'rgba(248, 246, 241, 1)',
    100: 'rgba(241, 237, 227, 1)',
    200: 'rgba(226, 219, 201, 1)',
    300: 'rgba(211, 201, 175, 1)',
    400: 'rgba(196, 183, 149, 1)',
    500: 'rgba(181, 165, 123, 1)',
    600: 'rgba(166, 147, 97, 1)',
    700: 'rgba(151, 129, 71, 1)',
    800: 'rgba(136, 111, 45, 1)',
    900: 'rgba(121, 93, 19, 1)',
  },
  paper: {
    light: '#FFFFFF',
    dark: '#1A1A1A',
  },
  text: {
    light: '#1A1A1A',
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
    bg: 'rgba(167, 201, 167, 0.15)',
    border: 'rgba(167, 201, 167, 0.3)',
  },
  SAPLING: {
    bg: 'rgba(179, 157, 219, 0.15)',
    border: 'rgba(179, 157, 219, 0.3)',
  },
  GROWTH: {
    bg: 'rgba(144, 202, 249, 0.15)',
    border: 'rgba(144, 202, 249, 0.3)',
  },
  MATURE: {
    bg: 'rgba(255, 183, 77, 0.15)',
    border: 'rgba(255, 183, 77, 0.3)',
  },
  EVOLVING: {
    bg: 'rgba(229, 115, 115, 0.15)',
    border: 'rgba(229, 115, 115, 0.3)',
  },
} as const;

export const connectionColors = {
  related: { color: '#B9B0A2', animated: false },
  prerequisite: { color: '#8B7C66', animated: true },
  refines: { color: '#6F6352', animated: true },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Bookerly, Georgia, serif',
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

export const transitions = {
  duration: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
} as const;
