"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import CityMapBg from "@/components/CityMapBg"

/* ClaudeImpact — «كشفٌ مباشر»: the metrics get *detected*.
   A normal-flow section (no pin, no scrub). When it enters the viewport
   the sequence plays once, on its own clock: each figure first appears
   as a sparse peacock dot-grid (raw signal), a scan band — the map
   viewer's sweep motif — passes over it and the solid ink numeral
   resolves in sync with the band's leading edge; focus-lock corner
   brackets snap on (hero hotspot motif), a prediction chip stamps the
   box, and the words rise out of a mask. Desktop: the three figures
   are detected one after another, right to left. Mobile: each card
   plays as it scrolls into view. Reduced motion: everything rendered
   settled, no animation. */

type Stat = {
  key: string
  value: number
  suffix?: string // e.g. "%"
  title: string
  desc: string
  chip: string // detection-label text stamped on the box
}

/* Illustrative sample figures (أرقام توضيحية) — swap for pilot data.
   Ordered as a sales argument: money → citizen → proof. */
const STATS: Stat[] = [
  {
    key: "savings",
    value: 70,
    suffix: "%",
    title: "خفضٌ في كلفة الصيانة الطارئة",
    desc: "الكشف المبكر يمنع تحوّل الضرر إلى إصلاح مكلف.",
    chip: "صيانةٌ استباقية",
  },
  {
    key: "complaints",
    value: 60,
    suffix: "%",
    title: "شكاوى متكررة أقلّ",
    desc: "يُعالَج الضرر قبل أن يتفاقم ويشتكي المواطن مجدداً.",
    chip: "بلاغُ المواطن",
  },
  {
    key: "accuracy",
    value: 90,
    suffix: "%",
    title: "دقة الكشف التلقائي",
    desc: "نموذج رؤية مُدرَّب على أضرار الطرق.",
    chip: "كشفٌ تلقائي مباشر",
  },
]

/* Scan geometry — the band is 22% of the figure box wide and travels
   from past its right edge to past its left edge. The solid numeral's
   clip-path opens left-inset 100%→0 over the same window, so the
   reveal tracks the band's leading (left) edge: the band travels 122%
   of the box, the edge crosses the box itself in the first 100/122. */
const BAND_W = 22 // % of the figure box
const SWEEP = 0.9 // seconds the sweep takes
const EDGE_CROSS = 100 / (100 + BAND_W)

/* The figure, rendered twice per card: a dotted "raw signal" copy and
   the solid copy that the scan resolves. */
function Figure({ s, dotted }: { s: Stat; dotted?: boolean }) {
  return (
    <span
      dir="ltr"
      className={`flex items-center font-body font-extrabold leading-none ${
        dotted ? "cip-dotnum" : "text-ink"
      }`}
      style={{ fontSize: "clamp(88px, 10vw, 150px)" }}
    >
      {s.value}
      {s.suffix && (
        <span
          className={dotted ? "cip-dotnum" : "text-peacock"}
          style={{ fontSize: "0.42em" }}
        >
          {s.suffix}
        </span>
      )}
    </span>
  )
}

