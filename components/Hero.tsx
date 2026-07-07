"use client"

import { useRef } from "react"
import { ChevronRight24Filled, Play24Filled } from "@fluentui/react-icons"
import { gsap, useGSAP } from "@/lib/gsap"
import CityMapBg from "@/components/CityMapBg"

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

const HEADLINE = ["بلاغٌ واحد،", "طريقٌ واحد،", "حلقةٌ تُغلق"]

/* ── Damage hotspots on the city map ──
   main: the story-seed signal (3 radar rings). Others ping softly.
   Hover / keyboard-focus locks a reading card onto the point.     */
type DamageType = "pothole" | "crack" | "subsidence"

const HOTSPOTS = [
  {
    right: "34%",
    top: "38%",
    hex: "#0072DA",
    label: "حفرة عميقة · ٧٠٪",
    type: "pothole" as DamageType,
    main: true,
    delay: 0,
  },
  {
    right: "58%",
    top: "28%",
    hex: "#FFAB00",
    label: "تشقق تمساحي · ٦٤٪",
    type: "crack" as DamageType,
    main: false,
    delay: 0.7,
  },
  {
    right: "22%",
    top: "62%",
    hex: "#CC3931",
    label: "حفرة خطرة · ٨٥٪",
    type: "pothole" as DamageType,
    main: false,
    delay: 1.4,
  },
  {
    right: "66%",
    top: "64%",
    hex: "#197FB0",
    label: "هبوط إسفلت · ٥٢٪",
    type: "subsidence" as DamageType,
    main: false,
    delay: 2.1,
  },
]

/* Road-damage glyphs — same footprint as the old dot, coloured per state.
   pothole: irregular filled hole · crack: alligator cracking (strokes) ·
   subsidence: dished depression (nested ellipses). */
function DamageGlyph({
  type,
  hex,
  className,
}: {
  type: DamageType
  hex: string
  className?: string
}) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true as const,
    xmlns: "http://www.w3.org/2000/svg",
  }
  if (type === "crack") {
    return (
      <svg {...common} fill="none">
        <path
          d="M12 2v20M3 12h18M5 5l14 14M19 5L5 19"
          stroke={hex}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (type === "subsidence") {
    return (
      <svg {...common} fill="none">
        <ellipse cx="12" cy="13" rx="9.5" ry="6.5" fill={hex} />
        <ellipse cx="12" cy="12" rx="5.5" ry="3.6" fill="#fff" opacity="0.3" />
      </svg>
    )
  }
  // pothole
  return (
    <svg {...common} fill="none">
      <path
        d="M12 3.5c2.7-.3 5.5.7 6.8 2.7 1.2 1.9.3 3.9.7 5.7.4 2 1.7 4-.2 5.5-1.9 1.5-4.9 1.4-7.4.9-2.6-.5-5.2-1.4-6.1-3.6-.9-2.2.4-4.4.5-6.6C7.2 6 9.6 3.9 12 3.5z"
        fill={hex}
      />
    </svg>
  )
}

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
        {/* damage shape replaces the old solid dot */}
        <DamageGlyph
          type={spot.type}
          hex={spot.hex}
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

        /* Orchestrated entrance */
        const tl = gsap.timeline({ defaults: { ease } })
        HEADLINE.forEach((_, i) => {
          tl.from(
            `.hero-line-${i}`,
            { yPercent: 105, duration: T.lineDur },
            [T.line1, T.line2, T.line3][i],
          )
        })
        tl.from(
          ".hero-subtitle",
          { y: 24, opacity: 0, duration: 0.8 },
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
          opacity: 0,
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
          return () => window.removeEventListener("mousemove", onMove)
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 pt-[72px]"
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
          {HEADLINE.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span className={`hero-line-${i} block`}>
                {i === 2 ? (
                  <>
                    حلقةٌ <span className="text-peacock">تُغلق</span>
                  </>
                ) : (
                  line
                )}
              </span>
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
            className="pill flex items-center gap-2 bg-peacock px-8 py-4 text-body-3 font-bold text-white transition-colors hover:bg-horizon"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            احجز عرضاً توضيحياً
            <ChevronRight24Filled aria-hidden />
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
