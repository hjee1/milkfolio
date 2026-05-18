import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casting Agent",
  description: "서해우 캐스팅 자동 지원 시스템 대시보드",
  // robots noindex — private page protected by client-side gate
  robots: { index: false, follow: false },
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  // data-accent="actor" → warm gold accent (matches actor brand identity)
  return <div data-accent="actor">{children}</div>;
}
