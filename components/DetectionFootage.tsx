"use client";

import { useEffect, useRef, useState } from "react";
import { Play24Filled, Pause24Filled } from "@fluentui/react-icons";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The climax of the Tech section: real field footage of the model
 * detecting road damage. Sits in the normal-scroll tail (never
 * scrubbed). Autoplays muted+inline; an illustrated "echo" of the same
 * road frame crossfades away as the block enters view — same frame,
 * now real. Pauses when scrolled out of view (battery/perf).
 *
 * TODO: confirm whether footage already has boxes burned in, or if
 *       we overlay our own.
 */
export default function DetectionFootage() {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  // Kick playback on mount as a belt-and-suspenders backup to the
  // autoPlay attribute (some engines reject the attribute but honour a
  // muted programmatic play()).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => setPaused(false)).catch(() => {});
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // The echo only exists as a motion flourish. Its resting DOM state
      // is fully transparent, so if this branch never runs (reduced
      // motion) the real video is simply visible — never covered.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

        // cover, then reveal: opaque on approach, fades once the frame
        // is well into view (once:true so it can never re-cover the video)
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

        gsap.from(".footage-caption", {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 55%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Pause when off-screen regardless of motion preference
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => videoRef.current?.play().catch(() => {}),
        onEnterBack: () => videoRef.current?.play().catch(() => {}),
        onLeave: () => videoRef.current?.pause(),
        onLeaveBack: () => videoRef.current?.pause(),
      });
      return () => st.kill();
    },
    { scope: root }
  );

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div ref={root} className="mx-auto w-full max-w-[860px] px-6 pb-24 pt-8">
      <div
        className="footage-frame card-surface relative overflow-hidden bg-whitesmoke p-3 md:p-4"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div className="relative overflow-hidden rounded-3xl">
          <video
            ref={videoRef}
            className="block aspect-video w-full object-cover cursor-pointer"
            poster="/media/detection-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onClick={toggle}
            onCanPlay={() => {
              const v = videoRef.current;
              if (v) {
                v.muted = true;
                v.play().catch(() => {});
              }
            }}
          >
            {/* mp4 first — it compressed smaller than the vp9 for this
                noisy field capture, and every target browser plays it */}
            <source src="/media/detection.mp4" type="video/mp4" />
            <source src="/media/detection.webm" type="video/webm" />
          </video>

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

          {/* small corner control */}
          <button
            type="button"
            onClick={toggle}
            aria-label={paused ? "تشغيل التسجيل" : "إيقاف التسجيل"}
            className="absolute bottom-4 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-peacock shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
          >
            {paused ? <Play24Filled /> : <Pause24Filled />}
          </button>
        </div>

      </div>

      <p className="footage-caption mt-5 text-center text-body-4 text-subtext">
        لقطة فعلية من نموذج الكشف أثناء المسح الميداني.
      </p>
    </div>
  );
}
