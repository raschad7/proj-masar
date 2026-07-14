"use client"

import { useRef } from "react"
import Image from "next/image"
import { gsap, useGSAP } from "@/lib/gsap"

/* BentoGridImpact — a premium bento grid for «الأثر».
   · fonts: Almarai (body) throughout
   · reveal: cards + photos fade in (slow), staggered
   · photos: parallax drift + hover zoom & caption
   · figures: mechanical odometer, scrubbed 0 → target with the scroll
   · the wide "70%" lifts out of the street through a road-line mask
   Reduced motion: everything renders settled (odometers show target). */

const HERO = {
  value: 70,
  suffix: "%",
  title: "خفضٌ في كلفة الصيانة الطارئة",
  img: "/impactPics/wideStreet.png",
  alt: "شارع المدينة",
}

const NUMS = [
  { value: 90, suffix: "%", title: "دقة الكشف التلقائي" },
  { value: 60, suffix: "%", title: "شكاوى متكررة أقلّ" },
]

const PHOTOS = [
  {
    img: "/impactPics/Carscaner.png",
    alt: "مركبة المسح",
    caption: "مركبة المسح الذكية",
  },
  {
    img: "/impactPics/people.png",
    alt: "أهالي المدينة",
    caption: "طرقٌ أأمن للأهالي",
  },
  {
    img: "/impactPics/fixer.png",
    alt: "فريق الصيانة",
    caption: "فريق الصيانة الميداني",
  },
]

