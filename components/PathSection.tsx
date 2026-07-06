"use client";

import { useRef } from "react";
import {
  Location24Filled,
  ClipboardTask24Filled,
  Wrench24Filled,
  CheckmarkCircle24Filled,
} from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : how much scroll the pinned journey consumes
   SEGMENTS     : timeline runs 0 → SEGMENTS (one unit per leg)     */
const PIN_DISTANCE = "+=300%";
const SEGMENTS = 3;

/* Road geometry — gentle S-curve, stations evenly spaced top→bottom */
const ROAD_D =
  "M200 20 C 310 150, 90 280, 200 410 C 310 540, 90 670, 200 800 C 310 930, 90 1060, 200 1180";
const STATION_Y = [20, 410, 800, 1180]; // in the 400×1200 viewBox

const STATIONS = [
  {
    num: "١",
    title: "بلاغٌ جديد",
    color: "var(--informative)",
    hex: "#0072DA",
    Icon: Location24Filled,
    copy: "يُلتقط من المواطن أو الفريق الميداني. يكتشف مسار الحفرة أو التشقّق تلقائياً، ويحدّد موقعها وخطورتها.",
  },
  {
    num: "٢",
    title: "مُسنَد",
    color: "var(--notice)",
    hex: "#FFAB00",
    Icon: ClipboardTask24Filled,
    copy: "يفرزه المشرف حسب الخطورة والموقع، ويُسنده إلى الفريق الأقرب.",
  },
  {
    num: "٣",
    title: "قيد الإصلاح",
    color: "var(--sports-teal)",
    hex: "#16668E",
    Icon: Wrench24Filled,
    copy: "يتسلّم فريق الإصلاح المهمة، ويبدأ العمل على الأرض.",
  },
  {
    num: "٤",
    title: "تمّ الإصلاح",
    color: "var(--positive)",
    hex: "#088A20",
    Icon: CheckmarkCircle24Filled,
    copy: "يُرفع دليل مصوّر، يُغلق البلاغ، ويصل الإشعار للمُبلِّغ.",
  },
];

function StationCard({
  station,
  index,
}: {
  station: (typeof STATIONS)[number];
  index: number;
}) {
  const { num, title, color, Icon, copy } = station;
  return (
    <div
      className={`path-card path-card-${index} card-surface w-full p-6`}
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div className="flex items-center gap-3">
        {/* Icon carries the station color — no background behind it */}
        <Icon style={{ color }} aria-hidden />
        <h3 className="text-[20px] font-bold text-ink">
          <span style={{ color }}>{num}</span> · {title}
        </h3>
      </div>
      <p className="mt-3 text-[16px] leading-relaxed text-subtext">{copy}</p>
    </div>
  );
}

