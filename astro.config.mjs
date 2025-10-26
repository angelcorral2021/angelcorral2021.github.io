import { defineConfig } from "astro/config";

// Import dinámico como workaround para problemas de resolución ESM/SSR
let tailwind;
try {
  // top-level await es válido en archivos .mjs
  tailwind = (await import("@astrojs/tailwind")).default;
} catch (e) {
  // Re-lanzar con mensaje claro para facilitar debugging
  console.error("Error importing @astrojs/tailwind from astro.config.mjs:", e);
  throw e;
}

export default defineConfig({
  integrations: [tailwind()],
  site: "https://example.com",
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro'
    }
  }
});
