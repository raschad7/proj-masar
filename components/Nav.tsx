"use client"

import { useRef, useState } from "react"
import { ArrowLeft20Filled } from "@fluentui/react-icons"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { useLenis } from "@/lib/lenis"

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

      /* CTA live-dot pulse */
      if (!reduce) {
        gsap.to(".nav-pulse", {
          scale: 1.5,
          opacity: 0.55,
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        })
      }

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
        <button type="button" onClick={toTop} aria-label="مسار — أعلى الصفحة">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/Logo 6.svg" alt="مسار" className="h-14 w-14" />
        </button>
      </div>

      {/* ── floating CTA (top-left, magnetic) — no card ── */}
      <div ref={ctaWrapRef} className="fixed left-6 top-6 z-50">
        <button
          ref={ctaRef}
          type="button"
          onClick={() => scrollToId("contact")}
          className="group flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="nav-pulse absolute inset-0 rounded-full bg-positive" />
            <span className="relative h-2 w-2 rounded-full bg-positive" />
          </span>
          <span className="text-[15px] font-bold text-ink">احجز عرضاً</span>
          <ArrowLeft20Filled
            className="text-peacock transition-transform duration-300 group-hover:-translate-x-1"
            aria-hidden
          />
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
                  <span
                    className={`nav-tick h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${
                      isActive
                        ? "bg-peacock"
                        : "bg-mutedtext group-hover:bg-peacock"
                    }`}
                    aria-hidden
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
