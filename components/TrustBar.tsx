"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import LogoLoop, { type LogoItem } from "@/components/LogoLoop"

/* Real logos where provided; flat civic-mark placeholders for the rest.
   TODO: swap placeholder marks for real municipality logos. */
const MUNICIPALITIES: Array<
  | { name: string; img: string }
  | { name: string; glyph: "shield" | "building" | "gate" }
> = [
  { name: "بلدية الخليل", img: "/trust/images.png" },
  { name: "بلدية رام الله", img: "/trust/4.png" },
  { name: "بلدية نابلس", img: "/trust/Nablus_Logo.png" },
  { name: "بلدية بيت لحم", glyph: "gate" },
  { name: "بلدية جنين", glyph: "building" },
  { name: "بلدية طولكرم", glyph: "shield" },
]

/* Minimal flat civic glyphs — same kit of parts as the section art */
function CivicGlyph({ kind }: { kind: "shield" | "building" | "gate" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-16 w-16"
      fill="currentColor"
      aria-hidden
    >
      {kind === "shield" && (
        <path d="M24 4 L40 10 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V10 Z" />
      )}
      {kind === "building" && (
        <>
          <rect x="10" y="16" width="28" height="26" rx="4" />
          <rect x="20" y="6" width="8" height="12" rx="3" />
        </>
      )}
      {kind === "gate" && (
        <path d="M8 42 V24 C8 15 15 8 24 8 C33 8 40 15 40 24 V42 H32 V26 A8 8 0 0 0 16 26 V42 Z" />
      )}
    </svg>
  )
}

/* Each entry rendered as one node item — logo/glyph + name, styled to
   match the site's muted→ink hover treatment. */
export const LOGOS: LogoItem[] = MUNICIPALITIES.map((m) => ({
  title: m.name,
  ariaLabel: m.name,
  node: (
    <div className="trust-logo group flex shrink-0 items-center gap-4 text-mutedtext transition-all duration-300 hover:-translate-y-1 hover:text-ink">
      {"img" in m ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.img}
          alt=""
          aria-hidden
          className="h-20 w-auto object-contain opacity-50 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          style={{ maxWidth: 140 }}
        />
      ) : (
        <CivicGlyph kind={m.glyph} />
      )}
      <span className="whitespace-nowrap text-[18px] font-bold">{m.name}</span>
    </div>
  ),
}))

export default function TrustBar() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* in-view reveal, once */
          gsap.from(".trust-reveal", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          })
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="bg-white py-60">
      <p className="trust-reveal text-center text-[18px] font-medium text-subtext">
        تثق به بلديات فلسطين
      </p>

      {/* ── Desktop: LogoLoop seamless marquee (pause on hover) ── */}
      <div className="trust-marquee trust-reveal mt-14 hidden h-[50px] md:block">
        <LogoLoop
          logos={LOGOS}
          speed={60}
          direction="left"
          logoHeight={50}
          gap={80}
          pauseOnHover
          fadeOut
          fadeOutColor="#ffffff"
          ariaLabel="بلديات تثق بمسار"
        />
      </div>

      {/* ── Mobile / reduced-motion: static wrapped grid ── */}
      <div className="trust-grid mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-10 px-6 md:hidden">
        {LOGOS.map((l, i) => (
          <div key={`grid-${i}`}>{"node" in l ? l.node : null}</div>
        ))}
      </div>
    </section>
  )
}
