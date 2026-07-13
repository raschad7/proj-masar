"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import { FullScreenMaximize24Filled, Dismiss24Filled, Map24Filled, Info24Filled } from "@fluentui/react-icons"

export default function MapPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Prevent scrolling on body when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
      document.documentElement.classList.add("map-fullscreen-active")
    } else {
      document.body.style.overflow = ""
      document.documentElement.classList.remove("map-fullscreen-active")
    }
    return () => {
      document.body.style.overflow = ""
      document.documentElement.classList.remove("map-fullscreen-active")
    }
  }, [isFullscreen])

  return (
    <>
      <Nav />
      {/* Changed to min-h-screen to allow scrolling to footer if needed, but still fits content well initially */}
      <main className="relative z-[1] bg-white min-h-screen flex flex-col pt-24 pb-6">
            <div className={`mx-auto px-4 md:px-6 flex-1 flex flex-col min-h-0 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'w-full max-w-full md:max-w-[98%] lg:max-w-[100%] pt-0' : 'container max-w-6xl pt-4'}`}>
            
            {/* Smooth height collapse using grid */}
            <div className={`text-center shrink-0 grid transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'grid-rows-[0fr] opacity-0 mb-0' : 'grid-rows-[1fr] opacity-100 mb-8'}`}>
              <div className="overflow-hidden">
                <h1 className="font-display text-2xl md:text-3xl leading-tight text-ink mb-3 pt-2">
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
                className={`relative overflow-hidden w-full flex-1 flex flex-col transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isFullscreen ? 'rounded-[24px] md:rounded-[32px] border-transparent shadow-none scale-100 bg-white' : 'border border-gray-200 rounded-[var(--radius-card)] cursor-pointer hover:scale-[1.01] shadow-xl hover:shadow-2xl'}`}
                style={{
                  background: isFullscreen ? "transparent" : "var(--seashell)",
                }}
                onClick={() => { if (!isFullscreen) setIsFullscreen(true) }}
                data-cursor={!isFullscreen ? "invert" : undefined}
              >
                
                {/* Close Button (only visible when expanded) */}
                <div className={`absolute top-4 right-4 md:top-6 md:right-6 z-40 transition-all duration-700 delay-100 flex items-center gap-4 ${isFullscreen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-negative animate-pulse shadow-sm"></div>
                    <h2 className="font-bold text-sm md:text-base text-ink">خريطة مسار التفاعلية (مباشر)</h2>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                    className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white hover:bg-gray-50 shadow-sm rounded-full text-ink transition-colors font-bold text-xs md:text-sm"
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

                {/* Quick Info (visible when NOT expanded) */}
                <div className={`absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20 pointer-events-none transition-opacity duration-[400ms] ${isFullscreen ? 'opacity-0' : 'opacity-100 delay-300'}`}>
                  <div className="bg-white/90 backdrop-blur-md px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-lg max-w-[200px] md:max-w-xs border border-gray-100 hidden sm:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Info24Filled className="text-peacock w-5 h-5" />
                      <span className="font-bold text-xs md:text-sm">معلومة سريعة</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-subtext leading-relaxed">
                      يتم تحديث الخريطة تلقائياً عند استلام أي بلاغ جديد من النظام.
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
                
                <iframe
                  src="/map/masar-map%20(1).html"
                  className={`w-full h-full flex-1 transition-opacity duration-[800ms] ${isFullscreen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-90 group-hover:opacity-100'}`}
                  title="Interactive Map Preview"
                />
              </div>
            </div>
          </div>
      </main>
      <Footer />
    </>
  )
}
