"use client";

import { useRef } from "react";
import { Checkmark24Filled, ChevronLeft24Filled } from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";

/* TiqmoImpact — a pinned wipe-up slideshow (à la Tiqmo).
   Four full-screen feature cards stacked on top of each other; as you
   scroll, each next card slides up from below and wipes over the one
   before it, its inner content counter-drifting for depth. Same four
   features as FeaturesSection. Headers in Rubbama (font-display), body in
   Almarai (font-body), counters in Latin digits at Almarai ExtraBold.
   Each card has its own rich background with a barely-there dark right
   edge. Mobile / reduced motion → a plain vertical stack (no pin). */

/* ── Flat illustrations (brand palette, light shapes read well on the
      dark cards) ─────────────────────────────────────────────────── */
const ARROW_PATH =
  "M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z";

function MapArrow({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <svg x={x - 15} y={y - 17} width={30} height={34} viewBox="18 17 20 23">
      <path d={ARROW_PATH} fill={fill} />
    </svg>
  );
}

function IlloDetect() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      <rect x="40" y="170" width="320" height="90" rx="28" fill="#ffffff" opacity="0.92" />
      <rect x="70" y="209" width="44" height="12" rx="6" fill="#0e2036" />
      <rect x="290" y="209" width="44" height="12" rx="6" fill="#0e2036" />
      <ellipse cx="200" cy="215" rx="56" ry="26" fill="#0e2036" />
      <path d="M128 168 h-24 a12 12 0 0 0 -12 12 v24" stroke="#34A8D8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M272 168 h24 a12 12 0 0 1 12 12 v24" stroke="#34A8D8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128 262 h-24 a12 12 0 0 1 -12 -12 v-24" stroke="#34A8D8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M272 262 h24 a12 12 0 0 0 12 -12 v-24" stroke="#34A8D8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="308" cy="132" r="12" fill="#FFAB00" />
    </svg>
  );
}
function IlloMap() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      <rect x="60" y="30" width="280" height="240" rx="32" fill="#ffffff" opacity="0.92" />
      <path d="M60 110 H340" stroke="#0f3b4d" strokeWidth="14" strokeLinecap="round" />
      <path d="M160 30 V270" stroke="#0f3b4d" strokeWidth="14" strokeLinecap="round" />
      <path d="M60 210 C 140 180, 260 240, 340 200" stroke="#0f3b4d" strokeWidth="14" strokeLinecap="round" />
      <MapArrow x={120} y={80} fill="#0072DA" />
      <MapArrow x={250} y={150} fill="#FFAB00" />
      <MapArrow x={300} y={70} fill="#CC3931" />
      <MapArrow x={200} y={235} fill="#088A20" />
    </svg>
  );
}
function IlloPriority() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      <rect x="70" y="52" width="260" height="56" rx="28" fill="#CC3931" />
      <circle cx="106" cy="80" r="10" fill="#ffffff" />
      <rect x="95" y="128" width="210" height="56" rx="28" fill="#FFAB00" />
      <circle cx="131" cy="156" r="10" fill="#ffffff" />
      <rect x="120" y="204" width="160" height="56" rx="28" fill="#ffffff" opacity="0.9" />
      <circle cx="156" cy="232" r="10" fill="#7c3a15" />
    </svg>
  );
}
function IlloEvidence() {
  return (
    <svg viewBox="0 0 400 300" className="w-full" fill="none" aria-hidden>
      <rect x="55" y="60" width="290" height="180" rx="32" fill="#ffffff" opacity="0.92" />
      <path d="M300 96 L272 138 L296 168 L268 206" stroke="#123d29" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M55 92 a32 32 0 0 1 32 -32 h113 v180 h-113 a32 32 0 0 1 -32 -32 z" fill="#088A20" />
      <path d="M105 150 l22 22 l40 -44" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="194" y="48" width="12" height="204" rx="6" fill="#ffffff" />
    </svg>
  );
}

type Card = {
  key: string;
  eyebrow: string;
  title: string;
  sub: string;
  bullets: string[];
  bg: string; // base background color
  accent: string; // checkmark / detail color
  Illo: () => React.JSX.Element;
};

const CARDS: Card[] = [
  {
    key: "detect",
    eyebrow: "ميزات مسار",
    title: "كشفٌ تلقائي",
    sub: "يرى الضرر قبل أن يراه أحد.",
    bullets: [
      "كشف تلقائي للحفر والتشقّقات",
      "تقدير درجة الخطورة",
      "من صورة الهاتف مباشرة",
      "يعمل أثناء القيادة",
      "نموذج رؤية مُدرَّب محليًا",
    ],
    bg: "#12335c",
    accent: "#34A8D8",
    Illo: IlloDetect,
  },
  {
    key: "map",
    eyebrow: "ميزات مسار",
    title: "خريطةٌ موحّدة",
    sub: "كل بلاغٍ في مكانه على المدينة.",
    bullets: [
      "كل البلاغات على خريطة واحدة",
      "تحديثٌ لحظي",
      "تصفية حسب الحي والحالة",
      "عرض المسارات المكتملة",
      "طبقات حسب نوع الضرر",
    ],
    bg: "#0f3b4d",
    accent: "#5ccbe6",
    Illo: IlloMap,
  },
  {
    key: "priority",
    eyebrow: "ميزات مسار",
    title: "أولويةٌ ذكية",
    sub: "الأهمّ أولاً، تلقائياً.",
    bullets: [
      "ترتيب حسب الخطورة",
      "مراعاة الموقع والكثافة",
      "إسنادٌ تلقائي للفرق",
      "تنبيهات للحالات الحرجة",
      "لوحة عملٍ يومية",
    ],
    bg: "#7c3a15",
    accent: "#FFC24D",
    Illo: IlloPriority,
  },
  {
    key: "evidence",
    eyebrow: "ميزات مسار",
    title: "دليلٌ مصوّر",
    sub: "قبل، وبعد — موثّق.",
    bullets: [
      "دليلٌ مصوّر قبل وبعد",
      "توثيق كل إصلاح",
      "تقارير جاهزة للمجلس",
      "سجلٌّ زمني كامل",
      "مساءلةٌ وشفافية",
    ],
    bg: "#123d29",
    accent: "#6fcf97",
    Illo: IlloEvidence,
  },
];

