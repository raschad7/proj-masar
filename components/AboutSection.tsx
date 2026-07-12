"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import LogoArrow from "@/components/LogoArrow"

/* AboutSection — "تعريف مسار" as a crosshair blueprint on solid brand blue.
   The definition spans the top; four questions sit in a 2×2 grid split by
   a crosshair that draws in from the centre. The مسار mark at the centre
   acts as a COMPASS: hover any quadrant and it rotates to point at it, and
   an AI-style detection reticle (corner brackets) snaps around the quadrant
   — echoing how Masar locks onto road damage. Hover the centre mark itself
   → it spins. On scroll-in the questions rise word by word and the cross
   draws itself. White cursor over the blue (data-cursor="invert").
   Reduced motion → the blueprint is simply present. */

type Cell = {
  key: string
  index: string
  q: string
  a: string
  angle: number // where the compass points when this cell is hovered
}

/* Grid order is RTL: first cell = top-right, then top-left, bottom-right,
   bottom-left. Angles rotate the (downward) مسار mark to aim at the cell. */
const CELLS: Cell[] = [
  {
    key: "who",
    index: "01",
    q: "لمن؟",
    a: "للبلدية، لا للمواطن. أداةٌ داخلية لفرق الميدان والمشرفين وإدارة الصيانة.",
    angle: -135, // ↗ top-right
  },
  {
    key: "problem",
    index: "02",
    q: "ما المشكلة التي يحلّها؟",
    a: "بلاغات الطرق موزّعة على مكالمات وواتساب وأوراق. أعطالٌ تسقط بلا متابعة، لا سجلّ موثّق، والاكتشاف يأتي متأخراً.",
    angle: 135, // ↖ top-left
  },
  {
    key: "how",
    index: "03",
    q: "كيف يحلّها؟",
    a: "رصدٌ تلقائي بالذكاء الاصطناعي يحدّد الخطورة والموقع على الخريطة، ثم يُتابَع كل عطلٍ حتى يُغلق بدليل.",
    angle: -45, // ↘ bottom-right
  },
  {
    key: "goal",
    index: "04",
    q: "هدفنا",
    a: "طرقٌ أكثر أماناً وبلديةٌ تُدار بالبيانات لا بالورق — صيانةٌ استباقية قبل أن يتفاقم العطل.",
    angle: 45, // ↙ bottom-left
  },
]

const DEFINITION =
  "منظومة ذكية للبلديات تُعيد ابتكار صيانة الطرق — تكتشف الأعطال تلقائياً وتتابعها حتى الإغلاق، في مصدرٍ واحد."

