import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서해우 — Actor",
  description: "배우 서해우 프로필 — 드라마, 단편영화, 뮤지컬",
  openGraph: {
    title: "서해우 — Actor",
    description: "배우 서해우 프로필 — 드라마, 단편영화, 뮤지컬",
    url: "https://milkfolio.space/actor/",
    type: "profile",
  },
};

// data-accent="actor" is already inherited from the root <html>; we just
// wrap so any future per-page tweaks (e.g. lang attribute) are colocated.
export default function ActorLayout({ children }: { children: React.ReactNode }) {
  return <div data-accent="actor">{children}</div>;
}
