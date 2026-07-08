"use client";

import { useRef, useState } from "react";
import { CheckmarkCircle24Filled } from "@fluentui/react-icons";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";
import CityMapBg from "@/components/CityMapBg";

/* ── The life of one report ───────────────────────────────────────
   A single work-item "ticket" travels through the four pipeline
   states as the section is pinned and scrolled. Its header floods
   with the active state's colour, the media morphs (dashcam detection
   → assignee → on-site → before/after proof), and a timestamped log
   accumulates — selling accountability, speed and auditability.
   Mobile / reduced-motion: a static stacked stepper.               */

const PIN_DISTANCE = "+=300%";

type State = {
  label: string; // status chip
  hex: string;
  tint: string; // faint header wash on the light body
  loc: string;
  time: string; // Arabic-Indic
  head: string; // value headline
  line: string; // value copy
  log: string; // log entry text
};

const STATES: State[] = [
  {
    label: "يُرصد تلقائياً",
    hex: "#0072DA",
    tint: "rgba(0,114,218,0.10)",
    loc: "شارع النصر · حي المخفية",
    time: "٩:١٢",
    head: "تقود فقط… ومسار يرى",
    line: "كاميرا المركبة ترصد كل حفرةٍ وتشقّق تلقائياً أثناء القيادة — تحدّد الموقع والخطورة دون أي إدخالٍ يدوي.",
    log: "رُصد تلقائياً",
  },
  {
    label: "مُسنَد",
    hex: "#FFAB00",
    tint: "rgba(255,171,0,0.12)",
    loc: "أولوية عالية · فريق ٣",
    time: "٩:١٣",
    head: "لكل بلاغٍ مالكٌ ووقت",
    line: "يفرزه النظام حسب الخطورة ويُسنده إلى الفريق الأقرب — لا بلاغ يضيع أو يُنسى في زحمة القنوات.",
    log: "أُسند إلى فريق ٣",
  },
  {
    label: "قيد الإصلاح",
    hex: "#16668E",
    tint: "rgba(22,102,142,0.10)",
    loc: "الفريق في الموقع",
    time: "١٠:٤٠",
    head: "الحالة مرئية لحظياً",
    line: "يتسلّم الفريق المهمة ويبدأ العمل، وتتحدّث الحالة مباشرةً على المسار — دون مكالمات متابعة.",
    log: "بدأ الإصلاح في الموقع",
  },
  {
    label: "أُغلق بدليل",
    hex: "#088A20",
    tint: "rgba(8,138,32,0.10)",
    loc: "مُوثّق · جاهز للتدقيق",
    time: "١١:٢٥",
    head: "يُغلق بدليلٍ موثّق",
    line: "يُرفع دليلٌ مصوّر قبل/بعد ويُغلق البلاغ في سجلٍّ قابلٍ للتدقيق من مجلس البلدية.",
    log: "أُغلق بدليل مصوّر",
  },
];

const N = STATES.length;
const REPORT_ID = "بلاغ #٠٤٢";

/* ── Media that morphs per state (stacked, crossfaded by `active`) ── */
/* eslint-disable @next/next/no-img-element */
function TicketMedia({ active }: { active: number }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink">
      {/* 1 — dashcam auto-detection */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: active === 0 ? 1 : 0 }}
      >
        <video
          className="h-full w-full object-cover"
          poster="/media/detection-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/media/detection.webm" type="video/webm" />
          <source src="/media/detection.mp4" type="video/mp4" />
        </video>
        {/* detection box */}
        <div
          className="absolute"
          style={{
            right: "34%",
            top: "46%",
            width: "30%",
            height: "26%",
            boxShadow: "inset 0 0 0 2px #34A8D8",
            borderRadius: 6,
          }}
        >
          <span className="absolute -top-6 right-0 rounded-md bg-peacock px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap">
            حفرة · ٧٠٪
          </span>
        </div>
        {/* REC chip */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-negative rec-blink" />
          كاميرا المركبة
        </span>
      </div>

      {/* 2 — assigned to a crew */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500"
        style={{ opacity: active === 1 ? 1 : 0, background: "#FFF7E6" }}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "rgba(255,171,0,0.18)" }}
          >
            <img src="/chars/TheFixer.svg" alt="" className="h-8 w-8" />
          </span>
          <div className="text-right">
            <p className="text-[15px] font-bold text-ink">فريق الإصلاح · وحدة ٣</p>
            <p className="text-[13px] text-subtext">أقرب فريق · ١.٢ كم</p>
          </div>
        </div>
        <span className="rounded-full bg-notice/15 px-4 py-1.5 text-[13px] font-bold text-[#8a5a00]">
          أُسند ٩:١٣ ص
        </span>
      </div>

      {/* 3 — in repair, on site */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: active === 2 ? 1 : 0 }}
      >
        <img
          src="/grid/pexels-gaion-27937015.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-x-4 bottom-4">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-bold text-sports-teal backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-sports-teal rec-blink" />
            الفريق في الموقع
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full w-3/5 rounded-full bg-sports-teal" />
          </div>
        </div>
      </div>

      {/* 4 — closed with before/after proof */}
      <div
        className="absolute inset-0 flex flex-col transition-opacity duration-500"
        style={{ opacity: active === 3 ? 1 : 0, background: "#F1FAF2" }}
      >
        <div className="grid flex-1 grid-cols-2 gap-1 p-1">
          <div className="relative overflow-hidden rounded-xl">
            <img src="/media/detection-poster.jpg" alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">قبل</span>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img src="/grid/pexels-ismail-nabhan-2159803207-36627992.jpg" alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-1.5 right-1.5 rounded bg-positive px-1.5 py-0.5 text-[10px] font-bold text-white">بعد</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 py-3 text-positive">
          <CheckmarkCircle24Filled aria-hidden />
          <span className="text-[15px] font-bold">أُغلق البلاغ · موثّق</span>
        </div>
      </div>
    </div>
  );
}

