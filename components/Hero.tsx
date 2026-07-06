"use client";

import { useRef } from "react";
import { ChevronRight24Filled, Play24Filled } from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";

/* ── Timing constants (seconds) — tune here ─────────────────── */
const T = {
  badge: 0,
  line1: 0.12,
  line2: 0.26,
  line3: 0.4,
  subtitle: 0.56,
  buttons: 0.68,
  hint: 1.3,
  lineDur: 0.9,
};

const HEADLINE = ["بلاغٌ واحد،", "طريقٌ واحد،", "حلقةٌ تُغلق"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Full choreography only when motion is welcome.
      // DOM defaults are the final resting state, so the reduced-motion
      // branch needs no code at all.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ease = "power3.out";

        /* Orchestrated entrance */
        const tl = gsap.timeline({ defaults: { ease } });
        tl.from(".hero-badge", { y: 16, opacity: 0, duration: 0.7 }, T.badge);
        HEADLINE.forEach((_, i) => {
          tl.from(
            `.hero-line-${i}`,
            { yPercent: 105, duration: T.lineDur },
            [T.line1, T.line2, T.line3][i]
          );
        });
        tl.from(".hero-subtitle", { y: 24, opacity: 0, duration: 0.8 }, T.subtitle);
        tl.from(".hero-buttons", { y: 24, opacity: 0, duration: 0.8 }, T.buttons);
        tl.from(".hero-hint", { opacity: 0, duration: 0.8 }, T.hint);

        /* Parallax hand-off — text rises faster than the signal,
           the camera starts pushing down into the city. */
        gsap.to(".hero-content", {
          yPercent: -28,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top", // fully faded after ~1 viewport of scroll
            scrub: true,
          },
        });
        gsap.to(".hero-signal", {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 pt-[72px]"
    >
      <CityMapBg className="opacity-50" />

      {/* The seed of the whole story: one pulsing report signal */}
      <div
        className="hero-signal absolute"
        style={{ right: "34%", top: "38%" }}
        aria-hidden
      >
        <div className="relative h-4 w-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="radar-ring absolute inset-0 rounded-full bg-informative/40"
            />
          ))}
          <span className="radar-core absolute inset-0 rounded-full bg-informative" />
        </div>
      </div>

      <div className="hero-content relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <span className="hero-badge pill mb-8 flex items-center gap-2 bg-whitesmoke px-5 py-2.5 text-[14px] font-bold text-subtext shadow-[var(--shadow-soft)]">
          <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
          مصمَّم لبلديات فلسطين
        </span>

        {/* Headline — each line rises from behind a clip mask */}
        <h1
          className="font-display text-ink"
          style={{
            fontSize: "clamp(38px, 7vw, 82px)",
            lineHeight: 1.16,
          }}
        >
          {HEADLINE.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span className={`hero-line-${i} block`}>
                {i === 2 ? (
                  <>
                    حلقةٌ <span className="text-peacock">تُغلق</span>
                  </>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle mt-8 max-w-[660px] text-subtext"
          style={{ fontSize: 21, lineHeight: 1.9 }}
        >
          مسار يحوّل بلاغات الطرق المتناثرة — من{" "}
          <strong className="font-bold text-ink">مكالمة وواتساب وورقة</strong> —
          إلى مسارٍ واحد واضح: يُكتشف، يُسنَد، يُصلَح، ويُغلَق. كل ذلك على خريطة
          مدينتك.
        </p>

        {/* Buttons */}
        <div className="hero-buttons mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#contact"
            className="pill flex items-center gap-2 bg-peacock px-8 py-4 text-[18px] font-bold text-white transition-colors hover:bg-horizon"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            احجز عرضاً توضيحياً
            <ChevronRight24Filled aria-hidden />
          </a>
          <a
            href="#path"
            className="pill flex items-center gap-2 bg-whitesmoke px-8 py-4 text-[18px] font-bold text-ink shadow-[var(--shadow-soft)] transition-colors hover:bg-seashell"
          >
            <Play24Filled className="text-peacock" aria-hidden />
            شاهد كيف يعمل
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-hint absolute bottom-8 z-10 flex flex-col items-center gap-2 text-lighttext">
        <span
          aria-hidden
          className="flex h-10 w-6 items-start justify-center rounded-full p-1.5"
          style={{ boxShadow: "inset 0 0 0 2px var(--light)" }}
        >
          <span className="wheel-dot h-1.5 w-1.5 rounded-full bg-lighttext" />
        </span>
        <span className="text-[14px]">تابع النزول</span>
      </div>
    </section>
  );
}
