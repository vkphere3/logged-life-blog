/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono', 
          'Menlo', 
          'Monaco', 
          'Consolas', 
          'Liberation Mono', 
          'Courier New', 
          'monospace'
        ],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: theme('colors.secondary.800'),
            lineHeight: '1.5',
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            h1: {
              color: theme('colors.secondary.900'),
              fontWeight: '700',
              lineHeight: '1.2',
            },
            h2: {
              color: theme('colors.secondary.900'),
              fontWeight: '600',
              lineHeight: '1.25',
            },
            h3: {
              color: theme('colors.secondary.900'),
              fontWeight: '600',
              lineHeight: '1.3',
            },
            p: {
              marginBottom: theme('spacing.6'),
            },
            img: {
              borderRadius: theme('borderRadius.md'),
            },
            blockquote: {
              borderLeftColor: theme('colors.primary.300'),
              borderLeftWidth: '4px',
              fontStyle: 'italic',
              color: theme('colors.secondary.600'),
            },
            code: {
              color: theme('colors.accent.700'),
              backgroundColor: theme('colors.accent.50'),
              borderRadius: theme('borderRadius.sm'),
              padding: theme('spacing.1'),
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.secondary.200'),
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300'),
              },
            },
            h1: {
              color: theme('colors.secondary.100'),
            },
            h2: {
              color: theme('colors.secondary.100'),
            },
            h3: {
              color: theme('colors.secondary.100'),
            },
            blockquote: {
              borderLeftColor: theme('colors.primary.600'),
              color: theme('colors.secondary.300'),
            },
            code: {
              color: theme('colors.accent.300'),
              backgroundColor: theme('colors.secondary.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};