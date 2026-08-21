import type { Metadata } from "next";
import { RobotPet } from "./_components/RobotPet";

export const metadata: Metadata = {
  title: "Hyunwoo Jee — AI Technical Engineer",
  description:
    "AI Technical Engineer · building the harness teams ship with. Standardizing harness workflows, composing agents.",
  alternates: {
    canonical: "https://milkfolio.space/dev",
  },
  openGraph: {
    title: "Hyunwoo Jee — AI Technical Engineer",
    description: "Building the harness teams ship with.",
    url: "https://milkfolio.space/dev/",
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Hyunwoo Jee — AI Technical Engineer",
    description: "Building the harness teams ship with.",
  },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  // data-accent="dev" switches --color-accent to the cyan brand color
  // for any token-aware descendant (utility classes, page CSS modules).
  // lang="en" scopes this English-only route inside the site-wide lang="ko"
  // (the root <html> lang cannot be overridden per segment).
  // RobotPet is a fixed-position scroll companion — see RobotPet.tsx.
  return (
    <div data-accent="dev" lang="en">
      {children}
      <RobotPet />
    </div>
  );
}