const N = CARDS.length;

export default function TiqmoImpact() {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        stack.current!.classList.add("tiq-animated");

        // incoming panels wait below the fold; their content pre-offset for parallax
        for (let i = 1; i < N; i++) {
          gsap.set(`.tiq-panel-${i}`, { yPercent: 100 });
          gsap.set(`.tiq-panel-${i} .tiq-inner`, { yPercent: -35 });
        }
        gsap.set(".tiq-dot", { opacity: 0.3 });
        gsap.set(".tiq-dot-0", { opacity: 1 });

        const MOVE = 1;
        const HOLD = 0.5;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            scrub: 1,
            start: "top top",
            end: "+=" + N * 100 + "%",
            invalidateOnRefresh: true,
          },
        });

        tl.to({}, { duration: HOLD }); // dwell on first card

        for (let i = 1; i < N; i++) {
          const at = tl.duration();
          // wipe the next panel up over the current one
          tl.to(`.tiq-panel-${i}`, { yPercent: 0, duration: MOVE, ease: "power2.inOut" }, at);
          // its content settles into place (parallax)
          tl.to(`.tiq-panel-${i} .tiq-inner`, { yPercent: 0, duration: MOVE, ease: "power2.inOut" }, at);
          // the covered panel drifts up slightly as it's buried
          tl.to(`.tiq-panel-${i - 1} .tiq-inner`, { yPercent: 12, duration: MOVE, ease: "power2.inOut" }, at);
          // progress dots
          tl.to(`.tiq-dot-${i}`, { opacity: 1, duration: 0.15 }, at + MOVE * 0.6);
          tl.to(`.tiq-dot-${i - 1}`, { opacity: 0.3, duration: 0.15 }, at + MOVE * 0.6);
          tl.to({}, { duration: HOLD }); // dwell on the new card
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="tiqmo-impact" className="relative bg-white">
      <div ref={stack} className="tiq-stack relative">
        {CARDS.map((c, i) => (
          <div
            key={c.key}
            className={`tiq-panel tiq-panel-${i} overflow-hidden`}
            style={{ background: c.bg, zIndex: i + 1 }}
          >
            {/* barely-there dark right edge */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.18), transparent 34%)" }}
              aria-hidden
            />

            <div className="tiq-inner relative mx-auto flex h-full min-h-screen max-w-6xl flex-col justify-center px-8 py-24 md:min-h-0 md:px-12">
              {/* counter — Latin digits, Almarai ExtraBold */}
              <div className="absolute right-8 top-10 flex items-center gap-4 text-white/75 md:right-12">
                <span className="font-body text-body-5 font-bold">{c.eyebrow}</span>
                <span dir="ltr" className="font-body text-body-4 font-extrabold tabular-nums">
                  {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </span>
              </div>

              {/* text (right in RTL) · illustration (left) */}
              <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:justify-between md:gap-8">
                <div className="w-full max-w-md text-center md:text-right">
                  <h3
                    className="font-display leading-[1.05] text-white"
                    style={{ fontSize: "clamp(44px, 5.5vw, 76px)" }}
                  >
                    {c.title}
                  </h3>
                  <p className="mt-4 font-body text-body-2 leading-relaxed text-white/85">{c.sub}</p>

                  <ul className="mt-7 flex flex-col gap-3.5">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-center justify-center gap-2.5 font-body text-body-4 text-white/90 md:justify-start">
                        <Checkmark24Filled aria-hidden className="shrink-0" style={{ color: c.accent }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="pill mt-9 inline-flex items-center gap-2 bg-white px-8 py-4 text-body-3 font-bold text-ink transition-transform duration-300 hover:-translate-y-1"
                  >
                    اكتشف المزيد
                    <ChevronLeft24Filled aria-hidden style={{ color: c.accent }} />
                  </a>
                </div>

                <div className="w-full max-w-[440px] shrink-0">
                  <c.Illo />
                </div>
              </div>

              {/* brand lockup bottom-left */}
              <div className="absolute bottom-10 left-8 flex items-center gap-2.5 md:left-12">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo/Logo 6.svg" alt="" className="h-7 w-7 [filter:brightness(0)_invert(1)]" aria-hidden />
                <span className="font-body text-body-5 text-white/60">منصّة إدارة أضرار الطرق للبلديات.</span>
              </div>
            </div>
          </div>
        ))}

        {/* progress dots */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2.5" aria-hidden>
          {CARDS.map((_, i) => (
            <span key={i} className={`tiq-dot tiq-dot-${i} h-2.5 w-2.5 rounded-full bg-white`} />
          ))}
        </div>
      </div>
    </section>
  );
}
