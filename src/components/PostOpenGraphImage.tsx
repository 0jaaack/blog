import type { JSX } from "preact/jsx-runtime";
import type { Essay } from "../pages/[slug]/[slug]-og.png";

export function PostOpenGraphImage(essay: Essay): JSX.Element {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px 80px",
        backgroundColor: "#ffffff",
      }}
    >
      <h1
        style={{
          fontSize: "64px",
          margin: "88px 0",
          marginLeft: "12px",
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
          maxHeight: "9em",
        }}
      >
        {essay.body}
      </p>
    </main>
  );
}
