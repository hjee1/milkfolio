import type { MetadataRoute } from "next";

// Public personas only — /agent is a private dashboard and is excluded here
// and disallowed in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://milkfolio.space";
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/actor`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/dev`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/designer`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
