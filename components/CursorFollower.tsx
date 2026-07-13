"use client"

import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap"

/**
 * Custom cursor built from public/curser/Vector 7.svg (a stylised arrow).
 * A crisp peacock arrow tracks the pointer tightly; a soft peacock glow
 * trails behind with more lag. Over interactive elements the arrow
 * shrinks and the glow swells — a "magnetic focus" feel that matches the
 * rounded, flat brand language. Fine pointers only (hidden on touch).
 *
 * VIDEO MODE: over `[data-cursor-video]` the arrow fades out and a
 * circular play/pause icon springs in. The icon reads the element's
 * `data-cursor-video-state` attribute ("playing" | "paused") to decide
 * which glyph to show.
 *
 * The three layers are ALWAYS rendered (invisible until first move) so
 * the refs exist when the effect runs — gating render on state left the
 * refs null when the effect fired.
 */

// tip of the arrow within its 19×21 viewBox — offset so it sits on the pointer
const TIP_X = 7.6
const TIP_Y = 0.5

export default function CursorFollower() {
  const arrowRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const videoCursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const arrow = arrowRef.current
    const glow = glowRef.current
    const videoCursor = videoCursorRef.current
    if (!arrow || !glow || !videoCursor) return

    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine) return // touch / reduced motion → keep native cursor

    document.documentElement.classList.add("has-custom-cursor")

    // GSAP owns the transform, so centering must go through it (Tailwind
    // translate classes would be overwritten by the x/y tweens).
    gsap.set(glow, { xPercent: -50, yPercent: -50 })
    gsap.set(videoCursor, { xPercent: -50, yPercent: -50 })

    const ax = gsap.quickTo(arrow, "x", { duration: 0.12, ease: "power3" })
    const ay = gsap.quickTo(arrow, "y", { duration: 0.12, ease: "power3" })
    const gx = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" })
    const gy = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" })
    const vx = gsap.quickTo(videoCursor, "x", { duration: 0.15, ease: "power3" })
    const vy = gsap.quickTo(videoCursor, "y", { duration: 0.15, ease: "power3" })

    /* Invert to white over brand-blue surfaces (tagged data-cursor="invert");
       a nested data-cursor="normal" island (e.g. a white button inside the
       blue CTA card) opts back out. The nearest tagged ancestor wins. */
    const path = arrow.querySelector("path")
    const PEACOCK = "#34a8d8"
    const GLOW_PEACOCK =
      "radial-gradient(circle, rgba(52,168,216,0.55) 0%, rgba(52,168,216,0) 70%)"
    const GLOW_WHITE =
      "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
    let inverted = false
    const setInvert = (on: boolean) => {
      if (on === inverted) return
      inverted = on
      if (path)
        gsap.to(path, {
          fill: on ? "#ffffff" : PEACOCK,
          duration: 0.25,
          ease: "power2.out",
        })
      glow.style.background = on ? GLOW_WHITE : GLOW_PEACOCK
    }
    const evalInvert = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return setInvert(false)
      const tagged = t.closest<HTMLElement>("[data-cursor]")
      setInvert(tagged?.dataset.cursor === "invert")
    }

    /* ── Video cursor mode ── */
    let inVideoMode = false
    const playIcon = videoCursor.querySelector(".vc-play") as HTMLElement | null
    const pauseIcon = videoCursor.querySelector(".vc-pause") as HTMLElement | null

    const enterVideoMode = () => {
      if (inVideoMode) return
      inVideoMode = true
      // Hide arrow, show video cursor circle
      gsap.to(arrow, { scale: 0, autoAlpha: 0, duration: 0.25, ease: "back.in(2)" })
      gsap.to(glow, { scale: 0, opacity: 0, duration: 0.2 })
      gsap.to(videoCursor, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.35,
        ease: "back.out(2.5)",
      })
    }

    const leaveVideoMode = () => {
      if (!inVideoMode) return
      inVideoMode = false
      // Hide video cursor, restore arrow
      gsap.to(videoCursor, {
        autoAlpha: 0,
        scale: 0.5,
        duration: 0.25,
        ease: "power3.in",
      })
      gsap.to(arrow, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(1.7)" })
      gsap.to(glow, { scale: 1, opacity: 0.18, duration: 0.3, ease: "power3.out" })
    }

    /** Update the play/pause glyph based on the video's state attribute */
    const syncVideoIcon = (t: EventTarget | null) => {
      if (!playIcon || !pauseIcon) return
      if (!(t instanceof Element)) return
      const videoEl = t.closest<HTMLElement>("[data-cursor-video]")
      if (!videoEl) return
      const state = videoEl.dataset.cursorVideoState
      if (state === "playing") {
        playIcon.style.display = "none"
        pauseIcon.style.display = "block"
      } else {
        playIcon.style.display = "block"
        pauseIcon.style.display = "none"
      }
    }

    const isOverVideo = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-cursor-video]")

    let visible = false
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true
        if (!inVideoMode) {
          gsap.to([arrow, glow], { autoAlpha: 1, duration: 0.25 })
        }
      }
      ax(e.clientX - TIP_X)
      ay(e.clientY - TIP_Y)
      gx(e.clientX)
      gy(e.clientY)
      vx(e.clientX)
      vy(e.clientY)

      // Check video hover on every move for smooth transitions
      if (isOverVideo(e.target)) {
        enterVideoMode()
        syncVideoIcon(e.target)
      } else if (inVideoMode) {
        leaveVideoMode()
      }

      evalInvert(e.target)
    }

    const INTERACTIVE = "a,button,[role=button],input,label,summary,.hotspot"
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest(INTERACTIVE)

    const onOver = (e: MouseEvent) => {
      if (isOverVideo(e.target)) {
        enterVideoMode()
        syncVideoIcon(e.target)
        return
      }
      if (isInteractive(e.target)) {
        gsap.to(arrow, { scale: 0.55, duration: 0.3, ease: "power3.out" })
        gsap.to(glow, {
          scale: 2.4,
          opacity: 0.28,
          duration: 0.3,
          ease: "power3.out",
        })
      }
    }
    const onOut = (e: MouseEvent) => {
      if (isOverVideo(e.target) && !isOverVideo(e.relatedTarget)) {
        leaveVideoMode()
        return
      }
      if (isInteractive(e.target)) {
        gsap.to(arrow, { scale: 1, duration: 0.3, ease: "power3.out" })
        gsap.to(glow, {
          scale: 1,
          opacity: 0.18,
          duration: 0.3,
          ease: "power3.out",
        })
      }
    }
    const onDown = () => {
      if (inVideoMode) {
        gsap.to(videoCursor, { scale: 0.85, duration: 0.12 })
      } else {
        gsap.to(arrow, { scale: 0.8, duration: 0.15 })
      }
    }
    const onUp = () => {
      if (inVideoMode) {
        gsap.to(videoCursor, { scale: 1, duration: 0.2, ease: "back.out(2)" })
        // Brief delay for state to update, then sync icon
        setTimeout(() => {
          const el = document.querySelector("[data-cursor-video]")
          syncVideoIcon(el)
        }, 50)
      } else {
        gsap.to(arrow, { scale: 1, duration: 0.2 })
      }
    }
    /* Hide when the pointer truly leaves the window, and RESET `visible`
       so the next move re-reveals it. Without the reset, re-entering the
       page (or refocusing the tab) left the cursor stuck hidden. */
    const hide = () => {
      visible = false
      inVideoMode = false
      gsap.to([arrow, glow, videoCursor], { autoAlpha: 0, duration: 0.2 })
    }
    /* Only hide on a real window exit — a mouseout whose relatedTarget is
       null means the pointer left the document, not just crossed elements. */
    const onWindowOut = (e: MouseEvent) => {
      if (!e.relatedTarget) hide()
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseover", onOver)
    window.addEventListener("mouseout", onOut)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("mouseout", onWindowOut)
    window.addEventListener("blur", hide)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mouseout", onOut)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("mouseout", onWindowOut)
      window.removeEventListener("blur", hide)
      document.documentElement.classList.remove("has-custom-cursor")
    }
  }, [])

  return (
    <>
      {/* trailing glow (centered on the pointer via GSAP xPercent/yPercent) */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(52,168,216,0) 0%, rgba(52,168,216,0) 70%)",
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
      {/* video cursor — large play/pause glyph, no circle background */}
      <div
        ref={videoCursorRef}
        aria-hidden
        className="video-cursor-icon pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
        style={{ visibility: "hidden", willChange: "transform" }}
      >
        {/* Play triangle — large and bold */}
        <svg
          className="vc-play"
          width="36"
          height="42"
          viewBox="0 0 36 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M34 18.536a3 3 0 010 5.196L6.25 40.29A3 3 0 011.75 37.69V4.577A3 3 0 016.25 1.98L34 18.536z"
            fill="white"
          />
        </svg>
        {/* Pause bars — large and bold */}
        <svg
          className="vc-pause"
          width="32"
          height="40"
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "none" }}
        >
          <rect width="10" height="40" rx="3" fill="white" />
          <rect x="22" width="10" height="40" rx="3" fill="white" />
        </svg>
      </div>
    </>
  )
}
