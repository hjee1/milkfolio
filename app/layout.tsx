import type { Metadata, Viewport } from "next";
import "./globals.css";

// NOTE: next/font/google fails behind the Somansa corporate proxy
// (HTTPS interception drops the fonts.googleapis.com fetch at build time).
// Phase 1 falls back to a runtime CSS @import inside globals.css, which the
// browser fetches directly. Trade-off: tiny FOUT on first paint, no
// build-time blocker. Phase 7 follow-up: self-host woff2 in /public/fonts.

export const metadata: Metadata = {
  metadataBase: new URL("https://milkfolio.space"),
  title: {
    default: "milkfolio",
    template: "%s · milkfolio",
  },
  description:
    "서해우 (actor) · Terry Jee (engineer) · designer — multi-identity portfolio at milkfolio.space",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>M</text></svg>",
  },
  openGraph: {
    type: "website",
    siteName: "milkfolio",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-accent="actor">
      <body>{children}</body>
    </html>
  );
}
