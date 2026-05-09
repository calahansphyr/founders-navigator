import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.ts'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1A2A',
        gold: '#ffae00',
        'innovation-orange': '#FF9F43',
        secondary: '#006d3c',
        success: '#10B981',
        surface: '#f7f9fb',
        'on-surface': '#191c1e',
        'surface-variant': '#e0e3e5',
        'surface-container': '#eceef0',
        'surface-container-low': '#f2f4f6',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'surface-container-lowest': '#ffffff',
        'on-surface-variant': '#524533',
        'outline-variant': '#d7c4ac',
        outline: '#847560',
        'primary-container': '#ffae00',
        'on-primary-container': '#6a4600',
        'inverse-primary': '#ffba48',
        primary: '#815600',
        'border-subtle': '#E2E8F0',
        'deep-navy': '#0F172A',
        'background-light': '#F8FAFC',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Public Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'section-padding': '4rem',
        'component-padding': '1.25rem',
        gutter: '1.5rem',
        'bento-gap': '1rem',
        'container-max': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
        bento: '12px',
      },
      fontSize: {
        'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'section-header': ['14px', { lineHeight: '1.6', letterSpacing: '0.05em', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1.4', fontWeight: '600' }],
        'metric-lg': ['32px', { lineHeight: '1', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
}
export default config
