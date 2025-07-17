import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://jaaack.dev",
  integrations: [mdx(), sitemap(), preact()],
  markdown: {
    shikiConfig: {
      themes: {
        dark: 'github-dark',
        light: 'github-light',
      },
    },
  },
  adapter: cloudflare({
    imageService: "compile"
  }),
  image: {
    domains: ["cdn.jaaack.dev", "cdn.gcp.hopsoffice.com"],
    responsiveStyles: true,
  },
});
