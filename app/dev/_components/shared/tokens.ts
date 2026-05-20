// Design tokens for the /dev redesign.
// @MX:NOTE: Single source of truth for cyan accent system + supporting palette.
//           All section components must import from here, never hardcode colors.
// @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-005

/**
 * Primary cyan accent (signature, persisted from the previous /dev design).
 * Used for: highlight text, focus rings, terminal prompts, key data.
 */
export const ACCENT = "#38d9ff" as const;

/**
 * Supporting tones — same hue family, varied luminance/saturation.
 * Built around HSL(193, 100%, 60%) ≈ #38d9ff.
 */
export const ACCENT_DEEP = "#0d6e8a" as const; // darker — for subtle backgrounds
export const ACCENT_SOFT = "#7fe4ff" as const; // lighter — for hover/secondary
export const ACCENT_GLOW = "rgba(56, 217, 255, 0.32)" as const; // box-shadow glow
export const ACCENT_FAINT = "rgba(56, 217, 255, 0.08)" as const; // section dividers, faint fills

/**
 * Neutral spine — the dark foundation.
 * Body and section backgrounds. Higher = lighter.
 */
export const BG_DEEP = "#070b12" as const; // canvas / hero bottom
export const BG_BASE = "#0a0e1a" as const; // body
export const BG_RAISE = "#10151f" as const; // cards, panels
export const BG_HIGH = "#1a2030" as const; // hover states
export const BORDER_FAINT = "rgba(255, 255, 255, 0.04)" as const;
export const BORDER_HAIRLINE = "rgba(255, 255, 255, 0.08)" as const;

/**
 * Text scale — luminance ladder for readability over BG_DEEP/BASE.
 */
export const TEXT_PRIMARY = "#e7eef7" as const;
export const TEXT_SECONDARY = "#8899aa" as const;
export const TEXT_FAINT = "#4a5568" as const;

/**
 * Typography stacks (CSS variable references defined in app/globals.css).
 * Reference them via var(--font-mono) etc. — these constants document intent.
 */
export const FONT_DISPLAY = "var(--font-grotesk, 'Space Grotesk', system-ui)" as const;
export const FONT_BODY = "var(--font-inter, 'Inter', system-ui)" as const;
export const FONT_MONO = "var(--font-mono, 'Fira Code', ui-monospace, monospace)" as const;

/**
 * Motion timing — used as Motion `transition` defaults and CSS `--ease-*` vars.
 */
export const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const; // standard entrances
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const; // dramatic reveals
export const DURATION_FAST = 0.18 as const;
export const DURATION_NORMAL = 0.32 as const;
export const DURATION_SLOW = 0.6 as const;

/**
 * Device tier breakpoints (consumed by useDeviceTier).
 */
export const BREAKPOINT_MOBILE = 768 as const;
export const BREAKPOINT_TABLET = 1024 as const;

/**
 * WebGL particle counts per device tier — driven by useDeviceTier.
 *
 * Tuned for "elegant", not "dense": sparse fields read as constellations,
 * dense fields read as noise. Lowered iteratively — second pass cut another
 * ~35% on top of the previous reduction.
 */
export const PARTICLES_BY_TIER = {
  mobile: 110,
  tablet: 240,
  desktop: 450,
} as const;

export type DeviceTier = keyof typeof PARTICLES_BY_TIER;
