import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import PhoneSection from "@/components/PhoneSection"
import SectionBreak from "@/components/SectionBreak"
import FeaturesSection from "@/components/FeaturesSection"
import TechSection from "@/components/TechSection"

import TrustBar from "@/components/TrustBar"
import Footer from "@/components/Footer"
import CTASection from "@/components/CTASection"
import ClaudeImpact from "@/components/ClaudeImpact"
import GeminiPath from "@/components/GeminiPath"
import AboutSection from "@/components/AboutSection"

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
        <SectionBreak />
        <ClaudeImpact />
        <SectionBreak />
        <TrustBar />
        <CTASection />
        <SectionBreak />
      </main>
      <Footer />
    </>
  )
}
