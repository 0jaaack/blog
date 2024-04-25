import { defineCollection, z } from "astro:content";

const essays = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    publishedDate: z.coerce.date(),
  }),
});

export const collections = { essays };
