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
        // Pin the combined section when it hits the top of the screen
        // and hold it for 100% of its height before continuing to the footer
        gsap.to(root.current, {
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
          },
        })
      })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="flex min-h-[100vh] flex-col justify-center bg-white">
      <div className="flex flex-col gap-4">
        <TrustBar />
        <CTASection />
      </div>
    </div>
  )
}
