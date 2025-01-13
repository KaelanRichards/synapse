export const colors = {
  // Paper-like surfaces
  surface: {
    pure: '#FFFFFF',
    faint: '#FAFAFA',
    dim: '#F5F5F5',
    dark: '#1A1A1A',
  },
  // Ink-like text
  ink: {
    pure: '#000000',
    rich: '#1A1A1A',
    muted: '#6B7280',
    faint: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  // Subtle accents
  accent: {
    primary: '#3B82F6',
    faded: 'rgba(59, 130, 246, 0.1)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
} as const;

export const maturityStateColors = {
  SEED: {
    bg: 'rgba(59, 130, 246, 0.05)',
    border: 'rgba(59, 130, 246, 0.1)',
  },
  SAPLING: {
    bg: 'rgba(16, 185, 129, 0.05)',
    border: 'rgba(16, 185, 129, 0.1)',
  },
  GROWTH: {
    bg: 'rgba(245, 158, 11, 0.05)',
    border: 'rgba(245, 158, 11, 0.1)',
  },
  MATURE: {
    bg: 'rgba(99, 102, 241, 0.05)',
    border: 'rgba(99, 102, 241, 0.1)',
  },
  EVOLVING: {
    bg: 'rgba(236, 72, 153, 0.05)',
    border: 'rgba(236, 72, 153, 0.1)',
  },
} as const;

export const spacing = {
  '2xs': '0.25rem',
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const typography = {
  fonts: {
    mono: 'JetBrains Mono, monospace',
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
    '3xl': '1.875rem',
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
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

export const shadows = {
  subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
  floating:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  command: '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.06)',
} as const;

export const transitions = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    gentle: 'cubic-bezier(0.4, 0.14, 0.3, 1)',
  },
} as const;

export const blur = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const;
