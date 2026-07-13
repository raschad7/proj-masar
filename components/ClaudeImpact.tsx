"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import CityMapBg from "@/components/CityMapBg"

/* ClaudeImpact — typography-takeover scrollytelling.
   Each figure owns the pinned stage in turn: a massive Almarai-ExtraBold
   number rolls in odometer-style (each digit is a slot column), the title
   rises out of a mask, and a giant outlined ghost of the figure drifts
   behind it. One peacock-led palette, no gauges, no illustrations.
   One pinned scrubbed timeline drives the sequence with snap-to-beat;
   scroll up rewinds. Reduced motion → calm static stack (no pin). */

type Stat = {
  key: string
  value: number
  prefix?: string // e.g. "×"
  suffix?: string // e.g. "%"
  title: string
  desc: string
  chip: string // short context pill above the number
}

/* Illustrative sample figures (أرقام توضيحية) — swap for pilot data.
   Ordered as a sales argument: money → citizen → labour/time → proof. */
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
    key: "speed",
    value: 3,
    prefix: "×",
    title: "أسرع في مسح شبكة الطرق",
    desc: "سيارة واحدة تمسح المدينة بدل جولات تفتيش يدوية.",
    chip: "مسحٌ أثناء القيادة",
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

const SEG = 3 // timeline units per stat
const HOLD = 1.4 // beat on the last figure before the pin releases
const TOTAL = SEG * STATS.length + HOLD

/* Odometer column: 0–9 twice. Non-final digits stop in the first cycle,
   the final digit rolls through a full extra revolution — so the ones
   place spins fastest, like a real counter. */
const COL = [...Array(10).keys(), ...Array(10).keys()]
const STEP = 100 / COL.length // yPercent per index

const digitsOf = (v: number) => String(v).split("")
const targetIdx = (d: string, isLast: boolean) =>
  isLast ? 10 + Number(d) : Number(d)