/* Split a string into word spans so each rises from its own clip mask. */
function Words({ text, cls }: { text: string; cls: string }) {
  return (
    <span className="inline">
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        className="inline-flex flex-wrap justify-center gap-x-[0.28em]"
      >
        {text.split(" ").map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.1em]">
            <span className={`${cls} inline-block will-change-transform`}>
              {w}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}

/* Four corner brackets that snap inward on hover — an AI detection reticle. */
function Reticle() {
  const base =
    "ab-cnr pointer-events-none absolute h-5 w-5 border-white/85 opacity-0 transition-all duration-300 group-hover:opacity-100"
  return (
    <>
      <span
        aria-hidden
        className={`${base} left-4 top-4 -translate-x-2 -translate-y-2 border-l-2 border-t-2 group-hover:translate-x-0 group-hover:translate-y-0`}
      />
      <span
        aria-hidden
        className={`${base} right-4 top-4 translate-x-2 -translate-y-2 border-r-2 border-t-2 group-hover:translate-x-0 group-hover:translate-y-0`}
      />
      <span
        aria-hidden
        className={`${base} bottom-4 left-4 -translate-x-2 translate-y-2 border-b-2 border-l-2 group-hover:translate-x-0 group-hover:translate-y-0`}
      />
      <span
        aria-hidden
        className={`${base} bottom-4 right-4 translate-x-2 translate-y-2 border-b-2 border-r-2 group-hover:translate-x-0 group-hover:translate-y-0`}
      />
    </>
  )
}

export default function AboutSection() {
  const root = useRef<HTMLElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const rotTo = useRef<((v: number) => void) | null>(null)
  const spin = useRef<gsap.core.Tween | null>(null)

  useGSAP(
    () => {
      // smooth compass rotation setter
      rotTo.current = gsap.quickTo(arrowRef.current, "rotation", {
        duration: 0.6,
        ease: "power3.out",
      })

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".ab-word", { yPercent: 120 })
        gsap.set(".ab-answer", { opacity: 0, y: 22 })
        gsap.set(".ab-cell", { opacity: 0, y: 26 })
        gsap.set(".ab-vline", { scaleY: 0, transformOrigin: "50% 50%" })
        gsap.set(".ab-hline", { scaleX: 0, transformOrigin: "50% 50%" })
        gsap.set(".ab-node", { scale: 0, opacity: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 62%",
            once: true,
          },
        })

        tl.to(".ab-head .ab-word", {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: "power3.out",
        })
        tl.to(
          ".ab-head .ab-answer",
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.5",
        )
        tl.to(".ab-vline", { scaleY: 1, duration: 0.7, ease: "power3.inOut" }, "-=0.3")
        tl.to(".ab-hline", { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, "<")
        tl.to(
          ".ab-node",
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.3",
        )
        CELLS.forEach((c, i) => {
          const at = i === 0 ? "-=0.25" : "-=0.45"
          tl.to(`.ab-cell-${i}`, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, at)
          tl.to(
            `.ab-cell-${i} .ab-word`,
            { yPercent: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" },
            "<",
          )
          tl.to(
            `.ab-cell-${i} .ab-answer`,
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "<0.1",
          )
        })
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".ab-word, .ab-answer, .ab-cell, .ab-vline, .ab-hline, .ab-node",
          { clearProps: "all" },
        )
      })
    },
    { scope: root },
  )

  const aim = (angle: number) => {
    spin.current?.kill()
    spin.current = null
    rotTo.current?.(angle)
  }
  const resetAim = () => {
    spin.current?.kill()
    spin.current = null
    rotTo.current?.(0)
  }
  // hover the centre mark → keep spinning it
  const startSpin = () => {
    if (spin.current) return
    spin.current = gsap.to(arrowRef.current, {
      rotation: "+=360",
      duration: 0.7,
      ease: "none",
      repeat: -1,
    })
  }
  const stopSpin = () => {
    spin.current?.kill()
    spin.current = null
    rotTo.current?.(0)
  }

  return (
    <section
      ref={root}
      id="about"
      data-cursor="invert"
      className="ab-section relative z-10 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#16668E] px-6 py-8 text-white"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center">
        {/* Eyebrow */}
        <p className="text-center text-body-5 font-bold tracking-widest text-white/70">
          تعريف مسار
        </p>

        {/* The definition — spans the top */}
        <div className="ab-head mx-auto mt-4 max-w-4xl text-center">
          <h2
            className="font-display text-white"
            style={{ fontSize: 42, lineHeight: 1.25 }}
          >
            <Words text="ما هو مسار؟" cls="ab-word" />
          </h2>
          <p
            className="ab-answer mx-auto mt-4 max-w-2xl leading-relaxed text-white/85"
            style={{ fontSize: 18, lineHeight: 1.85 }}
          >
            {DEFINITION}
          </p>
        </div>

        {/* Crosshair blueprint */}
        <div className="relative mt-6 md:mt-10" onMouseLeave={resetAim}>
          {/* dividers (desktop only) */}
          <div
            aria-hidden
            className="ab-vline pointer-events-none absolute inset-y-0 right-1/2 hidden w-px translate-x-1/2 bg-white/25 md:block"
          />
          <div
            aria-hidden
            className="ab-hline pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-white/25 md:block"
          />
          {/* centre compass — aims at hovered cell; spins when hovered itself */}
          <div
            className="ab-node absolute left-1/2 top-1/2 z-20 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] md:flex"
            onMouseEnter={startSpin}
            onMouseLeave={stopSpin}
          >
            <span
              ref={arrowRef}
              className="flex h-5 w-5 items-center justify-center"
            >
              <LogoArrow color="#16668E" className="h-5 w-5" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {CELLS.map((c, i) => (
              <div
                key={c.key}
                onMouseEnter={() => aim(c.angle)}
                className={`ab-cell ab-cell-${i} group relative flex flex-col items-center px-6 py-5 text-center transition-colors duration-300 hover:bg-white/[0.04] md:px-14 md:py-6`}
              >
                <Reticle />
                <div className="relative z-10 flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <span className="font-body text-body-5 font-extrabold tabular-nums text-white/80">
                      {c.index}
                    </span>
                    <span className="h-px w-8 bg-white/40" aria-hidden />
                  </div>
                  <h3
                    className="font-display text-white"
                    style={{ fontSize: 42, lineHeight: 1.2 }}
                  >
                    <Words text={c.q} cls="ab-word" />
                  </h3>
                  <p
                    className="ab-answer mx-auto mt-4 max-w-md leading-relaxed text-white/85"
                    style={{ fontSize: 18, lineHeight: 1.85 }}
                  >
                    {c.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .ab-section { min-height: 0; }
        }
      `}</style>
    </section>
  )
}
