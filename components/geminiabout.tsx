"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function GeminiAbout() {
  const rootRef = useRef<HTMLDivElement>(null);

  // useGSAP automatically handles gsap.context() for clean unmounts
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop Animations (Scroll Pinning & Storytelling) ──
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=4000",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Intro Phase 1 animations
        tl.from(".p1-title", { autoAlpha: 0, y: 50, duration: 0.5 })
          .from(".p1-sub", { autoAlpha: 0, y: 30, duration: 0.5 }, "-=0.3")
          .from(".p1-card", { autoAlpha: 0, y: 30, stagger: 0.2, duration: 0.5 }, "-=0.3")
          .to(".phase-1", { duration: 1 }); // read-time pause

        // Transition 1 -> 2
        tl.to(".phase-1", { autoAlpha: 0, y: -50, duration: 1 })
          .to(rootRef.current, { backgroundColor: "#172554", duration: 1 }, "<") // bg-blue-950
          .fromTo(".phase-2", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1 }, "<")
          .from(".p2-content", { autoAlpha: 0, x: 50, duration: 0.8 }, "-=0.5")
          .from(".p2-visual", { autoAlpha: 0, scale: 0.9, duration: 0.8 }, "-=0.5")
          .to(".phase-2", { duration: 1 }); 

        // Transition 2 -> 3
        tl.to(".phase-2", { autoAlpha: 0, y: -50, duration: 1 })
          .to(rootRef.current, { backgroundColor: "#134e4a", duration: 1 }, "<") // bg-teal-900 (slate/teal transition)
          .fromTo(".phase-3", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1 }, "<");

        // Phase 3 Cards Scrolling
        tl.from(".p3-card-1", { autoAlpha: 0, y: 50, duration: 0.5 })
          .to(".p3-cards-wrapper", { y: "-35vh", duration: 1 })
          .fromTo(".p3-card-2", { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, "<")
          .to(".p3-cards-wrapper", { y: "-70vh", duration: 1 })
          .fromTo(".p3-card-3", { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, "<")
          .to(".phase-3", { duration: 1 }); 

        // Transition 3 -> 4
        tl.to(".phase-3", { autoAlpha: 0, y: -50, duration: 1 })
          .to(rootRef.current, { backgroundColor: "#020617", duration: 1 }, "<") // bg-slate-950
          .fromTo(".phase-4", { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 1 }, "<")
          .from(".p4-content", { autoAlpha: 0, y: 30, duration: 0.5 }, "-=0.5");
      });

      // ── Mobile Animations (Fade-in on normal scroll) ──
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>(".phase-1, .phase-2, .phase-3, .phase-4").forEach(phase => {
          gsap.from(phase, {
            scrollTrigger: {
              trigger: phase,
              start: "top 80%",
            },
            autoAlpha: 0,
            y: 40,
            duration: 0.8,
            ease: "power2.out"
          });
        });
      });
      
      // ── Number Counters (Trigger on both mobile & desktop) ──
      mm.add("(prefers-reduced-motion: no-preference)", () => {
         gsap.utils.toArray<HTMLElement>(".metric-counter").forEach(counter => {
            const target = parseFloat(counter.getAttribute("data-target") || "0");
            const prefix = counter.getAttribute("data-prefix") || "";
            const suffix = counter.getAttribute("data-suffix") || "";
            
            const proxy = { val: 0 };
            gsap.to(proxy, {
                scrollTrigger: {
                    trigger: counter,
                    start: "top 85%",
                },
                val: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    counter.innerHTML = prefix + Math.ceil(proxy.val) + suffix;
                }
            });
         });
      });
    },
    { scope: rootRef }
  );

  return (
    <>
      {/* CSS for neon laser scan animation */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser {
          animation: scan-laser 3s ease-in-out infinite alternate;
        }
      `}</style>
      
      <div 
        ref={rootRef} 
        dir="rtl" 
        className="relative w-full bg-slate-950 text-white md:overflow-hidden md:h-screen"
        style={{ willChange: "background-color" }}
      >
        
        {/* ================= PHASE 1: The Problem ================= */}
        <div className="phase-1 flex min-h-screen w-full flex-col items-center justify-center p-6 text-center md:absolute md:inset-0 md:h-screen">
          <div className="max-w-4xl text-center">
            <h2 className="p1-title text-4xl font-bold leading-tight text-white md:text-6xl">
              الطرق التقليدية تكلف البلديات ملايين.. وتسبب آلاف الشكاوى.
            </h2>
            <p className="p1-sub mt-6 text-lg leading-relaxed text-slate-300 md:text-xl">
              الاعتماد على البلاغات العشوائية والجولات اليدوية يؤدي لتفاقم التشققات البسيطة إلى حفر كارثية تستنزف المال العام وتؤرق راحة المواطن.
            </p>
          </div>
          <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p1-card rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="metric-counter mb-4 text-5xl font-bold text-red-400" data-target="80" data-prefix="+" data-suffix="%">0</div>
              <p className="text-slate-300">من شكاوى المواطنين تتركز حول تهالك الأسفلت</p>
            </div>
            <div className="p1-card rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="metric-counter mb-4 text-5xl font-bold text-orange-400" data-target="3" data-suffix="x">0</div>
              <p className="text-slate-300">تضاعف في تكاليف الصيانة عند تأخر المعالجة</p>
            </div>
            <div className="p1-card rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mb-4 text-5xl font-bold text-blue-400">آلاف الساعات</div>
              <p className="text-slate-300">المهدرة سنوياً في عمليات الرصد والتفتيش التقليدية</p>
            </div>
          </div>
        </div>

        {/* ================= PHASE 2: AI Solution ================= */}
        <div className="phase-2 flex min-h-screen w-full flex-col items-center justify-center p-6 md:absolute md:inset-0 md:invisible md:h-screen md:opacity-0">
          <div className="flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row">
            <div className="p2-content w-full md:w-1/2">
              <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
                تطبيق مسار يحول المركبات العادية إلى وحدات رصد ذكية
              </h2>
              <p className="text-lg leading-relaxed text-blue-200">
                بمجرد انطلاق سيارة البلدية في جولتها اليومية وتفعيل التطبيق، تقوم خوارزميات الرؤية الحاسوبية (Computer Vision) بمسح الشارع تلقائياً، وتحديد الحفر وتصنيف درجة خطورتها وتثبيت موقعها الجغرافي بدقة متناهية على الخارطة دون أي تشتيت للسائق.
              </p>
            </div>
            <div className="p2-visual flex w-full justify-center md:w-1/2">
              {/* Grid Visual with Neon Laser */}
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0a1930] shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a33_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a33_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-2xl" />
                
                {/* Simulated detections */}
                <div className="absolute left-1/4 top-1/3 h-4 w-4 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]" />
                <div className="absolute bottom-1/3 right-1/4 h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
                <div className="absolute bottom-1/4 left-1/3 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                
                {/* Laser scan line */}
                <div className="animate-laser absolute left-0 h-[2px] w-full bg-cyan-400 shadow-[0_0_15px_2px_#22d3ee]" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= PHASE 3: Automated Workflow ================= */}
        <div className="phase-3 flex min-h-screen w-full flex-col items-center justify-center p-6 md:absolute md:inset-0 md:invisible md:h-screen md:opacity-0">
          <div className="flex h-full w-full max-w-6xl flex-col gap-12 md:h-[70vh] md:flex-row">
            
            <div className="flex w-full flex-col justify-center md:sticky md:top-24 md:w-1/2 md:static">
              <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
                دورة عمل مأتمتة.. وإصلاح موثق بالدليل
              </h2>
              <p className="text-lg leading-relaxed text-teal-100/80">
                لا يتوقف نظام مسار عند رصد الأعطال فقط؛ بل يمنح الإدارة سيطرة كاملة على الميدان عبر أتمتة تدفق العمل من اللحظة الأولى وحتى إنهاء المهمة.
              </p>
            </div>
            
            <div 
              className="relative mt-12 h-[60vh] w-full overflow-hidden md:mt-0 md:h-full md:w-1/2"
              style={{ maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}
            >
              <div className="p3-cards-wrapper absolute top-0 flex w-full flex-col gap-[10vh] pb-[30vh] pt-[15vh]">
                
                {/* Card A: Work Order */}
                <div className="p3-card-1 rounded-2xl border border-teal-500/30 bg-teal-950/50 p-8 shadow-2xl backdrop-blur-md">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/50 bg-teal-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold leading-relaxed text-white">1. توليد أمر العمل تلقائياً وإرساله لأقرب فرقة صيانة ميدانية حسب الموقع.</p>
                </div>
                
                {/* Card B: Before Picture */}
                <div className="p3-card-2 rounded-2xl border border-teal-500/30 bg-teal-950/50 p-8 shadow-2xl backdrop-blur-md">
                  <div className="mb-6 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-teal-700/50 bg-slate-900">
                    <span className="text-sm font-medium text-teal-500/50">[ صورة توثيق قبل الإصلاح ]</span>
                  </div>
                  <p className="text-xl font-bold leading-relaxed text-white">2. توثيق الموقع (قبل الإصلاح) لضمان الشفافية.</p>
                </div>
                
                {/* Card C: Resolved checkmark */}
                <div className="p3-card-3 rounded-2xl border border-teal-500/30 bg-teal-950/50 p-8 shadow-2xl backdrop-blur-md">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-green-500/50 bg-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold leading-relaxed text-white">3. إغلاق البلاغ رقمياً بعد رفع صورة (بعد الإصلاح) وإدخال المواد المستخدمة.</p>
                </div>
                
              </div>
            </div>

          </div>
        </div>

        {/* ================= PHASE 4: Data-Driven Outro ================= */}
        <div className="phase-4 flex min-h-screen w-full flex-col items-center justify-center p-6 md:absolute md:inset-0 md:invisible md:h-screen md:opacity-0">
          <div className="p4-content z-10 max-w-4xl text-center">
            <h2 className="mb-6 bg-gradient-to-l from-white to-slate-400 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
              مسار: من رصد الحفرة بالذكاء الاصطناعي.. إلى شارع آمن وموثق.
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-slate-400">
              منظومة متكاملة تمنح المجلس البلدي وإدارة الهندسة لوحة تحكم قيادية لمتابعة نسب الإنجاز، أداء الفرق الميدانية، وتوزيع الميزانيات بناءً على بيانات حقيقية دقيقة.
            </p>
            
            {/* Call To Action */}
            <button className="group relative overflow-hidden rounded-full bg-slate-800 p-[1px] transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 transition-all group-hover:bg-slate-900">
                <span className="text-lg font-bold text-white">اطلب العرض التوضيحي للمنظومة الآن</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </span>
            </button>
          </div>
          
          {/* Abstract Dashboard BG */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30">
            <div className="absolute h-[120%] w-[120%] rounded-full border-[1px] border-white/5" />
            <div className="absolute h-[80%] w-[80%] rounded-full border-[1px] border-white/5" />
            <div className="absolute h-[40%] w-[40%] rounded-full border-[1px] border-cyan-900/30 bg-blue-900/10" />
          </div>
        </div>

      </div>
    </>
  );
}
