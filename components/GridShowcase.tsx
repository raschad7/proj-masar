"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/* ── Card types ──────────────────────────────────────────────── */
type ImageCard = {
  type: "image";
  src: string;
  alt: string;
  label: string;
  desc: string;
  grid: string;
};
type SolidCard = {
  type: "solid";
  bg: string;
  textColor: string;
  word: string;
  grid: string;
  accent?: string;
};
type CardItem = ImageCard | SolidCard;

/* ── Bento grid — 7 cards (5 images + 2 solid) ───────────────
   Desktop 4 cols × 3 rows  (320 px / 195 px / 270 px)
   ┌──────────────────────────┬──────────┐
   │                          │          │
   │   Dashboard  (3c × 1r)   │  نرصد    │  320 px
   │                          │          │
   ├──────────┬───────┬───────┴──────────┤
   │  Road    │ نُصلح │                   │
   │  (1c×1r) │(1c×1r)│  Worker (2c × 2r) │  195 px
   ├──────────┼───────┤                   │
   │  Car     │ Phone │                   │
   │  (1c×1r) │(1c×1r)│                   │  270 px
   └──────────┴───────┴───────────────────┘
   ─────────────────────────────────────────────────────────── */
const ITEMS: CardItem[] = [
  {
    type: "image",
    src: "/grid/Gemini_Generated_Image_v3jpk7v3jpk7v3jp.png",
    alt: "لوحة تحكم خريطة شبكة الطرق",
    label: "رصد ذكي",
    desc: "خريطة حيّة لحالة كل شارع",
    grid: "col-span-2 md:col-start-1 md:col-end-4 md:row-start-1",
  },
  {
    type: "solid",
    bg: "#34A8D8",
    textColor: "#ffffff",
    word: "نرصد",
    accent: "rgba(255,255,255,0.12)",
    grid: "md:col-start-4 md:row-start-1",
  },
  {
    type: "image",
    src: "/grid/pexels-annpeach-12308486.jpg",
    alt: "طريق ريفي بين الأشجار",
    label: "بنية تحتية",
    desc: "طرق تستحق العناية",
    grid: "md:col-start-1 md:row-start-2",
  },
  {
    type: "solid",
    bg: "#F0F0F0",
    textColor: "#191919",
    word: "نُصلح",
    accent: "rgba(52,168,216,0.10)",
    grid: "md:col-start-2 md:row-start-2",
  },
  {
    type: "image",
    src: "/grid/pexels-gaion-27937015.jpg",
    alt: "عامل يقوم بإصلاح الطريق",
    label: "إصلاح فعلي",
    desc: "من البلاغ إلى الإنجاز",
    grid: "md:col-start-3 md:col-end-5 md:row-start-2 md:row-end-4",
  },
  {
    type: "image",
    src: "/grid/pexels-ismail-nabhan-2159803207-36627992.jpg",
    alt: "سيارة تسير على طريق مدينة",
    label: "حياة يومية",
    desc: "شوارع تخدم الجميع",
    grid: "md:col-start-1 md:row-start-3",
  },
  {
    type: "image",
    src: "/grid/pexels-samson-katt-5226497.jpg",
    alt: "شخص يستخدم تطبيق الخرائط على الهاتف",
    label: "بلاغ مواطن",
    desc: "إبلاغ بلمسة واحدة",
    grid: "md:col-start-2 md:row-start-3",
  },
];

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

/* ── Image card ──────────────────────────────────────────────── */
function ImageTile({ item }: { item: ImageCard }) {
  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          className="grid-card-img absolute inset-0 h-[118%] w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.08]"
          style={{ transitionTimingFunction: EASE }}
        />
      </div>

      {/* Base gradient */}
      <div
        className="absolute inset-0 z-[1] transition-opacity duration-500"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)",
          opacity: 0.55,
          transitionTimingFunction: EASE,
        }}
        aria-hidden
      />
      {/* Hover teal wash */}
      <div
        className="absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(to top, rgba(25,127,176,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
          transitionTimingFunction: EASE,
        }}
        aria-hidden
      />

      {/* Content overlay */}
      <div className="absolute inset-0 z-[2] flex flex-col justify-end p-5 md:p-7">
        <span
          className="pill mb-2 inline-flex w-fit items-center gap-1.5 bg-white/90 px-3 py-1 text-[12px] font-bold text-ink backdrop-blur-sm translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:text-[13px]"
          style={{ transitionTimingFunction: EASE }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-peacock"
            aria-hidden
          />
          {item.label}
        </span>
        <p
          className="font-bold text-white translate-y-4 opacity-0 transition-all duration-500 delay-75 group-hover:translate-y-0 group-hover:opacity-100 text-[15px] md:text-[17px]"
          style={{ transitionTimingFunction: EASE }}
        >
          {item.desc}
        </p>
      </div>

      {/* Corner dot */}
      <div
        className="absolute top-4 left-4 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white/0 transition-all duration-500 group-hover:bg-white/90 group-hover:backdrop-blur-sm md:top-5 md:left-5"
        style={{ transitionTimingFunction: EASE }}
        aria-hidden
      >
        <span
          className="h-2 w-2 rounded-full bg-peacock scale-0 transition-transform duration-500 group-hover:scale-100"
          style={{ transitionTimingFunction: EASE }}
        />
      </div>
    </>
  );
}

