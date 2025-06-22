import type { JSX } from "preact/jsx-runtime";
import type { Essay } from "../pages/[slug]/[slug]-og.png";
import type { Root } from 'mdast';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import stripMarkdown from 'strip-markdown';
import { remove } from 'unist-util-remove';

export async function extractTextFromMDX(mdxString: string): Promise<string> {
  const removeImports = () => (tree: Root) => {
    remove(tree, 'mdxjsEsm');
    remove(tree, 'import');
  };
  const removeFootnotes = () => (tree: Root) => {
    remove(tree, 'linkReference');
    remove(tree, 'definition');
  };
  const processor = remark()
    .use(remarkMdx)
    .use(removeImports)
    .use(removeFootnotes)
    .use(stripMarkdown);

  const result = await processor.process(mdxString);
  return String(result);
}

export async function PostOpenGraphImage(
  essay: Essay,
  width: number,
  height: number,
): Promise<JSX.Element> {
  const bodyText = await extractTextFromMDX(essay.body);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        padding: "48px 80px 0",
        backgroundColor: "#ffffff",
        width,
        height,
      }}
    >
      <h1
        style={{
          fontSize: "64px",
        }}
      >
        {essay.data.title}
      </h1>
      <p
        style={{
          fontSize: "36px",
          color: "#343a40",
          maskImage: "linear-gradient(to bottom, white 50%, transparent)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "1.5em",
          minHeight: 0,
          height: "100%",
        }}
      >
        {bodyText}
      </p>
    </main>
  );
}
