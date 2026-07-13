"use client"

import { useRef } from "react"
import {
  Scan24Filled,
  Map24Filled,
  ArrowSort24Filled,
  ImageMultiple24Filled,
  Warning24Filled,
} from "@fluentui/react-icons"
import { gsap, useGSAP } from "@/lib/gsap"

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : scroll consumed by the pinned horizontal gallery
   Timeline runs 0 → 3 (one unit per panel transition). The track's
   x is LINEAR (the user drives it); assembly beats are power3.     */
const PIN_DISTANCE = "+=320%"
const PANEL_COUNT = 4

/* ── The 4 features ── */
const FEATURES = [
  {
    word: "كشف تلقائي",
    num: "ميزة 01",
    Icon: Scan24Filled,
    hex: "#16668E",
    sub: "كشف تلقائي للأضرار — يتعرّف على الحفر والتشقّقات من الصورة ويقدّر خطورتها.",
  },
  {
    word: "خريطة حية",
    num: "ميزة 02",
    Icon: Map24Filled,
    hex: "#16668E",
    sub: "خريطة موحّدة حيّة — كل البلاغات على خريطة واحدة، لحظياً.",
  },
  {
    word: "ترتيب حسب الاولوية",
    num: "ميزة 03",
    Icon: ArrowSort24Filled,
    hex: "#16668E",
    sub: "أولوية ذكية — ترتيب حسب الخطورة والموقع والكثافة.",
  },
  {
    word: "توثيق منظم",
    num: "ميزة 04",
    Icon: ImageMultiple24Filled,
    hex: "#16668E",
    sub: "دليل مصوّر قبل/بعد — توثيق كل إصلاح للمساءلة.",
  },
]

/* ── Flat vector illustrations — big shapes, brand palette only.
      Named groups so GSAP can stagger pieces (.pop scales in,
      .draw uses DrawSVG).  TODO: refine art ─────────────────── */

function IlloDetect() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      {/* road */}
      <rect
        className="pop"
        x="40"
        y="170"
        width="320"
        height="90"
        rx="28"
        fill="var(--seashell)"
      />
      <rect
        className="pop"
        x="70"
        y="209"
        width="44"
        height="12"
        rx="6"
        fill="var(--white)"
      />
      <rect
        className="pop"
        x="290"
        y="209"
        width="44"
        height="12"
        rx="6"
        fill="var(--white)"
      />
      {/* pothole */}
      <ellipse
        className="pop"
        cx="200"
        cy="215"
        rx="56"
        ry="26"
        fill="var(--text)"
      />
      {/* detection bracket — corners draw on */}
      <path
        className="draw"
        d="M128 168 h-24 a12 12 0 0 0 -12 12 v24"
        stroke="#16668E"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M272 168 h24 a12 12 0 0 1 12 12 v24"
        stroke="#16668E"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M128 262 h-24 a12 12 0 0 1 -12 -12 v-24"
        stroke="#16668E"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M272 262 h24 a12 12 0 0 0 12 -12 v-24"
        stroke="#16668E"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* severity signal */}
      <circle className="pop" cx="308" cy="132" r="12" fill="#16668E" />
    </svg>
  )
}

function MapGlyph({
  x,
  y,
  fill,
  icon,
}: {
  x: number
  y: number
  fill: string
  icon: string
}) {
  const size = 32
  return (
    <foreignObject
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      className="pop"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: fill,
          maskImage: `url(${icon})`,
          WebkitMaskImage: `url(${icon})`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    </foreignObject>
  )
}

function IlloMap() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      {/* map block */}
      <rect
        className="pop"
        x="60"
        y="30"
        width="280"
        height="240"
        rx="32"
        fill="var(--seashell)"
      />
      {/* bold rounded streets */}
      <path
        className="draw"
        d="M60 110 H340"
        stroke="var(--white)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        className="draw"
        d="M160 30 V270"
        stroke="var(--white)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        className="draw"
        d="M60 210 C 140 180, 260 240, 340 200"
        stroke="var(--white)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* report pins — the damage glyphs mark each one */}
      <MapGlyph x={120} y={80} fill="#44729D" icon="/glyphs/long.svg" />
      <MapGlyph x={250} y={150} fill="#44729D" icon="/glyphs/gator.svg" />
      <MapGlyph x={300} y={70} fill="#44729D" icon="/glyphs/pothole.svg" />
      <MapGlyph x={200} y={235} fill="#44729D" icon="/glyphs/other.svg" />
    </svg>
  )
}

