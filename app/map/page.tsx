"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { FullScreenMaximize24Filled, Dismiss24Filled } from "@fluentui/react-icons"

/* The map encodes the defect TYPE as the marker's glyph shape (every
   marker is the same brand-blue disc). These glyphs mirror the ones the
   map itself draws, so the legend reads as a true key to the field. */
type DefectType = "pothole" | "long" | "trans" | "gator" | "other"

const GLYPHS: Record<DefectType, ReactNode> = {
  pothole: <circle cx="12" cy="12" r="4.5" fill="currentColor" />,
  long: <path d="M12 5v14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />,
  trans: <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />,
  gator: (
    <g fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10H7z" />
      <path d="M12 7v10M7 12h10" />
    </g>
  ),
  other: <path d="M12 5l7 7-7 7-7-7 7-7Z" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round" />,
}

const SYMBOLS: { type: DefectType; name: string; desc: string }[] = [
  { type: "pothole", name: "حفرة", desc: "فجوة أو انخفاض في سطح الطريق" },
  { type: "long", name: "شَقّ طولي", desc: "شرخ بمحاذاة اتجاه السير" },
  { type: "trans", name: "شَقّ عرضي", desc: "شرخ يقطع عرض الطريق" },
  { type: "gator", name: "تشقّق تمساحي", desc: "تشققات متشابكة كجلد التمساح" },
  { type: "other", name: "تلف آخر", desc: "أنواع تلف أخرى على الطريق" },
]

/* the exact disc marker the map paints — blue disc, white ring, ink glyph */
function MarkerSymbol({ type }: { type: DefectType }) {
  return (
    <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-peacock ring-2 ring-white">
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden className="text-[#0E1312]">
        {GLYPHS[type]}
      </svg>
    </span>
  )
}

/* Camera focus-lock corner brackets — origins point at each corner so
   they read as "closing in" on the field when the map opens. */
const BRACKETS = [
  { pos: "top-3 right-3 md:top-5 md:right-5", corner: "border-t-2 border-r-2 rounded-tr-xl", origin: "top right" },
  { pos: "top-3 left-3 md:top-5 md:left-5", corner: "border-t-2 border-l-2 rounded-tl-xl", origin: "top left" },
  { pos: "bottom-3 right-3 md:bottom-5 md:right-5", corner: "border-b-2 border-r-2 rounded-br-xl", origin: "bottom right" },
  { pos: "bottom-3 left-3 md:bottom-5 md:left-5", corner: "border-b-2 border-l-2 rounded-bl-xl", origin: "bottom left" },
] as const

