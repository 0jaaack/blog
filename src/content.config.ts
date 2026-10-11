import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const essays = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/essays" }),
  schema: z.object({
    title: z.string(),
    publishedDate: z.coerce.date(),
  }),
});

const bio = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/bio" }),
  schema: z.object({}),
});

export const collections = { essays, bio };
