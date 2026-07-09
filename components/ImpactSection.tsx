"use client";

import { useRef } from "react";
import {
  ArrowRepeatAll24Filled,
  Scan24Filled,
  ChatDismiss24Filled,
  Money24Filled,
  ChevronLeft24Filled,
} from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";

/* ── Illustrative sample figures (framed on-page as أرقام توضيحية) ──
   Chosen to sell: speed, fewer repeat complaints, saved maintenance
   cost, closure rate, detection accuracy — the outcomes a municipality
   decides on. Swap these for real pilot data anytime. */
const LOOP_RATE = 92; // % closed loops (gauge)
const COMPLAINTS = 60; // % fewer repeat complaints
const SAVINGS = 35; // % saved on emergency maintenance
const ACCURACY = 94; // % detection accuracy

const R = 110;
const CX = 130;
const CY = 130;

const toAr = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

const CARD_HOVER =
  "transition-[transform,box-shadow] duration-300 will-change-transform hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]";

export default function ImpactSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* cards fade/rise once on entry. clearProps removes the inline
           transform GSAP leaves behind — otherwise it overrides the CSS
           hover-lift and the cards wouldn't move on hover. */
        gsap.from(".impact-reveal", {
          y: 44,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });

        /* everything numeric is SCRUBBED — it grows as the user scrolls */
        gsap.set(".impact-gauge-arc", { drawSVG: "0%" });
        gsap.set(".impact-bar", { scaleX: 0, transformOrigin: "100% 50%" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            end: "top 25%",
            scrub: true,
          },
        });

        const count = (
          sel: string,
          from: number,
          to: number,
          suffix: string,
          at: number,
          dur = 0.9
        ) => {
          const el = root.current!.querySelector<HTMLElement>(sel);
          if (!el) return;
          const p = { v: from };
          el.textContent = toAr(from) + suffix;
          tl.to(
            p,
            {
              v: to,
              duration: dur,
              ease: "none",
              onUpdate: () => (el.textContent = toAr(Math.round(p.v)) + suffix),
            },
            at
          );
        };

        /* gauge draws + counts up together */
        tl.to(".impact-gauge-arc", { drawSVG: `${LOOP_RATE}%`, duration: 1, ease: "none" }, 0);
        count(".impact-gauge-num", 0, LOOP_RATE, "٪", 0, 1);

        /* stat cards */
        count(".impact-num-complaints", 0, COMPLAINTS, "٪", 0.1);
        count(".impact-num-savings", 0, SAVINGS, "٪", 0.2);
        count(".impact-num-acc", 0, ACCURACY, "٪", 0.3);

        /* bars fill with them */
        tl.to(".impact-bar-complaints", { scaleX: COMPLAINTS / 100, duration: 0.9, ease: "none" }, 0.1);
        tl.to(".impact-bar-savings", { scaleX: SAVINGS / 100, duration: 0.9, ease: "none" }, 0.2);
        tl.to(".impact-bar-acc", { scaleX: ACCURACY / 100, duration: 0.9, ease: "none" }, 0.3);
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="impact"
      className="relative overflow-hidden bg-white px-6 py-28 md:py-36"
    >
      <CityMapBg className="opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="impact-reveal font-display text-display-1 text-ink">
            نتائجُ تُقنع مجلس البلدية
          </h2>
          <p className="impact-reveal mx-auto mt-3 max-w-xl text-body-2 text-subtext">
            حين تُغلق الحلقة، يتحسّن كل رقمٍ يهمّ المدينة: أسرع، أقلّ شكاوى،
            وأوفر تكلفة.
          </p>
        </div>

        {/* ── Grid: gauge (right) + 3 selling stat cards stacked (left) ── */}
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          {/* Loop-closure gauge */}
          <div
            className={`impact-reveal card-surface flex flex-col items-center justify-center p-8 ${CARD_HOVER}`}
          >
            <div className="relative">
              <svg viewBox="0 0 260 260" className="h-56 w-56 md:h-64 md:w-64" fill="none">
                <circle cx={CX} cy={CY} r={R} stroke="var(--seashell)" strokeWidth="18" strokeLinecap="round" />
                <circle
                  className="impact-gauge-arc"
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke="url(#impactGauge)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
                <defs>
                  <linearGradient id="impactGauge" gradientUnits="userSpaceOnUse" x1="20" y1="20" x2="240" y2="240">
                    <stop offset="0%" stopColor="#44729D" />
                    <stop offset="55%" stopColor="#34A8D8" />
                    <stop offset="100%" stopColor="#599664" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ArrowRepeatAll24Filled className="mb-1 text-positive" style={{ width: 30, height: 30 }} aria-hidden />
                <span className="impact-gauge-num font-display text-[60px] leading-none text-ink">
                  {toAr(LOOP_RATE)}٪
                </span>
                <span className="mt-2 text-body-4 font-bold text-subtext">نسبة إغلاق الحلقة</span>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-center text-[15px] leading-relaxed text-subtext">
              من البلاغات تُغلق بالكامل — من الاكتشاف حتى الدليل المصوّر.
            </p>
          </div>

          {/* Stacked stat cards */}
          <div className="flex flex-col gap-6">
          {/* Fewer repeat complaints */}
          <div className={`impact-reveal card-surface flex-1 p-7 ${CARD_HOVER}`}>
            <div className="flex items-center gap-2 text-notice">
              <ChatDismiss24Filled aria-hidden />
              <span className="text-body-5 font-bold text-lighttext">شكاوى متكررة أقلّ</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-body-3 font-bold text-subtext">−</span>
              <span className="impact-num-complaints font-display text-[48px] leading-none text-ink">
                {toAr(COMPLAINTS)}٪
              </span>
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-seashell">
              <div className="impact-bar impact-bar-complaints h-full rounded-full bg-notice" style={{ width: `${COMPLAINTS}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-lighttext">لأن المواطن يرى بلاغه يتحرّك ويُغلق.</p>
          </div>

          {/* Maintenance cost saved */}
          <div className={`impact-reveal card-surface flex-1 p-7 ${CARD_HOVER}`}>
            <div className="flex items-center gap-2 text-positive">
              <Money24Filled aria-hidden />
              <span className="text-body-5 font-bold text-lighttext">توفير صيانة طارئة</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="impact-num-savings font-display text-[48px] leading-none text-ink">
                {toAr(SAVINGS)}٪
              </span>
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-seashell">
              <div className="impact-bar impact-bar-savings h-full rounded-full bg-positive" style={{ width: `${SAVINGS}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-lighttext">الإصلاح المبكر أرخص من الطارئ.</p>
          </div>

          {/* Detection accuracy */}
          <div className={`impact-reveal card-surface flex-1 p-7 ${CARD_HOVER}`}>
            <div className="flex items-center gap-2 text-informative">
              <Scan24Filled aria-hidden />
              <span className="text-body-5 font-bold text-lighttext">دقة الكشف التلقائي</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="impact-num-acc font-display text-[48px] leading-none text-ink">
                {toAr(ACCURACY)}٪
              </span>
              <span className="text-body-5 text-subtext">من الحفر والتشقّقات</span>
            </div>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-seashell">
              <div className="impact-bar impact-bar-acc h-full rounded-full bg-informative" style={{ width: `${ACCURACY}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-lighttext">قبل أن يصل البلاغ للمشرف.</p>
          </div>
          </div>
        </div>

        {/* ── Conversion strip ── */}
        <div className="impact-reveal mt-8 flex flex-col items-center gap-5 rounded-[var(--radius-card)] bg-whitesmoke p-8 text-center md:flex-row md:justify-between md:p-10 md:text-right">
          <div>
            <p className="text-body-1 text-ink">أرقامٌ كهذه تبدأ بمكالمة.</p>
            <p className="mt-1 text-body-4 text-subtext">
              نُريك خلال ١٥ دقيقة ما يعنيه إغلاق الحلقة لمدينتك.
            </p>
          </div>
          <a
            href="#contact"
            className="pill flex shrink-0 items-center gap-2 bg-peacock px-8 py-4 text-body-3 font-bold text-white transition-colors hover:bg-horizon"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            احجز عرضاً توضيحياً
            <ChevronLeft24Filled aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
