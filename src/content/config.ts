import { defineCollection, z } from "astro:content";

const essays = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishedDate: z.coerce.date(),
  }),
});

const bio = defineCollection({
  type: "content",
  schema: z.object({}),
});

export const collections = { essays, bio };
