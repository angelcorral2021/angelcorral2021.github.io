/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        // Definición de tu esquema de estilos "writeup"
        writeup: { 
          css: {
            // Estilos para H2
            'h2': {
              color: theme('colors.blue.400'), // Cambia el color
              borderBottom: `2px solid ${theme('colors.slate.700')}`,
              paddingBottom: '0.5rem',
              marginTop: '2.5rem',
            },
            // Estilos para PRE (bloques de código)
            'pre': {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.white'),
              padding: '1rem',
              borderRadius: '0.375rem', // rounded-md
              // ¡Aquí puedes añadir todos los estilos que estaban en writeup.css!
            },
            // Estilos para Párrafos
            'p': {
              marginBottom: '1.2em',
              lineHeight: '1.7',
            }
            // ... otros elementos (li, table, etc.)
          },
        },
      }),
    },
  },
  plugins: [
     require('@tailwindcss/typography'),
  ],
};

