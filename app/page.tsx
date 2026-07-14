import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import PhoneSection from "@/components/PhoneSection"
import SectionBreak from "@/components/SectionBreak"
import FeaturesSection from "@/components/FeaturesSection"
import TechSection from "@/components/TechSection"
import DetectionFootage from "@/components/DetectionFootage"

import CombinedCTA from "@/components/CombinedCTA"
import Footer from "@/components/Footer"
import ClaudeImpact from "@/components/ClaudeImpact"
import GeminiPath from "@/components/GeminiPath"
import AboutSection from "@/components/AboutSection"
import BentoGridImpact from "@/components/BentoGridImpact"
import AntiGridSection from "@/components/AntiGridSection"

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[1] bg-white">
        <div className="relative isolate">
          <Hero />
          <AboutSection />
          <GeminiPath />
        </div>
        <PhoneSection />
        <SectionBreak label="الميزات" gap={10} />
        <FeaturesSection />
        <SectionBreak label="كيف يعمل" />
        <TechSection />

        {/* ── Climax: the real thing ── */}
        <div className="pt-10 text-center relative z-10 bg-white">
          <h3 className="font-display text-display-3 text-ink">
            …وهذا هو فعلياً على الأرض
          </h3>
        </div>
        <DetectionFootage />
        <SectionBreak />
        {/* Sticky hand-off: BentoGridImpact holds pinned while CombinedCTA slides up over it */}
        <div className="relative isolate">
          <BentoGridImpact />
          <div className="relative z-10">
            <CombinedCTA />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
