"use client";

import { useRef } from "react";
import { ChevronLeft24Filled } from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";

/* Final payoff: one road draws across, a report pin travels it and
   drops onto the CTA — the whole "close the loop" story in one gesture.
   Scrubbed on entry so the user drives the reveal. Not pinned. */

const ROAD_D =
  "M40 130 C 260 60, 420 190, 640 120 S 900 60, 980 110";

export default function CTASection() {
  const root = useRef<HTMLElement>(null);
  const roadRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".cta-road", { drawSVG: "0%" });
        gsap.set(".cta-pin", { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            end: "top 25%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // headline lines rise from behind clip masks
        tl.from(".cta-line", { yPercent: 110, duration: 1, stagger: 0.3, ease: "power3.out" }, 0);
        // road draws in
        tl.to(".cta-road", { drawSVG: "100%", duration: 2.4, ease: "none" }, 0.3);
        // pin rides the road, then settles
        tl.to(".cta-pin", { opacity: 1, duration: 0.1 }, 0.3);
        tl.to(
          ".cta-pin",
          {
            motionPath: {
              path: roadRef.current!,
              align: roadRef.current!,
              alignOrigin: [0.5, 1],
            },
            duration: 2.4,
            ease: "none",
          },
          0.3
        );
        // subtitle + buttons land last
        tl.from(".cta-sub", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, 1.8);
        tl.from(".cta-buttons", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, 2.1);
      });

      // subtle idle float on the pin's landing ring
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".cta-ping", {
          scale: 2.4,
          opacity: 0,
          duration: 1.8,
          ease: "power2.out",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="contact" className="bg-white px-6 py-24">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden bg-peacock px-8 py-24 text-center md:px-16 md:py-32"
        style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-lift)" }}
      >
        {/* road + travelling pin */}
        <svg
          className="pointer-events-none absolute inset-x-0 top-10 mx-auto w-full max-w-3xl opacity-90"
          viewBox="0 0 1020 200"
          fill="none"
          aria-hidden
        >
          <path
            ref={roadRef}
            className="cta-road"
            d={ROAD_D}
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <g className="cta-pin">
            <circle className="cta-ping" cx="0" cy="0" r="14" fill="rgba(255,255,255,0.4)" />
            <circle cx="0" cy="0" r="10" fill="var(--white)" />
            <circle cx="0" cy="0" r="4" fill="var(--peacock)" />
          </g>
        </svg>

        <div className="relative z-10">
          <h2 className="font-display text-display-1 text-white">
            <span className="block overflow-hidden">
              <span className="cta-line block">جاهزون لإغلاق الحلقة</span>
            </span>
            <span className="block overflow-hidden">
              <span className="cta-line block">في مدينتك؟</span>
            </span>
          </h2>

          <p className="cta-sub mx-auto mt-6 max-w-xl text-body-2 leading-relaxed text-white/85">
            احجز عرضاً توضيحياً ونُريك كيف يتحوّل كل بلاغ طريقٍ إلى مسارٍ واضح —
            على خريطة مدينتك.
          </p>

          <div className="cta-buttons mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@masar.ps"
              className="pill flex items-center gap-2 bg-white px-9 py-4 text-body-3 font-bold text-peacock transition-transform hover:scale-[1.03]"
              style={{ boxShadow: "var(--shadow-lift)" }}
            >
              احجز عرضاً توضيحياً
              <ChevronLeft24Filled aria-hidden />
            </a>
            <a
              href="mailto:hello@masar.ps"
              className="pill bg-white/15 px-9 py-4 text-body-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
