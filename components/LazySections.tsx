"use client"

import dynamic from "next/dynamic"

/* Below-fold sections, each in its own chunk.

   Hydrating the whole page as one bundle produced a single ~800ms
   main-thread task (hydration + every section's GSAP/ScrollTrigger
   setup + SplitText) — the page's dominant Total Blocking Time cost.
   dynamic() from this client module code-splits each section so it
   downloads, evaluates, hydrates, and builds its ScrollTriggers in its
   own small task.

   ssr stays on (default): the HTML is still server-rendered, so
   nothing visual changes and there is no layout shift. Chunks are
   requested immediately after hydration, well before the user can
   scroll to them.

   NOTE: dynamic() only code-splits from a client module — doing this
   directly in app/page.tsx (a Server Component) would not split. */

export const AboutSectionLazy = dynamic(
  () => import("@/components/AboutSection"),
)
export const GeminiPathLazy = dynamic(
  () => import("@/components/GeminiPath"),
)
export const PhoneSectionLazy = dynamic(
  () => import("@/components/PhoneSection"),
)
export const FeaturesSectionLazy = dynamic(
  () => import("@/components/FeaturesSection"),
)
export const TechSectionLazy = dynamic(
  () => import("@/components/TechSection"),
)
export const DetectionFootageLazy = dynamic(
  () => import("@/components/DetectionFootage"),
)
export const BentoGridImpactLazy = dynamic(
  () => import("@/components/BentoGridImpact"),
)
export const CombinedCTALazy = dynamic(
  () => import("@/components/CombinedCTA"),
)
export const FooterLazy = dynamic(() => import("@/components/Footer"))