/* ── The travelling ticket card ── */
function Ticket({ active }: { active: number }) {
  const s = STATES[active];
  return (
    <div
      className="path-ticket w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white"
    >
      {/* coloured header floods with the active state */}
      <div
        className="flex items-center justify-between px-5 py-4 transition-colors duration-500"
        style={{ background: s.hex }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
          <span className="text-[15px] font-bold text-white">{s.label}</span>
        </div>
        <span className="text-[13px] font-bold text-white/85">{REPORT_ID}</span>
      </div>

      <div className="p-4" style={{ background: s.tint, transition: "background 0.5s" }}>
        {/* location line */}
        <div className="mb-3 flex items-center justify-between text-[13px]">
          <span className="font-bold text-ink transition-all duration-300" key={s.loc}>
            {s.loc}
          </span>
          <span className="text-subtext">{s.time} ص</span>
        </div>

        <TicketMedia active={active} />

        {/* accumulating log */}
        <ul className="mt-4 flex flex-col gap-1.5">
          {STATES.map((st, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[12px] transition-all duration-500"
              style={{
                opacity: i <= active ? 1 : 0.28,
                transform: i <= active ? "translateY(0)" : "translateY(2px)",
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: i <= active ? st.hex : "var(--muted)" }}
              />
              <span className="text-subtext">{st.time}</span>
              <span className={i <= active ? "font-bold text-ink" : "text-mutedtext"}>
                {st.log}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PathSection() {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          let last = 0;
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

          gsap.from(".path-reveal", {
            y: 34,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          });
        }
      );

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".path-stack-item").forEach((it) => {
          gsap.from(it, {
            y: 50,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: it, start: "top 85%" },
          });
        });
      });
    },
    { scope: root }
  );

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st || !lenis) {
      setActive(i);
      return;
    }
    lenis.scrollTo(st.start + (i / (N - 1)) * (st.end - st.start), { duration: 1 });
  };

  return (
    <section ref={root} id="path" className="relative overflow-hidden bg-white">
      <CityMapBg className="opacity-30" />

      {/* ── Desktop: pinned travelling ticket ── */}
      <div className="hidden md:block">
        <div ref={stageRef} className="relative flex h-screen flex-col overflow-hidden px-6">
          {/* heading */}
          <div className="path-reveal relative z-10 pt-20 text-center">
            <h2 className="font-display text-display-2 text-ink">حياةُ بلاغٍ واحد</h2>
            <p className="mt-2 text-body-3 text-subtext">
              من الرصد التلقائي إلى الإغلاق الموثّق — مسارٌ واحدٌ يراه الجميع.
            </p>
          </div>

          {/* stepper rail */}
          <div className="path-reveal relative z-10 mx-auto mt-8 flex w-full max-w-3xl items-center">
            {STATES.map((s, i) => (
              <div key={i} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="flex items-center gap-2 whitespace-nowrap"
                  aria-pressed={i === active}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-all duration-300"
                    style={{
                      background: i <= active ? s.hex : "var(--seashell)",
                      color: i <= active ? "#fff" : "var(--muted)",
                      transform: i === active ? "scale(1.12)" : "scale(1)",
                    }}
                  >
                    {["١", "٢", "٣", "٤"][i]}
                  </span>
                  <span
                    className="text-[13px] font-bold transition-colors duration-300"
                    style={{ color: i === active ? "var(--text)" : "var(--muted)" }}
                  >
                    {s.label}
                  </span>
                </button>
                {i < N - 1 && (
                  <span className="mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-seashell">
                    <span
                      className="block h-full rounded-full transition-all duration-500"
                      style={{ width: i < active ? "100%" : "0%", background: s.hex }}
                    />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* two columns: value copy + ticket */}
          <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 grid-cols-2 items-center gap-12">
            {/* copy (RTL right) */}
            <div className="order-2">
              <span
                className="mb-3 inline-block h-1.5 w-12 rounded-full transition-colors duration-500"
                style={{ background: STATES[active].hex }}
              />
              <h3 className="font-display text-display-3 text-ink" key={STATES[active].head}>
                {STATES[active].head}
              </h3>
              <p className="mt-4 max-w-md text-body-2 leading-relaxed text-subtext">
                {STATES[active].line}
              </p>
            </div>

            {/* ticket (RTL left) */}
            <div className="order-1 flex justify-center">
              <Ticket active={active} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / reduced-motion: static stack ── */}
      <div className="flex flex-col gap-10 px-6 py-24 md:hidden">
        <div className="text-center">
          <h2 className="font-display text-display-2 text-ink">حياةُ بلاغٍ واحد</h2>
          <p className="mt-2 text-body-3 text-subtext">
            من الرصد التلقائي إلى الإغلاق الموثّق.
          </p>
        </div>
        {STATES.map((s, i) => (
          <div key={i} className="path-stack-item overflow-hidden rounded-[24px] bg-white">
            <div className="flex items-center justify-between px-5 py-4" style={{ background: s.hex }}>
              <span className="text-[15px] font-bold text-white">
                {["١", "٢", "٣", "٤"][i]} · {s.label}
              </span>
              <span className="text-[13px] font-bold text-white/85">{s.time} ص</span>
            </div>
            <div className="p-5" style={{ background: s.tint }}>
              <h3 className="font-display text-display-4 text-ink">{s.head}</h3>
              <p className="mt-2 text-body-3 leading-relaxed text-subtext">{s.line}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