export default function ClaudeImpact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // stage a card's hidden state (animated modes only)
      const stageCard = (i: number) => {
        gsap.set(`.cip-solid-${i}`, { clipPath: "inset(0% 0% 0% 100%)" })
        gsap.set(`.cip-br-${i}`, { opacity: 0, scale: 1.7 })
        gsap.set(`.cip-chip-${i}`, { opacity: 0, scale: 1.25 })
        gsap.set(`.cip-title-in-${i}`, { yPercent: 110 })
        gsap.set(`.cip-desc-${i}`, { opacity: 0, y: 14 })
      }

      // one card's detection sequence, on its own local clock
      const cardTl = (i: number) => {
        const tl = gsap.timeline()
        // raw signal condenses in
        tl.fromTo(
          `.cip-dots-${i}`,
          { opacity: 0, scale: 1.04 },
          { opacity: 0.9, scale: 1, duration: 0.35, ease: "power2.out" },
          0,
        )
        // scan pass — solid resolves behind the band's leading edge
        tl.set(`.cip-band-${i}`, { opacity: 1 }, 0.2)
        tl.fromTo(
          `.cip-band-${i}`,
          { xPercent: (100 / BAND_W) * 100 },
          { xPercent: -100, duration: SWEEP, ease: "none" },
          0.2,
        )
        tl.to(
          `.cip-band-${i}`,
          { opacity: 0, duration: 0.18 },
          0.2 + SWEEP - 0.12,
        )
        tl.to(
          `.cip-solid-${i}`,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: SWEEP * EDGE_CROSS,
            ease: "none",
          },
          0.2,
        )
        tl.to(`.cip-dots-${i}`, { opacity: 0, duration: 0.25 }, 0.2 + SWEEP)
        // detection confirmed — brackets snap, chip stamps, words rise
        const lockAt = 0.2 + SWEEP * EDGE_CROSS
        tl.to(
          `.cip-br-${i}`,
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2)",
            stagger: 0.05,
          },
          lockAt,
        )
        tl.to(
          `.cip-chip-${i}`,
          { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" },
          lockAt + 0.12,
        )
        tl.to(
          `.cip-title-in-${i}`,
          { yPercent: 0, duration: 0.5, ease: "power3.out" },
          lockAt + 0.1,
        )
        tl.to(
          `.cip-desc-${i}`,
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
          lockAt + 0.25,
        )
        return tl
      }

      const stageHeader = () => {
        gsap.set(".cip-eyebrow", { opacity: 0, y: 10 })
        gsap.set(".cip-head-in", { yPercent: 110 })
      }
      const headerIn = (tl: gsap.core.Timeline) => {
        tl.to(
          ".cip-eyebrow",
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0,
        )
        tl.to(
          ".cip-head-in",
          { yPercent: 0, duration: 0.6, ease: "power3.out" },
          0.05,
        )
      }

      // desktop — one choreography: figures detected one after another
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          stageHeader()
          STATS.forEach((_, i) => stageCard(i))

          const master = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          })
          headerIn(master)
          STATS.forEach((_, i) => master.add(cardTl(i), 0.35 + i * 0.55))
        },
      )

      // mobile — each card plays as it enters the viewport
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          stageHeader()
          STATS.forEach((_, i) => stageCard(i))

          const head = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          })
          headerIn(head)

          STATS.forEach((_, i) => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: `.cip-card-${i}`,
                start: "top 78%",
                toggleActions: "play none none none",
              },
            })
            tl.add(cardTl(i))
          })
        },
      )

      // reduced motion — no staging, everything renders settled
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="impact-claude"
      className="relative overflow-hidden bg-white px-6 py-24 md:py-28"
    >
      <CityMapBg className="opacity-30" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* header */}
        <p className="cip-eyebrow text-center text-body-5 font-bold tracking-widest text-peacock">
          الأثر
        </p>
        <div className="mt-2 overflow-hidden">
          <h2 className="cip-head-in text-center font-display text-display-2 text-ink md:text-display-1">
            نتائجُ نفخر بها
          </h2>
        </div>

        {/* the three detections */}
        <div className="mt-20 grid gap-16 md:mt-24 md:grid-cols-3 md:gap-10">
          {STATS.map((s, i) => (
            <div
              key={s.key}
              className={`cip-card-${i} flex flex-col items-center text-center`}
            >
              {/* figure box — dotted raw signal under the clipped solid copy */}
              <div className="relative w-full">
                <div
                  aria-hidden
                  className={`cip-dots-${i} flex items-center justify-center`}
                  style={{ opacity: 0 }}
                >
                  <Figure s={s} dotted />
                </div>
                <div
                  className={`cip-solid-${i} absolute inset-0 flex items-center justify-center`}
                >
                  <span className="relative inline-block">
                    <Figure s={s} />
                    {/* focus-lock brackets, em-scaled to the numeral */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-[0.12em] -inset-y-[0.06em] block"
                      style={{ fontSize: "clamp(88px, 10vw, 150px)" }}
                    >
                      <span
                        className={`cip-br-${i} absolute right-0 top-0 h-[0.14em] w-[0.14em] rounded-tr-[0.05em] border-r-[0.022em] border-t-[0.022em] border-peacock`}
                      />
                      <span
                        className={`cip-br-${i} absolute left-0 top-0 h-[0.14em] w-[0.14em] rounded-tl-[0.05em] border-l-[0.022em] border-t-[0.022em] border-peacock`}
                      />
                      <span
                        className={`cip-br-${i} absolute bottom-0 left-0 h-[0.14em] w-[0.14em] rounded-bl-[0.05em] border-b-[0.022em] border-l-[0.022em] border-peacock`}
                      />
                      <span
                        className={`cip-br-${i} absolute bottom-0 right-0 h-[0.14em] w-[0.14em] rounded-br-[0.05em] border-b-[0.022em] border-r-[0.022em] border-peacock`}
                      />
                    </span>
                    {/* prediction chip, stamped on the box */}
                    <span
                      dir="rtl"
                      className={`cip-chip-${i} pill absolute -top-9 right-0 inline-flex items-center gap-2 bg-peacock px-4 py-1.5 text-body-5 font-bold text-white`}
                    >
                      <span className="rec-blink h-1.5 w-1.5 rounded-full bg-white" />
                      {s.chip}
                    </span>
                  </span>
                </div>
                {/* scan band, clipped to the figure box */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 block overflow-hidden"
                >
                  <span
                    className={`cip-band-${i} cip-scanband absolute inset-y-0 left-0 block`}
                    style={{ width: `${BAND_W}%`, opacity: 0 }}
                  />
                </span>
              </div>

              {/* title rises out of a mask */}
              <div className="mt-6 overflow-hidden">
                <h3
                  className={`cip-title-in-${i} font-display text-display-4 text-ink`}
                >
                  {s.title}
                </h3>
              </div>

              <p
                className={`cip-desc-${i} mt-3 max-w-xs text-body-4 leading-relaxed text-subtext`}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