/* ── Odometer ──────────────────────────────────────────────────────
   One column per digit; each column is an 11-tall strip [0…9,0] where
   the trailing 0 lets the wheel wrap 9→0 seamlessly. translateY is set
   (em units) per frame by the scrubbed timeline. Initial inline style
   shows the *target* so no-JS / reduced-motion renders the final value. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

function digitPos(value: number, colCount: number, c: number) {
  const divisor = Math.pow(10, colCount - 1 - c)
  return (value / divisor) % 10
}

function Odometer({ value }: { value: number }) {
  const cols = String(value).split("")
  return (
    <span
      dir="ltr"
      className="bgi-odo inline-flex leading-none tabular-nums"
      data-target={value}
    >
      {cols.map((_, c) => (
        <span
          key={c}
          className="inline-block overflow-hidden"
          style={{ height: "1em" }}
        >
          <span
            className="bgi-odo-strip flex flex-col"
            style={{
              transform: `translateY(-${digitPos(value, cols.length, c)}em)`,
            }}
          >
            {STRIP.map((d, i) => (
              <span
                key={i}
                className="flex items-center justify-center"
                style={{ height: "1em" }}
              >
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

function Figure({
  value,
  suffix,
  className,
  suffixClassName,
}: {
  value: number
  suffix?: string
  className?: string
  suffixClassName?: string
}) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-end font-body ${className ?? ""}`}
    >
      <Odometer value={value} />
      {suffix && (
        <span className={`leading-none ${suffixClassName ?? ""}`}>
          {suffix}
        </span>
      )}
    </span>
  )
}

export default function BentoGridImpact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── staging ──
        gsap.set(".bgi-eyebrow", { opacity: 0, y: 10 })
        gsap.set(".bgi-head-in", { yPercent: 110 })
        gsap.set(".bgi-card", { opacity: 0, y: 26 })
        // parallax headroom — images sit oversized, drift with scroll
        gsap.set(".bgi-photo-img", { scale: 1.18, yPercent: -7 })
        // the street figure waits below its road-line mask
        gsap.set(".bgi-street-rise", { yPercent: 118 })
        gsap.set(".bgi-street-cap", { opacity: 0, y: 12 })
        // odometers start at zero
        gsap.set(".bgi-odo-strip", { y: 0 })

        // ── 1) reveal on enter — slow fade ──
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            toggleActions: "play none none none",
          },
        })
        reveal
          .to(
            ".bgi-eyebrow",
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0,
          )
          .to(
            ".bgi-head-in",
            { yPercent: 0, duration: 0.6, ease: "power3.out" },
            0.05,
          )
          .to(
            ".bgi-card",
            {
              opacity: 1,
              y: 0,
              duration: 1.5,
              ease: "power2.out",
              stagger: 0.16,
            },
            0.3,
          )
          .to(
            ".bgi-street-cap",
            { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
            1.4,
          )

        // ── 2) parallax — every photo drifts inside its frame ──
        gsap.utils.toArray<HTMLElement>(".bgi-photo-img").forEach((img) => {
          gsap.to(img, {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: img,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2, // Smoothed out to match the CTA section
            },
          })
        })

        // ── 3) Count the numbers up — scroll-driven. It STARTS as the section
        //    rises into view and FINISHES as the section reaches the top (where
        //    it sticks), so the count plays out while you scroll down and is
        //    settled by the time the hand-off to the next section begins.
        //    Tune: `start` = when it begins · `end` = when it finishes.
        const count = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%", // begins while scrolling down toward it
            end: "top 15%", // finishes just before the section locks
            scrub: 2,
          },
        })
        count.to(
          ".bgi-street-rise",
          { yPercent: 0, ease: "power2.out", duration: 1 },
          0,
        )
        gsap.utils.toArray<HTMLElement>(".bgi-odo").forEach((odo) => {
          const target = Number(odo.dataset.target)
          const strips = gsap.utils.toArray<HTMLElement>(".bgi-odo-strip", odo)
          const proxy = { v: 0 }

          count.to(
            proxy,
            {
              v: target,
              ease: "none",
              duration: 1,
              onUpdate: () => {
                strips.forEach((strip, c) => {
                  const pos = digitPos(proxy.v, strips.length, c)
                  strip.style.transform = `translateY(-${pos}em)`
                })
              },
            },
            0,
          )
        })

        // ── 4) Scroll-pause: pin the section for a duration to match DetectionFootage
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1,
          },
        })
        // We just hold it empty, or add a subtle effect if desired, but 
        // to match detection video exactly in duration and mechanics:
        pinTl.to({}, { duration: 1 })
      })

      // reduced motion — nothing staged; odometers keep their target
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="impact-bento"
      className="relative z-0 flex min-h-screen flex-col justify-center overflow-hidden bg-white px-6 pt-8 pb-20 md:pt-10 md:pb-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* header */}

        <div className="mt-2 overflow-hidden">
          <h2 className="bgi-head-in text-center font-display text-display-2 text-ink md:text-display-1">
            نتائجُ نفخر بها
          </h2>
        </div>

        {/* bento grid */}
        <div
          dir="rtl"
          className="mt-10 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-12 md:gap-5"
        >
          {/* ── wide hero (70%) — number lifts out of the street ── */}
          <div className="bgi-card relative col-span-1 min-h-[300px] overflow-hidden rounded-[28px] md:col-span-6 md:min-h-[32vh]">
            <Image
              src={HERO.img}
              alt={HERO.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="bgi-photo-img object-cover"
            />
            {/* centered figure, masked at the road line */}
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-5 md:pt-6 text-center">
              <div className="overflow-hidden">
                <div className="bgi-street-rise">
                  <Figure
                    value={HERO.value}
                    suffix={HERO.suffix}
                    className="text-5xl text-ink md:text-8xl"
                    suffixClassName="text-[0.5em] text-ink"
                  />
                </div>
              </div>
              <p className="bgi-street-cap mt-3 font-body text-lg font-medium leading-snug text-subtext md:text-xl">
                {HERO.title}
              </p>
            </div>
          </div>

          {/* ── two number cards ── */}
          {NUMS.map((n) => (
            <div
              key={n.title}
              className="bgi-card flex min-h-[200px] flex-col items-center justify-center rounded-[28px] bg-whitesmoke px-6 py-8 text-center md:col-span-3 md:min-h-[32vh]"
            >
              <Figure
                value={n.value}
                suffix={n.suffix}
                className="text-5xl text-ink md:text-6xl"
                suffixClassName="text-[0.5em] text-ink"
              />
              <p className="mt-3 max-w-[12rem] font-body text-lg font-medium leading-snug text-subtext md:text-xl">
                {n.title}
              </p>
            </div>
          ))}

          {/* ── bottom row — three photos (hover: zoom + caption) ── */}
          {PHOTOS.map((p) => (
            <div
              key={p.img}
              className="bgi-card group relative min-h-[240px] overflow-hidden rounded-[28px] md:col-span-4 md:min-h-[26vh]"
            >
              <div className="absolute inset-0 scale-[1.10] transition-transform duration-[600ms] ease-out group-hover:scale-[1.16]">
                <Image
                  src={p.img}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="bgi-photo-img object-cover"
                />
              </div>
              {/* caption slides up on hover */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-5 pt-10 transition-transform duration-[450ms] ease-out group-hover:translate-y-0">
                <p dir="rtl" className="font-body text-lg font-bold text-white">
                  {p.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
