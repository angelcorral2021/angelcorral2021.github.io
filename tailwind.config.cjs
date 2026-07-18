/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        bg1: '#050505',
        primary: '#10b981', // emerald-500
        secondary: '#0ea5e9', // sky-500
        accent: '#f59e0b', // amber-500
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      typography: ({ theme }) => ({
        writeup: { 
          css: {
            'h2': {
              color: theme('colors.sky.400'),
              borderBottom: `2px solid ${theme('colors.slate.700')}`,
              paddingBottom: '0.5rem',
              marginTop: '2.5rem',
            },
            'pre': {
              backgroundColor: theme('colors.slate.900'),
              color: theme('colors.white'),
              padding: '1.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${theme('colors.slate.800')}`,
            },
            'p': {
              marginBottom: '1.2em',
              lineHeight: '1.7',
            }
          },
        },
      }),
    },
  },
  plugins: [
     require('@tailwindcss/typography'),
  ],
};

