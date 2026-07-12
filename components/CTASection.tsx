"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft24Filled } from "@fluentui/react-icons"
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap"

/* Final payoff CTA: a large ASCII rendering of the masar mark covers
   the left, the ask sits on the right. The mark is sampled from the
   logo onto a character grid at runtime, then "decoded" into place on
   scroll while the headline splits in word by word. Peacock palette. */

const COLS = 85
const NOISE = "01<>/\\|=+*#%مسار"

const HARDCODED_ASCII = `                             @@                                      @@
                           @@@@@@                                  @@@@@@
                          @@@@@@@@      @@@@@@            @@@@@@@ @@@@@@@@
                         @@@@@@@@@@  @@@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@
                        @@@@@@@@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                       @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                      @@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@
                     @@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@
                    @@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@
                   @@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@
                  @@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@
                 @@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@
                @@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@
               @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@
              @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
             @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            @@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@  @  @@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@
           @@@@@@@@@@@@@@@@      @@@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@      @@@@@@@@@@@@@
          @@@@@@@@@@@@@@@          @@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@          @@@@@@@@@@@@
         @@@@@@@@@@@@@               @@@@@@@@@@@@@ @@@@@@@@@@@@@               @@@@@@@@@@
        @@@@@                          @@@@@@@@@@@ @@@@@@@@@@@                    @@@@@@@
                                          @@@@@@@@ @@@@@@@@
                                            @@@@@@ @@@@@@
                                              @@@@ @@@@
                                                @@ @@
                                                  @`

export default function CTASection() {
  const root = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useGSAP(
    () => {
      if (!preRef.current) return
      const pre = preRef.current
      const final = HARDCODED_ASCII

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

        //  ascii "decode": scramble that resolves left → right
        const proxy = { p: 0 }
        
        // Start empty so it's not visible before scrolling down
        pre.textContent = ""

        gsap.to(proxy, {
          p: 1,
          duration: 2.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            const p = proxy.p
            
            // Hide completely if reversed to the start
            if (p <= 0.01) {
              pre.textContent = ""
              return
            }

            let out = ""
            let col = 0
            for (let i = 0; i < final.length; i++) {
              const ch = final[i]
              if (ch === "\n") {
                out += "\n"
                col = 0
                continue
              }
              if (ch === " ") {
                out += " "
                col++
                continue
              }
              //  cells resolve as the wavefront sweeps rightward
              const threshold = (col / COLS) * 0.85
              out +=
                p > threshold ? ch : NOISE[(Math.random() * NOISE.length) | 0]
              col++
            }
            pre.textContent = out
          },
          onComplete: () => {
            pre.textContent = final
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
        {/* ASCII mark — covers the left, fades toward the copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[54%] md:block"
          style={{
            maskImage:
              "linear-gradient(to left, transparent 2%, black 34%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, transparent 2%, black 34%, black 100%)",
          }}
        >
          <pre
            ref={preRef}
            className="cta-ascii absolute left-[-3%] top-1/2 -translate-y-1/2 select-none font-mono text-white/90"
            style={{
              fontSize: "clamp(6px, 1.15vw, 12px)",
              lineHeight: 1,
              letterSpacing: "0.06em",
              whiteSpace: "pre",
            }}
          />
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