function IlloPriority() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      {/* stacked by priority — hot on top, calming downward */}

      {/* Top Bar - 98% */}
      <rect
        className="pop"
        x="70"
        y="52"
        width="260"
        height="56"
        rx="28"
        fill="#16668E"
      />
      <g className="pop" transform="translate(86, 68)">
        <Warning24Filled
          style={{ color: "var(--white)", width: 24, height: 24 }}
        />
      </g>
      <text
        className="pop pct-1"
        x="118"
        y="86"
        fill="var(--white)"
        fontSize="20"
        fontWeight="800"
        fontFamily="var(--font-almarai), sans-serif"
        textAnchor="start"
        style={{ direction: "ltr" }}
      >
        98%
      </text>

      {/* Middle Bar - 64% */}
      <rect
        className="pop"
        x="95"
        y="128"
        width="210"
        height="56"
        rx="28"
        fill="#197FB0"
      />
      <g className="pop" transform="translate(111, 144)">
        <Warning24Filled
          style={{ color: "var(--white)", width: 24, height: 24 }}
        />
      </g>
      <text
        className="pop pct-2"
        x="143"
        y="162"
        fill="var(--white)"
        fontSize="20"
        fontWeight="800"
        fontFamily="var(--font-almarai), sans-serif"
        textAnchor="start"
        style={{ direction: "ltr" }}
      >
        64%
      </text>

      {/* Bottom Bar - 22% */}
      <rect
        className="pop"
        x="120"
        y="204"
        width="160"
        height="56"
        rx="28"
        fill="#34A8D8"
      />
      <g className="pop" transform="translate(136, 220)">
        <Warning24Filled
          style={{ color: "var(--white)", width: 24, height: 24 }}
        />
      </g>
      <text
        className="pop pct-3"
        x="168"
        y="238"
        fill="var(--white)"
        fontSize="20"
        fontWeight="800"
        fontFamily="var(--font-almarai), sans-serif"
        textAnchor="start"
        style={{ direction: "ltr" }}
      >
        22%
      </text>
    </svg>
  )
}

function IlloEvidence() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      {/* before (right, RTL-first): cracked */}
      <rect
        className="pop"
        x="55"
        y="60"
        width="290"
        height="180"
        rx="32"
        fill="var(--seashell)"
      />
      <path
        className="draw"
        d="M300 96 L272 138 L296 168 L268 206"
        stroke="var(--text)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* after (left): fixed */}
      <path
        className="pop"
        d="M55 92 a32 32 0 0 1 32 -32 h113 v180 h-113 a32 32 0 0 1 -32 -32 z"
        fill="#16668E"
      />
      <path
        className="draw"
        d="M105 150 l22 22 l40 -44"
        stroke="var(--white)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* divider sweep */}
      <rect
        className="pop"
        x="194"
        y="48"
        width="12"
        height="204"
        rx="6"
        fill="var(--white)"
      />
    </svg>
  )
}

const ILLOS = [IlloDetect, IlloMap, IlloPriority, IlloEvidence]