export default function MapPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [justOpened, setJustOpened] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const open = useCallback(() => {
    setIsFullscreen(true)
    setJustOpened(true)
    window.setTimeout(() => setJustOpened(false), 1700)
  }, [])

  const close = useCallback(() => setIsFullscreen(false), [])

  // Safety net: never let the loading veil trap the map, even if the
  // iframe's onLoad is missed (fast cache / prior mount).
  useEffect(() => {
    const t = window.setTimeout(() => setMapLoaded(true), 2000)
    return () => window.clearTimeout(t)
  }, [])

  // Lock body scroll while fullscreen + Esc to close
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
      document.documentElement.classList.add("map-fullscreen-active")
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close()
      }
      window.addEventListener("keydown", onKey)
      return () => {
        document.body.style.overflow = ""
        document.documentElement.classList.remove("map-fullscreen-active")
        window.removeEventListener("keydown", onKey)
      }
    }
    document.body.style.overflow = ""
    document.documentElement.classList.remove("map-fullscreen-active")
  }, [isFullscreen, close])

  return (
    <>
      <Nav />
      {/* min-h-screen so the footer stays reachable while the map fits initially */}
      <main className="relative z-[1] bg-white min-h-screen flex flex-col pt-24 pb-6">
        <div className={`mx-auto px-4 md:px-6 flex-1 flex flex-col min-h-0 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'w-full max-w-full md:max-w-[98%] lg:max-w-[100%] pt-0' : 'container max-w-6xl pt-4'}`}>

          {/* Smooth height collapse using grid */}
          <div className={`text-center shrink-0 grid transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'grid-rows-[0fr] opacity-0 mb-0' : 'grid-rows-[1fr] opacity-100 mb-8'}`}>
            <div className="overflow-hidden">
              <h1 className="font-display text-2xl md:text-3xl leading-tight text-ink mb-3 pt-2 text-balance">
                خريطة مسار الحية
              </h1>
              <p className="text-sm text-subtext max-w-3xl mx-auto leading-relaxed pb-2">
                نافذتك المباشرة لمراقبة نبض المدينة. استعرض البلاغات، راقب عمليات الإصلاح لحظة بلحظة،
                واكتشف الأماكن التي تحتاج إلى تدخل عاجل بناءً على التحديثات الحية.
              </p>
            </div>
          </div>

          {/* Premium Card View */}
          <div className={`relative group flex-1 flex flex-col transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'min-h-[85vh] md:min-h-[90vh] pb-0' : 'min-h-[500px] pb-6'}`}>
            <div
              className={`relative overflow-hidden w-full flex-1 flex flex-col transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'rounded-[24px] md:rounded-[32px] border-transparent shadow-none scale-100 bg-white' : 'border border-gray-200 rounded-[var(--radius-card)] cursor-pointer hover:scale-[1.01]'}`}
              style={{
                background: isFullscreen ? "transparent" : "var(--seashell)",
              }}
              onClick={() => { if (!isFullscreen) open() }}
              data-cursor={!isFullscreen ? "invert" : undefined}
            >

              {/* Camera focus-lock brackets (mount on open → play once) */}
              {isFullscreen && BRACKETS.map((b) => (
                <div
                  key={b.pos}
                  aria-hidden
                  className={`map-bracket absolute z-40 h-8 w-8 md:h-10 md:w-10 border-peacock ${b.pos} ${b.corner}`}
                  style={{ transformOrigin: b.origin }}
                />
              ))}

              {/* One-shot live scan sweep */}
              {justOpened && (
                <div aria-hidden className="absolute inset-x-0 top-0 z-[35] pointer-events-none overflow-hidden h-full">
                  <div className="map-scan absolute inset-x-0 top-0" />
                </div>
              )}

              {/* Close controls + live label (only when expanded) */}
              <div className={`absolute top-4 right-[60px] md:top-6 md:right-[76px] z-40 flex items-center gap-4 ${isFullscreen ? 'map-overlay-in' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-negative animate-pulse shadow-sm"></div>
                  <h2 className="font-bold text-sm md:text-base text-ink">خريطة مسار التفاعلية (مباشر)</h2>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); close(); }}
                  className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white hover:bg-gray-50 rounded-full text-ink transition-colors font-bold text-xs md:text-sm"
                >
                  <span>تصغير</span>
                  <Dismiss24Filled className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Live Badge (visible when NOT expanded) */}
              <div className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100 transition-opacity duration-[400ms] ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-300'}`}>
                <span className="w-2 h-2 rounded-full bg-negative animate-pulse"></span>
                <span className="text-sm font-bold text-ink">مباشر (Live)</span>
              </div>

              {/* Symbol key — explains the marker glyphs on the map.
                  Compact chips in card mode; full descriptions in fullscreen. */}
              <div className={`absolute bottom-[60px] left-4 md:bottom-[76px] md:left-6 z-40 pointer-events-none ${isFullscreen ? 'map-overlay-in' : 'transition-opacity duration-[400ms] opacity-100 delay-300'}`}>
                <div className="w-fit max-w-[320px] bg-white/90 backdrop-blur-md rounded-xl border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-peacock" />
                    <span className="font-bold text-[11px] text-ink">دليل رموز الخريطة</span>
                  </div>

                  {/* fullscreen desktop: full rows with descriptions */}
                  <ul className={`flex-col gap-1.5 ${isFullscreen ? 'hidden md:flex' : 'hidden'}`}>
                    {SYMBOLS.map((s) => (
                      <li key={s.type} className="flex items-center gap-2">
                        <MarkerSymbol type={s.type} />
                        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <span className="font-bold text-[12px] text-ink">{s.name}</span>
                          <span className="text-[10px] text-subtext">{s.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* compact: symbol + name only, wraps */}
                  <ul className={`flex flex-wrap gap-x-2.5 gap-y-1.5 max-w-[220px] ${isFullscreen ? 'md:hidden' : ''}`}>
                    {SYMBOLS.map((s) => (
                      <li key={s.type} className="flex items-center gap-1">
                        <MarkerSymbol type={s.type} />
                        <span className="font-bold text-[10px] text-ink whitespace-nowrap">{s.name}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 pt-2 border-t border-gray-100 text-[9px] md:text-[10px] text-subtext leading-relaxed">
                    كثافة اللون الأزرق تدل على شدّة التلف.
                  </p>
                </div>
              </div>

              {/* Interaction Overlay (visible when NOT expanded) */}
              <div className={`absolute inset-0 z-30 bg-ink/5 flex items-center justify-center transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="bg-peacock text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <FullScreenMaximize24Filled className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-base md:text-lg">تفاعل مع الخريطة بالكامل</span>
                </div>
              </div>

              {/* Loading veil — auto-clears on iframe load or the 2s fallback */}
              <div className={`absolute inset-0 z-[15] flex items-center justify-center transition-opacity duration-700 ${mapLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="map-shimmer absolute inset-0" />
                <div className="relative flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-peacock animate-pulse" />
                  <span className="text-xs md:text-sm font-bold text-subtext">جارٍ تحميل الخريطة…</span>
                </div>
              </div>

              <iframe
                src="/map/masar-map%20(1).html"
                onLoad={() => setMapLoaded(true)}
                className={`w-full h-full flex-1 transition-opacity duration-[800ms] ${isFullscreen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-90 group-hover:opacity-100'}`}
                title="خريطة مسار التفاعلية"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
