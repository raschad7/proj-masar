"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import DetectionFootage from "@/components/DetectionFootage";

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : scroll consumed by the pinned analysis
   Timeline runs 0 → 5, one unit per beat:
   ٠ يلتقط · ١ يرى · ٢ يصنّف · ٣ يوطّن · ٤ يزامن                    */
const PIN_DISTANCE = "+=500%";

const STEPS = [
  { label: "يلتقط", hex: "#34A8D8" },
  { label: "يرى", hex: "#44729D" },
  { label: "يصنّف", hex: "#D1A242" },
  { label: "يوطّن", hex: "#16668E" },
  { label: "يزامن", hex: "#599664" },
];



/* Detection boxes (SVG viewBox coords) */
const BOX_POTHOLE = { x: 185, y: 238, w: 215, h: 130 };
const BOX_CRACK = { x: 525, y: 165, w: 150, h: 225 };

export default function TechSection() {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* DOM defaults are the fully-annotated frame (the static
         mobile / reduced-motion fallback). The desktop branch strips
         it back and re-draws it beat-by-beat under scroll. */
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Initial: raw frame only */
          gsap.set(".tech-scan", { xPercent: -130, opacity: 0 });
          gsap.set(".tech-rect", { drawSVG: "0%" });
          gsap.set(".tech-chip", { opacity: 0, scale: 0.6 });
          gsap.set(".tech-conf", { scaleX: 0, transformOrigin: "100% 50%" });
          gsap.set(".tech-coords", { opacity: 0, y: -8 });
          gsap.set(".tech-map", { yPercent: 135 });
          gsap.set(".tech-pin", { opacity: 0 });
          gsap.set(".tech-extra-pin", { opacity: 0, scale: 0 });
          gsap.set(".tech-step-fill", { opacity: 0 });

          /* pin ONLY the stage — the footage climax lives in the
             section's normal-scroll tail, after the unpin */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              pin: stageRef.current,
              scrub: true,
              start: "top top",
              end: PIN_DISTANCE,
              invalidateOnRefresh: true,
            },
          });

          const step = (i: number, at: number) =>
            tl.to(`.tech-step-fill-${i}`, { opacity: 1, duration: 0.12 }, at);

          /* ── Beat 1 · يلتقط — scan-line sweeps once ── */
          step(0, 0.05);
          tl.to(".tech-scan", { opacity: 1, duration: 0.08 }, 0.08);
          tl.to(".tech-scan", { xPercent: 130, duration: 0.6, ease: "none" }, 0.12);
          tl.to(".tech-scan", { opacity: 0, duration: 0.12 }, 0.68);

          /* ── Beat 2 · يرى — THE HERO BEAT.
             Bounding boxes connect (machine-vision feel).
             Pothole box leads, crack box follows. Hold to settle. ── */
          step(1, 1);
          tl.to(".tb-pothole .tech-rect", { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" }, 1.1);
          tl.to(".tb-crack .tech-rect", { drawSVG: "100%", duration: 0.4, ease: "power2.inOut" }, 1.4);

          /* ── Beat 3 · يصنّف — label chips pop + confidence fills ── */
          step(2, 2);
          tl.to(".tech-chip", { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)", stagger: 0.18 }, 2.08);
          tl.to(".tech-conf", { scaleX: 1, duration: 0.3, stagger: 0.18, ease: "power2.out" }, 2.3);

          /* ── Beat 4 · يوطّن — coords flash, map slides in, pin drops ── */
          step(3, 3);
          tl.to(".tech-coords", { opacity: 1, y: 0, duration: 0.15 }, 3.05);
          tl.to(".tech-map", { yPercent: 0, duration: 0.35, ease: "power3.out" }, 3.2);
          tl.to(".tech-coords", { opacity: 0, duration: 0.15 }, 3.65);
          tl.to(".tech-pin", { opacity: 1, duration: 0.04 }, 3.5);
          tl.from(
            ".tech-pin",
            {
              motionPath: {
                path: [
                  { x: -30, y: -190 },
                  { x: 8, y: -90 },
                  { x: 0, y: 0 },
                ],
                curviness: 1.4,
              },
              duration: 0.4,
              ease: "power2.in",
              immediateRender: false,
            },
            3.5
          );
          tl.fromTo(
            ".tech-pin-ring",
            { scale: 0.4, opacity: 0.6 },
            { scale: 2.4, opacity: 0, duration: 0.3, transformOrigin: "50% 50%" },
            3.9
          );

          /* ── Beat 5 · يزامن — the report joins the live city ── */
          step(4, 4);
          tl.to(".tech-map", { scale: 1.05, duration: 0.4, ease: "power2.out" }, 4.1);
          tl.to(".tech-extra-pin", { opacity: 1, scale: 1, duration: 0.2, stagger: 0.1, ease: "back.out(2)" }, 4.2);
          tl.to({}, { duration: 0.4 }); // settle
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} id="tech" className="relative bg-white">
      <div
        ref={stageRef}
        className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 md:h-screen"
      >
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="font-display text-display-1 text-ink">
            مسار يرى الطريق
          </h2>
          <p className="mt-3 text-body-2 text-subtext">
            من صورة… إلى بلاغٍ مُوطَّن على الخريطة.
          </p>
        </div>

        {/* ── Camera frame ── */}
        <div
          className="card-surface relative w-full overflow-hidden"
          style={{
            borderRadius: "var(--radius-card)",
            /* never taller than the space under the heading + tracker,
               so the whole street (pothole + crack) is visible at 100% zoom */
            maxWidth: "min(860px, calc((100vh - 360px) * 1.739))",
          }}
        >
          {/* Road scene — flat vector. TODO: asset — may be swapped for a
              real photo; overlays below stay as the SVG/HTML annotation layer. */}
          <svg viewBox="0 0 800 460" className="block w-full" fill="none" aria-hidden>
            {/* sky */}
            <rect width="800" height="460" fill="var(--whitesmoke)" />
            {/* building skyline — flat rounded blocks */}
            <rect x="30" y="52" width="110" height="88" rx="14" fill="var(--seashell)" />
            <rect x="160" y="24" width="90" height="116" rx="14" fill="var(--seashell)" />
            <rect x="270" y="70" width="130" height="70" rx="14" fill="var(--seashell)" />
            <rect x="420" y="38" width="100" height="102" rx="14" fill="var(--seashell)" />
            <rect x="540" y="80" width="120" height="60" rx="14" fill="var(--seashell)" />
            <rect x="680" y="46" width="95" height="94" rx="14" fill="var(--seashell)" />
            {/* sidewalk + curb */}
            <rect x="0" y="140" width="800" height="38" fill="var(--white)" />
            <rect x="0" y="172" width="800" height="10" fill="var(--seashell)" />
            {/* asphalt */}
            <rect x="0" y="182" width="800" height="278" fill="var(--light)" />
            {/* crosswalk */}
            {[48, 84, 120, 156].map((x) => (
              <rect key={x} x={x} y="205" width="20" height="230" rx="10" fill="var(--white)" opacity="0.9" />
            ))}
            {/* center lane dashes */}
            {[230, 350, 470, 590, 710].map((x) => (
              <rect key={x} x={x} y="312" width="64" height="13" rx="6.5" fill="var(--white)" opacity="0.95" />
            ))}
            {/* pothole — one clear dark blob, fully inside its box */}
            <ellipse cx="292" cy="303" rx="76" ry="33" fill="var(--text)" />
            <ellipse cx="242" cy="290" rx="26" ry="15" fill="var(--text)" />
            <ellipse cx="348" cy="294" rx="26" ry="16" fill="var(--text)" />
            {/* crack — bold branched fracture */}
            <path
              d="M565 190 L585 235 L570 275 L600 320 L585 362"
              stroke="var(--text)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M585 235 L622 253 L640 287"
              stroke="var(--text)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* detection overlays */}
            {[
              { cls: "tb-pothole", box: BOX_POTHOLE, hex: "#44729D" },
              { cls: "tb-crack", box: BOX_CRACK, hex: "#44729D" },
            ].map(({ cls, box, hex }) => (
              <g key={cls} className={cls}>
                <rect
                  className="tech-rect"
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="14"
                  stroke={hex}
                  strokeWidth="4"
                  opacity="0.85"
                />
              </g>
            ))}
          </svg>

          {/* scan line */}
          <div
            className="tech-scan pointer-events-none absolute inset-y-0 right-0 w-full"
            aria-hidden
          >
            <div className="absolute inset-y-0 right-1/2 w-24" style={{ background: "rgba(52,168,216,0.08)" }} />
            <div className="absolute inset-y-0 right-1/2 w-1 rounded-full bg-peacock" />
          </div>

          {/* label chips */}
          <div className="tech-chip absolute flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]" style={{ right: "53%", top: "42%" }}>
            <span className="text-body-5 font-bold text-ink">حفرة</span>
            <span className="pill bg-negative px-2 py-0.5 text-[11px] font-bold text-white">خطير</span>
            <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-seashell">
              <span className="tech-conf absolute inset-0 rounded-full bg-negative" style={{ width: "85%" }} />
            </span>
          </div>
          <div className="tech-chip absolute flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]" style={{ right: "8%", top: "26%" }}>
            <span className="text-body-5 font-bold text-ink">تشقّق</span>
            <span className="pill bg-notice px-2 py-0.5 text-[11px] font-bold text-white">متوسط</span>
            <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-seashell">
              <span className="tech-conf absolute inset-0 rounded-full bg-notice" style={{ width: "64%" }} />
            </span>
          </div>

          {/* coordinate readout */}
          <div
            className="tech-coords absolute rounded-full bg-white px-3 py-1.5 font-mono text-[12px] font-bold text-subtext shadow-[var(--shadow-soft)]"
            style={{ right: "40%", top: "18%" }}
          >
            31.9038°N · 35.2034°E
          </div>

          {/* mini map — the report gets a home */}
          <div
            className="tech-map absolute bottom-5 left-5 w-[200px] overflow-hidden rounded-3xl bg-white p-3 shadow-[var(--shadow-soft)]"
          >
            <div className="relative h-[120px] overflow-hidden rounded-2xl bg-seashell">
              <span className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-white" />
              <span className="absolute inset-y-0 left-1/3 w-2.5 rounded-full bg-white" />
              {/* the dropped pin (severity color) + landing ring */}
              <span className="tech-pin absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-negative" />
              <span
                className="tech-pin-ring absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ boxShadow: "inset 0 0 0 2px var(--negative)", opacity: 0 }}
              />
              {/* live city pins */}
              <span className="tech-extra-pin absolute right-[18%] top-[22%] h-3 w-3 rounded-full bg-informative" />
              <span className="tech-extra-pin absolute right-[70%] top-[30%] h-3 w-3 rounded-full bg-notice" />
              <span className="tech-extra-pin absolute right-[30%] top-[72%] h-3 w-3 rounded-full bg-positive" />
            </div>
            <p className="mt-2 text-center text-[11px] font-bold text-subtext">
              بلاغ جديد على الخريطة
            </p>
          </div>
        </div>

        {/* ── Step tracker ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {STEPS.map(({ label, hex }, i) => (
            <span
              key={label}
              className="pill relative bg-whitesmoke px-5 py-2.5 text-body-4 font-bold text-mutedtext"
            >
              {label}
              {/* colored layer crossfades in when the beat activates */}
              <span
                className={`tech-step-fill tech-step-fill-${i} pill absolute inset-0 flex items-center justify-center bg-white shadow-[var(--shadow-soft)]`}
                style={{ color: hex }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Climax: the real thing (normal-scroll tail, never scrubbed) ── */}
      <div className="pt-10 text-center">
        <h3 className="font-display text-display-3 text-ink">
          …وهذا هو فعلياً على الأرض
        </h3>
      </div>
      <DetectionFootage />
    </section>
  );
}
