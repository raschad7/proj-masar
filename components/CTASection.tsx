"use client"

import { useRef } from "react"
import { gsap, useGSAP, SplitText } from "@/lib/gsap"

/* Final payoff CTA: a big solid-white مسار mark bleeds off the far-left
   edge of the card. It drifts vertically slower than the page as the card
   passes — a quiet parallax that gives the panel depth without ever calling
   attention to itself. Scrubbed to scroll. The ask sits on the right. */

export default function CTASection() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      //  slow vertical parallax — the mark lags the page as the card passes
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-mark",
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        )

        //  headline splits into words that rise from behind a mask
        const split = new SplitText(".cta-heading", {
          type: "lines,words",
          linesClass: "overflow-hidden py-[0.1em]",
        })

        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          duration: 1.4,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        })

        gsap.from(".cta-sub", {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        })
        gsap.from(".cta-buttons", {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        })

        return () => {
          split.revert()
        }
      })
    },
    { scope: root, dependencies: [] },
  )

  return (
    <section ref={root} id="contact" className="bg-white px-6 py-16">
      <div
        data-cursor="invert"
        className="relative mx-auto flex max-w-[1200px] items-center overflow-hidden bg-peacock px-8 py-14 md:px-14 md:py-16"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        {/* مسار mark — oversized, bleeds off the left, draws in on scroll */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[75%] items-center justify-start overflow-hidden md:flex"
          style={{
            maskImage:
              "linear-gradient(to left, transparent 0%, black 26%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, transparent 0%, black 26%, black 100%)",
          }}
        >
          <svg
            viewBox="5.5 16.5 45 23"
            className="cta-mark h-[118%] w-auto -translate-x-[30%] text-white"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.8376 17.9785L5.97976 36.6039C5.45769 37.4995 6.47538 38.5 7.36193 37.9628L15.2983 33.1536C15.6502 32.9403 16.0969 32.9644 16.4239 33.2144L22.8304 38.112C23.6024 38.7022 24.6775 37.9558 24.3944 37.0263L18.6581 18.1908C18.4039 17.3559 17.2771 17.2245 16.8376 17.9785Z" />
            <path d="M38.7624 17.9785L49.6202 36.6039C50.1423 37.4995 49.1246 38.5 48.238 37.9628L40.3017 33.1536C39.9497 32.9403 39.503 32.9644 39.1761 33.2144L32.7696 38.112C31.9976 38.7022 30.9225 37.9558 31.2056 37.0263L36.9419 18.1908C37.1961 17.3559 38.3229 17.2245 38.7624 17.9785Z" />
            <path d="M26.8471 38.0051L21.2015 20.2617C20.9429 19.4492 21.7545 18.7067 22.5409 19.0362L27.4135 21.078C27.6608 21.1817 27.9393 21.1817 28.1865 21.078L33.0592 19.0362C33.8455 18.7067 34.6571 19.4492 34.3986 20.2617L28.7529 38.0051C28.4573 38.9342 27.1427 38.9342 26.8471 38.0051Z" />
          </svg>
        </div>

        {/* Copy — right side, RTL */}
        <div className="relative z-10 w-full text-center md:w-[56%] md:text-right">
          <h2 className="cta-heading font-display text-display-1 leading-[1.1] text-white">
            جاهزون لإغلاق الحلقة في مدينتك؟
          </h2>

          <p className="cta-sub mt-5 text-body-2 leading-relaxed text-white/85 md:mx-0 mx-auto max-w-xl">
            احجز عرضاً توضيحياً ونُريك كيف يتحوّل كل بلاغ طريقٍ إلى مسارٍ واضح —
            على خريطة مدينتك.
          </p>

          <div className="cta-buttons mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <a
              href="mailto:hello@masar.ps"
              data-cursor="normal"
              className="group flex items-center gap-[11px] rounded-[99px] bg-white px-[30px] py-[15px] text-[17px] font-[800] text-peacock transition-transform hover:scale-[1.03]"
            >
              <span className="relative block h-[20px] w-[18px] overflow-hidden">
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 19 21"
                  fill="none"
                  className="absolute inset-0 transition-transform duration-300 ease-out group-hover:-translate-y-[150%]"
                >
                  <path
                    d="M11.0001 0.496532L0.142295 19.122C-0.379772 20.0175 0.637915 21.0181 1.52446 20.4808L9.46083 15.6717C9.81279 15.4584 10.2595 15.4825 10.5864 15.7325L16.9929 20.6301C17.7649 21.2203 18.84 20.4739 18.5569 19.5443L12.8206 0.708826C12.5664 -0.126008 11.4396 -0.257404 11.0001 0.496532Z"
                    fill="#34A8D9"
                  />
                </svg>
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 19 21"
                  fill="none"
                  className="absolute inset-0 translate-y-[150%] transition-transform duration-300 ease-out group-hover:translate-y-0"
                >
                  <path
                    d="M11.0001 0.496532L0.142295 19.122C-0.379772 20.0175 0.637915 21.0181 1.52446 20.4808L9.46083 15.6717C9.81279 15.4584 10.2595 15.4825 10.5864 15.7325L16.9929 20.6301C17.7649 21.2203 18.84 20.4739 18.5569 19.5443L12.8206 0.708826C12.5664 -0.126008 11.4396 -0.257404 11.0001 0.496532Z"
                    fill="#34A8D9"
                  />
                </svg>
              </span>
              <span>احجز عرضاً توضيحياً</span>
            </a>
            <a
              href="mailto:hello@masar.ps"
              className="pill bg-white/15 px-9 py-4 text-body-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
