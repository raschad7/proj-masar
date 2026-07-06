import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import PathSection from "@/components/PathSection";
import PhoneSection from "@/components/PhoneSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PathSection />
        <PhoneSection />
      </main>
      <footer
        id="contact"
        className="relative z-10 bg-whitesmoke py-16 text-center"
      >
        <p className="font-display text-2xl text-ink">مسار</p>
        <p className="mt-2 text-[16px] text-subtext">
          بلاغٌ واحد، طريقٌ واحد، حلقةٌ تُغلق.
        </p>
      </footer>
    </>
  );
}
