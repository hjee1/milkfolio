import type { Metadata } from "next";
import { RobotPet } from "./_components/RobotPet";

export const metadata: Metadata = {
  title: "Hyunwoo Jee — AI Engineer",
  description:
    "AI Engineer · building the harness teams ship with. Standardizing harness workflows, composing agents.",
  openGraph: {
    title: "Hyunwoo Jee — AI Engineer",
    description: "Building the harness teams ship with.",
    url: "https://milkfolio.space/dev/",
    type: "profile",
  },
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  // data-accent="dev" switches --color-accent to the cyan brand color
  // for any token-aware descendant (utility classes, page CSS modules).
  // RobotPet is a fixed-position scroll companion — see RobotPet.tsx.
  return (
    <div data-accent="dev">
      {children}
      <RobotPet />
    </div>
  );
}
