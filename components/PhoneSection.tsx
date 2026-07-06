"use client";

import { useRef } from "react";
import {
  Camera24Filled,
  Map24Filled,
  CheckmarkCircle24Filled,
  Wrench24Filled,
} from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import CityMapBg from "@/components/CityMapBg";

/* ── Tuning constants (all pacing in vh of scroll) ───────────────
   The section = intro viewport (phone center, header above) + 3 tall
   role rows. The phone travels center → right → left → right.
   ROW_VH   : height of each role row — taller = slower journey
   CROSS_VH : scroll consumed by each crossing
   TRAVEL_X : how far the phone parks off-center (vw)                */
const INTRO_VH = 100;
const ROW_VH = 170;
const CROSS_VH = 80;
const TRAVEL_X = 24;

/* crossing i (1..3) ends exactly when row i is centered in view */
const crossEnd = (i: number) => INTRO_VH + (i - 1) * ROW_VH + ROW_VH / 2 - 50;
const TOTAL_VH = INTRO_VH + 3 * ROW_VH - 100;

const CROSSINGS = [1, 2, 3].map((i) => ({
  at: crossEnd(i) - CROSS_VH,
  from: i - 1,
  to: i,
  x: i === 2 ? -TRAVEL_X : TRAVEL_X, //  right → left → right
  tilt: i === 2 ? 5 : -5,
}));

const ROLES = [
  {
    title: "المُبلِّغ / الماسح",
    hex: "#0072DA",
    glass: "rgba(0, 114, 218, 0.10)",
    side: "left" as const, // phone RIGHT → copy LEFT
    char: "/chars/TheScanner.svg",
    copy: "المواطن أو الفريق الميداني يلتقط الطريق، فيصنّف مسار الضرر تلقائياً ويحدّد موقعه وخطورته.",
  },
  {
    title: "المشرف / الموزّع",
    hex: "#FFAB00",
    glass: "rgba(255, 171, 0, 0.12)",
    side: "right" as const, // phone LEFT → copy RIGHT
    char: "/chars/TheSupervisor.svg",
    copy: "يرى كل البلاغات على الخريطة، يرتّبها بالأولوية حسب الخطورة والموقع، ويوزّع الفرق.",
  },
  {
    title: "فريق الإصلاح",
    hex: "#16668E",
    glass: "rgba(22, 102, 142, 0.10)",
    side: "left" as const, // phone RIGHT → copy LEFT
    char: "/chars/TheFixer.svg",
    copy: "يستقبل المهام، يُنجز على الأرض، ويوثّق بالصورة حتى إغلاق البلاغ.",
  },
];

/* ── Phone screens ─────────────────────────────────────────────── */

function BrandScreen() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 bg-whitesmoke">
      <CityMapBg className="opacity-30" fade={false} />
      <span className="relative h-4 w-4 rounded-full bg-peacock" />
      <span className="font-display relative text-[26px] text-ink">مسار</span>
      <span className="relative text-[10px] text-subtext">
        بلاغٌ واحد، طريقٌ واحد
      </span>
    </div>
  );
}

function ScannerScreen() {
  return (
    <div className="flex h-full flex-col bg-[#20242A] p-3">
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#3A4048]">
        <div className="absolute inset-x-6 bottom-0 top-1/3 rounded-t-[60px] bg-[#4A5058]" />
        <div
          className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg"
          style={{ boxShadow: "inset 0 0 0 3px #0072DA" }}
        >
          <span className="pill absolute -top-3 right-1 bg-informative px-2 py-0.5 text-[9px] font-bold text-white">
            حفرة · خطورة عالية
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-informative text-white">
          <Camera24Filled />
        </span>
      </div>
    </div>
  );
}

