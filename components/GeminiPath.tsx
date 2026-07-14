"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckmarkCircle24Filled } from "@fluentui/react-icons";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/* ── The life of one report (In-Place Morphing with Titles) ── */

type State = {
  label: string;
  hex: string;
  loc: string;
  time: string;
  head: string;
  line: string;
};

const STATES: State[] = [
  {
    label: "يُرصد تلقائياً",
    hex: "#16668E",
    loc: "شارع النصر · حي المخفية",
    time: "9:12",
    head: "تقود فقط… ومسار يرى",
    line: "كاميرا المركبة ترصد كل حفرةٍ وتشقّق تلقائياً أثناء القيادة — تحدّد الموقع والخطورة دون أي إدخالٍ يدوي.",
  },
  {
    label: "مُسنَد",
    hex: "#16668E",
    loc: "أولوية عالية · فريق 3",
    time: "9:13",
    head: "لكل بلاغٍ مالكٌ ووقت",
    line: "يفرزه النظام حسب الخطورة ويُسنده إلى الفريق الأقرب — لا بلاغ يضيع أو يُنسى في زحمة القنوات.",
  },
  {
    label: "قيد الإصلاح",
    hex: "#16668E",
    loc: "الفريق في الموقع",
    time: "10:40",
    head: "الحالة مرئية لحظياً",
    line: "يتسلّم الفريق المهمة ويبدأ العمل، وتتحدّث الحالة مباشرةً على المسار — دون مكالمات متابعة.",
  },
  {
    label: "أُغلق بدليل",
    hex: "#16668E",
    loc: "مُوثّق · جاهز للتدقيق",
    time: "11:25",
    head: "يُغلق بدليلٍ موثّق",
    line: "يُرفع دليلٌ مصوّر قبل/بعد ويُغلق البلاغ في سجلٍّ قابلٍ للتدقيق من مجلس البلدية.",
  },
];

