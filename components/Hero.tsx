"use client"

import { useRef } from "react"
import { ChevronRight24Filled, Play24Filled } from "@fluentui/react-icons"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import CityMapBg from "@/components/CityMapBg"
import LogoArrow from "@/components/LogoArrow"

/* ── Timing constants (seconds) — tune here ─────────────────── */
const T = {
  badge: 0,
  line1: 0.12,
  line2: 0.26,
  line3: 0.4,
  subtitle: 0.56,
  buttons: 0.68,
  lineDur: 0.9,
}

/* Mouse-parallax depths (px at full viewport offset) */
const PARALLAX = { scene: 22, content: -8 }

/* Headline — two lines, each split into words so they can rise
   one-by-one from behind a clip mask. */
const HEADLINE: string[][] = [
  ["بلاغٌ", "واحد،", "طريقٌ", "واحد،"],
  ["حلقةٌ", "تُغلق"],
]

/* ── Damage hotspots on the city map ──
   main: the story-seed signal (3 radar rings). Others ping softly.
   Hover / keyboard-focus locks a reading card onto the point.
   Every marker is the same مسار arrow, tinted per state.          */
const HOTSPOTS = [
  {
    right: "18%",
    top: "24%",
    hex: "#0072DA",
    label: "حفرة عميقة · 70٪",
    main: true,
    delay: 0,
  },
  {
    right: "82%",
    top: "22%",
    hex: "#FFAB00",
    label: "تشقق تمساحي · 64٪",
    main: false,
    delay: 0.7,
  },
  {
    right: "15%",
    top: "76%",
    hex: "#C0625D",
    label: "حفرة خطرة · 85٪",
    main: false,
    delay: 1.4,
  },
  {
    right: "85%",
    top: "72%",

    hex: "#197FB0",
    label: "هبوط إسفلت · 52٪",
    main: false,
    delay: 2.1,
  },
]

