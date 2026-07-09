"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";
import CityMapBg from "@/components/CityMapBg";

/* ── App gallery — pinned, scroll-scrubbed screen reel ────────────
   The section pins. As the user scrolls, the real app screenshots
   scroll vertically THROUGH the phone (a filmstrip), one per beat,
   and the matching screen name lights up. Clicking a name smooth-
   scrolls to that beat. Mobile / reduced-motion: a static stack.

   Screens live in /public/gallary/ (1..4.png).                      */

const PIN_DISTANCE = "+=360%";

type Screen = { name: string; desc: string; hex: string; img: string };

const SCREENS: Screen[] = [
  {
    name: "الرئيسية · قائمة الرحلات",
    desc: "كل البلاغات النشطة في مكانٍ واحد، مع حالتها على المسار.",
    hex: "#44729D",
    img: "/gallary/1.png",
  },
  {
    name: "التقاط البلاغ",
    desc: "يكتشف مسار الحفرة أو التشقّق من الصورة ويقدّر خطورتها.",
    hex: "#34A8D8",
    img: "/gallary/2.png",
  },
  {
    name: "مهمة الفريق",
    desc: "يتسلّم الفريق المهمة، ويوثّق الإصلاح بدليلٍ مصوّر قبل/بعد.",
    hex: "#16668E",
    img: "/gallary/3.png",
  },
  {
    name: "رحلة البلاغ",
    desc: "المحطات الأربع بتوقيتها — من الاكتشاف حتى إغلاق الحلقة.",
    hex: "#599664",
    img: "/gallary/4.png",
  },
];

const N = SCREENS.length;

/* eslint-disable @next/next/no-img-element */
function PhoneReel({
  screensRef,
}: {
  screensRef: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div
      className="relative rounded-[46px] bg-ink p-2.5"
      style={{ height: "min(600px, 68vh)", aspectRatio: "1206 / 2622", boxShadow: "var(--shadow-lift)" }}
    >
      {/* screen viewport — screens slide across it, one per beat */}
      <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-whitesmoke">
        {SCREENS.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              screensRef.current[i] = el;
            }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={s.img}
              alt={s.name}
              className="h-full w-full object-cover object-top"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Static phone (no reel) for the mobile stack */
function StaticPhone({ img, alt }: { img: string; alt: string }) {
  return (
    <div
      className="relative shrink-0 rounded-[38px] bg-ink p-2"
      style={{ width: 220, aspectRatio: "1206 / 2622", boxShadow: "var(--shadow-lift)" }}
    >
      <div className="h-full w-full overflow-hidden rounded-[30px] bg-whitesmoke">
        <img src={img} alt={alt} className="h-full w-full object-cover object-top" />
      </div>
    </div>
  );
}

export default function AppGallery() {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screensRef = useRef<(HTMLDivElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const mounted = useRef(false);
  const lenis = useLenis();
  const [active, setActive] = useState(0);

  /* Slide carousel: each screen sits at xPercent = (i - active) * 100, so a
     change of `active` eases the next screen in while the current slides out.
     First run positions them instantly; afterwards it animates. */
  useGSAP(
    () => {
      const dur = mounted.current ? 0.6 : 0;
      screensRef.current.forEach((el, i) => {
        if (el) gsap.to(el, { xPercent: (i - active) * 100, duration: dur, ease: "power3.inOut" });
      });
      mounted.current = true;
    },
    { dependencies: [active], scope: root }
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          let last = 0;
          /* pin the stage; scroll only drives WHICH screen is active. Snap so
             the reel rests on a screen, giving each slide room to settle. */
          const st = ScrollTrigger.create({
            trigger: stageRef.current,
            pin: stageRef.current,
            start: "top top",
            end: PIN_DISTANCE,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / (N - 1), duration: 0.4, ease: "power2.inOut" },
            onUpdate: (self) => {
              const i = Math.min(N - 1, Math.round(self.progress * (N - 1)));
              if (i !== last) {
                last = i;
                setActive(i);
              }
            },
          });
          stRef.current = st;

          /* heading eases up a touch as the journey takes over */
          gsap.from(".gallery-reveal", {
            y: 34,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          });
        }
      );

      /* mobile motion: gentle in-view reveals on the stack */
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>(".gallery-stack-item").forEach((it) => {
            gsap.from(it, {
              y: 50,
              opacity: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: it, start: "top 80%" },
            });
          });
        }
      );
    },
    { scope: root }
  );

  /* Clicking a name smooth-scrolls to that beat of the pinned reel */
  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st || !lenis) {
      setActive(i);
      return;
    }
    const y = st.start + (i / (N - 1)) * (st.end - st.start);
    lenis.scrollTo(y, { duration: 1 });
  };

  return (
    <section ref={root} id="gallery" className="relative bg-white">
      {/* ── Desktop: pinned reel + synced screen list ── */}
      <div className="hidden md:block">
        <div
          ref={stageRef}
          className="relative flex h-screen flex-col overflow-hidden px-6"
        >
          <CityMapBg className="opacity-30" />

          {/* compact heading */}
          <div className="gallery-reveal relative z-10 pt-24 text-center">
            <h2 className="font-display text-display-2 text-ink">
              شاشةٌ لكل خطوة على المسار
            </h2>
            <p className="mt-2 text-body-3 text-subtext">
              مرّر لترى البلاغ يتنقّل من الميدان إلى الخريطة إلى الإغلاق.
            </p>
          </div>

          {/* two columns */}
          <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-2 items-center gap-16">
            {/* screen list (RTL: right column) */}
            <ul className="order-2 flex flex-col gap-2">
              {SCREENS.map((s, i) => {
                const isActive = i === active;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-pressed={isActive}
                      className="flex w-full items-center gap-4 rounded-[24px] p-5 text-right transition-all duration-300"
                      style={{
                        background: isActive ? "var(--whitesmoke)" : "transparent",
                        boxShadow: isActive ? "var(--shadow-soft)" : "none",
                      }}
                    >

                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-[21px] font-bold transition-colors"
                          style={{ color: isActive ? "var(--text)" : "var(--muted)" }}
                        >
                          {s.name}
                        </h3>
                        <div
                          className="grid transition-all duration-300"
                          style={{
                            gridTemplateRows: isActive ? "1fr" : "0fr",
                            opacity: isActive ? 1 : 0,
                            marginTop: isActive ? 6 : 0,
                          }}
                        >
                          <p className="overflow-hidden text-[15px] leading-relaxed text-subtext">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-body-5 font-bold text-lighttext">
                        {["1", "2", "3", "4"][i]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* phone reel (RTL: left column) */}
            <div className="order-1 flex justify-center">
              <PhoneReel screensRef={screensRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / reduced-motion: static stack ── */}
      <div className="flex flex-col gap-16 px-6 py-24 md:hidden">
        <div className="text-center">
          <h2 className="font-display text-display-2 text-ink">
            شاشةٌ لكل خطوة على المسار
          </h2>
          <p className="mt-2 text-body-3 text-subtext">
            من الميدان إلى الخريطة إلى الإغلاق.
          </p>
        </div>
        {SCREENS.map((s, i) => (
          <div
            key={i}
            className="gallery-stack-item flex flex-col items-center gap-6 text-center"
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.hex }} />
              <h3 className="text-display-4 font-bold text-ink">{s.name}</h3>
            </div>
            <p className="max-w-sm text-body-3 leading-relaxed text-subtext">
              {s.desc}
            </p>
            <StaticPhone img={s.img} alt={s.name} />
          </div>
        ))}
      </div>
    </section>
  );
}
