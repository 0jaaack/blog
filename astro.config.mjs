import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import svgr from "vite-plugin-svgr";

// https://astro.build/config
export default defineConfig({
  site: "https://jaaack.dev",
  integrations: [mdx(), sitemap(), preact()],
  vite: {
    plugins: [svgr()],
  },
});
