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

/* ── Tuning constants ────────────────────────────────────────────
   PIN_DISTANCE : scroll consumed by the pinned 3-stage journey
   TRAVEL_X     : how far the phone slides off-center (vw)
   Timeline map : stage holds at 0 / 1 / 2, crossings between.      */
const PIN_DISTANCE = "+=250%";
const TRAVEL_X = 24;
const CROSS = { start1: 0.45, start2: 1.45, dur: 0.55 };

const ROLES = [
  {
    title: "المُبلِّغ / الماسح",
    hex: "#0072DA",
    glass: "rgba(0, 114, 218, 0.10)",
    side: "left" as const, // card LEFT, phone RIGHT
    copy: "المواطن أو الفريق الميداني يلتقط الطريق، فيصنّف مسار الضرر تلقائياً ويحدّد موقعه وخطورته.",
  },
  {
    title: "المشرف / الموزّع",
    hex: "#FFAB00",
    glass: "rgba(255, 171, 0, 0.12)",
    side: "right" as const, // card RIGHT, phone LEFT
    copy: "يرى كل البلاغات على الخريطة، يرتّبها بالأولوية حسب الخطورة والموقع، ويوزّع الفرق.",
  },
  {
    title: "فريق الإصلاح",
    hex: "#16668E",
    glass: "rgba(22, 102, 142, 0.10)",
    side: "left" as const, // card LEFT, phone RIGHT
    copy: "يستقبل المهام، يُنجز على الأرض، ويوثّق بالصورة حتى إغلاق البلاغ.",
  },
];

/* ── Phone screen mocks — accent color matches the active role ── */

function ScannerScreen() {
  return (
    <div className="flex h-full flex-col bg-[#20242A] p-3">
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#3A4048]">
        {/* road illusion */}
        <div className="absolute inset-x-6 bottom-0 top-1/3 rounded-t-[60px] bg-[#4A5058]" />
        {/* auto-detection box */}
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
        {/* map pins */}
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

const SCREENS = [ScannerScreen, DispatcherScreen, CrewScreen];

function RoleCard({ role, index }: { role: (typeof ROLES)[number]; index: number }) {
  return (
    <div
      className={`role-card role-card-${index} relative p-8 backdrop-blur-md`}
      style={{
        borderRadius: "var(--radius-card)",
        background: role.glass,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h3 className="text-[28px] font-extrabold" style={{ color: role.hex }}>
        {role.title}
      </h3>
      <p className="mt-4 text-[18px] leading-relaxed text-ink">{role.copy}</p>
      {/* TODO: asset — character illustration peeking from the card edge */}
      <div
        aria-hidden
        className="absolute -bottom-6 flex h-20 w-20 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{
          background: role.hex,
          [role.side === "left" ? "left" : "right"]: "-1.5rem",
        }}
      >
        شخصية
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
          /* Entry hand-off: the phone peeks up from Section 2's tail and
             settles as this section scrolls in (pre-pin scrub). */
          gsap.from(".phone-rise", {
            yPercent: 55,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });

          /* Initial stage-1 state */
          gsap.set(".phone-travel", { x: `${TRAVEL_X}vw` });
          gsap.set(".role-card-1, .role-card-2", { opacity: 0 });
          gsap.set(".phone-screen-1, .phone-screen-2", { yPercent: 100 });

          /* Master timeline — pinned, scrubbed across the 3 stages.
             Stage holds: 0–0.45, 1.0–1.45, 2.0–end. */
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

          const crossings: Array<{ at: number; from: number; to: number; x: number; tilt: number }> = [
            { at: CROSS.start1, from: 0, to: 1, x: -TRAVEL_X, tilt: -6 },
            { at: CROSS.start2, from: 1, to: 2, x: TRAVEL_X, tilt: 6 },
          ];

          crossings.forEach(({ at, from, to, x, tilt }) => {
            // phone slides across with a subtle tilt that settles upright
            tl.to(
              ".phone-travel",
              { x: `${x}vw`, duration: CROSS.dur, ease: "power3.inOut" },
              at
            );
            tl.to(".phone-tilt", { rotation: tilt, duration: 0.2, ease: "power2.out" }, at);
            tl.to(
              ".phone-tilt",
              { rotation: 0, duration: 0.3, ease: "power3.out" },
              at + CROSS.dur - 0.25
            );

            // old card slides toward its side and fades
            tl.to(
              `.role-card-${from}`,
              {
                opacity: 0,
                x: ROLES[from].side === "left" ? -48 : 48,
                duration: 0.22,
                ease: "power2.in",
              },
              at - 0.03
            );

            // screen swap mid-crossing: old slides up/out, new in from below
            tl.to(
              `.phone-screen-${from}`,
              { yPercent: -100, duration: 0.2, ease: "power2.in" },
              at + 0.16
            );
            tl.to(
              `.phone-screen-${to}`,
              { yPercent: 0, duration: 0.22, ease: "power3.out" },
              at + 0.3
            );

            // new card fades in, scales up, lifts
            tl.fromTo(
              `.role-card-${to}`,
              { opacity: 0, scale: 0.94, x: ROLES[to].side === "left" ? -48 : 48 },
              { opacity: 1, scale: 1, x: 0, duration: 0.3, ease: "power3.out" },
              at + CROSS.dur - 0.1
            );
          });

          // settle hold on stage 3 before unpin
          tl.to({}, { duration: 0.3 });
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} id="roles" className="relative overflow-hidden bg-white">
      <CityMapBg className="opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 md:h-screen">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="font-display text-[clamp(30px,4.5vw,56px)] leading-[1.3] text-ink">
            ثلاثة أدوار، لوحة واحدة
          </h2>
          <p className="mt-3 text-[18px] text-subtext">
            من يلتقط، من يوزّع، من يُصلح — كلهم على مسار واحد.
          </p>
        </div>

        {/* ── Desktop animated stage ── */}
        <div className="roles-desktop relative hidden flex-1 md:block">
          {/* the constant traveler */}
          <div className="phone-rise absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="phone-travel">
              <div className="phone-tilt">
                <div
                  className="aspect-[236/480] h-[min(480px,64vh)] rounded-[36px] bg-white p-3"
                  style={{ boxShadow: "var(--shadow-lift)" }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-whitesmoke">
                    {SCREENS.map((Screen, i) => (
                      <div
                        key={i}
                        className={`phone-screen-${i} absolute inset-0`}
                      >
                        <Screen />
                      </div>
                    ))}
                    {/* notch */}
                    <span className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-seashell" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* role cards — opposite side of the phone per stage */}
          {ROLES.map((role, i) => (
            <div
              key={i}
              className="absolute top-1/2 z-10 w-[min(420px,36vw)] -translate-y-1/2"
              style={role.side === "left" ? { left: "4vw" } : { right: "4vw" }}
            >
              <RoleCard role={role} index={i} />
            </div>
          ))}
        </div>

        {/* ── Mobile / reduced-motion: static stack ── */}
        <div className="roles-stack flex flex-col gap-10 md:hidden">
          {ROLES.map((role, i) => {
            const Screen = SCREENS[i];
            return (
              <div key={i} className="flex flex-col items-center gap-6">
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
      </div>
    </section>
  );
}
