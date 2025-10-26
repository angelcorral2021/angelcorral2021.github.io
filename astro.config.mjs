import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  base: "/", // 👈 correcto para angelcorral2021.github.io
});
