"use client"

import { useRef, useState } from "react"
import { ArrowLeft20Filled } from "@fluentui/react-icons"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { useLenis } from "@/lib/lenis"
import LogoArrow from "@/components/LogoArrow"

/* ── The nav IS the مسار — now vertical ───────────────────────────
   A floating island on the right: a vertical path whose marker (the
   report dot) glides DOWN as you scroll, the trail filling in behind
   it. Active section = ink; the rest muted, its label popping out on
   hover/active. Logo + CTA float free and hide on scroll-down.        */

const SECTIONS = [
  { n: "٠١", label: "المسار", id: "path" },
  { n: "٠٢", label: "الأدوار", id: "roles" },
  { n: "٠٣", label: "الميزات", id: "features" },
  { n: "٠٤", label: "التطبيق", id: "gallery" },
  { n: "٠٥", label: "الأثر", id: "impact" },
  { n: "٠٦", label: "تواصل", id: "contact" },
]
const N = SECTIONS.length

/* vertical geometry (px) — rows are STEP tall, dot centered in each */
const STEP = 42
const OFFSET = STEP / 2 // 21 → dot0 sits at the first row's center
const TRACK_H = (N - 1) * STEP // 210
const ROWS_H = N * STEP // 252
const yOf = (i: number) => OFFSET + i * STEP

