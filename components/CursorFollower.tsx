"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor built from public/curser/Vector 7.svg (a stylized arrow).
 * A crisp peacock arrow tracks the pointer tightly; a soft peacock glow
 * trails behind with more lag. Over interactive elements the arrow
 * shrinks and the glow swells — a "magnetic focus" feel that matches the
 * rounded, flat brand language. Fine pointers only (hidden on touch).
 *
 * The two layers are ALWAYS rendered (invisible until first move) so the
 * refs exist when the effect runs — gating render on state left the refs
 * null when the effect fired.
 */

// tip of the arrow within its 19×21 viewBox — offset so it sits on the pointer
const TIP_X = 7.6;
const TIP_Y = 0.5;

export default function CursorFollower() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arrow = arrowRef.current;
    const glow = glowRef.current;
    if (!arrow || !glow) return;

    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return; // touch / reduced motion → keep native cursor

    document.documentElement.classList.add("has-custom-cursor");

    // GSAP owns the transform, so centering must go through it (Tailwind
    // translate classes would be overwritten by the x/y tweens).
    gsap.set(glow, { xPercent: -50, yPercent: -50 });

    const ax = gsap.quickTo(arrow, "x", { duration: 0.12, ease: "power3" });
    const ay = gsap.quickTo(arrow, "y", { duration: 0.12, ease: "power3" });
    const gx = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" });

    /* Invert to white over brand-blue surfaces (tagged data-cursor="invert");
       a nested data-cursor="normal" island (e.g. a white button inside the
       blue CTA card) opts back out. The nearest tagged ancestor wins. */
    const path = arrow.querySelector("path");
    const PEACOCK = "#34a8d8";
    const GLOW_PEACOCK =
      "radial-gradient(circle, rgba(52,168,216,0.55) 0%, rgba(52,168,216,0) 70%)";
    const GLOW_WHITE =
      "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)";
    let inverted = false;
    const setInvert = (on: boolean) => {
      if (on === inverted) return;
      inverted = on;
      if (path)
        gsap.to(path, {
          fill: on ? "#ffffff" : PEACOCK,
          duration: 0.25,
          ease: "power2.out",
        });
      glow.style.background = on ? GLOW_WHITE : GLOW_PEACOCK;
    };
    const evalInvert = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return setInvert(false);
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      setInvert(tagged?.dataset.cursor === "invert");
    };

    let visible = false;
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([arrow, glow], { autoAlpha: 1, duration: 0.25 });
      }
      ax(e.clientX - TIP_X);
      ay(e.clientY - TIP_Y);
      gx(e.clientX);
      gy(e.clientY);
      evalInvert(e.target);
    };

    const INTERACTIVE = "a,button,[role=button],input,label,summary,.hotspot";
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest(INTERACTIVE);

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(arrow, { scale: 0.55, duration: 0.3, ease: "power3.out" });
        gsap.to(glow, { scale: 2.4, opacity: 0.28, duration: 0.3, ease: "power3.out" });
      }
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(arrow, { scale: 1, duration: 0.3, ease: "power3.out" });
        gsap.to(glow, { scale: 1, opacity: 0.18, duration: 0.3, ease: "power3.out" });
      }
    };
    const onDown = () => gsap.to(arrow, { scale: 0.8, duration: 0.15 });
    const onUp = () => gsap.to(arrow, { scale: 1, duration: 0.2 });
    /* Hide when the pointer truly leaves the window, and RESET `visible`
       so the next move re-reveals it. Without the reset, re-entering the
       page (or refocusing the tab) left the cursor stuck hidden. */
    const hide = () => {
      visible = false;
      gsap.to([arrow, glow], { autoAlpha: 0, duration: 0.2 });
    };
    /* Only hide on a real window exit — a mouseout whose relatedTarget is
       null means the pointer left the document, not just crossed elements. */
    const onWindowOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hide();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseout", onWindowOut);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseout", onWindowOut);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      {/* trailing glow (centered on the pointer via GSAP xPercent/yPercent) */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(52,168,216,0.55) 0%, rgba(52,168,216,0) 70%)",
          visibility: "hidden",
          willChange: "transform",
        }}
      />
      {/* crisp arrow — tip anchored to the pointer */}
      <div
        ref={arrowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
        style={{ visibility: "hidden", willChange: "transform" }}
      >
        <svg
          width="19"
          height="21"
          viewBox="0 0 19 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }}
        >
          <path
            d="M7.60318 0.496584L18.461 19.122C18.983 20.0176 17.9654 21.0181 17.0788 20.4809L9.14244 15.6717C8.79049 15.4584 8.34381 15.4826 8.01686 15.7325L1.61033 20.6302C0.838364 21.2203 -0.236721 20.4739 0.0463715 19.5444L5.78264 0.708878C6.03688 -0.125957 7.16367 -0.257352 7.60318 0.496584Z"
            fill="var(--peacock)"
          />
        </svg>
      </div>
    </>
  );
}
