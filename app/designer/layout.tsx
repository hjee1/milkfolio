import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yuna Jee — Designer",
  description:
    "Design portfolio of Yuna Jee — UX/UI, Product Design, 3D Modeling, Brand Strategy.",
  openGraph: {
    title: "Yuna Jee — Designer",
    description:
      "A designer who builds experiences that bridge technology and human understanding.",
    url: "https://milkfolio.space/designer/",
  },
};

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // data-accent="designer" → --color-accent becomes soft pink (#d4b8cc).
  return <div data-accent="designer">{children}</div>;
}
