import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private casting dashboard — keep out of every index.
        disallow: "/agent",
      },
    ],
    sitemap: "https://milkfolio.space/sitemap.xml",
  };
}
