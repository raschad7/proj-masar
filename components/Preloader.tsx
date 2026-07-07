"use client";

import { useRef, useState } from "react";
import { gsap, MotionPathPlugin, useGSAP } from "@/lib/gsap";

/* The three logo marks, as their raw path data (56×56 viewBox). */
const MARKS = [
  "M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z",
  "M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z",
  "M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z",
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * First-entry preloader.
 *  1. Logo pops in the centre of a white screen.
 *  2. The blue tile expands to cover the whole viewport.
 *  3. The three marks detach and fly on randomised arcs…
 *  4. …landing on the hero's damage hotspots exactly as the blue wipes
 *     away — so the arrows read as the live signals lighting up.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      /* Every reload should begin at the top so the intro plays in full —
         stop the browser from restoring the previous scroll position. */
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);

      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      /* Centre the tile and every mark via GSAP transforms so that the
         motionPath x/y/rotate later stay additive (Tailwind -translate would
         be clobbered by the tween). */
      gsap.set([".pl-tile", ".pl-mark", ".pl-pulse"], { xPercent: -50, yPercent: -50 });

      const finish = () => {
        document.body.style.overflow = prev;
        setDone(true);
      };

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap
          .timeline({ delay: 0.5, onComplete: finish })
          .to(root.current, { opacity: 0, duration: 0.5, ease: "power2.out" });
        return;
      }

      /* Screen-space targets: the real hero hotspots (fallback to spread
         points if the hero isn't in the DOM yet). */
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const hotspots = Array.from(
        document.querySelectorAll<HTMLElement>(".hotspot")
      ).slice(0, 3);
      const targets = MARKS.map((_, i) => {
        const el = hotspots[i];
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
        }
        return { x: rand(-0.35, 0.35) * window.innerWidth, y: rand(-0.3, 0.3) * window.innerHeight };
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: finish,
      });

      /* 1 — logo pops in */
      tl.from(".pl-tile", { scale: 0.6, opacity: 0, duration: 0.55, ease: "back.out(1.7)" });
      tl.from(
        ".pl-mark",
        { scale: 0, opacity: 0, duration: 0.45, stagger: 0.08, ease: "back.out(2)" },
        "-=0.25"
      );

      /* 2 — blue tile expands to cover the viewport */
      const coverScale =
        (Math.max(window.innerWidth, window.innerHeight) / 88) * 2.2;
      tl.to(".pl-tile", {
        scale: coverScale,
        borderRadius: 0,
        duration: 0.7,
        ease: "power4.inOut",
        delay: 0.25,
      });

      /* 3 — marks roam: a wide scatter, a swoop, then home in. Two random
         waypoints per mark + a floaty ease give them real air time. */
      const W = window.innerWidth;
      const H = window.innerHeight;
      MARKS.forEach((_, i) => {
        const t = targets[i];
        const dir = i % 2 === 0 ? 1 : -1; // fan the marks to opposite sides
        tl.to(
          `.pl-mark-${i}`,
          {
            duration: rand(1.7, 2.0),
            ease: "power1.inOut",
            rotate: rand(-380, 380),
            motionPath: {
              path: [
                { x: dir * rand(0.28, 0.46) * W, y: rand(-0.42, -0.15) * H },
                { x: -dir * rand(0.22, 0.42) * W, y: rand(0.12, 0.42) * H },
                { x: t.x, y: t.y },
              ],
              curviness: rand(1.6, 2.4),
            },
          },
          i === 0 ? ">-0.1" : "<+0.08"
        );
      });

      /* Park a pulse ring on each target so it can flash on landing. */
      MARKS.forEach((_, i) => {
        gsap.set(`.pl-pulse-${i}`, { x: targets[i].x, y: targets[i].y, scale: 0, opacity: 0 });
      });

      /* small settle "click" as each mark reaches its hotspot… */
      tl.add("land", ">-0.15");
      tl.to(
        ".pl-mark",
        { scale: 1.25, duration: 0.16, ease: "power2.out", stagger: 0.05 },
        "land"
      );
      /* …and a radar-style pulse blooms out of the landing point */
      tl.to(
        ".pl-pulse",
        {
          scale: 1,
          opacity: 0.9,
          duration: 0.18,
          ease: "power2.out",
          stagger: 0.05,
        },
        "land"
      );
      tl.to(
        ".pl-pulse",
        {
          scale: 2.6,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.05,
        },
        "land+=0.18"
      );

      /* 4 — the blue implodes into the primary hotspot: everything converges
         to one point as the marks settle and fade. */
      const collapseX = ((cx + targets[0].x) / W) * 100;
      const collapseY = ((cy + targets[0].y) / H) * 100;
      gsap.set(root.current, {
        clipPath: `circle(150% at ${collapseX}% ${collapseY}%)`,
      });
      tl.to(
        ".pl-mark",
        { scale: 0.3, opacity: 0, duration: 0.45, ease: "power2.in", stagger: 0.04 },
        ">-0.02"
      );
      tl.to(
        root.current,
        {
          clipPath: `circle(0% at ${collapseX}% ${collapseY}%)`,
          duration: 0.85,
          ease: "power3.inOut",
        },
        "<+0.12"
      );

      /* Hero lift-in — as the mask opens, the hero settles from a subtle
         scale + blur so the reveal feels connected, not static. Cleared
         afterwards so parallax / scroll transforms aren't left with junk. */
      const heroContent = document.querySelector(".hero-content");
      const heroScene = document.querySelector(".hero-scene");
      if (heroContent && heroScene) {
        tl.fromTo(
          [heroScene, heroContent],
          { scale: 1.06, filter: "blur(8px)" },
          {
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            clearProps: "scale,filter",
          },
          "<+0.1"
        );
      }
    },
    { scope: root }
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[9999] overflow-hidden bg-white"
      aria-hidden
    >
      {/* Blue tile — starts as the 88px logo square, expands to cover */}
      <div
        className="pl-tile absolute left-1/2 top-1/2 h-[88px] w-[88px] bg-[#34A8D9]"
        style={{ borderRadius: 24 }}
      />

      {/* Landing pulses — one radar ring parked on each target hotspot,
          flashed the instant the matching mark arrives. */}
      {MARKS.map((_, i) => (
        <div
          key={`pulse-${i}`}
          className={`pl-pulse pl-pulse-${i} absolute left-1/2 top-1/2 h-[72px] w-[72px] rounded-full`}
          style={{ boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.9)" }}
        />
      ))}

      {/* The three marks — each on its own full-screen layer so it can fly
          freely across the viewport. Centred over the tile at rest. */}
      {MARKS.map((d, i) => (
        <svg
          key={i}
          className={`pl-mark pl-mark-${i} absolute left-1/2 top-1/2 h-[88px] w-[88px]`}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={d} fill="#111717" />
        </svg>
      ))}
    </div>
  );
}
