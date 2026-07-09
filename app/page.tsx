import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import PathSection from "@/components/PathSection"
import PhoneSection from "@/components/PhoneSection"
import SectionBreak from "@/components/SectionBreak"
import FeaturesSection from "@/components/FeaturesSection"
import TechSection from "@/components/TechSection"
import AppGallery from "@/components/AppGallery"
import TrustBar, { LOGOS as TRUST_LOGOS } from "@/components/TrustBar"
import GridShowcase from "@/components/GridShowcase"
import Footer from "@/components/Footer"
import CTASection from "@/components/CTASection"
import ClaudeImpact from "@/components/ClaudeImpact"
import GeminiPath from "@/components/GeminiPath"

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[1] bg-white">
        <Hero />
        <GeminiPath />
        <PhoneSection />

        <SectionBreak label="الميزات" />
        <FeaturesSection />
        <SectionBreak label="كيف يعمل" />
        <TechSection />
        <SectionBreak label="التطبيق" />
        <AppGallery />
        <SectionBreak label="الأثر" />
        <ClaudeImpact />
        <TrustBar />

        <SectionBreak label="من الميدان" />
        <GridShowcase />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