/* ── Solid colour card ───────────────────────────────────────── */
function SolidTile({ item }: { item: SolidCard }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ borderRadius: "inherit", background: item.bg }}
    >
      {/* Decorative rings — echoes the hero radar motif */}
      <span
        className="pointer-events-none absolute h-[260%] w-[260%] rounded-full transition-transform duration-700 group-hover:scale-110"
        style={{
          border: `1.5px solid ${item.accent ?? "rgba(255,255,255,0.1)"}`,
          transitionTimingFunction: EASE,
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute h-[160%] w-[160%] rounded-full transition-transform duration-700 group-hover:scale-110"
        style={{
          border: `1.5px solid ${item.accent ?? "rgba(255,255,255,0.1)"}`,
          transitionTimingFunction: EASE,
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute h-[70%] w-[70%] rounded-full transition-transform duration-700 group-hover:scale-110"
        style={{
          border: `1.5px solid ${item.accent ?? "rgba(255,255,255,0.1)"}`,
          transitionTimingFunction: EASE,
        }}
        aria-hidden
      />

      {/* Word */}
      <span
        className="font-display relative z-[1] select-none transition-transform duration-500 group-hover:scale-110"
        style={{
          color: item.textColor,
          fontSize: "clamp(36px, 5vw, 54px)",
          lineHeight: 1,
          transitionTimingFunction: EASE,
        }}
      >
        {item.word}
      </span>
    </div>
  );
}

/* ── Main section ────────────────────────────────────────────── */
export default function GridShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".grid-card");
        cards.forEach((card, i) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            scale: 0.95,
            duration: 0.85,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });

        /* Parallax on image cards */
        cards.forEach((card) => {
          const img = card.querySelector<HTMLElement>(".grid-card-img");
          if (img) {
            gsap.to(img, {
              yPercent: -8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="grid-showcase"
      className="relative overflow-hidden bg-white px-6 py-28 md:py-36"
    >
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
        <span className="pill mb-6 inline-flex items-center gap-2 bg-whitesmoke px-5 py-2.5 text-body-5 font-bold text-subtext shadow-[var(--shadow-soft)]">
          <span className="h-2 w-2 rounded-full bg-peacock" aria-hidden />
          من الميدان
        </span>
        <h2 className="font-display text-display-2 text-ink mt-4">
          كل صورة، <span className="text-peacock">قصة طريق</span>
        </h2>
        <p
          className="mt-6 text-subtext"
          style={{ fontSize: 19, lineHeight: 1.85 }}
        >
          من رصد الأضرار عبر الخرائط الذكية، إلى الإصلاح الفعلي على أرض الواقع
          — مسار يغطّي كل مرحلة.
        </p>
      </div>

      {/* ── Bento wrapper — subtle bg so the rounded gaps show ── */}
      <div
        className="mx-auto max-w-[1200px] rounded-[36px] p-2.5 md:p-3"
        style={{ background: "#E9E9E9" }}
      >
        <div
          className="grid grid-cols-2 auto-rows-[170px] gap-2.5 md:grid-cols-4 md:grid-rows-[320px_195px_270px] md:auto-rows-auto md:gap-3"
        >
          {ITEMS.map((item) => (
            <div
              key={item.type === "image" ? item.src : item.word}
              className={`grid-card group relative overflow-hidden ${item.grid}`}
              style={{ borderRadius: 24 }}
            >
              {item.type === "image" ? (
                <ImageTile item={item} />
              ) : (
                <SolidTile item={item} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