export default function PathSection() {
  const root = useRef<HTMLElement>(null);
  const roadRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      /* Pinned scrub runs only on desktop with motion allowed.
         DOM defaults are the FINAL payoff state (fully colored),
         which doubles as the mobile / reduced-motion static stepper. */
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Initial muted state */
          gsap.set(".path-card", { opacity: 0.35, scale: 0.94, y: 16 });
          gsap.set(".station-node", { fill: "var(--muted)" });
          gsap.set(".path-colored", { drawSVG: "0%" });
          gsap.set(".report-dot", { fill: STATIONS[0].hex });

          /* Master timeline — 0 → SEGMENTS, scrubbed by scroll.
             pin: the whole section; start when its top hits the viewport top;
             the journey consumes PIN_DISTANCE of scroll. */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              pin: true,
              scrub: true,
              start: "top top",
              end: PIN_DISTANCE,
              invalidateOnRefresh: true,
            },
          });

          /* Road draws + dot drives — both linear so the user feels
             they are steering the report themselves. */
          tl.to(
            ".path-colored",
            { drawSVG: "100%", duration: SEGMENTS, ease: "none" },
            0
          );
          tl.to(
            ".report-dot-group",
            {
              motionPath: {
                path: roadRef.current!,
                align: roadRef.current!,
                alignOrigin: [0.5, 0.5],
              },
              duration: SEGMENTS,
              ease: "none",
            },
            0
          );

          /* Dot color morphs smoothly just before each arrival */
          STATIONS.slice(1).forEach((s, i) => {
            tl.to(
              ".report-dot",
              { fill: s.hex, duration: 0.4, ease: "power1.inOut" },
              i + 1 - 0.3
            );
          });

          /* Station + card choreography.
             Arrival at t = index; only one station is "hot" at a time. */
          STATIONS.forEach((s, i) => {
            const arrive = Math.max(i - 0.001, 0);

            // node lights up + swells
            tl.to(
              `.station-node-${i}`,
              {
                fill: s.hex,
                scale: 1.15,
                transformOrigin: "50% 50%",
                duration: 0.25,
              },
              arrive
            );
            // card becomes the single active one
            tl.to(
              `.path-card-${i}`,
              { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out" },
              Math.max(i - 0.15, 0)
            );

            // leaving: settle to colored-but-done (last station stays lit)
            if (i < STATIONS.length - 1) {
              tl.to(
                `.station-node-${i}`,
                { scale: 1, duration: 0.25 },
                i + 0.7
              );
              tl.to(
                `.path-card-${i}`,
                { opacity: 0.5, scale: 0.97, duration: 0.3 },
                i + 0.7
              );
            }
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="path"
      className="relative overflow-hidden bg-white"
    >
      <CityMapBg className="opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 md:h-screen">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="font-display text-display-1 text-ink">
            من بلاغ… إلى طريقٍ مُصلَح
          </h2>
          <p className="mt-3 text-body-2 text-subtext">
            رحلة واحدة، أربع محطات، مرئية للجميع.
          </p>
        </div>

        {/* ── Desktop: road + alternating cards (animated) ── */}
        <div className="path-desktop relative mx-auto hidden w-full max-w-5xl flex-1 md:block">
          <svg
            className="absolute left-1/2 h-full -translate-x-1/2"
            viewBox="0 0 400 1200"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              {/* Blue → amber → teal → green trail */}
              <linearGradient
                id="roadGradient"
                gradientUnits="userSpaceOnUse"
                x1="200"
                y1="20"
                x2="200"
                y2="1180"
              >
                <stop offset="0%" stopColor="#0072DA" />
                <stop offset="34%" stopColor="#FFAB00" />
                <stop offset="67%" stopColor="#16668E" />
                <stop offset="100%" stopColor="#088A20" />
              </linearGradient>
            </defs>

            {/* muted base road */}
            <path
              d={ROAD_D}
              stroke="var(--seashell)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* colored overlay — DrawSVG reveals it top→bottom */}
            <path
              ref={roadRef}
              className="path-colored"
              d={ROAD_D}
              stroke="url(#roadGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* station nodes */}
            {STATION_Y.map((y, i) => (
              <g key={i}>
                <circle
                  className={`station-node station-node-${i}`}
                  cx="200"
                  cy={y}
                  r="14"
                  fill={STATIONS[i].hex}
                />
                <circle cx="200" cy={y} r="5" fill="var(--white)" />
              </g>
            ))}

            {/* the report dot the user drives */}
            <g className="report-dot-group">
              <circle
                className="report-dot"
                cx="200"
                cy="20"
                r="11"
                fill={STATIONS[3].hex}
              />
            </g>
          </svg>

          {/* Alternating cards: 1 & 3 LEFT of the road, 2 & 4 RIGHT */}
          {STATIONS.map((s, i) => (
            <div
              key={i}
              className="absolute -translate-y-1/2"
              style={{
                top: `${(STATION_Y[i] / 1200) * 100}%`,
                width: "min(320px, calc(50vw - 150px))",
                ...(i % 2 === 0
                  ? { right: "calc(50% + 120px)" }
                  : { left: "calc(50% + 120px)" }),
              }}
            >
              <StationCard station={s} index={i} />
            </div>
          ))}
        </div>

        {/* ── Mobile / static stepper: fully colored, no pin ── */}
        <div className="path-stack mx-auto flex w-full max-w-md flex-col gap-6 md:hidden">
          {STATIONS.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center" aria-hidden>
                <span
                  className="h-5 w-5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                {i < STATIONS.length - 1 && (
                  <span
                    className="w-1.5 flex-1 rounded-full"
                    style={{ background: s.color, opacity: 0.35 }}
                  />
                )}
              </div>
              <div className="pb-2">
                <StationCard station={s} index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
