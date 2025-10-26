import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

/*export default defineConfig({
  integrations: [tailwind()],
  base: "/angelcorral2021/", // 👈 correcto para angelcorral2021.github.io
  
});
*/

export default defineConfig({
  site: 'https://angelcorral2021.github.io', // 👈 muy importante
  base: '/', // 👈 raíz del sitio
});