function DispatcherScreen() {
  return (
    <div className="flex h-full flex-col gap-2 bg-whitesmoke p-3">
      <div className="relative h-[45%] overflow-hidden rounded-2xl bg-seashell">
        <Map24Filled className="absolute bottom-2 left-2 text-mutedtext" />
        <span className="absolute right-[20%] top-[30%] h-3 w-3 rounded-full bg-informative" />
        <span className="absolute right-[55%] top-[55%] h-3 w-3 rounded-full bg-notice" />
        <span className="absolute right-[70%] top-[25%] h-3 w-3 rounded-full bg-negative" />
        <span className="absolute right-[40%] top-[70%] h-3 w-3 rounded-full bg-positive" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {[
          { c: "#CC3931", t: "شارع القدس — حفرة" },
          { c: "#FFAB00", t: "دوار المنارة — تشقّق" },
          { c: "#0072DA", t: "شارع ركب — هبوط" },
        ].map(({ c, t }) => (
          <div
            key={t}
            className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-[var(--shadow-soft)]"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            <span className="text-[10px] font-bold text-ink">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrewScreen() {
  return (
    <div className="flex h-full flex-col gap-3 bg-whitesmoke p-3">
      <div className="rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <Wrench24Filled className="text-sports-teal" />
          <span className="text-[11px] font-bold text-ink">
            مهمة: حفرة — شارع القدس
          </span>
        </div>
        <p className="mt-1 text-[9px] text-subtext">الأولوية: عالية · ٨٠٠م</p>
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="pill bg-sports-teal py-2.5 text-[11px] font-bold text-white"
      >
        رفع دليل مصوّر
      </button>
      <div className="flex flex-1 items-center justify-center">
        <CheckmarkCircle24Filled
          className="text-positive"
          style={{ width: 56, height: 56 }}
        />
      </div>
    </div>
  );
}

/* Screen 0 is the brand/idle screen shown while the phone is centered */
const SCREENS = [BrandScreen, ScannerScreen, DispatcherScreen, CrewScreen];

function RoleCard({ role, index }: { role: (typeof ROLES)[number]; index: number }) {
  const char = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={role.char}
      alt=""
      aria-hidden
      className="role-char w-[140px] shrink-0 md:w-[280px]"
    />
  );
  const card = (
    <div
      className="flex flex-1 flex-col justify-center p-8 backdrop-blur-md md:min-h-[360px] md:p-12"
      style={{
        borderRadius: "var(--radius-card)",
        background: role.glass,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h3 className="text-display-3 font-display" style={{ color: role.hex }}>
        {role.title}
      </h3>
      <p className="mt-6 text-[21px] leading-relaxed text-ink">{role.copy}</p>
    </div>
  );
  /* The character stands beside the card on its OUTER edge (away from
     the phone). RTL flex renders the first child on the right. */
  return (
    <div className={`role-card role-card-${index} flex items-end gap-3`}>
      {role.side === "right" ? char : card}
      {role.side === "right" ? card : char}
    </div>
  );
}

function PhoneShell() {
  return (
    <div
      className="aspect-[236/480] h-[min(480px,62vh)] rounded-[36px] bg-white p-3"
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-whitesmoke">
        {SCREENS.map((Screen, i) => (
          <div key={i} className={`phone-screen-${i} absolute inset-0`}>
            <Screen />
          </div>
        ))}
        <span className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-seashell" />
      </div>
    </div>
  );
}

export default function PhoneSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Entry hand-off: the phone peeks over the tail of The Path
             and settles into the center of this section (pre-sticky). */
          gsap.from(".phone-rise", {
            y: "45vh",
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });

          /* Initial: brand screen showing, phone parked center, a touch
             low so the header owns the top of the intro viewport. */
          gsap.set(".phone-screen-1, .phone-screen-2, .phone-screen-3", {
            yPercent: 100,
          });
          gsap.set(".phone-center", { y: "7vh" });

          /* Master timeline — scrubbed across the whole section
             (sticky stage does the pinning natively). All positions
             and durations are in vh of scroll: the timeline's total
             duration equals TOTAL_VH so 1 unit = 1vh, keeping the
             choreography aligned with the tall rows. */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          /* Header hands the stage to the journey */
          tl.to(
            ".roles-header",
            { opacity: 0, y: -48, duration: 30, ease: "power2.in" },
            CROSSINGS[0].at - 20
          );
          tl.to(
            ".phone-center",
            { y: 0, duration: CROSS_VH, ease: "power2.inOut" },
            CROSSINGS[0].at
          );

          /* Crossings: slow, smooth slides with a settling tilt +
             synchronized vertical screen swap mid-flight. */
          CROSSINGS.forEach(({ at, from, to, x, tilt }) => {
            tl.to(
              ".phone-travel",
              { x: `${x}vw`, duration: CROSS_VH, ease: "power2.inOut" },
              at
            );
            tl.to(
              ".phone-tilt",
              { rotation: tilt, duration: CROSS_VH * 0.35, ease: "power2.out" },
              at
            );
            tl.to(
              ".phone-tilt",
              { rotation: 0, duration: CROSS_VH * 0.45, ease: "power3.out" },
              at + CROSS_VH * 0.55
            );
            tl.to(
              `.phone-screen-${from}`,
              { yPercent: -100, duration: CROSS_VH * 0.28, ease: "power2.in" },
              at + CROSS_VH * 0.3
            );
            tl.to(
              `.phone-screen-${to}`,
              { yPercent: 0, duration: CROSS_VH * 0.3, ease: "power3.out" },
              at + CROSS_VH * 0.52
            );
          });

          /* pad the timeline out to the full scroll span */
          tl.to({}, { duration: Math.max(0.001, TOTAL_VH - crossEnd(3)) });

          /* Role copy reveals — driven by each row entering the
             viewport (independent of the phone timeline). */
          gsap.utils.toArray<HTMLElement>(".role-row").forEach((row, i) => {
            gsap.from(row.querySelector(".role-card"), {
              opacity: 0,
              y: 70,
              scale: 0.96,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 45%",
                toggleActions: "play none none reverse",
              },
            });
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} id="roles" className="relative bg-white">
      {/* ── Desktop: sticky phone stage + 3 scroll rows ── */}
      <div className="roles-desktop hidden md:block">
        {/* Sticky stage — pins the phone for the whole journey */}
        <div className="pointer-events-none sticky top-0 z-20 h-screen">
          <CityMapBg className="opacity-40" />

          {/* Header above the centered phone (intro state) */}
          <div className="roles-header relative z-10 pt-28 text-center">
            <h2 className="font-display text-display-1 text-ink">
              ثلاثة أدوار، لوحة واحدة
            </h2>
            <p className="mt-3 text-body-2 text-subtext">
              من يلتقط، من يوزّع، من يُصلح — كلهم على مسار واحد.
            </p>
          </div>

          {/* The traveler */}
          <div className="phone-center absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="phone-rise">
              <div className="phone-travel">
                <div className="phone-tilt">
                  <PhoneShell />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 role rows — the page scrolls, the phone appears to descend */}
        {ROLES.map((role, i) => (
          <div
            key={i}
            className="role-row relative z-30"
            style={{ height: `${ROW_VH}vh` }}
          >
            <div
              className="absolute top-1/2 w-[min(820px,56vw)] -translate-y-1/2"
              style={role.side === "left" ? { left: "2vw" } : { right: "2vw" }}
            >
              <RoleCard role={role} index={i} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Mobile / reduced-motion: static stack ── */}
      <div className="roles-stack flex flex-col gap-12 px-6 py-16 md:hidden">
        <div className="text-center">
          <h2 className="font-display text-display-2 text-ink">
            ثلاثة أدوار، لوحة واحدة
          </h2>
          <p className="mt-3 text-body-2 text-subtext">
            من يلتقط، من يوزّع، من يُصلح — كلهم على مسار واحد.
          </p>
        </div>
        {ROLES.map((role, i) => {
          const Screen = SCREENS[i + 1]; // skip the brand screen
          return (
            <div key={i} className="flex flex-col items-center gap-8">
              <RoleCard role={role} index={i} />
              <div
                className="h-[400px] w-[200px] rounded-[32px] bg-white p-2.5"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="h-full w-full overflow-hidden rounded-[24px]">
                  <Screen />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
