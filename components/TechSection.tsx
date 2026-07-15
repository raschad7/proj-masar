"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : scroll consumed by the pinned analysis
   Timeline runs 3 beats (condensed from 5 for better pacing) */
const PIN_DISTANCE = "+=300%"

const STEPS = [
  { label: "يلتقط", hex: "#16668E" },
  { label: "يرى", hex: "#197FB0" },
  { label: "يصنّف", hex: "#34A8D8" },
  { label: "يحدد", hex: "#197FB0" },
  { label: "يزامن", hex: "#16668E" },
]

/* Detection boxes (SVG viewBox coords) */
const BOX_POTHOLE = { x: 185, y: 238, w: 215, h: 130 }
const BOX_CRACK = { x: 525, y: 165, w: 150, h: 225 }

export default function TechSection() {
  const root = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      /* DOM defaults are the fully-annotated frame (the static
         mobile / reduced-motion fallback). The desktop branch strips
         it back and re-draws it beat-by-beat under scroll. */
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Initial: raw frame only */
          gsap.set(".tech-scan", { xPercent: -130, opacity: 0 })
          gsap.set(".tech-rect", { drawSVG: "0%" })
          gsap.set(".tech-chip", { opacity: 0, scale: 0.6 })
          gsap.set(".tech-conf", { scaleX: 0, transformOrigin: "100% 50%" })
          gsap.set(".tech-coords", { opacity: 0, y: -8 })
          gsap.set(".tech-map", { yPercent: 135 })
          gsap.set(".tech-pin", { opacity: 0 })
          gsap.set(".tech-extra-pin", { opacity: 0, scale: 0 })
          gsap.set(".tech-step-fill", { opacity: 0 })
          gsap.set(".tech-caption-1, .tech-caption-2", { opacity: 0 })

          /* pin ONLY the stage — the footage climax lives in the
             section's normal-scroll tail, after the unpin */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              pin: stageRef.current,
              scrub: 1, // Smooth momentum
              start: "top top",
              end: PIN_DISTANCE,
              invalidateOnRefresh: true,
              snap: {
                snapTo: "labels",
                duration: { min: 0.2, max: 0.6 },
                ease: "power1.inOut"
              }
            },
          })

          const step = (i: number, at: number) =>
            tl.to(`.tech-step-fill-${i}`, { opacity: 1, duration: 0.12 }, at)

          tl.addLabel("start", 0)

          /* ── Beat 1 · يلتقط + يرى — scan sweeps and boxes draw in its wake ── */
          step(0, 0.05)
          step(1, 0.4) // "يرى" pill lights up as boxes draw
          tl.to(".tech-scan", { opacity: 1, duration: 0.08 }, 0.08)
          tl.to(".tech-scan", { xPercent: 130, duration: 0.8, ease: "none" }, 0.12)
          
          // Boxes draw while scan passes over them
          tl.to(".tb-pothole .tech-rect", { drawSVG: "100%", duration: 0.3, ease: "power2.out" }, 0.35)
          tl.to(".tb-crack .tech-rect", { drawSVG: "100%", duration: 0.3, ease: "power2.out" }, 0.6)
          
          tl.to(".tech-scan", { opacity: 0, duration: 0.12 }, 0.9)
          
          // Caption crossfade 0 -> 1
          tl.to(".tech-caption-0", { opacity: 0, duration: 0.15 }, 0.8)
          tl.to(".tech-caption-1", { opacity: 1, duration: 0.15 }, 0.95)

          tl.addLabel("beat1", 1.0)

          /* ── Beat 2 · يصنّف — label chips pop + confidence fills ── */
          step(2, 1.1)
          tl.to(".tech-chip", { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.18 }, 1.15)
          tl.to(".tech-conf", { scaleX: 1, duration: 0.3, stagger: 0.18, ease: "power2.out" }, 1.35)

          // Caption crossfade 1 -> 2
          tl.to(".tech-caption-1", { opacity: 0, duration: 0.15 }, 1.8)
          tl.to(".tech-caption-2", { opacity: 1, duration: 0.15 }, 1.95)

          tl.addLabel("beat2", 2.0)

          /* ── Beat 3 · يوطّن + يزامن — coords flash, map slides in, pin drops, then syncs ── */
          step(3, 2.1)
          tl.to(".tech-coords", { opacity: 1, y: 0, duration: 0.1 }, 2.1)
          tl.to(".tech-map", { yPercent: 0, duration: 0.25, ease: "power3.out" }, 2.15)
          tl.to(".tech-coords", { opacity: 0, duration: 0.1 }, 2.45)
          
          tl.to(".tech-pin", { opacity: 1, duration: 0.04 }, 2.3)
          tl.from(".tech-pin", {
            motionPath: {
              path: [ { x: -30, y: -190 }, { x: 8, y: -90 }, { x: 0, y: 0 } ],
              curviness: 1.4,
            },
            duration: 0.25,
            ease: "power2.in",
            immediateRender: false,
          }, 2.3)
          tl.fromTo(".tech-pin-ring",
            { scale: 0.4, opacity: 0.6 },
            { scale: 2.4, opacity: 0, duration: 0.2, transformOrigin: "50% 50%" },
            2.55
          )

          step(4, 2.6) // "يزامن" pill lights up
          tl.to(".tech-map", { scale: 1.05, duration: 0.4, ease: "power2.out" }, 2.65)
          tl.to(".tech-extra-pin", { opacity: 1, scale: 1, duration: 0.2, stagger: 0.1, ease: "back.out(2)" }, 2.75)

          tl.addLabel("beat3", 3.0)
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="tech" className="relative bg-white">
      <div
        ref={stageRef}
        className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 md:h-screen"
      >
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="font-display text-display-1 text-ink">
            مسار يرى الطريق
          </h2>
          <p className="mt-3 text-body-2 text-subtext">
            من صورة… إلى بلاغٍ مُوطَّن على الخريطة.
          </p>
        </div>

        {/* ── Camera frame ── */}
        <div
          className="card-surface relative w-full overflow-hidden"
          style={{
            borderRadius: "var(--radius-card)",
            /* never taller than the space under the heading + tracker,
               so the whole street (pothole + crack) is visible at 100% zoom */
            maxWidth: "min(860px, calc((100vh - 360px) * 1.739))",
          }}
        >
          {/* Road scene — flat vector. TODO: asset — may be swapped for a
              real photo; overlays below stay as the SVG/HTML annotation layer. */}
          <svg
            viewBox="0 0 800 460"
            className="block w-full"
            fill="none"
            aria-hidden
          >
            {/* sky */}
            <rect width="800" height="460" fill="var(--whitesmoke)" />
            {/* building skyline — flat rounded blocks */}
            <rect
              x="30"
              y="52"
              width="110"
              height="88"
              rx="14"
              fill="var(--seashell)"
            />
            <rect
              x="160"
              y="24"
              width="90"
              height="116"
              rx="14"
              fill="var(--seashell)"
            />
            <rect
              x="270"
              y="70"
              width="130"
              height="70"
              rx="14"
              fill="var(--seashell)"
            />
            <rect
              x="420"
              y="38"
              width="100"
              height="102"
              rx="14"
              fill="var(--seashell)"
            />
            <rect
              x="540"
              y="80"
              width="120"
              height="60"
              rx="14"
              fill="var(--seashell)"
            />
            <rect
              x="680"
              y="46"
              width="95"
              height="94"
              rx="14"
              fill="var(--seashell)"
            />
            {/* sidewalk + curb */}
            <rect x="0" y="140" width="800" height="38" fill="var(--white)" />
            <rect
              x="0"
              y="172"
              width="800"
              height="10"
              fill="var(--seashell)"
            />
            {/* asphalt */}
            <rect x="0" y="182" width="800" height="278" fill="var(--light)" />
            {/* crosswalk */}
            {[48, 84, 120, 156].map((x) => (
              <rect
                key={x}
                x={x}
                y="205"
                width="20"
                height="230"
                rx="10"
                fill="var(--white)"
                opacity="0.9"
              />
            ))}
            {/* center lane dashes */}
            {[230, 350, 470, 590, 710].map((x) => (
              <rect
                key={x}
                x={x}
                y="312"
                width="64"
                height="13"
                rx="6.5"
                fill="var(--white)"
                opacity="0.95"
              />
            ))}
            {/* pothole — one clear dark blob, fully inside its box */}
            <ellipse cx="292" cy="303" rx="76" ry="33" fill="var(--text)" />
            <ellipse cx="242" cy="290" rx="26" ry="15" fill="var(--text)" />
            <ellipse cx="348" cy="294" rx="26" ry="16" fill="var(--text)" />
            {/* crack — bold branched fracture */}
            <path
              d="M565 190 L585 235 L570 275 L600 320 L585 362"
              stroke="var(--text)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M585 235 L622 253 L640 287"
              stroke="var(--text)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* detection overlays */}
            {[
              { cls: "tb-pothole", box: BOX_POTHOLE, hex: "#44729D" },
              { cls: "tb-crack", box: BOX_CRACK, hex: "#44729D" },
            ].map(({ cls, box, hex }) => (
              <g key={cls} className={cls}>
                <rect
                  className="tech-rect"
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="14"
                  stroke={hex}
                  strokeWidth="4"
                  opacity="0.85"
                />
              </g>
            ))}
          </svg>

          {/* scan line */}
          <div
            className="tech-scan pointer-events-none absolute inset-y-0 right-0 w-full"
            aria-hidden
          >
            <div
              className="absolute inset-y-0 right-1/2 w-24"
              style={{ background: "linear-gradient(to right, transparent, rgba(52,168,216,0.15))" }}
            />
            <div className="absolute inset-y-0 right-1/2 w-1 rounded-full bg-peacock" />
          </div>

          {/* label chips */}
          <div
            className="tech-chip absolute flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]"
            style={{ right: "53%", top: "42%" }}
          >
            <span className="text-body-5 font-bold text-ink">حفرة</span>
            <span
              className="pill px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: "#16668E" }}
            >
              خطير
            </span>
            <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-seashell">
              <span
                className="tech-conf absolute inset-0 rounded-full"
                style={{ width: "85%", backgroundColor: "#16668E" }}
              />
            </span>
          </div>
          <div
            className="tech-chip absolute flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]"
            style={{ right: "8%", top: "26%" }}
          >
            <span className="text-body-5 font-bold text-ink">تشقّق</span>
            <span
              className="pill px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: "#197FB0" }}
            >
              متوسط
            </span>
            <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-seashell">
              <span
                className="tech-conf absolute inset-0 rounded-full"
                style={{ width: "64%", backgroundColor: "#197FB0" }}
              />
            </span>
          </div>

          {/* coordinate readout */}
          <div
            className="tech-coords absolute rounded-full bg-white px-3 py-1.5 font-mono text-[12px] font-bold text-subtext shadow-[var(--shadow-soft)]"
            style={{ right: "40%", top: "18%" }}
          >
            31.9038°N · 35.2034°E
          </div>

          {/* mini map — the report gets a home */}
          <div className="tech-map absolute bottom-5 left-5 w-[200px] overflow-hidden rounded-3xl bg-white p-3 shadow-[var(--shadow-soft)]">
            <div className="relative h-[120px] overflow-hidden rounded-2xl bg-seashell">
              <span className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-white" />
              <span className="absolute inset-y-0 left-1/3 w-2.5 rounded-full bg-white" />
              {/* the dropped pin (severity color) + landing ring */}
              <span
                className="tech-pin absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundColor: "#16668E",
                  maskImage: 'url(/glyphs/long.svg)',
                  WebkitMaskImage: 'url(/glyphs/long.svg)',
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
              <span
                className="tech-pin-ring absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  boxShadow: "inset 0 0 0 2px #16668E",
                  opacity: 0,
                }}
              />
              {/* live city pins */}
              <span
                className="tech-extra-pin absolute right-[18%] top-[22%] h-4 w-4"
                style={{
                  backgroundColor: "#197FB0",
                  maskImage: 'url(/glyphs/pothole.svg)',
                  WebkitMaskImage: 'url(/glyphs/pothole.svg)',
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
              <span
                className="tech-extra-pin absolute right-[70%] top-[30%] h-4 w-4"
                style={{
                  backgroundColor: "#34A8D8",
                  maskImage: 'url(/glyphs/gator.svg)',
                  WebkitMaskImage: 'url(/glyphs/gator.svg)',
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
              <span
                className="tech-extra-pin absolute right-[30%] top-[72%] h-4 w-4"
                style={{
                  backgroundColor: "#16668E",
                  maskImage: 'url(/glyphs/other.svg)',
                  WebkitMaskImage: 'url(/glyphs/other.svg)',
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] font-bold text-subtext">
              بلاغ جديد على الخريطة
            </p>
          </div>
        </div>

        {/* ── Dynamic Captions ── */}
        <div className="relative mt-6 h-6 w-full text-center text-body-2 font-medium text-ink md:mt-8">
          <div className="tech-caption-0 absolute inset-0">
            النموذج يمسح الطريق ويلتقط العيوب تلقائياً
          </div>
          <div className="tech-caption-1 absolute inset-0 opacity-0">
            يصنّف العيوب المكتشفة ويحدد درجة خطورتها
          </div>
          <div className="tech-caption-2 absolute inset-0 opacity-0">
            يوطّن البلاغ على الخريطة ويزامنه مع غرفة العمليات
          </div>
        </div>

        {/* ── Step tracker ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8">
          {STEPS.map(({ label, hex }, i) => (
            <span
              key={label}
              className="pill relative bg-whitesmoke px-5 py-2.5 text-body-4 font-bold text-mutedtext"
            >
              {label}
              {/* colored layer crossfades in when the beat activates */}
              <span
                className={`tech-step-fill tech-step-fill-${i} pill absolute inset-0 flex items-center justify-center bg-white shadow-[var(--shadow-soft)]`}
                style={{ color: hex }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