function FeatureBlock({
  feature,
  index,
  layout,
}: {
  feature: (typeof FEATURES)[number]
  index: number
  layout: "panel" | "stack"
}) {
  const { word, num, Icon, hex, sub } = feature
  const Illo = ILLOS[index]
  const flip = layout === "panel" && index % 2 === 1
  return (
    <div
      className={`feat-content flex items-center justify-center gap-10 ${
        layout === "panel"
          ? `w-full max-w-5xl ${flip ? "flex-row-reverse" : "flex-row"}`
          : "flex-col text-center"
      }`}
    >
      <div className="feat-illo-wrap w-full max-w-[440px] shrink-0">
        <div className="feat-illo">
          <Illo />
        </div>
      </div>
      <div className={layout === "panel" ? "max-w-md" : "max-w-md"}>
        <div
          className={`feat-word flex items-center gap-2 ${layout === "stack" ? "justify-center" : ""}`}
        >
          <Icon style={{ color: hex }} aria-hidden />
          <span className="text-body-5 font-bold text-lighttext">{num}</span>
        </div>
        <h3 className="feat-word font-display mt-3 text-[clamp(48px,6vw,72px)] leading-tight text-ink">
          {word}
        </h3>
        <p className="feat-sub mt-4 text-body-2 leading-relaxed text-subtext">
          {sub}
        </p>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  const root = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = trackRef.current!

          /* Hide all panels initially */
          for (let i = 0; i < PANEL_COUNT; i++) {
            gsap.set(`.feat-${i} .feat-illo`, { opacity: 0, scale: 0.9 })
            gsap.set(`.feat-${i} .pop`, {
              scale: 0,
              opacity: 0,
              transformOrigin: "50% 50%",
            })
            const draws = gsap.utils.toArray(`.feat-${i} .draw`)
            if (draws.length) gsap.set(draws, { drawSVG: "0%" })
            gsap.set(`.feat-${i} .feat-word, .feat-${i} .feat-sub`, {
              y: 40,
              opacity: 0,
            })
          }
          gsap.set(".feat-dot-fill", { opacity: 0 })
          gsap.set(".feat-dot-fill-0", { opacity: 1 })

          // Hide panel 0 card background and make it extremely small initially
          gsap.set(".feat-0 .feat-card-bg", {
            scale: 0.3,
            borderRadius: "100px",
            opacity: 0,
          })

          /* PHASE 0: Grow the first card as it enters the viewport (before pinning) */
          gsap.to(".feat-0 .feat-card-bg", {
            scale: 1,
            borderRadius: "var(--radius-card)",
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%", // starts growing when section enters the bottom
              end: "top top", // finishes growing exactly when it pins
              scrub: 1,
            },
          })

          /* Master timeline — pin + scrub */
          const MOVE = 1.5
          const HOLD = 1.5

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              scrub: 1, // Smooth scrubbing
              start: "top top",
              end: PIN_DISTANCE,
              invalidateOnRefresh: true,
            },
          })

          /* PHASE 1: Animate Panel 0 elements in (plays right after pinning) */
          const draws0 = gsap.utils.toArray(`.feat-0 .draw`)
          tl.to(".feat-0 .feat-illo", {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
          })
          tl.to(
            ".feat-0 .pop",
            {
              scale: 1,
              opacity: 1,
              stagger: 0.05,
              duration: 0.5,
              ease: "back.out(1.7)",
            },
            "-=0.2",
          )
          if (draws0.length) {
            tl.to(
              draws0,
              {
                drawSVG: "100%",
                stagger: 0.08,
                duration: 0.6,
                ease: "power2.out",
              },
              "-=0.4",
            )
          }
          tl.to(
            ".feat-0 .feat-word",
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
            "-=0.5",
          )
          tl.to(
            ".feat-0 .feat-sub",
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
            "-=0.4",
          )

          /* DWELL on the first panel so the user can read it */
          tl.to({}, { duration: HOLD })

          /* x that centers panel i (function → recomputed on refresh) */
          const stepX = (i: number) => () =>
            (track.scrollWidth - window.innerWidth) * (i / (PANEL_COUNT - 1))

          for (let i = 1; i < PANEL_COUNT; i++) {
            const at = tl.duration() // this move begins where we left off

            /* slide the (still-blank) card to center with a gentle settle */
            tl.to(
              track,
              { x: stepX(i), duration: MOVE, ease: "power1.inOut" },
              at,
            )

            /* previous panel card scales down and fades back as we leave it */
            tl.to(
              `.feat-${i - 1} .feat-card-bg`,
              {
                opacity: 0.4,
                scale: 0.85,
                duration: MOVE * 0.6,
                ease: "power2.inOut",
              },
              at,
            )

            /* ── ASSEMBLE once the card ARRIVES at center (during the dwell)
               so the reveal is front-and-center, not lost mid-slide ── */
            const arr = at + MOVE
            tl.to(
              `.feat-${i} .feat-illo`,
              { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" },
              arr,
            )
            tl.to(
              `.feat-${i} .pop`,
              {
                scale: 1,
                opacity: 1,
                stagger: 0.07,
                duration: 0.4,
                ease: "back.out(1.7)",
              },
              arr + 0.08,
            )
            const draws = gsap.utils.toArray(`.feat-${i} .draw`)
            if (draws.length)
              tl.to(
                draws,
                {
                  drawSVG: "100%",
                  stagger: 0.1,
                  duration: 0.5,
                  ease: "power2.out",
                },
                arr + 0.2,
              )
            tl.to(
              `.feat-${i} .feat-word`,
              { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
              arr + 0.3,
            )
            tl.to(
              `.feat-${i} .feat-sub`,
              { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
              arr + 0.45,
            )

            /* progress rail swaps as the card lands */
            tl.to(`.feat-dot-fill-${i}`, { opacity: 1, duration: 0.12 }, arr)
            tl.to(
              `.feat-dot-fill-${i - 1}`,
              { opacity: 0, duration: 0.12 },
              arr,
            )

            if (i === 2) {
              const targets = [98, 64, 22]
              const obj = { v1: 0, v2: 0, v3: 0 }
              tl.to(
                obj,
                {
                  v1: targets[0],
                  v2: targets[1],
                  v3: targets[2],
                  duration: 0.8,
                  ease: "power3.out",
                  onUpdate: () => {
                    gsap.utils
                      .toArray<Element>(".features-desktop .pct-1")
                      .forEach(
                        (n) => (n.textContent = Math.round(obj.v1) + "%"),
                      )
                    gsap.utils
                      .toArray<Element>(".features-desktop .pct-2")
                      .forEach(
                        (n) => (n.textContent = Math.round(obj.v2) + "%"),
                      )
                    gsap.utils
                      .toArray<Element>(".features-desktop .pct-3")
                      .forEach(
                        (n) => (n.textContent = Math.round(obj.v3) + "%"),
                      )
                  },
                },
                arr + 0.1,
              )
            }

            /* DWELL — the pause spans the whole reveal, then holds a beat */
            tl.to(track, { x: stepX(i), duration: HOLD }, arr)
          }
        },
      )

      /* Mobile with motion: gentle in-view reveals on the stack */
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>(".feat-stack-item")
            .forEach((item, idx) => {
              const stl = gsap.timeline({
                scrollTrigger: {
                  trigger: item,
                  start: "top 75%",
                  toggleActions: "play none none reverse",
                },
              })
              stl.from(item, {
                opacity: 0,
                y: 60,
                duration: 0.8,
                ease: "power3.out",
              })

              if (idx === 2) {
                const targets = [98, 64, 22]
                const obj = { v1: 0, v2: 0, v3: 0 }
                stl.to(
                  obj,
                  {
                    v1: targets[0],
                    v2: targets[1],
                    v3: targets[2],
                    duration: 1.2,
                    ease: "power3.out",
                    onUpdate: () => {
                      item
                        .querySelectorAll(".pct-1")
                        .forEach(
                          (n) => (n.textContent = Math.round(obj.v1) + "%"),
                        )
                      item
                        .querySelectorAll(".pct-2")
                        .forEach(
                          (n) => (n.textContent = Math.round(obj.v2) + "%"),
                        )
                      item
                        .querySelectorAll(".pct-3")
                        .forEach(
                          (n) => (n.textContent = Math.round(obj.v3) + "%"),
                        )
                    },
                  },
                  0.2,
                )
              }
            })
        },
      )
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="features"
      className="relative overflow-hidden bg-white"
    >
      {/* ── Desktop: pinned horizontal gallery ── */}
      <div className="features-desktop hidden h-screen flex-col md:flex">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${PANEL_COUNT * 100}vw` }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`feat-${i} flex h-full w-screen items-center justify-center px-[4vw] py-[9vh]`}
            >
              {/* each feature is its own rounded card; the track
                  slide makes the current card exit as the next enters */}
              <div
                className="feat-card-bg flex h-full w-full max-w-6xl items-center justify-center overflow-hidden px-[5vw]"
                style={{
                  background: "var(--seashell)",
                  borderRadius: "var(--radius-card)",
                }}
              >
                <FeatureBlock feature={feature} index={i} layout="panel" />
              </div>
            </div>
          ))}
        </div>
        {/* progress rail */}
        <div
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-3"
          aria-hidden
        >
          {FEATURES.map((_, i) => (
            <span key={i} className="relative h-3 w-3 rounded-full bg-seashell">
              <span
                className={`feat-dot-fill feat-dot-fill-${i} absolute inset-0 rounded-full bg-peacock`}
              />
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile / reduced-motion: vertical stack ── */}
      <div className="features-stack flex flex-col gap-20 px-6 py-20 md:hidden">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className="feat-stack-item px-6 py-12"
            style={{
              background: "var(--seashell)",
              borderRadius: "var(--radius-card)",
            }}
          >
            <FeatureBlock feature={feature} index={i} layout="stack" />
          </div>
        ))}
      </div>
    </section>
  )
}
