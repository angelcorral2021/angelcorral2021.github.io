import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://angelcorral2021.github.io/angelcorral2021.github.io',
  base: '/',
  integrations: [tailwind()],
});
