import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import PathSection from "@/components/PathSection";
import PhoneSection from "@/components/PhoneSection";
import SectionBreak from "@/components/SectionBreak";
import FeaturesSection from "@/components/FeaturesSection";
import TechSection from "@/components/TechSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PathSection />
        <PhoneSection />
        <SectionBreak label="الميزات" />
        <FeaturesSection />
        <SectionBreak label="كيف يعمل" />
        <TechSection />
      </main>
      <footer
        id="contact"
        className="relative z-10 bg-whitesmoke py-16 text-center"
      >
        <div className="flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/Logo 6.svg" alt="" className="h-9 w-9" aria-hidden />
          <p className="font-display text-2xl text-ink">مسار</p>
        </div>
        <p className="mt-2 text-[16px] text-subtext">
          بلاغٌ واحد، طريقٌ واحد، حلقةٌ تُغلق.
        </p>
      </footer>
    </>
  );
}
