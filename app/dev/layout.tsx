import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyunwoo Jee — AI Technical Engineer",
  description:
    "AI Technical Engineer. Standardizing harness workflows, composing agents, building the next shape of how software gets made.",
  openGraph: {
    title: "Hyunwoo Jee — AI Technical Engineer",
    description:
      "Working at the frontier where AI engineering meets human craft.",
    url: "https://milkfolio.space/dev/",
    type: "profile",
  },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  // data-accent="dev" switches --color-accent to the cyan brand color
  // for any token-aware descendant (utility classes, page CSS modules).
  return <div data-accent="dev">{children}</div>;
}
