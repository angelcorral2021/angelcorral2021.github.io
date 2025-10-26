import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  base: "/angelcorral2021/angelcorral2021.github.io/", // 👈 correcto para angelcorral2021.github.io
  
});
