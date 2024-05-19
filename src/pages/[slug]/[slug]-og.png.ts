import type { APIRoute, InferGetStaticPropsType } from "astro";
import { getCollection } from "astro:content";
import { getPNGImageFromPost } from "../../utils/createImageFromPost";

export async function getStaticPaths() {
  const essays = await getCollection("essays");
  return essays.map((essay) => ({
    params: {
      slug: essay.slug,
    },
    props: essay,
  }));
}

export type Essay = InferGetStaticPropsType<typeof getStaticPaths>;
type Props = Essay;

export const GET: APIRoute = async function get({ props }) {
  const essay = props as Props;
  const png = await getPNGImageFromPost(essay);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