const SplitText = ({ text, className, wordClass = "split-word" }: { text: string, className?: string, wordClass?: string }) => {
  return (
    <span className={`inline-block ${className || ""}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap gap-x-2.5">
        {text.split(" ").map((word, i) => (
          <span key={i} className="inline-flex overflow-hidden py-1">
            <span className={`${wordClass} inline-block opacity-0 translate-y-full origin-bottom-left will-change-transform`}>
              {word}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
};

/* eslint-disable @next/next/no-img-element */
function StickyMedia({ activeIndex }: { activeIndex: number }) {
  /* The 4.7MB clip must not download at page load (it used to be the
     single largest cost of the whole page). preload="none" + play/pause
     from an IntersectionObserver: the fetch starts only once the section
     is a half-viewport away, and decode stops when it scrolls out. */
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    /* No rootMargin: at hydration (before ScrollTrigger inserts its pin
       spacers) the page is still short, so any early margin made this
       fire at load and start the 4.7MB fetch. The poster covers the
       brief moment between the section arriving and playback starting. */
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/3] rounded-[32px] overflow-hidden bg-black">
      
      <style>{`
        @keyframes ai-scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-ai-scan {
          animation: ai-scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* 1 — Dashcam */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ 
          opacity: activeIndex === 0 ? 1 : 0, 
          transform: activeIndex === 0 ? "scale(1) translateY(0px)" : "scale(1.04) translateY(24px)",
          filter: activeIndex === 0 ? "blur(0px)" : "blur(8px)",
          zIndex: activeIndex === 0 ? 10 : 1
        }}
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover opacity-90 transition-transform duration-[20000ms] ease-out ${activeIndex === 0 ? 'scale-110' : 'scale-100'}`}
          poster="/media/detection-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
        >
          {/* mp4 only — H.264 is universally supported; the webm was larger
              and redundant. */}
          <source src="/media/detection.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2 — Dispatch Map */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ 
          opacity: activeIndex === 1 ? 1 : 0, 
          transform: activeIndex === 1 ? "scale(1) translateY(0px)" : "scale(1.04) translateY(24px)",
          filter: activeIndex === 1 ? "blur(0px)" : "blur(8px)",
          zIndex: activeIndex === 1 ? 10 : 1
        }}
      >
        <Image
          src="/grid/Gemini_Generated_Image_v3jpk7v3jpk7v3jp.png"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          className={`object-cover opacity-90 transition-transform duration-[20000ms] ease-out ${activeIndex === 1 ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Flat dispatch card (No Shadow) */}
        <div className="absolute inset-x-6 bottom-6 transform transition-transform duration-700 delay-300" style={{ translate: activeIndex === 1 ? '0 0' : '0 20px', opacity: activeIndex === 1 ? 1 : 0 }}>
          <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 border border-black/5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <img src="/chars/TheFixer.svg" alt="" width={32} height={32} loading="lazy" className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[16px] font-bold text-ink">فريق الإصلاح · وحدة 3</p>
              <p className="text-[14px] text-subtext mt-0.5">أقرب فريق · 1.2 كم</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#FFAB00]/10 px-3 py-1.5 text-[12px] font-bold text-[#b37700]">
              أولوية عالية
            </span>
          </div>
        </div>
      </div>

      {/* 3 — In Repair */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ 
          opacity: activeIndex === 2 ? 1 : 0, 
          transform: activeIndex === 2 ? "scale(1) translateY(0px)" : "scale(1.04) translateY(24px)",
          filter: activeIndex === 2 ? "blur(0px)" : "blur(8px)",
          zIndex: activeIndex === 2 ? 10 : 1
        }}
      >
        <Image
          src="/grid/pexels-gaion-27937015.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          className={`object-cover opacity-90 transition-transform duration-[20000ms] ease-out ${activeIndex === 2 ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      {/* 4 — Closed */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ 
          opacity: activeIndex === 3 ? 1 : 0, 
          transform: activeIndex === 3 ? "scale(1) translateY(0px)" : "scale(1.04) translateY(24px)",
          filter: activeIndex === 3 ? "blur(0px)" : "blur(8px)",
          zIndex: activeIndex === 3 ? 10 : 1
        }}
      >
        <Image
          src="/gallary/pathPic.png"
          alt="قبل وبعد الإصلاح"
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          className={`object-cover opacity-90 transition-transform duration-[20000ms] ease-out ${activeIndex === 3 ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
}

export default function GeminiPath() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Setup the ScrollTrigger pinning and snapping logic
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      let last = 0;
      ScrollTrigger.create({
        trigger: root.current,
        pin: true,
        start: "top top",
        end: "+=400%", // User scrolls 4x the screen height to go through the 4 states smoothly
        onUpdate: (self) => {
          // Map scroll progress (0 to 1) evenly to the 4 states (0, 1, 2, 3)
          const i = Math.min(3, Math.floor(self.progress * 4));
          if (i !== last) {
            last = i;
            setActive(i);
          }
        },
      });
    });

    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
         // Mobile handles scrolling normally without pinning
         gsap.utils.toArray<HTMLElement>(".mobile-step").forEach((section, i) => {
             ScrollTrigger.create({
                trigger: section,
                start: "top 60%",
                onEnter: () => setActive(i),
                onEnterBack: () => setActive(i)
             });
         });
    });

  }, { scope: root });

  // Handle the text split animation in-place when activeIndex changes (Desktop)
  useGSAP(() => {
      const activeSection = `.text-state-${active}`;
      
      // Hide all first instantly
      gsap.set(".text-state", { autoAlpha: 0, display: "none" });
      
      // Make the active one visible
      gsap.set(activeSection, { autoAlpha: 1, display: "flex" });

      // Run the split text animation for the new active section
      const tl = gsap.timeline();
      tl.fromTo(
        `${activeSection} .split-word`,
        { y: "120%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.8, stagger: 0.04, ease: "back.out(1.4)", rotationZ: 0.01 }
      );
      
      tl.fromTo(
        `${activeSection} .fade-up-elem`,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out" },
        "-=0.6"
      );
  }, [active]);

  return (
    <section ref={root} id="path" className="relative bg-white pb-24 md:pb-0">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Desktop Layout: Pinned In-Place Morphing */}
        <div className="hidden md:flex h-screen min-h-[600px] items-center relative">
            
            {/* Left Side (RTL Right): Text Morphing Container */}
            <div className="w-1/2 pr-[90px] lg:pr-[140px] flex flex-col justify-center">
                <div className="mb-8">
                   <h2 className="font-display text-[24px] text-mutedtext">حياةُ بلاغٍ واحد</h2>
                </div>
                
                <div className="relative grid">
                    {STATES.map((s, i) => (
                        <div key={i} className={`text-state text-state-${i} col-start-1 row-start-1 flex-col justify-center`} style={{ display: i === 0 ? 'flex' : 'none' }}>
                            
                            {/* Title of Phase (Label) */}
                            <div className="fade-up-elem mb-6 flex items-center gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-[18px]" style={{ background: s.hex }}>
                                    {i + 1}
                                </span>
                                <h3 className="font-display text-[44px] font-bold text-ink">
                                    {s.label}
                                </h3>
                            </div>

                            {/* Split Text Heading */}
                            <h4 className="font-display text-[32px] text-ink leading-tight mb-6">
                                <SplitText text={s.head} />
                            </h4>
                        
                        <p className="fade-up-elem text-[20px] text-subtext leading-relaxed max-w-lg">
                            {s.line}
                        </p>
                        
                        {/* Meta Data */}
                        <div className="fade-up-elem mt-10 pt-8 border-t border-black/10 max-w-lg">
                            <p className="text-[14px] text-subtext mb-2">الوقت والموقع</p>
                            <p className="text-[18px] font-bold text-ink">
                                {s.loc} <span className="mx-2 font-normal text-black/20">·</span> <span className="tabular-nums">{s.time} ص</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Side (RTL Left): Morphing Media Container */}
            <div className="w-1/2 pl-6 lg:pl-12">
                <StickyMedia activeIndex={active} />
            </div>

        </div>

        {/* Mobile Layout: Stacked normal scrolling */}
        <div className="md:hidden flex flex-col gap-12 relative z-10 py-24">
            <div className="text-center mb-8">
               <h2 className="font-display text-[24px] text-mutedtext">حياةُ بلاغٍ واحد</h2>
            </div>

            <div className="sticky top-20 z-20">
                <StickyMedia activeIndex={active} />
            </div>
            
            <div className="flex flex-col gap-20 pb-10 mt-8">
                {STATES.map((s, i) => (
                    <div key={i} className="mobile-step relative">
                        {/* Title of Phase */}
                        <div className="mb-4 flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white font-bold text-[15px]" style={{ background: s.hex }}>
                                {i + 1}
                            </span>
                            <h3 className="font-display text-[32px] font-bold text-ink">
                                {s.label}
                            </h3>
                        </div>

                        <h4 className="font-display text-[24px] text-ink leading-tight mb-4">{s.head}</h4>
                        <p className="text-[18px] text-subtext leading-relaxed mb-6">{s.line}</p>
                        
                        <div className="pt-6 border-t-2 border-black/5">
                            <p className="text-[16px] font-bold text-ink">{s.loc}</p>
                            <p className="text-[15px] text-subtext mt-1">{s.time} ص</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}
