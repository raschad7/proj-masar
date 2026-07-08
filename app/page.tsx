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

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-[1] bg-white">
        <Hero />
        <PathSection />
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
        <div className="hidden h-[72px] px-6 md:block"></div>

        <SectionBreak label="من الميدان" />
        <GridShowcase />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