export default function ClaudeImpact() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // initial state — only the first panel showing, everything staged
        STATS.forEach((s, i) => {
          gsap.set(`.cip-panel-${i}`, {
            opacity: i === 0 ? 1 : 0,
            yPercent: i === 0 ? 0 : 6,
          })
          gsap.set(`.cip-chip-${i}`, { opacity: 0, y: 14 })
          gsap.set(`.cip-title-in-${i}`, { yPercent: 110 })
          gsap.set(`.cip-desc-${i}`, { opacity: 0, y: 16 })
          gsap.set(`.cip-fix-${i}`, {
            opacity: 0,
            scale: 0.4,
            transformOrigin: "50% 70%",
          })
          gsap.set(`.cip-tab-${i}`, { opacity: i === 0 ? 1 : 0.35 })
          gsap.set(`.cip-tabline-${i}`, {
            scaleX: i === 0 ? 1 : 0,
            transformOrigin: "100% 50%",
          })
        })
        gsap.set(".cip-progress", { scaleX: 0, transformOrigin: "100% 50%" })

        // snap settles the scrub on a fully-revealed beat, never in between
        const beats = STATS.map((_, i) => (i * SEG + SEG * 0.85) / TOTAL)

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: "+=" + STATS.length * 700,
            scrub: 1.2,
            pin: true,
            invalidateOnRefresh: true,
            snap: {
              snapTo: [...beats, 1],
              duration: { min: 0.2, max: 0.6 },
              delay: 0.1,
              ease: "power1.inOut",
            },
          },
        })

        // the ghosted city map slowly zooms across the whole sequence
        tl.to(".cip-map", { scale: 1.12, yPercent: -3, ease: "none", duration: TOTAL }, 0)
        tl.to(".cip-progress", { scaleX: 1, ease: "none", duration: TOTAL }, 0)

        STATS.forEach((s, i) => {
          const at = i * SEG

          if (i > 0) {
            // previous panel + tab hand over to this one
            tl.to(
              `.cip-panel-${i - 1}`,
              { opacity: 0, yPercent: -6, duration: 0.5, ease: "power2.in" },
              at - 0.3,
            )
            tl.to(`.cip-tab-${i - 1}`, { opacity: 0.35, duration: 0.4 }, at - 0.3)
            tl.to(
              `.cip-tabline-${i - 1}`,
              { scaleX: 0, transformOrigin: "0% 50%", duration: 0.4 },
              at - 0.3,
            )
            tl.fromTo(
              `.cip-panel-${i}`,
              { opacity: 0, yPercent: 6 },
              { opacity: 1, yPercent: 0, duration: 0.6, ease: "power3.out" },
              at,
            )
            tl.to(`.cip-tab-${i}`, { opacity: 1, duration: 0.4 }, at)
            tl.to(
              `.cip-tabline-${i}`,
              { scaleX: 1, transformOrigin: "100% 50%", duration: 0.4 },
              at,
            )
          }

          // context chip leads, the number follows
          tl.to(
            `.cip-chip-${i}`,
            { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
            at + 0.05,
          )

          // odometer roll — every column starts together; longer distances
          // spin faster, which is what sells the counter effect
          const digits = digitsOf(s.value)
          digits.forEach((d, j) => {
            tl.to(
              `.cip-col-${i}-${j}`,
              {
                yPercent: -STEP * targetIdx(d, j === digits.length - 1),
                duration: SEG * 0.55,
                ease: "power1.out",
              },
              at + 0.1,
            )
          })

          // ×/% pops once the roll is settling
          tl.to(
            `.cip-fix-${i}`,
            { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
            at + SEG * 0.5,
          )

          // ghost figure drifts sideways behind the whole beat
          tl.fromTo(
            `.cip-ghost-${i}`,
            { xPercent: -4 },
            { xPercent: 4, duration: SEG, ease: "none" },
            at,
          )

          // title rises out of its mask, caption follows
          tl.to(
            `.cip-title-in-${i}`,
            { yPercent: 0, duration: 0.55, ease: "power3.out" },
            at + 0.25,
          )
          tl.to(
            `.cip-desc-${i}`,
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            at + 0.45,
          )
        })

        // hold the last figure a beat before releasing the pin
        tl.to({}, { duration: HOLD })
      })

      // reduced motion — static stack, final values, no pin
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.current!.classList.add("cip-static")
        STATS.forEach((s, i) => {
          const digits = digitsOf(s.value)
          digits.forEach((d, j) => {
            gsap.set(`.cip-col-${i}-${j}`, {
              yPercent: -STEP * targetIdx(d, j === digits.length - 1),
            })
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="impact-claude" className="relative bg-white">
      {/* pinned stage */}
      <div
        ref={stage}
        className="cip-stage relative flex h-screen flex-col overflow-hidden px-6"
      >
        <CityMapBg className="cip-map opacity-40" />

        {/* header */}
        <div className="relative z-20 mx-auto w-full max-w-6xl pt-16 md:pt-20">
          <p className="text-center text-body-5 font-bold tracking-widest text-peacock">
            الأثر
          </p>
          <h2 className="mt-2 text-center font-display text-display-2 text-ink md:text-display-1">
            نتائجُ نفخر بها
          </h2>
        </div>

        {/* stacked figure panels */}
        <div className="cip-panels relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center">
          {STATS.map((s, i) => (
            <div
              key={s.key}
              className={`cip-panel-${i} cip-panel absolute inset-0 flex flex-col items-center justify-center text-center`}
            >
              {/* giant outlined ghost of the figure, drifting behind */}
              <div
                aria-hidden
                className={`cip-ghost-${i} pointer-events-none absolute inset-0 flex items-center justify-center`}
              >
                <span
                  dir="ltr"
                  className="font-body font-extrabold leading-none text-transparent"
                  style={{
                    fontSize: "clamp(220px, 46vw, 560px)",
                    WebkitTextStroke: "1.5px var(--peacock)",
                    opacity: 0.08,
                  }}
                >
                  {s.value}
                </span>
              </div>

              <div className="relative flex flex-col items-center">
                {/* context chip */}
                <span
                  className={`cip-chip-${i} pill inline-flex items-center gap-2 bg-peacock/10 px-4 py-2 text-body-5 font-bold text-horizon`}
                >
                  <span className="rec-blink h-1.5 w-1.5 rounded-full bg-peacock" />
                  {s.chip}
                </span>

                {/* the figure — odometer digit slots */}
                <span
                  dir="ltr"
                  className="mt-4 flex items-center font-body font-extrabold leading-none text-ink"
                  style={{ fontSize: "clamp(96px, 19vw, 230px)" }}
                >
                  {s.prefix && (
                    <span
                      className={`cip-fix-${i} text-peacock`}
                      style={{ fontSize: "0.42em" }}
                    >
                      {s.prefix}
                    </span>
                  )}
                  {digitsOf(s.value).map((_, j) => (
                    <span
                      key={j}
                      className="inline-block overflow-hidden"
                      style={{ height: "1em" }}
                    >
                      <span className={`cip-col-${i}-${j} flex flex-col`}>
                        {COL.map((n, k) => (
                          <span
                            key={k}
                            className="block leading-none"
                            style={{ height: "1em" }}
                          >
                            {n}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
                  {s.suffix && (
                    <span
                      className={`cip-fix-${i} text-peacock`}
                      style={{ fontSize: "0.42em" }}
                    >
                      {s.suffix}
                    </span>
                  )}
                </span>

                {/* title rises out of a mask */}
                <div className="mt-3 overflow-hidden">
                  <h3
                    className={`cip-title-in-${i} font-display text-display-4 text-ink md:text-display-3`}
                  >
                    {s.title}
                  </h3>
                </div>

                <p
                  className={`cip-desc-${i} mt-4 max-w-md text-body-3 leading-relaxed text-subtext`}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* bottom rail — progress line + beat tabs */}
        <div className="relative z-20 mx-auto w-full max-w-6xl pb-8 md:pb-10">
          <div className="relative h-[2px] w-full bg-seashell">
            <div className="cip-progress absolute inset-y-0 right-0 w-full origin-right bg-peacock" />
          </div>
          <div className="mt-4 flex items-start justify-between gap-2">
            {STATS.map((s, i) => (
              <div
                key={s.key}
                className={`cip-tab-${i} flex flex-col gap-1.5 text-body-5 font-bold`}
              >
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-peacock">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="hidden text-subtext sm:inline">
                    {s.title}
                  </span>
                </div>
                <span
                  className={`cip-tabline-${i} block h-0.5 w-full bg-peacock`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
