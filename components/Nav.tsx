"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ArrowLeft20Filled } from "@fluentui/react-icons"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { useLenis } from "@/lib/lenis"

/* ── The nav IS the مسار — now vertical ───────────────────────────
   A floating island on the right: a vertical path whose marker (the
   report dot) glides DOWN as you scroll, the trail filling in behind
   it. Active section = ink; the rest muted, its label popping out on
   hover/active. Logo + CTA float free and hide on scroll-down.        */

const SECTIONS = [
  { n: "01", label: "الرئيسية", id: "top" },
  { n: "02", label: "عن مسار", id: "about" },
  { n: "03", label: "المسار", id: "path" },
  { n: "04", label: "الأدوار", id: "roles" },
  { n: "05", label: "الميزات", id: "features" },
  { n: "06", label: "كيف يعمل", id: "tech" },
  { n: "07", label: "الأثر", id: "impact-claude" },
  { n: "08", label: "تواصل", id: "contact" },
  { n: "09", label: "من الميدان", id: "grid-showcase" },
]
const N = SECTIONS.length

export default function Nav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const islandRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const ctaWrapRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const centerWrapRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(0)
  const [inFooter, setInFooter] = useState(false)
  const [inAbout, setInAbout] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  /* The overlay's hover-preview images are invisible until the menu opens,
     yet next/image fetched all five right after hydration (the hidden
     overlay still intersects the viewport). Mount them on first open. */
  const [menuImagesReady, setMenuImagesReady] = useState(false)
  const lenis = useLenis()

  useEffect(() => {
    if (menuOpen) {
      setMenuImagesReady(true)
      document.body.style.overflow = "hidden"
      
      const handleScrollAttempt = () => {
        setMenuOpen(false)
      }
      
      window.addEventListener("wheel", handleScrollAttempt, { passive: true })
      window.addEventListener("touchmove", handleScrollAttempt, { passive: true })
      window.addEventListener("scroll", handleScrollAttempt, { passive: true })
      
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("wheel", handleScrollAttempt)
        window.removeEventListener("touchmove", handleScrollAttempt)
        window.removeEventListener("scroll", handleScrollAttempt)
      }
    } else {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const scrollToId = (id: string) => {
    if (id === "top") {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 })
      else window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const el = document.getElementById(id)
    if (!el) return
    const target = (el.closest('.pin-spacer') as HTMLElement) || el
    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.1 })
    else target.scrollIntoView({ behavior: "smooth" })
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
          if (!el) return 0
          const target = el.closest('.pin-spacer') || el
          return target.getBoundingClientRect().top + window.scrollY
        })
        docEnd = document.documentElement.scrollHeight
      }
      measure()
      document.fonts?.ready.then(measure)
      window.addEventListener("resize", measure)
      ScrollTrigger.addEventListener("refresh", measure)

      /* ── active-section tracking (drives which tick is lit) ── */
      let last = -1
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
        const idx = Math.round(p)
        if (idx !== last) {
          last = idx
          setActive(idx)
        }

      }
      gsap.ticker.add(tick)

      /* ── footer / about state via IntersectionObserver ──────────────
         These used to be getBoundingClientRect() reads inside the ticker —
         two forced synchronous layouts EVERY FRAME, interleaved with GSAP's
         transform writes (classic layout thrash; Lighthouse flags it as
         "forced reflow"). IO delivers the same booleans asynchronously with
         zero main-thread layout cost, and stays correct under ScrollTrigger
         pinning because it tracks the element's real on-screen rect. */
      const observers: IntersectionObserver[] = []
      const footerEl = document.getElementById("footer-spacer")
      if (footerEl) {
        const io = new IntersectionObserver(
          ([e]) => setInFooter(e.isIntersecting),
          /* fires once the spacer's top clears 100px above the viewport
             bottom — same threshold as the old scrollY math */
          { rootMargin: "0px 0px -100px 0px" },
        )
        io.observe(footerEl)
        observers.push(io)
      }
      const aboutEl = document.getElementById("about")
      if (aboutEl) {
        /* the ruler sits at the viewport's vertical center — go white while
           the dark About section covers that center line */
        const io = new IntersectionObserver(
          ([e]) => setInAbout(e.isIntersecting),
          { rootMargin: "-50% 0px -50% 0px" },
        )
        io.observe(aboutEl)
        observers.push(io)
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
            ".nav-tick",
            { scaleX: 0, transformOrigin: "100% 50%", stagger: 0.04, duration: 0.4 },
            0.1,
          )
      }
      let revealed = false

      /* ── scroll-direction hide/show for logo + CTA (standard) ── */
      let lastY = window.scrollY
      let hidden = false
      const floaters = [logoRef.current, ctaWrapRef.current, centerWrapRef.current].filter(Boolean)
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

      /* ── magnetic Menu Btn ── */
      let cleanupMenuBtn = () => {}
      if (!reduce && menuBtnRef.current) {
        const btn = menuBtnRef.current
        const mx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" })
        const my = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" })
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect()
          // Increased multiplier to 0.65 for a stronger magnetic pull
          mx((e.clientX - (r.left + r.width / 2)) * 0.65)
          my((e.clientY - (r.top + r.height / 2)) * 0.65)
        }
        const onLeave = () => {
          mx(0)
          my(0)
        }
        btn.addEventListener("mousemove", onMove)
        btn.addEventListener("mouseleave", onLeave)
        cleanupMenuBtn = () => {
          btn.removeEventListener("mousemove", onMove)
          btn.removeEventListener("mouseleave", onLeave)
        }
      }

      return () => {
        gsap.ticker.remove(tick)
        observers.forEach((o) => o.disconnect())
        window.removeEventListener("resize", measure)
        ScrollTrigger.removeEventListener("refresh", measure)
        window.removeEventListener("scroll", onScroll)
        cleanupCta()
        cleanupMenuBtn()
      }
    },
    { scope: navRef },
  )

  return (
    <nav ref={navRef} aria-label="التنقل الرئيسي">
      {/* ── floating logo (top-right) — no card, larger ── */}
      <div ref={logoRef} className="fixed right-6 top-5 z-50">
        <button
          type="button"
          onClick={toTop}
          aria-label="مسار — أعلى الصفحة"
          data-cursor="invert"
          className="nav-logo-btn block"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14"
          >
            <rect width="56" height="56" rx="16" fill="#34A8D9" />
            <path
              className="logo-arrow logo-arrow-1"
              d="M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z"
              fill="#111717"
            />
            <path
              className="logo-arrow logo-arrow-2"
              d="M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z"
              fill="#111717"
            />
            <path
              className="logo-arrow logo-arrow-3"
              d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z"
              fill="#111717"
            />
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
              <span
                className="nav-cta-underline absolute -bottom-1 left-0 h-[2px] w-full bg-peacock"
                aria-hidden
              />
            </span>
            <ArrowLeft20Filled
              className="nav-cta-arrow text-peacock"
              aria-hidden
            />
          </span>
        </button>
      </div>

      {/* ── center floating menu button (magnetic) ── */}
      <div ref={centerWrapRef} className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
        <div className="relative">
          <button
            ref={menuBtnRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative h-12 w-12 transition-transform hover:scale-105 before:absolute before:-inset-8 before:rounded-full before:content-['']"
            style={{ perspective: '1000px' }}
            aria-label="القائمة"
          >
            <div 
              className="relative h-full w-full rounded-full shadow-lg transition-transform duration-500"
              style={{ 
                transformStyle: 'preserve-3d', 
                transform: menuOpen ? 'rotateY(180deg)' : 'rotateY(0deg)' 
              }}
            >
              {/* Front (Hamburger) */}
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-full bg-[#34A8D9]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex flex-col gap-[4px]">
                  <span className="h-[2px] w-5 rounded-full bg-white" />
                  <span className="h-[2px] w-5 rounded-full bg-white" />
                  <span className="h-[2px] w-5 rounded-full bg-white" />
                </div>
              </div>

              {/* Back (X) */}
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-full border border-black/5 bg-white text-[#34A8D9]"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute h-[2px] w-5 rotate-45 rounded-full bg-[#34A8D9]" />
                  <span className="absolute h-[2px] w-5 -rotate-45 rounded-full bg-[#34A8D9]" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Menu Overlay (Exact Utopai Style) ── */}
      <div 
        className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'opacity-100 pointer-events-auto bg-white/60 backdrop-blur-xl' : 'opacity-0 pointer-events-none bg-white/0 backdrop-blur-none'}`}
      >
        {/* Container is expanded to accommodate 3 columns */}
        <div className={`relative w-[90vw] max-w-[1000px] h-[60vh] max-h-[500px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}>
          <div className="grid h-full w-full grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-4 md:gap-8 relative">
            
            {/* Box 1 - Home (RTL: Top Right) */}
            <a href="/" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors">
              {menuImagesReady && <Image src="/gallary/pathPic.png" fill sizes="(max-width: 768px) 45vw, 340px" className="object-cover opacity-0 transition-opacity duration-700 delay-150 ease-in-out group-hover:duration-500 group-hover:delay-0 group-hover:opacity-20" alt="" />}
              
              {/* Permanent Corner Brackets (All 4 Corners) */}
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">الرئيسية</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">الواجهة الرئيسية</span>
              </div>
            </a>
            
            {/* Box 2 - Map */}
            <a href="/map" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors">
              {menuImagesReady && <Image src="/grid/Gemini_Generated_Image_v3jpk7v3jpk7v3jp.png" fill sizes="(max-width: 768px) 45vw, 340px" className="object-cover opacity-0 transition-opacity duration-700 delay-150 ease-in-out group-hover:duration-500 group-hover:delay-0 group-hover:opacity-20" alt="" />}
              
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">خريطة البلاغات</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">تصفح جغرافياً</span>
              </div>
            </a>

            {/* Box 3 - Gallery (New) */}
            <a href="/gallery" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors">
              {menuImagesReady && <Image src="/media/detection-poster.jpg" fill sizes="(max-width: 768px) 45vw, 340px" className="object-cover opacity-0 transition-opacity duration-700 delay-150 ease-in-out group-hover:duration-500 group-hover:delay-0 group-hover:opacity-20" alt="" />}
              
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">التطبيق</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">معرض التطبيق</span>
              </div>
            </a>

            {/* Box 4 - Tech / AI */}
            <a href="/#tech" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors">
              {menuImagesReady && <Image src="/media/detection-poster.jpg" fill sizes="(max-width: 768px) 45vw, 340px" className="object-cover opacity-0 transition-opacity duration-700 delay-150 ease-in-out group-hover:duration-500 group-hover:delay-0 group-hover:opacity-20" alt="" />}
              
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">النظام الذكي</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">تقنيات الرصد</span>
              </div>
            </a>

            {/* Box 5 - Teams */}
            <a href="/#roles" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors">
              {menuImagesReady && <Image src="/grid/pexels-gaion-27937015.jpg" fill sizes="(max-width: 768px) 45vw, 340px" className="object-cover opacity-0 transition-opacity duration-700 delay-150 ease-in-out group-hover:duration-500 group-hover:delay-0 group-hover:opacity-20" alt="" />}
              
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">الفرق الميدانية</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">إدارة المهام</span>
              </div>
            </a>

            {/* Box 6 - Contact */}
            <a href="/#contact" onClick={() => setMenuOpen(false)} className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl transition-colors bg-[#111717]/5 hover:bg-[#111717]/10">
              <div className="absolute top-0 left-0 h-8 w-8 rounded-tl-3xl border-t-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute top-0 right-0 h-8 w-8 rounded-tr-3xl border-t-[1px] border-r-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-3xl border-b-[1px] border-l-[1px] border-black/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-3xl border-b-[1px] border-r-[1px] border-black/15 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center px-2">
                <span className="font-display text-[22px] md:text-[26px] font-bold text-ink transition-all duration-300 group-hover:-translate-y-1">تواصل معنا</span>
                <span className="mt-1 md:mt-2 text-[12px] md:text-[14px] font-medium text-black">اطلب عرضاً توضيحياً</span>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* ── the ruler (right edge, centered) — only the active tick extends ── */}
      {pathname !== "/map" && pathname !== "/gallery" && (
        <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
          <div
            ref={islandRef}
            className="relative flex flex-col items-end gap-3.5 pr-3"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            {SECTIONS.map((s, i) => {
              const isActive = i === active

              const onDark = inFooter || inAbout
              const labelColor = onDark ? "text-white" : "text-peacock"
              const barColor = onDark
                ? isActive
                  ? "bg-white"
                  : "bg-white/40 group-hover/tick:bg-white/80"
                : isActive
                  ? "bg-peacock"
                  : "bg-mutedtext/50 group-hover/tick:bg-peacock"

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToId(s.id)}
                  aria-label={s.label}
                  aria-current={isActive ? "true" : undefined}
                  className="group/tick relative flex h-5 items-center justify-end gap-3"
                >
                  <span
                    className={`pointer-events-none whitespace-nowrap text-[12px] font-bold opacity-0 translate-x-2 transition-all duration-300 ease-out group-hover/tick:translate-x-0 group-hover/tick:opacity-100 ${labelColor}`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`nav-tick h-[2px] w-6 shrink-0 rounded-full transition-colors duration-300 ${barColor}`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
