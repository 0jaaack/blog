import fs from "fs/promises";
import type { JSX } from "preact/jsx-runtime";
import satori from "satori";
import sharp from "sharp";
import { PostOpenGraphImage } from "../components/PostOpenGraphImage";
import type { Essay } from "../pages/[slug]/[slug]-og.png";

export async function getSVGImageFromComponent(component: JSX.Element) {
  return await satori(component, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Pretendard",
        data: await fs.readFile("./src/assets/fonts/Pretendard-Regular.ttf"),
        weight: 400,
      },
      {
        name: "Pretendard",
        data: await fs.readFile("./src/assets/fonts/Pretendard-Bold.ttf"),
        weight: 700,
      },
    ],
  });
}

export const getPNGImageFromPost = async (essay: Essay): Promise<Buffer> => {
  const component = await PostOpenGraphImage(essay);
  const SVG = await getSVGImageFromComponent(component);

  return await sharp(Buffer.from(SVG)).png().toBuffer();
};
