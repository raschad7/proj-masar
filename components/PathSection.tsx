"use client";

import { Fragment, useRef, useState } from "react";
import { CheckmarkCircle24Filled } from "@fluentui/react-icons";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";

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
    hex: "#44729D",
    tint: "rgba(68,114,157,0.10)",
    loc: "شارع النصر · حي المخفية",
    time: "9:12",
    head: "تقود فقط… ومسار يرى",
    line: "كاميرا المركبة ترصد كل حفرةٍ وتشقّق تلقائياً أثناء القيادة — تحدّد الموقع والخطورة دون أي إدخالٍ يدوي.",
    log: "رُصد تلقائياً",
  },
  {
    label: "مُسنَد",
    hex: "#D1A242",
    tint: "rgba(209,162,66,0.12)",
    loc: "أولوية عالية · فريق 3",
    time: "9:13",
    head: "لكل بلاغٍ مالكٌ ووقت",
    line: "يفرزه النظام حسب الخطورة ويُسنده إلى الفريق الأقرب — لا بلاغ يضيع أو يُنسى في زحمة القنوات.",
    log: "أُسند إلى فريق 3",
  },
  {
    label: "قيد الإصلاح",
    hex: "#16668E",
    tint: "rgba(22,102,142,0.10)",
    loc: "الفريق في الموقع",
    time: "10:40",
    head: "الحالة مرئية لحظياً",
    line: "يتسلّم الفريق المهمة ويبدأ العمل، وتتحدّث الحالة مباشرةً على المسار — دون مكالمات متابعة.",
    log: "بدأ الإصلاح في الموقع",
  },
  {
    label: "أُغلق بدليل",
    hex: "#599664",
    tint: "rgba(89,150,100,0.10)",
    loc: "مُوثّق · جاهز للتدقيق",
    time: "11:25",
    head: "يُغلق بدليلٍ موثّق",
    line: "يُرفع دليلٌ مصوّر قبل/بعد ويُغلق البلاغ في سجلٍّ قابلٍ للتدقيق من مجلس البلدية.",
    log: "أُغلق بدليل مصوّر",
  },
];

const N = STATES.length;
const REPORT_ID = "بلاغ #042";

/* ── Media that morphs per state (stacked, crossfaded by `active`) ── */
/* eslint-disable @next/next/no-img-element */
function TicketMedia({ active }: { active: number }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
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
            حفرة · 70٪
          </span>
        </div>
        {/* REC chip */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-negative rec-blink" />
          كاميرا المركبة
        </span>
      </div>

      {/* 2 — assigned to the nearest crew (map dispatch) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: active === 1 ? 1 : 0 }}
      >
        <img
          src="/grid/Gemini_Generated_Image_v3jpk7v3jpk7v3jp.png"
          alt=""
          className="h-full w-full object-cover"
        />
        {/* darken + amber wash so text and card read clearly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 62% 40%, rgba(209,162,66,0.22) 0%, transparent 55%)",
          }}
        />

        {/* status chip */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-notice rec-blink" />
          الإسناد الذكي
        </span>

        {/* location pin on the map (report site) */}
        <div className="absolute" style={{ right: "40%", top: "38%" }}>
          <span
            className="absolute -inset-3 rounded-full"
            style={{ background: "rgba(209,162,66,0.25)" }}
          />
          <span
            className="relative block h-3.5 w-3.5 rounded-full border-2 border-white"
            style={{ background: "#D1A242" }}
          />
        </div>

        {/* floating dispatch card */}
        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(209,162,66,0.18)" }}
            >
              <img src="/chars/TheFixer.svg" alt="" className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[15px] font-bold text-ink">فريق الإصلاح · وحدة 3</p>
              <p className="text-[13px] text-subtext">أقرب فريق · 1.2 كم</p>
            </div>
            <span className="shrink-0 rounded-full bg-notice/15 px-3 py-1 text-[12px] font-bold text-[#8a5a00]">
              أولوية عالية
            </span>
          </div>
        </div>
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

      {/* 4 — closed with before/after proof (single composite image) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: active === 3 ? 1 : 0 }}
      >
        <img
          src="/gallary/pathPic.png"
          alt="قبل وبعد الإصلاح"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full bg-positive/95 px-3 py-2 text-[13px] font-bold text-white backdrop-blur-sm">
          <CheckmarkCircle24Filled aria-hidden className="h-4 w-4" />
          أُغلق البلاغ · موثّق
        </span>
      </div>
    </div>
  );
}

/* ── The travelling ticket ──────────────────────────────────────
   Flat, borderless, shadowless (locked system): the media is the
   hero, depth comes from a full-bleed state-coloured footer with a
   large Arabic-Indic ordinal watermark. Progress lives in the
   stepper rail above, so no duplicate timeline here. */
const AR_ORD = ["٠١", "٠٢", "٠٣", "٠٤"];

function Ticket({ active }: { active: number }) {
  const s = STATES[active];
  return (
    <div className="path-ticket w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white">
      {/* media — the hero, edge to edge */}
      <TicketMedia active={active} />

      {/* state-coloured footer — colour + layering carry the depth */}
      <div
        className="relative overflow-hidden px-5 pb-5 pt-4 transition-colors duration-500"
        style={{ background: s.hex }}
      >
        {/* oversized ordinal watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-5 left-3 select-none font-display leading-none text-white/15"
          style={{ fontSize: 96 }}
        >
          {AR_ORD[active]}
        </span>

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-white/90" />
              <span className="truncate text-[16px] font-bold text-white">
                {s.label}
              </span>
            </div>
            <p className="mt-1 truncate text-[12.5px] text-white/75">{s.loc}</p>
          </div>
          <div className="shrink-0 text-left">
            <p className="text-[13px] font-bold tracking-wide text-white tabular-nums">
              {REPORT_ID}
            </p>
            <p className="mt-1 text-[12.5px] text-white/75 tabular-nums">
              {s.time} ص
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Headline with a per-word reveal (re-runs when the copy changes).
   Arabic is split by word, never by character — character splitting
   breaks the cursive joining. Rise + de-blur, no hard clip mask so
   diacritics never get cropped. */
function SplitHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const inners = ref.current!.querySelectorAll(".ph-word");
      gsap.fromTo(
        inners,
        { yPercent: 60, opacity: 0, filter: "blur(6px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
        }
      );
    },
    { dependencies: [text], scope: ref }
  );
  return (
    <h3 ref={ref} className="font-display text-display-3 leading-[1.15] text-ink">
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="ph-word inline-block will-change-transform">{w}</span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h3>
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
                    {["1", "2", "3", "4"][i]}
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
              <SplitHeading text={STATES[active].head} key={STATES[active].head} />
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
                {["1", "2", "3", "4"][i]} · {s.label}
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
