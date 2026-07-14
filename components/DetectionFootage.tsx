"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The climax of the Tech section: real field footage of the model
 * detecting road damage.
 *
 * - Autoplays muted+inline when scrolled into view (preload="auto").
 * - Pins on scroll for a cinematic pause, then releases.
 * - Custom cursor morphs into a play/pause circle on hover
 *   (handled by CursorFollower via `data-cursor-video`).
 * - No caption, no corner button — the cursor IS the control.
 */
export default function DetectionFootage() {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Start false — video is idle until ScrollTrigger fires play()
  const [playing, setPlaying] = useState(false);

  // Sync React state with the actual video element events
  // so the cursor icon always reflects reality.
  const syncState = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(!v.paused);
  }, []);

  // Keep it muted so browsers allow inline autoplay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
  }, []);

  // Propagate playing state to the DOM for CursorFollower,
  // and animate the dark overlay on pause/play.
  useEffect(() => {
    const el = frameRef.current;
    const overlay = overlayRef.current;
    if (!el) return;
    el.dataset.cursorVideoState = playing ? "playing" : "paused";

    if (overlay) {
      gsap.to(overlay, {
        opacity: playing ? 0 : 1,
        duration: 0.15,
        ease: "power3.out",
      });
    }
  }, [playing]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance: slide up + fade
        gsap.from(".footage-frame", {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        // Cover → reveal: illustrated echo fades out
        gsap.set(".footage-echo", { opacity: 1 });
        gsap.to(".footage-echo", {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        });

        // Scroll-pause: pin with a subtle scrubbed scale to feel alive
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1,
          },
        });
        pinTl.to(".footage-frame", {
          scale: 1.02,
          ease: "none",
        });
      });

      // Play/pause based on viewport visibility (any motion pref).
      // Starts one viewport early so preload="none" has time to fetch
      // before the frame is actually on screen.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 200%",
        end: "bottom top",
        onEnter: () => {
          const v = videoRef.current;
          if (v) { v.play().catch(() => {}); }
        },
        onEnterBack: () => {
          const v = videoRef.current;
          if (v) { v.play().catch(() => {}); }
        },
        onLeave: () => videoRef.current?.pause(),
        onLeaveBack: () => videoRef.current?.pause(),
      });
    },
    { scope: root }
  );

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
    // State syncs via onPlay/onPause events
  };

  return (
    <div
      ref={root}
      className="mx-auto flex w-full max-w-[860px] items-center justify-center px-6 pb-24 pt-8"
      style={{ minHeight: "100vh" }}
    >
      <div
        ref={frameRef}
        data-cursor-video
        className="footage-frame card-surface relative overflow-hidden bg-whitesmoke p-3 md:p-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div className="relative overflow-hidden rounded-3xl">
          <video
            ref={videoRef}
            className="block aspect-video w-full object-cover"
            poster="/media/detection-poster.jpg"
            muted
            loop
            playsInline
            preload="none"
            onClick={toggle}
            onPlay={syncState}
            onPause={syncState}
          >
            <source src="/media/detection.mp4" type="video/mp4" />
          </video>

          {/* Dark vignette overlay — fades in when paused */}
          <div
            ref={overlayRef}
            className="footage-paused-overlay"
            aria-hidden
          />

          {/* illustrated echo — fades out to reveal the real thing.
              Resting state is transparent so it can never trap the video. */}
          <div
            className="footage-echo pointer-events-none absolute inset-0 bg-whitesmoke opacity-0"
            aria-hidden
          >
            <svg viewBox="0 0 800 450" className="h-full w-full" fill="none">
              <rect width="800" height="450" fill="var(--whitesmoke)" />
              <rect x="0" y="180" width="800" height="270" fill="var(--light)" />
              <rect x="330" y="300" width="64" height="13" rx="6.5" fill="var(--white)" />
              <rect x="450" y="300" width="64" height="13" rx="6.5" fill="var(--white)" />
              <ellipse cx="270" cy="310" rx="70" ry="30" fill="var(--text)" />
              <rect x="175" y="252" width="195" height="118" rx="14" stroke="#0072DA" strokeWidth="4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
