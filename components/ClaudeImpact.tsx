"use client";

import { useRef } from "react";
import { ChevronLeft24Filled } from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";

/* ClaudeImpact — the metrics as a pinned scrollytelling stage.
   Each figure takes over the screen in turn: a huge Almarai-ExtraBold
   number counts up inside a gauge ring that draws to its value, with a
   status chip and caption. One pinned, scrubbed timeline drives the whole
   sequence — scroll down advances, scroll up rewinds. Same illustrative
   figures and semantics as the classic ImpactSection. Reduced motion →
   a calm static stack (no pin). */

type Stat = {
  key: string;
  value: number;
  prefix?: string; // e.g. "×"
  suffix?: string; // e.g. "%"
  arcPct: number; // how far the ring fills (0–100)
  title: string; // sits inside the ring, under the number
  desc: string; // caption below the ring
  color: string;
  photo: string; // real photo shown beside the ring, swaps per stat
  caption: string; // short caption chip on the photo
};

/* Illustrative sample figures (أرقام توضيحية) — swap for pilot data.
   Ordered as a sales argument: money → citizen → labour/time → proof.
   Each figure is paired with a real photo that crossfades in as its panel
   takes over the pinned stage. */
const STATS: Stat[] = [
  {
    key: "savings",
    value: 70,
    suffix: "%",
    arcPct: 70,
    title: "خفضٌ في كلفة الصيانة الطارئة",
    desc: "الكشف المبكر يمنع تحوّل الضرر إلى إصلاح مكلف.",
    color: "#088a20",
    photo: "/grid/pexels-gaion-27937015.jpg",
    caption: "صيانةٌ استباقية",
  },
  {
    key: "complaints",
    value: 60,
    suffix: "%",
    arcPct: 60,
    title: "شكاوى متكررة أقلّ",
    desc: "يُعالَج الضرر قبل أن يتفاقم ويشتكي المواطن مجدداً.",
    color: "#ffab00",
    photo: "/grid/pexels-samson-katt-5226497.jpg",
    caption: "بلاغُ المواطن",
  },
  {
    key: "speed",
    value: 3,
    prefix: "×",
    arcPct: 100,
    title: "أسرع في مسح شبكة الطرق",
    desc: "سيارة واحدة تمسح المدينة بدل جولات تفتيش يدوية.",
    color: "#34a8d8",
    photo: "/grid/pexels-ismail-nabhan-2159803207-36627992.jpg",
    caption: "مسحٌ أثناء القيادة",
  },
  {
    key: "accuracy",
    value: 90,
    suffix: "%",
    arcPct: 90,
    title: "دقة الكشف التلقائي",
    desc: "نموذج رؤية مُدرَّب على أضرار الطرق.",
    color: "#0072da",
    photo: "/media/detection-poster.jpg",
    caption: "كشفٌ تلقائي مباشر",
  },
];

const SEG = 3; // timeline units per stat

