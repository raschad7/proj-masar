import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets a second dev server (e.g. an agent preview) run
  // alongside the main one without fighting over the .next lockfile.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    // AVIF first (≈20% smaller than WebP), WebP fallback, then original.
    formats: ["image/avif", "image/webp"],
    // Next 16 requires an explicit qualities allowlist. 75 is the default
    // used site-wide; 90 is reserved for the hero/full-bleed imagery.
    qualities: [75, 90],
    // Optimized variants are content-hashed by URL, so cache them long.
    minimumCacheTTL: 2678400, // 31 days
  },
};

export default nextConfig;
