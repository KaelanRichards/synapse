/** @type {import('tailwindcss').Config} */
import {
  colors,
  typography,
  spacing,
  shadows,
  radii,
} from './src/theme/tokens.ts';
import typographyPlugin from '@tailwindcss/typography';
import formsPlugin from '@tailwindcss/forms';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors,
    fontFamily: typography.fonts,
    fontSize: typography.sizes,
    fontWeight: typography.weights,
    spacing,
    boxShadow: shadows,
    borderRadius: radii,
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: colors.primary[600],
              '&:hover': {
                color: colors.primary[700],
              },
            },
          },
        },
      },
    },
  },
  plugins: [typographyPlugin, formsPlugin],
};
export default config;
