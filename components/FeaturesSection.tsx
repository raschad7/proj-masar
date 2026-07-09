"use client"

import { useRef } from "react"
import {
  Scan24Filled,
  Map24Filled,
  ArrowSort24Filled,
  ImageMultiple24Filled,
} from "@fluentui/react-icons"
import { gsap, useGSAP } from "@/lib/gsap"

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : scroll consumed by the pinned horizontal gallery
   Timeline runs 0 → 3 (one unit per panel transition). The track's
   x is LINEAR (the user drives it); assembly beats are power3.     */
const PIN_DISTANCE = "+=450%"
const PANEL_COUNT = 4

/* ── The 4 features ── */
const FEATURES = [
  {
    word: "كشف تلقائي",
    num: "ميزة 01",
    Icon: Scan24Filled,
    hex: "#0072DA",
    sub: "كشف تلقائي للأضرار — يتعرّف على الحفر والتشقّقات من الصورة ويقدّر خطورتها.",
  },
  {
    word: "خريطة حية",
    num: "ميزة 02",
    Icon: Map24Filled,
    hex: "#34A8D8",
    sub: "خريطة موحّدة حيّة — كل البلاغات على خريطة واحدة، لحظياً.",
  },
  {
    word: "ترتيب حسب الاولوية",
    num: "ميزة 03",
    Icon: ArrowSort24Filled,
    hex: "#FFAB00",
    sub: "أولوية ذكية — ترتيب حسب الخطورة والموقع والكثافة.",
  },
  {
    word: "توثيق منظم",
    num: "ميزة 04",
    Icon: ImageMultiple24Filled,
    hex: "#088A20",
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
        stroke="#0072DA"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M272 168 h24 a12 12 0 0 1 12 12 v24"
        stroke="#0072DA"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M128 262 h-24 a12 12 0 0 1 -12 -12 v-24"
        stroke="#0072DA"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="draw"
        d="M272 262 h24 a12 12 0 0 0 12 -12 v-24"
        stroke="#0072DA"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* severity signal */}
      <circle className="pop" cx="308" cy="132" r="12" fill="var(--notice)" />
    </svg>
  )
}

/* One brand arrow dropped onto the map at (x,y), sized to the old pin.
   Nested <svg> lets us reuse the logo path in the illustration's space. */
const ARROW_PATH =
  "M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z"

function MapArrow({ x, y, fill }: { x: number; y: number; fill: string }) {
  const w = 30
  const h = 34
  return (
    <svg
      className="pop"
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      viewBox="18 17 20 23"
    >
      <path d={ARROW_PATH} fill={fill} />
    </svg>
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
      {/* report pins — the مسار arrow marks each one */}
      <MapArrow x={120} y={80} fill="#0072DA" />
      <MapArrow x={250} y={150} fill="var(--notice)" />
      <MapArrow x={300} y={70} fill="var(--negative)" />
      <MapArrow x={200} y={235} fill="var(--positive)" />
    </svg>
  )
}

function IlloPriority() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      {/* stacked by priority — hot on top, calming downward */}
      <rect
        className="pop"
        x="70"
        y="52"
        width="260"
        height="56"
        rx="28"
        fill="var(--negative)"
      />
      <circle className="pop" cx="106" cy="80" r="10" fill="var(--white)" />
      <rect
        className="pop"
        x="95"
        y="128"
        width="210"
        height="56"
        rx="28"
        fill="var(--notice)"
      />
      <circle className="pop" cx="131" cy="156" r="10" fill="var(--white)" />
      <rect
        className="pop"
        x="120"
        y="204"
        width="160"
        height="56"
        rx="28"
        fill="var(--sports-teal)"
      />
      <circle className="pop" cx="156" cy="232" r="10" fill="var(--white)" />
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
        fill="var(--positive)"
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

          /* Initial states: panels 1..3 disassembled (panel 0 assembles
             on section entry, pre-pin, so it's never seen blank). */
          for (let i = 1; i < PANEL_COUNT; i++) {
            gsap.set(`.feat-${i} .feat-illo`, { opacity: 0, scale: 0.9 })
            gsap.set(`.feat-${i} .pop`, {
              scale: 0,
              opacity: 0,
              transformOrigin: "50% 50%",
            })
            // not every illustration has stroke work (e.g. أولوية is all fills)
            const draws = gsap.utils.toArray(`.feat-${i} .draw`)
            if (draws.length) gsap.set(draws, { drawSVG: "0%" })
            gsap.set(`.feat-${i} .feat-word, .feat-${i} .feat-sub`, {
              y: 40,
              opacity: 0,
            })
          }
          gsap.set(".feat-dot-fill", { opacity: 0 })
          gsap.set(".feat-dot-fill-0", { opacity: 1 })

          /* Panel 0 assembles as the section scrolls into view */
          const intro = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
            defaults: { ease: "power3.out" },
          })
          intro
            .from(".feat-0 .pop", {
              scale: 0,
              opacity: 0,
              stagger: 0.06,
              duration: 0.5,
            })
            .fromTo(
              ".feat-0 .draw",
              { drawSVG: "0%" },
              { drawSVG: "100%", stagger: 0.08, duration: 0.5 },
              0.2,
            )
            .from(
              ".feat-0 .feat-word",
              { y: 40, opacity: 0, duration: 0.5 },
              0.25,
            )
            .from(
              ".feat-0 .feat-sub",
              { y: 30, opacity: 0, duration: 0.5 },
              0.35,
            )

          /* Master timeline — pin + scrub, built as MOVE → HOLD segments
             so each card slides to center then DWELLS (a pause in the
             scroll) before the next one moves in. RTL: the track overflows
             LEFT, so positive x brings later panels into view.            */
          const MOVE = 1 //   scroll units to slide one panel to center
          const HOLD = 1.1 //  dwell once centered — the reveal plays here

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              scrub: true,
              start: "top top",
              end: PIN_DISTANCE,
              invalidateOnRefresh: true,
            },
          })

          /* x that centers panel i (function → recomputed on refresh) */
          const stepX = (i: number) => () =>
            (track.scrollWidth - window.innerWidth) * (i / (PANEL_COUNT - 1))

          /* dwell on the first (already-assembled) panel */
          tl.to(track, { x: stepX(0), duration: HOLD })

          for (let i = 1; i < PANEL_COUNT; i++) {
            const at = tl.duration() // this move begins where we left off

            /* slide the (still-blank) card to center with a gentle settle */
            tl.to(
              track,
              { x: stepX(i), duration: MOVE, ease: "power1.inOut" },
              at,
            )

            /* previous panel eases back as we leave it */
            tl.to(
              `.feat-${i - 1} .feat-content`,
              {
                opacity: 0.6,
                scale: 0.97,
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
            .forEach((item) => {
              gsap.from(item, {
                opacity: 0,
                y: 60,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: item,
                  start: "top 75%",
                  toggleActions: "play none none reverse",
                },
              })
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
              {/* each feature is its own #F0F0F0 rounded card; the track
                  slide makes the current card exit as the next enters */}
              <div
                className="flex h-full w-full max-w-6xl items-center justify-center overflow-hidden px-[5vw]"
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
