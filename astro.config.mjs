import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://angelcorral2021.github.io',
  base: '/',
  integrations: [tailwind()],
  markdown: {
    // Aquí defines el tema de color para tus bloques de código.
    // 'dracula', 'github-dark', 'material-theme-palenight' son opciones populares.
    // 'github-light' o 'default' son buenas opciones si quieres un tema claro.
    shikiConfig: {
      theme: 'dracula' // O el tema que prefieras
    }
  }
});
