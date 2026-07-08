"use client";

import { useRef, useState, useEffect } from "react";
import {
  Mail24Filled,
  Call24Filled,
  Location24Filled,
} from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";
import LogoArrow from "@/components/LogoArrow";

/* Footer — "Nightfall on the city", revealed like a curtain.
   On desktop the footer is FIXED behind the page; a spacer creates the
   scroll room, so the opaque page above slides up and uncovers the
   footer from the bottom. That same scroll progress drives one scrubbed
   timeline (glow, road draw, pin ride, damage dots flipping to
   resolved, text rising, multi-layer parallax) — scroll up rewinds it
   all exactly. On mobile / reduced-motion it falls back to a calm
   static footer. */

const NIGHT = "#05090f"; // very deep ink-navy slab

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "المنتج", links: ["المسار", "الأدوار", "الميزات", "التقنية", "التسعير"] },
  { title: "الشركة", links: ["من نحن", "تواصل", "وظائف", "الأخبار"] },
  { title: "موارد", links: ["الأسئلة الشائعة", "الدعم", "سياسة الخصوصية", "الشروط"] },
];

const CONTACT = [
  { Icon: Mail24Filled, label: "hello@masar.ps" /* TODO: real email */ },
  { Icon: Call24Filled, label: "+970 000 000 000" /* TODO: real phone */ },
  { Icon: Location24Filled, label: "رام الله، فلسطين" },
];

/* Fluent UI ships no third-party brand marks, so these are inline brand
   glyphs kept at a Fluent-like weight. */
const SOCIAL: { label: string; path: string }[] = [
  {
    label: "LinkedIn",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.74C24 .78 23.2 0 22.22 0z",
  },
  {
    label: "X",
    path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.4z",
  },
  {
    label: "Facebook",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z",
  },
  {
    label: "Instagram",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.12A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
  },
];

const MAP_DOTS = [
  { right: "14%", top: "26%", at: 0.28, label: "حفرة · أُغلقت", flicker: false },
  { right: "37%", top: "58%", at: 0.46, label: "تشقق · أُغلق", flicker: true },
  { right: "60%", top: "32%", at: 0.64, label: "هبوط · أُغلق", flicker: false },
  { right: "80%", top: "62%", at: 0.82, label: "حفرة · أُغلقت", flicker: false },
];

const DANGER = "#cc3931";
const RESOLVED = "#34a8d8";
const ROAD_D = "M40 78 C 360 34, 620 98, 940 54 S 1300 26, 1392 48";

function useRamallahClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("ar", {
        timeZone: "Asia/Hebron",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const roadRef = useRef<SVGPathElement>(null);
  const clock = useRamallahClock();

  /* Keep the spacer exactly as tall as the fixed footer (desktop only),
     so the curtain reveal ends precisely when the footer is fully shown. */
  useEffect(() => {
    const el = root.current;
    const sp = spacer.current;
    if (!el || !sp) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      sp.style.height = mq.matches ? `${el.offsetHeight}px` : "0px";
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    mq.addEventListener("change", sync);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* ── Desktop: curtain reveal + scrubbed scene, keyed to the spacer
            scrolling past (i.e. the page uncovering the fixed footer). ── */
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set(".ft-road", { drawSVG: "0%" });
          gsap.set(".ft-pin", { opacity: 0 });
          gsap.set(".ft-dot-core", { fill: DANGER });

          const master = gsap.timeline({
            scrollTrigger: {
              trigger: spacer.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 1,
            },
          });

          // whole scene lifts into place as it is revealed (parallax)
          master.from(".ft-inner", { yPercent: 14, ease: "none", duration: 4 }, 0);
          master.fromTo(root.current, { "--glow": 0 } as gsap.TweenVars, { "--glow": 1, ease: "none", duration: 4 } as gsap.TweenVars, 0);

          // road draws + pin rides
          master.to(".ft-road", { drawSVG: "100%", ease: "none", duration: 3 }, 0.4);
          master.to(".ft-pin", { opacity: 1, duration: 0.1 }, 0.4);
          master.to(
            ".ft-pin",
            { motionPath: { path: roadRef.current!, align: roadRef.current!, alignOrigin: [0.5, 0.5] }, ease: "none", duration: 3 },
            0.4,
          );

          // damage dots flip danger → resolved as the pin reaches them
          MAP_DOTS.forEach((d, i) => {
            master.to(`.ft-dot-core-${i}`, { fill: RESOLVED, duration: 0.01 }, 0.4 + d.at * 3);
            master.fromTo(
              `.ft-dot-ping-${i}`,
              { scale: 0.4, opacity: 0.7 },
              { scale: 2.8, opacity: 0, duration: 0.5, ease: "power2.out", transformOrigin: "50% 50%" },
              0.4 + d.at * 3,
            );
          });

          // text rises from clip masks
          master.from(".ft-rise", { yPercent: 120, duration: 1, stagger: 0.05, ease: "power3.out" }, 1.6);

          // deeper multi-layer parallax within the reveal
          master.from(".ft-layer-far", { yPercent: 10, ease: "none", duration: 4 }, 0);
          master.from(".ft-layer-mid", { yPercent: 22, ease: "none", duration: 4 }, 0);

          // mouse parallax (fine pointers)
          if (window.matchMedia("(pointer: fine)").matches) {
            const far = gsap.quickTo(".ft-layer-far", "x", { duration: 0.9, ease: "power3.out" });
            const mid = gsap.quickTo(".ft-layer-mid", "x", { duration: 0.7, ease: "power3.out" });
            const glow = gsap.quickTo(".ft-cursor-glow", "x", { duration: 0.5, ease: "power3.out" });
            const glowY = gsap.quickTo(".ft-cursor-glow", "y", { duration: 0.5, ease: "power3.out" });
            const onMove = (e: MouseEvent) => {
              const r = root.current!.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width - 0.5;
              far(nx * 26);
              mid(nx * 14);
              glow(e.clientX - r.left);
              glowY(e.clientY - r.top);
            };
            window.addEventListener("mousemove", onMove);
            return () => window.removeEventListener("mousemove", onMove);
          }
        },
      );

      // reduced motion / mobile — settle the resolved end-state, no travel
      mm.add("(prefers-reduced-motion: reduce), (max-width: 767px)", () => {
        gsap.set(root.current, { "--glow": 1 } as gsap.TweenVars);
        gsap.set(".ft-road", { drawSVG: "100%" });
        gsap.set(".ft-pin", { opacity: 1 });
        gsap.set(".ft-dot-core", { fill: RESOLVED });
      });
    },
    { scope: root },
  );

  return (
    <>
      <footer
        ref={root}
        dir="rtl"
        className="ft-root relative z-0 flex flex-col overflow-hidden md:fixed md:inset-x-0 md:bottom-0 md:min-h-dvh md:justify-center"
        style={
          {
            background: `radial-gradient(120% 90% at 78% 0%, rgba(52,168,216,calc(0.14*var(--glow,0))) 0%, transparent 55%), linear-gradient(180deg, #0a1220 0%, ${NIGHT} 65%)`,
            "--glow": 0,
          } as React.CSSProperties
        }
      >
        <div className="ft-grain pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <div
          className="ft-cursor-glow pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(52,168,216,0.5), transparent 70%)" }}
          aria-hidden
        />

        {/* parallax scene layers */}
        <div className="ft-layer-far pointer-events-none absolute inset-0" aria-hidden>
          <CityMapBg className="opacity-[0.12] [filter:hue-rotate(150deg)_saturate(1.4)_brightness(1.6)]" />
        </div>
        <div className="ft-layer-mid pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="ft-mote absolute block rounded-full bg-white"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `${(i * 37) % 100}%`,
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                opacity: 0.12 + (i % 4) * 0.05,
                animationDelay: `${(i % 7) * 0.6}s`,
              }}
            />
          ))}
        </div>
        <div className="ft-layer-near pointer-events-none absolute inset-0" aria-hidden>
          {MAP_DOTS.map((d, i) => (
            <span key={`${d.label}-${i}`} className="ft-dotwrap group pointer-events-auto absolute" style={{ right: d.right, top: d.top }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 overflow-visible">
                <circle className={`ft-dot-ping ft-dot-ping-${i}`} cx="12" cy="12" r="8" fill={RESOLVED} opacity="0" />
                <circle className={`ft-dot-core ft-dot-core-${i} ${d.flicker ? "ft-flicker" : ""}`} cx="12" cy="12" r="5" />
              </svg>
              <span className="pointer-events-none absolute bottom-full right-1/2 mb-2 translate-y-1 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-body-5 font-bold text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {d.label}
              </span>
            </span>
          ))}
        </div>

        {/* road + travelling report pin */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24" aria-hidden>
          <svg viewBox="0 0 1440 120" className="h-full w-full" fill="none" preserveAspectRatio="none">
            <path
              ref={roadRef}
              className="ft-road"
              d={ROAD_D}
              stroke={RESOLVED}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.75"
              style={{ filter: "drop-shadow(0 0 6px rgba(52,168,216,0.6))" }}
            />
            <g className="ft-pin">
              <circle className="ft-pin-breathe" cx="0" cy="0" r="9" fill={RESOLVED} opacity="0.3" />
              <circle cx="0" cy="0" r="6" fill="#fff" />
              <circle cx="0" cy="0" r="3" fill={RESOLVED} />
            </g>
          </svg>
        </div>

        {/* content */}
        <div className="ft-inner relative mx-auto w-full max-w-6xl px-6 pb-10 pt-28 md:flex-1 md:flex md:flex-col md:justify-center">
          <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
            {/* brand block — large mark + wordmark */}
            <div>
              <div className="overflow-hidden">
                <div className="ft-rise flex items-center gap-4">
                  <span className="nav-logo-btn block">
                    <svg width="64" height="64" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" aria-label="مسار">
                      <rect width="56" height="56" rx="16" fill="#ffffff" />
                      <path className="logo-arrow logo-arrow-1" d="M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z" fill="#111717" />
                      <path className="logo-arrow logo-arrow-2" d="M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z" fill="#111717" />
                      <path className="logo-arrow logo-arrow-3" d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z" fill="#111717" />
                    </svg>
                  </span>
                  <span className="font-display text-6xl leading-none text-white">مسار</span>
                </div>
              </div>
              <p className="mt-6 max-w-xs text-body-4 leading-relaxed text-white/55">
                منصّة إدارة أضرار الطرق للبلديات.
              </p>

              <ul className="mt-7 flex flex-col gap-3">
                {CONTACT.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-white">
                    <Icon className="shrink-0 text-white" aria-hidden />
                    <span className="text-body-4">{label}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-2 text-body-5 text-white/40">
                <span className="ft-flicker inline-block h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
                <span className="tabular-nums">التوقيت المحلي · {clock || "—"}</span>
              </div>

            </div>

            {/* nav columns */}
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <div className="overflow-hidden pb-1">
                  <h3 className="ft-rise text-body-4 font-bold text-white">{col.title}</h3>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link} className="overflow-hidden">
                      <a href="#" className="ft-rise ft-link group relative inline-flex items-center gap-2 text-body-4 text-white/60 transition-colors hover:text-white">
                        <LogoArrow color="var(--peacock)" className="h-3 w-3 -translate-x-1 -rotate-90 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">{link}</span>
                        <span className="ft-underline pointer-events-none absolute -bottom-0.5 right-0 h-px w-0 bg-peacock transition-all duration-300 group-hover:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* bottom bar */}
        <div className="relative border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
            <p className="text-body-5 text-white/40">© مسار ٢٠٢٦ — جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-body-5 text-white/50 transition-colors hover:text-white">سياسة الخصوصية</a>
              <a href="#" className="text-body-5 text-white/50 transition-colors hover:text-white">الشروط</a>
              <div className="flex items-center gap-2">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="group flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-all hover:scale-110 hover:bg-white/5 hover:text-peacock"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* reveal spacer — height synced to the fixed footer on desktop */}
      <div ref={spacer} aria-hidden />
    </>
  );
}