export default function ClaudeImpact() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const setNum = (i: number, v: number, s: Stat) => {
        const el = root.current!.querySelector<HTMLElement>(`.cip-num-${i}`);
        if (el) el.textContent = (s.prefix ?? "") + Math.round(v) + (s.suffix ?? "");
      };

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // initial state — only the first panel showing, arcs empty, zeros
        STATS.forEach((s, i) => {
          gsap.set(`.cip-panel-${i}`, { opacity: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 10 });
          gsap.set(`.cip-arc-${i}`, { drawSVG: "0%" });
          gsap.set(`.cip-tab-${i}`, { opacity: i === 0 ? 1 : 0.3 });
          setNum(i, 0, s);
        });
        gsap.set(".cip-progress", { scaleX: 0, transformOrigin: "100% 50%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: "+=" + STATS.length * 900, // long, deliberate scrub
            scrub: 1.2,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        // overall progress line fills across the whole sequence
        tl.to(".cip-progress", { scaleX: 1, ease: "none", duration: SEG * STATS.length }, 0);

        STATS.forEach((s, i) => {
          const at = i * SEG;

          if (i > 0) {
            // previous panel + tab dim out as this one takes over
            tl.to(`.cip-panel-${i - 1}`, { opacity: 0, yPercent: -10, duration: 0.5, ease: "power2.in" }, at - 0.3);
            tl.to(`.cip-tab-${i - 1}`, { opacity: 0.3, duration: 0.4 }, at - 0.3);
            tl.fromTo(`.cip-panel-${i}`, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0, duration: 0.6, ease: "power3.out" }, at);
            tl.to(`.cip-tab-${i}`, { opacity: 1, duration: 0.4 }, at);
          }

          // number counts up + ring draws to value, together
          const p = { v: 0 };
          tl.to(
            p,
            {
              v: s.value,
              duration: SEG * 0.62,
              ease: "power1.out",
              onUpdate: () => setNum(i, p.v, s),
            },
            at + 0.1,
          );
          tl.to(`.cip-arc-${i}`, { drawSVG: `${s.arcPct}%`, duration: SEG * 0.62, ease: "power1.out" }, at + 0.1);
          // photo settles from a gentle zoom as it enters
          tl.fromTo(`.cip-photo-img-${i}`, { scale: 1.12 }, { scale: 1, duration: SEG * 0.9, ease: "power2.out" }, at);
          // a soft pulse on the ring as it settles
          tl.fromTo(`.cip-ring-glow-${i}`, { opacity: 0 }, { opacity: 0.35, duration: 0.4, yoyo: true, repeat: 1 }, at + SEG * 0.6);
        });

        // hold the last figure a beat before releasing the pin
        tl.to({}, { duration: 1.4 });

        // mouse parallax — photo drifts one way, gauge the other (fine pointers)
        if (window.matchMedia("(pointer: fine)").matches) {
          const px = gsap.quickTo(".cip-photo", "x", { duration: 0.9, ease: "power3.out" });
          const py = gsap.quickTo(".cip-photo", "y", { duration: 0.9, ease: "power3.out" });
          const gx = gsap.quickTo(".cip-panel > div", "x", { duration: 1.1, ease: "power3.out" });
          const onMove = (e: MouseEvent) => {
            const r = stage.current!.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            px(nx * 34);
            py(ny * 24);
            gx(nx * -12);
          };
          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
      });

      // reduced motion — static stack, final values, no pin
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.current!.classList.add("cip-static");
        STATS.forEach((s, i) => {
          gsap.set(`.cip-arc-${i}`, { drawSVG: `${s.arcPct}%` });
          setNum(i, s.value, s);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="impact-claude" className="relative bg-white">
      {/* pinned stage */}
      <div ref={stage} className="cip-stage relative flex h-screen flex-col overflow-hidden px-6">
        <CityMapBg className="opacity-30" />

        {/* header + tabs */}
        <div className="relative z-10 mx-auto w-full max-w-6xl pt-20 md:pt-24">
          <p className="text-center text-body-5 font-bold tracking-widest text-peacock">الأثر</p>
          <h2 className="mt-2 text-center font-display text-display-2 text-ink md:text-display-1">
            نتائجُ تُقنع مجلس البلدية
          </h2>

          {/* progress rail */}
          <div className="mt-8">
            <div className="relative h-px w-full bg-seashell">
              <div className="cip-progress absolute inset-y-0 right-0 w-full origin-right bg-peacock" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              {STATS.map((s, i) => (
                <div key={s.key} className={`cip-tab-${i} flex items-center gap-2 text-body-5 font-bold`}>
                  <span className="tabular-nums" style={{ color: s.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="hidden text-subtext sm:inline">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* stacked figure panels */}
        <div className="cip-panels relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center">
          {STATS.map((s, i) => (
            <div key={s.key} className={`cip-panel-${i} cip-panel absolute inset-0 flex flex-col items-center justify-center`}>
              {/* photo on the left, gauge on the right — centered as a group */}
              <div
                dir="ltr"
                className="flex flex-col items-center justify-center gap-12 md:flex-row md:gap-28"
              >
                {/* real photo — swaps with each figure */}
                <div className="cip-photo relative h-[min(72vw,420px)] w-[min(88vw,480px)] shrink-0 overflow-hidden rounded-[32px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.photo}
                    alt={s.title}
                    className={`cip-photo-img-${i} h-full w-full object-cover`}
                  />
                  {/* caption chip */}
                  <span
                    dir="rtl"
                    className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-body-5 font-bold text-white backdrop-blur-md"
                  >
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.caption}
                  </span>
                </div>

                {/* gauge ring + Almarai number + title inside */}
                <div className="relative h-[min(58vw,320px)] w-[min(58vw,320px)] shrink-0">
                  <svg viewBox="0 0 360 360" className="h-full w-full -rotate-90" fill="none">
                    <circle cx="180" cy="180" r="150" stroke="var(--seashell)" strokeWidth="14" />
                    <circle
                      className={`cip-ring-glow-${i}`}
                      cx="180" cy="180" r="150"
                      stroke={s.color}
                      strokeWidth="26"
                      strokeLinecap="round"
                      opacity="0"
                      style={{ filter: `drop-shadow(0 0 14px ${s.color})` }}
                    />
                    <circle
                      className={`cip-arc-${i}`}
                      cx="180" cy="180" r="150"
                      stroke={s.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <span
                      className={`cip-num-${i} font-body font-extrabold leading-none`}
                      style={{ fontSize: "clamp(56px, 11vw, 104px)", color: s.color }}
                      dir="ltr"
                    >
                      {(s.prefix ?? "") + "0" + (s.suffix ?? "")}
                    </span>
                    <span className="mt-2 text-body-4 font-bold leading-snug text-ink">{s.title}</span>
                  </div>
                </div>
              </div>

              <p className="mt-8 max-w-md text-center text-body-4 leading-relaxed text-subtext">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* conversion strip (below the pin) */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="flex flex-col items-center gap-5 rounded-[var(--radius-card)] bg-whitesmoke p-8 text-center md:flex-row md:justify-between md:p-10 md:text-right">
          <div>
            <p className="text-body-1 text-ink">أرقامٌ كهذه تبدأ بمكالمة.</p>
            <p className="mt-1 text-body-4 text-subtext">نُريك خلال 15 دقيقة ما يعنيه إغلاق الحلقة لمدينتك.</p>
          </div>
          <a
            href="#contact"
            className="pill flex shrink-0 items-center gap-2 bg-peacock px-8 py-4 text-body-3 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-horizon"
          >
            احجز عرضاً توضيحياً
            <ChevronLeft24Filled aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
