import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import SectionBreak from "@/components/SectionBreak"
/* Below-fold sections come pre-rendered but hydrate from their own
   chunks (see LazySections) so startup isn't one giant main-thread task. */
import {
  AboutSectionLazy,
  GeminiPathLazy,
  PhoneSectionLazy,
  FeaturesSectionLazy,
  TechSectionLazy,
  DetectionFootageLazy,
  BentoGridImpactLazy,
  CombinedCTALazy,
  FooterLazy,
} from "@/components/LazySections"

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[1] bg-white">
        <div className="relative isolate">
          <Hero />
          <AboutSectionLazy />
          <GeminiPathLazy />
        </div>
        <PhoneSectionLazy />
        <SectionBreak label="الميزات" gap={10} />
        <FeaturesSectionLazy />
        <SectionBreak label="كيف يعمل" />
        <TechSectionLazy />

        {/* ── Climax: the real thing ── */}
        <div className="pt-10 text-center relative z-10 bg-white">
          <h3 className="font-display text-display-3 text-ink">
            …وهذا هو فعلياً على الأرض
          </h3>
        </div>
        <DetectionFootageLazy />
        <SectionBreak />
        {/* Sticky hand-off: BentoGridImpact holds pinned while CombinedCTA slides up over it */}
        <div className="relative isolate">
          <BentoGridImpactLazy />
          <div className="relative z-10">
            <CombinedCTALazy />
          </div>
        </div>
      </main>
      <FooterLazy />
    </>
  )
}
