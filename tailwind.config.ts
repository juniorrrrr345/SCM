import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',   // Petits mobiles
        'sm': '640px',   // Mobiles standard  
        'md': '768px',   // Tablettes portrait
        'lg': '1024px',  // Tablettes paysage / Petits PC
        'xl': '1280px',  // PC standard
        '2xl': '1536px', // Grands écrans
        '3xl': '1920px', // Très grands écrans
        // Breakpoints spéciaux
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        // Hauteur d'écran
        'short': {'raw': '(max-height: 667px)'},
        'tall': {'raw': '(min-height: 800px)'}
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontSize: {
        'xxs': ['0.625rem', '0.75rem'],
        'xs': ['0.75rem', '1rem'],
        'sm': ['0.875rem', '1.25rem'],
        'base': ['1rem', '1.5rem'],
        'lg': ['1.125rem', '1.75rem'],
        'xl': ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
        '5xl': ['3rem', '1'],
        '6xl': ['3.75rem', '1'],
        // Responsive font sizes
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(150px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-xl': 'repeat(auto-fit, minmax(250px, 1fr))',
        'responsive': 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))',
      },
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
      },
      maxWidth: {
        'xxs': '16rem',
        'xs': '20rem',
        'container': '1200px',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      }
    },
  },
  plugins: [],
}
export default config