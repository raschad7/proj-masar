"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  Camera24Filled,
  Map24Filled,
  CheckmarkCircle24Filled,
  Wrench24Filled,
  WrenchScrewdriver24Filled,
  Location24Filled,
  Location24Regular,
  Image24Regular,
  Sparkle24Filled,
  ArrowSortDownLines24Filled,
  People24Regular,
  TaskListSquareLtr24Filled,
  type FluentIcon,
} from "@fluentui/react-icons"
import { gsap, useGSAP } from "@/lib/gsap"
import CityMapBg from "@/components/CityMapBg"
import type { PhonePose } from "@/components/PhoneCanvas"

/* three.js is heavy and WebGL is client-only — split it out */
const PhoneCanvas = dynamic(() => import("@/components/PhoneCanvas"), {
  ssr: false,
})

/* ── Phone Screens ─────────────────────────────────────────────── */

/* Card background for the roles section — single source of truth */
const CARD_BG = "#F0F0F0"

type Step = { Icon: FluentIcon; label: string }

const ROLES: Array<{
  title: string
  hex: string
  glass: string
  side: "left" | "right"
  char: string
  copy: string
  num: string
  Icon: FluentIcon
  steps: Step[]
}> = [
  {
    title: "المُبلِّغ / الماسح",
    hex: "#16668E",
    glass: "rgba(22, 102, 142, 0.10)",
    side: "left", // phone RIGHT → copy LEFT
    char: "/chars/3ammm.svg",
    copy: "المواطن أو الفريق الميداني يلتقط الطريق، فيصنّف مسار الضرر تلقائياً ويحدّد موقعه وخطورته.",
    num: "01",
    Icon: Camera24Filled,
    steps: [
      { Icon: Image24Regular, label: "التقاط صورة الطريق" },
      { Icon: Location24Regular, label: "تحديد الموقع تلقائياً" },
      { Icon: Sparkle24Filled, label: "إرسال للتحليل الذكي" },
    ],
  },
  {
    title: "المشرف / الموزّع",
    hex: "#197FB0",
    glass: "rgba(25, 127, 176, 0.12)",
    side: "right", // phone LEFT → copy RIGHT
    char: "/chars/TheSupervisor.svg",
    copy: "يرى كل البلاغات على الخريطة، يرتّبها بالأولوية حسب الخطورة والموقع، ويوزّع الفرق.",
    num: "02",
    Icon: Map24Filled,
    steps: [
      { Icon: Map24Filled, label: "عرض البلاغات على الخريطة" },
      { Icon: ArrowSortDownLines24Filled, label: "ترتيب حسب الأولوية" },
      { Icon: People24Regular, label: "توزيع الفرق الميدانية" },
    ],
  },
  {
    title: "فريق الإصلاح",
    hex: "#34A8D8",
    glass: "rgba(52, 168, 216, 0.10)",
    side: "left", // phone RIGHT → copy LEFT
    char: "/chars/TheFixer.svg",
    copy: "يستقبل المهام، يُنجز على الأرض، ويوثّق بالصورة حتى إغلاق البلاغ.",
    num: "03",
    Icon: Wrench24Filled,
    steps: [
      { Icon: TaskListSquareLtr24Filled, label: "استلام المهمة الميدانية" },
      { Icon: WrenchScrewdriver24Filled, label: "الإصلاح على الأرض" },
      { Icon: CheckmarkCircle24Filled, label: "توثيق وإغلاق البلاغ" },
    ],
  },
]

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
  )
}

