"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import TrustBar from "./TrustBar"
import CTASection from "./CTASection"

export default function CombinedCTA() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
        // To match DetectionFootage, we just pin the section when it reaches top,
        // hold for +=80%, then release. No overlapping slide-up needed.
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1,
          },
        })
        pinTl.to({}, { duration: 1 })
      })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="relative min-h-[100vh] overflow-hidden">
      <div className="cta-inner flex min-h-[100vh] flex-col justify-center gap-4 bg-white">
        <TrustBar />
        <CTASection />
      </div>
    </div>
  )
}
