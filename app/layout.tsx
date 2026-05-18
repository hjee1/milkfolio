import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Noto_Serif_KR,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// next/font/google → self-hosted woff2 at build time, zero layout shift,
// no external Google Fonts request at runtime. The variable names line up
// with the `--font-*` declarations in globals.css `@theme` block.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false, // Korean glyph set is large; only preload on actor page
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://milkfolio.space"),
  title: {
    default: "milkfolio",
    template: "%s · milkfolio",
  },
  description: "서해우 (actor) · Terry Jee (engineer) · designer — multi-identity portfolio at milkfolio.space",
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
  // The data-accent default is "actor" (warm gold) since that matches the
  // root brand identity. Sub-pages override via their own layout.tsx.
  return (
    <html
      lang="ko"
      data-accent="actor"
      className={`${cormorant.variable} ${notoSerifKr.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