function ScannerScreen() {
  return (
    <div className="flex h-full flex-col bg-[#15181D] p-3">
      <div className="flex items-center justify-between px-1 pb-2 pt-1">
        <span className="text-[13px] text-white/80">‹</span>
        <span className="text-[11px] font-bold text-white">إبلاغ عن مشكلة</span>
      </div>
      {/* camera viewport */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-b from-[#575D66] to-[#3C424B]">
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-bold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-positive" />
          ٩٦٪ الدقة
        </span>
        {/* pothole */}
        <span className="absolute left-1/2 top-1/2 h-9 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[#111318]" />
        {/* AI focus box */}
        <div
          className="absolute left-1/2 top-1/2 h-14 w-20 -translate-x-1/2 -translate-y-1/2 rounded-md"
          style={{ boxShadow: "inset 0 0 0 2px #0072DA" }}
        />
        {/* overlay result card */}
        <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white p-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-negative">عالية</span>
            <span className="text-[9px] font-bold text-subtext">الخطورة</span>
          </div>
          <div className="mt-1 flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${i < 4 ? "bg-negative" : "bg-seashell"}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-1">
            <span className="text-[9px] text-ink">الخليل، شارع الشهداء</span>
            <Location24Filled
              className="text-informative"
              style={{ width: 11, height: 11 }}
            />
          </div>
        </div>
      </div>
      {/* control bar */}
      <div className="mt-2.5 flex items-center justify-between px-3">
        <Image24Regular
          className="text-white/75"
          style={{ width: 20, height: 20 }}
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-white">
          <span className="h-8 w-8 rounded-full bg-informative" />
        </span>
        <Camera24Filled
          className="text-white/75"
          style={{ width: 20, height: 20 }}
        />
      </div>
    </div>
  )
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
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: c }}
            />
            <span className="text-[10px] font-bold text-ink">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
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
  )
}

/* Screen 0 is the brand/idle screen shown while the phone is centered */
const SCREENS = [BrandScreen, ScannerScreen, DispatcherScreen, CrewScreen]

function RoleCard({
  role,
  index,
}: {
  role: (typeof ROLES)[number]
  index: number
}) {
  const char = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={role.char}
      alt=""
      aria-hidden
      className="role-char w-[170px] shrink-0 md:w-[310px] object-contain"
    />
  )
  const { Icon } = role
  const card = (
    <div
      className="relative flex flex-1 flex-col rounded-[32px] p-8 md:p-10"
      style={{ background: "#F0F0F0" }}
    >
      {/* Title row: Icon on right (in RTL), Text on left */}
      <div className="flex items-center justify-center gap-3">
        <Icon style={{ width: 36, height: 36, color: role.hex }} />
        <h3
          className="font-display font-bold leading-tight"
          style={{ fontSize: 32, color: role.hex }}
        >
          {role.title}
        </h3>
      </div>

      {/* Description */}
      <p className="mt-4 text-center text-[15px] leading-relaxed text-subtext max-w-[90%] mx-auto">
        {role.copy}
      </p>

      {/* Steps List */}
      <div className="mt-10 flex flex-col gap-6 mx-auto w-fit">
        {role.steps.map(({ Icon: StepIcon, label }) => (
          <div key={label} className="flex items-center gap-4">
            {/* Plain Icon without square */}
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ color: role.hex }}
            >
              <StepIcon style={{ width: 24, height: 24 }} />
            </span>
            {/* Text */}
            <span className="text-[16px] font-medium text-ink">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
  /* The character stands beside the card on its OUTER edge (away from
     the phone). RTL flex renders the first child on the right. */
  return (
    <div className={`role-card role-card-${index} flex items-end gap-3`}>
      {role.side === "right" ? char : card}
      {role.side === "right" ? card : char}
    </div>
  )
}

/* Flat DOM stand-in when WebGL isn't available — shows the brand
   screen. Rendered inside the oversized canvas area (128% × 160% of
   the phone box), so it insets itself back down to the box:
   (1 − 1/1.28)/2 and (1 − 1/1.6)/2. */
function PhoneShellFallback() {
  return (
    <div className="absolute inset-x-[18.75%] inset-y-[10.9375%]">
      <div className="h-full w-full rounded-[40px] bg-[#111318] p-1.5 shadow-[var(--shadow-soft)]">
        <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-whitesmoke">
          <BrandScreen />
          <span className="absolute left-1/2 top-2.5 h-5 w-[68px] -translate-x-1/2 rounded-full bg-[#050506]" />
        </div>
      </div>
    </div>
  )
}

/* Floating UI overlays that accompany the phone (Tiqmo-style):
   a persistent availability pill and a step counter that recolors
   per role. Decorative — the stage is pointer-events-none. */
const STEP_NUMERALS = ["١", "٢", "٣"]

function PhoneChips() {
  return (
    <>
      <div
        aria-hidden
        className="phone-chip chip-cta pill absolute -left-28 bottom-24 z-30 flex items-center gap-2 bg-white/80 px-4 py-2 backdrop-blur-md"
      ></div>
      <div
        aria-hidden
        className="phone-chip chip-step pill absolute -right-14 top-12 z-30 h-9 w-[88px] bg-white/80 backdrop-blur-md"
      >
        {ROLES.map((role, i) => (
          <span
            key={i}
            className={`step-layer-${i} absolute inset-0 flex items-center justify-center gap-2`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: role.hex }}
            />
            <span className="text-body-5 font-bold text-ink">
              {STEP_NUMERALS[i]} / ٣
            </span>
          </span>
        ))}
      </div>
    </>
  )
}