export default function Nav() {
  const navRef = useRef<HTMLElement>(null)
  const islandRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const ctaWrapRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(0)
  const lenis = useLenis()

  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.1 })
    else el.scrollIntoView({ behavior: "smooth" })
  }
  const toTop = () =>
    lenis ? lenis.scrollTo(0, { duration: 1 }) : window.scrollTo({ top: 0 })

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      /* ── section offsets (cached, recomputed on layout changes) ── */
      let tops: number[] = []
      let docEnd = 0
      const measure = () => {
        tops = SECTIONS.map((s) => {
          const el = document.getElementById(s.id)
          return el ? el.getBoundingClientRect().top + window.scrollY : 0
        })
        docEnd = document.documentElement.scrollHeight
      }
      measure()
      document.fonts?.ready.then(measure)
      window.addEventListener("resize", measure)
      ScrollTrigger.addEventListener("refresh", measure)

      /* ── magnetic vertical follow ── */
      let cur = 0
      let last = -1
      const apply = (f: number) => {
        if (markerRef.current) gsap.set(markerRef.current, { y: f * TRACK_H })
        if (fillRef.current) gsap.set(fillRef.current, { scaleY: f })
      }
      const tick = () => {
        const y = window.scrollY + window.innerHeight * 0.4
        let p = 0
        if (y >= tops[0]) {
          let i = 0
          for (; i < N - 1; i++) if (y < tops[i + 1]) break
          const segStart = tops[i]
          const segEnd = i < N - 1 ? tops[i + 1] : docEnd
          const local = gsap.utils.clamp(
            0,
            1,
            (y - segStart) / (segEnd - segStart || 1),
          )
          p = Math.min(N - 1, i + local)
        }
        const targetFrac = p / (N - 1)
        const idx = Math.round(p)
        if (idx !== last) {
          last = idx
          setActive(idx)
        }
        cur += (targetFrac - cur) * (reduce ? 1 : 0.14)
        apply(cur)
      }
      gsap.ticker.add(tick)



      /* ── island draws in on first scroll ── */
      const playReveal = () => {
        if (reduce) {
          gsap.set(islandRef.current, { autoAlpha: 1, x: 0 })
          return
        }
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            islandRef.current,
            { autoAlpha: 0, x: 18 },
            { autoAlpha: 1, x: 0, duration: 0.5 },
            0,
          )
          .from(
            ".nav-line-base",
            { scaleY: 0, transformOrigin: "50% 0%", duration: 0.6 },
            0.05,
          )
          .from(".nav-tick", { scale: 0, stagger: 0.05, duration: 0.3 }, 0.15)
          .from(
            ".nav-marker",
            { scale: 0, duration: 0.35, ease: "back.out(2)" },
            0.4,
          )
      }
      let revealed = false

      /* ── scroll-direction hide/show for logo + CTA (standard) ── */
      let lastY = window.scrollY
      let hidden = false
      const floaters = [logoRef.current, ctaWrapRef.current].filter(Boolean)
      const setHidden = (h: boolean) => {
        hidden = h
        gsap.to(floaters, {
          y: h ? -90 : 0,
          autoAlpha: h ? 0 : 1,
          duration: reduce ? 0 : 0.45,
          ease: "power3.out",
        })
      }
      const onScroll = () => {
        const y = window.scrollY
        /* island reveal, once */
        if (!revealed && y > 40) {
          revealed = true
          playReveal()
        }
        /* floaters: shown near top; hide on down, show on up */
        if (y < 60) {
          if (hidden) setHidden(false)
        } else if (y > lastY + 2 && !hidden) {
          setHidden(true)
        } else if (y < lastY - 2 && hidden) {
          setHidden(false)
        }
        lastY = y
      }
      window.addEventListener("scroll", onScroll, { passive: true })

      /* ── magnetic CTA ── */
      let cleanupCta = () => {}
      if (!reduce && ctaRef.current) {
        const cta = ctaRef.current
        const mx = gsap.quickTo(cta, "x", { duration: 0.4, ease: "power3" })
        const my = gsap.quickTo(cta, "y", { duration: 0.4, ease: "power3" })
        const onMove = (e: MouseEvent) => {
          const r = cta.getBoundingClientRect()
          mx((e.clientX - (r.left + r.width / 2)) * 0.35)
          my((e.clientY - (r.top + r.height / 2)) * 0.35)
        }
        const onLeave = () => {
          mx(0)
          my(0)
        }
        cta.addEventListener("mousemove", onMove)
        cta.addEventListener("mouseleave", onLeave)
        cleanupCta = () => {
          cta.removeEventListener("mousemove", onMove)
          cta.removeEventListener("mouseleave", onLeave)
        }
      }

      return () => {
        gsap.ticker.remove(tick)
        window.removeEventListener("resize", measure)
        ScrollTrigger.removeEventListener("refresh", measure)
        window.removeEventListener("scroll", onScroll)
        cleanupCta()
      }
    },
    { scope: navRef },
  )

  return (
    <nav ref={navRef} aria-label="التنقل الرئيسي">
      {/* ── floating logo (top-right) — no card, larger ── */}
      <div ref={logoRef} className="fixed right-6 top-5 z-50">
        <button type="button" onClick={toTop} aria-label="مسار — أعلى الصفحة" data-cursor="invert" className="nav-logo-btn block">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-14 w-14">
            <rect width="56" height="56" rx="16" fill="#34A8D9"/>
            <path className="logo-arrow logo-arrow-1" d="M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z" fill="#111717"/>
            <path className="logo-arrow logo-arrow-2" d="M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z" fill="#111717"/>
            <path className="logo-arrow logo-arrow-3" d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z" fill="#111717"/>
          </svg>
        </button>
      </div>

      {/* ── floating CTA (top-left, magnetic) — no card ── */}
      <div ref={ctaWrapRef} className="fixed left-6 top-6 z-50">
        <button
          ref={ctaRef}
          type="button"
          onClick={() => scrollToId("contact")}
          className="group relative flex items-center gap-2"
        >
          <span className="nav-cta-pulse flex items-center gap-2">
            <span className="relative">
              <span className="text-[15px] font-bold text-ink">احجز عرضاً</span>
              <span className="nav-cta-underline absolute -bottom-1 left-0 h-[2px] w-full bg-peacock" aria-hidden />
            </span>
            <ArrowLeft20Filled
              className="nav-cta-arrow text-peacock"
              aria-hidden
            />
          </span>
        </button>
      </div>

      {/* ── vertical progress island (right, centered) — expands on hover ── */}
      <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div
          ref={islandRef}
          className="nav-island card-surface group relative w-[54px] overflow-hidden py-3 transition-[width] duration-300 ease-out hover:w-[130px]"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <div className="relative" style={{ height: ROWS_H }}>
            {/* base track */}
            <div
              className="nav-line-base absolute rounded-full bg-seashell"
              style={{ top: OFFSET, height: TRACK_H, width: 2, right: 15 }}
            />
            {/* traveled fill (top → down) */}
            <div
              ref={fillRef}
              className="absolute rounded-full"
              style={{
                top: OFFSET,
                height: TRACK_H,
                width: 2,
                right: 15,
                transformOrigin: "50% 0%",
                transform: "scaleY(0)",
                background:
                  "linear-gradient(180deg,#088A20 0%,#34A8D8 55%,#0072DA 100%)",
              }}
            />
            {/* the marker — the report dot */}
            <div
              ref={markerRef}
              className="nav-marker absolute rounded-full bg-ink shadow-[0_0_0_4px_var(--white)]"
              style={{ top: 14, right: 9, width: 14, height: 14 }}
            />

            {/* section rows — labels reveal + go blue when the island opens */}
            {SECTIONS.map((s, i) => {
              const isActive = i === active
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToId(s.id)}
                  aria-label={s.label}
                  aria-current={isActive ? "true" : undefined}
                  className="relative flex w-full items-center justify-end gap-2.5 pr-3"
                  style={{ height: STEP }}
                >
                  <span
                    className={`whitespace-nowrap text-[13px] font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                      isActive ? "text-peacock" : "text-ink"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold tracking-widest transition-colors duration-300 ${
                      isActive
                        ? "text-peacock"
                        : "text-mutedtext group-hover:text-peacock"
                    }`}
                  >
                    {s.n}
                  </span>
                  <LogoArrow
                    color={
                      isActive
                        ? "var(--peacock)"
                        : "currentColor"
                    }
                    className={`nav-tick h-3.5 w-3 shrink-0 transition-colors duration-300 ${
                      isActive
                        ? "text-peacock"
                        : "text-mutedtext group-hover:text-peacock"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
