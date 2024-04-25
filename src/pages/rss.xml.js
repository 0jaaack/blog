import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const essays = await getCollection("essays");
  return rss({
    title: "jaaack.dev",
    description: "공재혁 블로그",
    site: context.site,
    items: essays.map((essay) => ({
      title: essay.data.title,
      pubDate: essay.data.publishedDate,
      link: `/${essay.slug}`,
    })),
  });
}