export default function PhoneSection() {
  const root = useRef<HTMLElement>(null)
  /* 3D pose in CSS-transform conventions — the GSAP timeline tweens
     this plain object and PhoneCanvas applies it every frame. State
     only for identity stability; it is mutated, never re-set. */
  const [pose] = useState<PhonePose>(() => ({
    rx: 8,
    ry: 0,
    rz: 0,
    z: 0,
    screen: 0,
  }))

  /* Defer the WebGL canvas (three.js + drei ≈ 260KB of JS plus GL context
     setup) until the section is within a viewport of arriving. Mounting it
     on hydration was the page's single biggest main-thread cost — it ran
     while the user was still reading the hero. The static shell fallback
     fills the frame until then, so nothing visibly changes. */
  const [canvasReady, setCanvasReady] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setCanvasReady(true)
          io.disconnect()
        }
      },
      { rootMargin: "100% 0px" }, // one viewport early — loads before arrival
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Initial pose: brand screen showing, phone parked center a
             touch low, tipped slightly back in 3D space. */
          gsap.set(".phone-center", { y: "12vh" })
          gsap.set(".phone-chip", { autoAlpha: 0 })
          gsap.set(".step-layer-1, .step-layer-2", { autoAlpha: 0 })

          /* Role card+character groups: centered via xPercent/yPercent,
             pushed to their side with x, and parked just below their
             resting spot (y) so each rises from below on entry. */
          ROLES.forEach((role, i) => {
            gsap.set(`.role-card-wrapper-${i}`, {
              xPercent: -50,
              yPercent: -50,
              x: role.side === "left" ? -300 : 300,
              y: 70,
              autoAlpha: 0,
            })
          })

          /* Entry hand-off: the phone peeks over the tail of The Path
             and tips upright as it settles into center (pre-sticky). */
          gsap.from(".phone-rise", {
            y: "45vh",
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          })
          gsap.from(pose, {
            rx: 34,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          })

          /* Idle float — time-based, layered on its own element so it
             never fights the scrubbed transforms. */
          gsap.to(".phone-float", {
            y: -12,
            duration: 2.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          gsap.to(".phone-float", {
            rotation: 0.6,
            duration: 3.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          gsap.to(".chip-cta", {
            y: -8,
            duration: 2.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
          gsap.to(".chip-step", {
            y: 7,
            duration: 2.9,
            delay: 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })

          /* Pinned master timeline */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".roles-desktop-pin",
              pin: true,
              start: "top top",
              end: "+=500%", // 5x screen height to fit the outro
              scrub: 1, // smooth scrubbing
            },
          })

          let currentRy = 0

          // Intro -> Step 1 (Card 0). The header stays put the whole
          // time and only leaves during the outro.
          tl.to(".phone-chip", { autoAlpha: 1, duration: 1 }, 0)

          currentRy += -360 - 16
          tl.to(
            ".phone-travel",
            { x: 220, duration: 1.5, ease: "power2.inOut" },
            0,
          )
          tl.to(pose, { ry: currentRy, duration: 1.5, ease: "power2.inOut" }, 0)
          tl.to(
            pose,
            { rx: 15, rz: 4, z: -110, duration: 0.75, ease: "power2.inOut" },
            0,
          )
          tl.to(
            pose,
            { rx: 8, rz: 0, z: 0, duration: 0.75, ease: "power3.out" },
            0.75,
          )
          tl.set(pose, { screen: 1 }, 0.75)
          tl.to(".role-glow-0", { opacity: 1, duration: 0.75 }, 0.75)
          tl.to(
            ".step-layer-0",
            { autoAlpha: 1, yPercent: 0, duration: 0.5 },
            0.75,
          )
          tl.to(
            ".role-card-wrapper-0",
            { y: 0, autoAlpha: 1, duration: 1, ease: "power2.out" },
            0.5,
          )

          // PAUSE 1
          tl.to({}, { duration: 1.5 })

          // Step 1 -> Step 2 (Card 1)
          const t2 = tl.duration()
          tl.to(
            ".role-card-wrapper-0",
            { y: -70, autoAlpha: 0, duration: 0.8, ease: "power2.in" },
            t2,
          )
          tl.to(".role-glow-0", { opacity: 0, duration: 0.75 }, t2)
          tl.to(
            ".step-layer-0",
            { autoAlpha: 0, yPercent: -60, duration: 0.5 },
            t2,
          )

          currentRy += 360 + 32
          tl.to(
            ".phone-travel",
            { x: -220, duration: 1.5, ease: "power2.inOut" },
            t2,
          )
          tl.to(
            pose,
            { ry: currentRy, duration: 1.5, ease: "power2.inOut" },
            t2,
          )
          tl.to(
            pose,
            { rx: 15, rz: -4, z: -110, duration: 0.75, ease: "power2.inOut" },
            t2,
          )
          tl.to(
            pose,
            { rx: 8, rz: 0, z: 0, duration: 0.75, ease: "power3.out" },
            t2 + 0.75,
          )
          tl.set(pose, { screen: 2 }, t2 + 0.75)
          tl.to(".role-glow-1", { opacity: 1, duration: 0.75 }, t2 + 0.75)
          tl.fromTo(
            ".step-layer-1",
            { autoAlpha: 0, yPercent: 60 },
            { autoAlpha: 1, yPercent: 0, duration: 0.5 },
            t2 + 0.75,
          )
          tl.to(
            ".role-card-wrapper-1",
            { y: 0, autoAlpha: 1, duration: 1, ease: "power2.out" },
            t2 + 0.5,
          )

          // PAUSE 2
          tl.to({}, { duration: 1.5 })

          // Step 2 -> Step 3 (Card 2)
          const t3 = tl.duration()
          tl.to(
            ".role-card-wrapper-1",
            { y: -70, autoAlpha: 0, duration: 0.8, ease: "power2.in" },
            t3,
          )
          tl.to(".role-glow-1", { opacity: 0, duration: 0.75 }, t3)
          tl.to(
            ".step-layer-1",
            { autoAlpha: 0, yPercent: -60, duration: 0.5 },
            t3,
          )

          currentRy += -360 - 32
          tl.to(
            ".phone-travel",
            { x: 220, duration: 1.5, ease: "power2.inOut" },
            t3,
          )
          tl.to(
            pose,
            { ry: currentRy, duration: 1.5, ease: "power2.inOut" },
            t3,
          )
          tl.to(
            pose,
            { rx: 15, rz: 4, z: -110, duration: 0.75, ease: "power2.inOut" },
            t3,
          )
          tl.to(
            pose,
            { rx: 8, rz: 0, z: 0, duration: 0.75, ease: "power3.out" },
            t3 + 0.75,
          )
          tl.set(pose, { screen: 3 }, t3 + 0.75)
          tl.to(".role-glow-2", { opacity: 1, duration: 0.75 }, t3 + 0.75)
          tl.fromTo(
            ".step-layer-2",
            { autoAlpha: 0, yPercent: 60 },
            { autoAlpha: 1, yPercent: 0, duration: 0.5 },
            t3 + 0.75,
          )
          tl.to(
            ".role-card-wrapper-2",
            { y: 0, autoAlpha: 1, duration: 1, ease: "power2.out" },
            t3 + 0.5,
          )

          // PAUSE 3 (Final Resting Phase)
          tl.to({}, { duration: 1.5 })

          // OUTRO PHASE (Step 3 -> Exit)
          const tOutro = tl.duration()
          // Fade out all cards and overlays
          tl.to(
            ".role-card-wrapper-2",
            { y: -70, autoAlpha: 0, duration: 0.8, ease: "power2.in" },
            tOutro,
          )
          tl.to(".role-glow-2", { opacity: 0, duration: 0.75 }, tOutro)
          tl.to(
            ".step-layer-2",
            { autoAlpha: 0, yPercent: -60, duration: 0.5 },
            tOutro,
          )
          tl.to(".phone-chip", { autoAlpha: 0, duration: 0.8 }, tOutro)
          tl.to(".roles-header", { autoAlpha: 0, y: -40, duration: 1 }, tOutro)

          // Center the phone, flip to show back, lay horizontally, and zoom in
          currentRy += 180 // Turn to back
          tl.to(
            ".phone-travel",
            { x: 0, duration: 1.5, ease: "power2.inOut" },
            tOutro,
          )
          tl.to(
            pose,
            {
              ry: currentRy,
              rx: 0,
              rz: -90, // Horizontal orientation
              z: 400, // Zoom in
              duration: 1.5,
              ease: "power2.inOut",
            },
            tOutro,
          )

          // Hold the zoomed horizontal back to show off the logo
          tl.to({}, { duration: 1.2 })

          // Exit off-screen to the left
          const tExit = tl.duration()
          tl.to(
            ".phone-travel",
            { x: "-150vw", duration: 1.5, ease: "power3.in" },
            tExit,
          )
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="roles" className="relative bg-white">
      {/* ── Desktop: Pinned Scrollytelling ── */}
      <div className="roles-desktop-pin hidden md:block h-screen relative overflow-hidden bg-white">
        <CityMapBg className="opacity-40" />

        {/* Header — persists through the whole scroll, fades on outro */}
        <div className="roles-header absolute top-0 left-0 right-0 z-10 pt-10 text-center">
          <h2 className="mt-1.5 font-display text-[34px] font-bold leading-[1.15] text-ink">
            كل دورٍ مهم، ولكل دورٍ مسؤولياته
          </h2>
          <p className="mx-auto mt-2 max-w-[460px] text-[15px] leading-relaxed text-subtext">
            من يلتقط، من يوزّع، من يُصلح — ثلاثة أدوار تعمل على مسارٍ واحد.
          </p>
        </div>

        {/* Pinned Phone Traveler */}
        <div className="phone-center absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="phone-rise">
            <div className="phone-travel relative">
              {ROLES.map((role, i) => (
                <div
                  key={i}
                  aria-hidden
                  className={`role-glow-${i} absolute -inset-24 -z-10 rounded-full opacity-0`}
                  style={{
                    background: `radial-gradient(closest-side, ${role.glass}, transparent)`,
                  }}
                />
              ))}
              <div className="phone-float relative">
                <div className="relative aspect-[236/480] h-[min(480px,62vh)]">
                  <div className="absolute -inset-x-[150%] -inset-y-[14%]">
                    {canvasReady ? (
                      <PhoneCanvas
                        pose={pose}
                        fallback={<PhoneShellFallback />}
                      />
                    ) : (
                      <PhoneShellFallback />
                    )}
                  </div>
                </div>
                <PhoneChips />
              </div>
            </div>
          </div>
        </div>

        {/* Pinned absolute cards — position + slide owned by GSAP
            (xPercent/yPercent centering, x = side offset, y = slide) */}
        {ROLES.map((role, i) => (
          <div
            key={i}
            className={`role-card-wrapper-${i} absolute top-[calc(50%_+_11vh)] left-1/2 w-full max-w-[640px] z-30 opacity-0 pointer-events-none`}
          >
            <RoleCard role={role} index={i} />
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
          const Screen = SCREENS[i + 1] // skip the brand screen
          return (
            <div key={i} className="flex flex-col items-center gap-8">
              <RoleCard role={role} index={i} />
              <div
                className="relative h-[400px] w-[200px] rounded-[36px] bg-[#111318] p-1.5"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[30px]">
                  <Screen />
                  <span className="absolute left-1/2 top-2.5 z-10 h-5 w-[64px] -translate-x-1/2 rounded-full bg-[#050506]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
