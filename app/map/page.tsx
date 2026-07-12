"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "@/components/Footer"
import { FullScreenMaximize24Filled, Dismiss24Filled, ArrowRight24Filled, Map24Filled, Info24Filled } from "@fluentui/react-icons"

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

      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-50 py-6 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink hover:text-peacock transition-colors font-bold group"
        >
          <ArrowRight24Filled className="transform group-hover:translate-x-1 transition-transform" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Brand Logo inside Header */}
        <Link href="/" aria-label="الرئيسية" className="block transform scale-75 origin-right">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="56" height="56" rx="16" fill="#34A8D9" />
            <path
              d="M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z"
              fill="#111717"
            />
            <path
              d="M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z"
              fill="#111717"
            />
            <path
              d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z"
              fill="#111717"
            />
          </svg>
        </Link>
      </header>

      <main className="relative z-[1] bg-white min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          
          <div className="mt-8 mb-16 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-seashell rounded-full mb-6">
              <Map24Filled className="text-peacock w-8 h-8" />
            </div>
            <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-tight text-ink mb-6">
              خريطة مسار الحية
            </h1>
            <p className="text-body-1 text-subtext max-w-3xl mx-auto leading-relaxed">
              نافذتك المباشرة لمراقبة نبض المدينة. استعرض البلاغات، راقب عمليات الإصلاح لحظة بلحظة، 
              واكتشف الأماكن التي تحتاج إلى تدخل عاجل بناءً على التحديثات الحية.
            </p>
          </div>

          {/* Premium Card View */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-peacock/20 to-blue-500/20 rounded-[var(--radius-card)] blur-xl group-hover:opacity-100 opacity-60 transition duration-500"></div>
            <div
              className="relative overflow-hidden w-full transition-transform duration-500 hover:scale-[1.01] cursor-pointer shadow-2xl border border-white/50"
              style={{
                background: "var(--seashell)",
                borderRadius: "var(--radius-card)",
                height: "65vh",
                minHeight: "550px"
              }}
              onClick={() => setIsFullscreen(true)}
              data-cursor="invert"
            >
              {/* Premium Overlay Elements */}
              <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-negative animate-pulse"></span>
                <span className="text-sm font-bold text-ink">مباشر (Live)</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg max-w-xs border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Info24Filled className="text-peacock" />
                    <span className="font-bold text-sm">معلومة سريعة</span>
                  </div>
                  <p className="text-xs text-subtext leading-relaxed">
                    يتم تحديث الخريطة تلقائياً عند استلام أي بلاغ جديد من النظام.
                  </p>
                </div>
              </div>

              {/* Interaction Overlay */}
              <div className="absolute inset-0 z-30 bg-ink/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-peacock text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <FullScreenMaximize24Filled className="w-6 h-6" />
                  <span className="text-lg">تفاعل مع الخريطة بالكامل</span>
                </div>
              </div>
              
              <iframe
                src="/map/masar-map%20(1).html"
                className="w-full h-full pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                title="Interactive Map Preview"
              />
            </div>
          </div>
        </div>

        {/* Fullscreen View */}
        {isFullscreen && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-300 ease-out">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-negative animate-pulse"></div>
                <h2 className="font-bold text-lg text-ink">خريطة مسار التفاعلية (مباشر)</h2>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-seashell hover:bg-gray-200 rounded-full text-ink transition-colors font-bold text-sm"
              >
                <span>إغلاق</span>
                <Dismiss24Filled />
              </button>
            </div>
            <iframe
              src="/map/masar-map%20(1).html"
              className="w-full h-full pt-[68px]"
              title="Interactive Map Fullscreen"
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
