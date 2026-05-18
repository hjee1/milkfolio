import type { NextConfig } from "next";

const config: NextConfig = {
  // We coexist with the legacy GitHub-Pages HTML files in the repo root during
  // the migration. Once Phase 7 removes those, this map can be deleted.
  // The legacy files are static — they live in the repo root and `app/` routes
  // override them in Next.js, so no special handling needed at build time.
  reactStrictMode: true,
  poweredByHeader: false,
  // The /agent/data.html file is pushed by the hjee1/casting-agent pipeline.
  // We serve it as a static asset via the public/agent path (see API route).
  // Until Phase 3 wires the API route, it stays in /agent/data.html (legacy).
  experimental: {
    typedRoutes: true,
  },
};

export default config;