function Hotspot({ spot }: { spot: (typeof HOTSPOTS)[number] }) {
  const rings = spot.main ? [0, 1, 2] : [0]
  return (
    <button
      type="button"
      className="hotspot pointer-events-auto absolute"
      style={{ right: spot.right, top: spot.top }}
      aria-label={spot.label}
    >
      <span className="dot-wrap relative block h-6 w-6">
        {rings.map((i) => (
          <span
            key={i}
            className="radar-ring absolute inset-0 rounded-full"
            style={{
              background: spot.hex,
              opacity: 0.4,
              animationDelay: `${spot.delay + i}s`,
            }}
          />
        ))}
        {/* soft glow halo behind the main signal */}
        {spot.main && (
          <span
            className="radar-core absolute inset-0 rounded-full"
            style={{ background: spot.hex, opacity: 0.25 }}
          />
        )}
        {/* the مسار arrow marks every damage point */}
        <LogoArrow
          color={spot.hex}
          className="absolute inset-0 h-full w-full"
        />
        {/* focus-lock ring */}
        <span
          aria-hidden
          className="focus-ring absolute -inset-2.5 rounded-full"
          style={{ boxShadow: `inset 0 0 0 2px ${spot.hex}` }}
        />
      </span>
      {/* reading card */}
      <span className="tip absolute bottom-full right-1/2 mb-4 flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 shadow-[var(--shadow-soft)]">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: spot.hex }}
          aria-hidden
        />
        <span className="text-body-5 font-bold text-ink">{spot.label}</span>
      </span>
    </button>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ease = "power3.out"

        /* Subtitle split into masked lines so it reveals line-by-line */
        const subtitle = root.current!.querySelector(
          ".hero-subtitle",
        ) as HTMLElement
        const split = new SplitText(subtitle, {
          type: "lines",
          mask: "lines",
          linesClass: "hero-sub-line",
        })

        /* Orchestrated entrance — title words rise one-by-one from clip
           masks; the subtitle rises line-by-line under them. */
        const tl = gsap.timeline({ defaults: { ease } })
        tl.from(
          ".hero-word",
          { yPercent: 115, duration: T.lineDur, stagger: 0.09 },
          T.line1,
        )
        tl.set(subtitle, { opacity: 1 }, 0)
        tl.from(
          split.lines,
          { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.14 },
          T.subtitle,
        )
        tl.from(
          ".hero-buttons",
          { y: 24, opacity: 0, duration: 0.8 },
          T.buttons,
        )
        tl.from(
          ".hotspot",
          {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            stagger: 0.12,
            ease: "back.out(2)",
          },
          0.9,
        )

        /* Scroll: camera pushes into the city while the text lifts away */
        gsap.to(".hero-scene", {
          scale: 1.14,
          yPercent: -9,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        gsap.to(".hero-content", {
          yPercent: -28,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "75% top",
            scrub: true,
          },
        })

        /* Mouse parallax — the map drifts against the cursor (fine pointers only) */
        const fine = window.matchMedia("(pointer: fine)").matches
        if (fine) {
          const sceneX = gsap.quickTo(".hero-scene", "x", {
            duration: 0.8,
            ease,
          })
          const sceneY = gsap.quickTo(".hero-scene", "y", {
            duration: 0.8,
            ease,
          })
          const contentX = gsap.quickTo(".hero-content", "x", {
            duration: 1,
            ease,
          })

          const onMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5
            const ny = e.clientY / window.innerHeight - 0.5
            sceneX(nx * PARALLAX.scene)
            sceneY(ny * PARALLAX.scene * 0.6)
            contentX(nx * PARALLAX.content)
          }
          window.addEventListener("mousemove", onMove)
          return () => {
            window.removeEventListener("mousemove", onMove)
            split.revert()
          }
        }

        return () => split.revert()
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="top"
      className="sticky top-0 z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 pt-[72px]"
    >
      {/* City scene: map + live damage hotspots move as one layer */}
      <div className="hero-scene absolute inset-0">
        <CityMapBg className="opacity-50" />
        <div className="absolute inset-0" aria-hidden={false}>
          {HOTSPOTS.map((spot) => (
            <Hotspot key={spot.label} spot={spot} />
          ))}
        </div>
      </div>

      <div className="hero-content pointer-events-none relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Headline — each line rises from behind a clip mask */}
        <h1
          className="font-display text-ink"
          style={{ fontSize: "clamp(38px, 7vw, 82px)", lineHeight: 1.16 }}
        >
          {HEADLINE.map((words, li) => (
            <span
              key={li}
              className="flex flex-wrap justify-center gap-x-[0.28em]"
            >
              {words.map((word, wi) => {
                const isClose = li === 1 && wi === 1 // "تُغلق"
                return (
                  <span key={wi} className="block overflow-hidden pb-[0.06em]">
                    <span
                      className={`hero-word block ${isClose ? "text-peacock" : ""}`}
                    >
                      {word}
                    </span>
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle mt-8 max-w-[660px] text-subtext"
          style={{ fontSize: 21, lineHeight: 1.9 }}
        >
          مسار يحوّل بلاغات الطرق المتناثرة — من{" "}
          <strong className="font-bold text-ink">مكالمة وواتساب وورقة</strong> —
          إلى مسارٍ واحد واضح: يُكتشف، يُسنَد، يُصلَح، ويُغلَق. كل ذلك على خريطة
          مدينتك.
        </p>

        {/* Buttons */}
        <div className="hero-buttons pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#contact"
            data-cursor="invert"
            className="group flex items-center gap-[11px] rounded-[99px] bg-[#0E1312] px-[30px] py-[15px] text-[17px] font-[800] text-[#F2F0E8] transition-transform hover:scale-[1.03]"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            <span className="relative block h-[20px] w-[18px] overflow-hidden">
              <svg
                width="18"
                height="20"
                viewBox="0 0 19 21"
                fill="none"
                className="absolute inset-0 transition-transform duration-300 ease-out group-hover:-translate-y-[150%]"
              >
                <path
                  d="M11.0001 0.496532L0.142295 19.122C-0.379772 20.0175 0.637915 21.0181 1.52446 20.4808L9.46083 15.6717C9.81279 15.4584 10.2595 15.4825 10.5864 15.7325L16.9929 20.6301C17.7649 21.2203 18.84 20.4739 18.5569 19.5443L12.8206 0.708826C12.5664 -0.126008 11.4396 -0.257404 11.0001 0.496532Z"
                  fill="#34A8D9"
                />
              </svg>
              <svg
                width="18"
                height="20"
                viewBox="0 0 19 21"
                fill="none"
                className="absolute inset-0 translate-y-[150%] transition-transform duration-300 ease-out group-hover:translate-y-0"
              >
                <path
                  d="M11.0001 0.496532L0.142295 19.122C-0.379772 20.0175 0.637915 21.0181 1.52446 20.4808L9.46083 15.6717C9.81279 15.4584 10.2595 15.4825 10.5864 15.7325L16.9929 20.6301C17.7649 21.2203 18.84 20.4739 18.5569 19.5443L12.8206 0.708826C12.5664 -0.126008 11.4396 -0.257404 11.0001 0.496532Z"
                  fill="#34A8D9"
                />
              </svg>
            </span>
            <span>احجز عرضاً توضيحياً</span>
          </a>
          <a
            href="#path"
            className="pill flex items-center gap-2 bg-whitesmoke px-8 py-4 text-body-3 font-bold text-ink shadow-[var(--shadow-soft)] transition-colors hover:bg-seashell"
          >
            <Play24Filled className="text-peacock" aria-hidden />
            شاهد كيف يعمل
          </a>
        </div>
      </div>
    </section>
  )
}
