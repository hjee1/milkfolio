import type { NextConfig } from "next";

// @MX:ANCHOR: Build-time metadata injection consumed by /dev Craft section.
// @MX:REASON: Single source of truth for VERCEL_GIT_COMMIT_SHA and BUILD_TIME.
//             Both /dev Hero and Craft sections read these as inlined constants.
// @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-O-001 / REQ-DEV-E-005
const BUILD_SHA = (process.env.VERCEL_GIT_COMMIT_SHA ?? "local-dev").slice(0, 7);
const BUILD_TIME = new Date().toISOString();

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes is stable in Next.js 16 (moved out of experimental).
  typedRoutes: true,
  // Build-time constants surfaced to the client bundle (Next.js inlines these at build).
  // Available as process.env.BUILD_SHA / BUILD_TIME inside any Client/Server Component.
  env: {
    BUILD_SHA,
    BUILD_TIME,
  },
};

export default config;
