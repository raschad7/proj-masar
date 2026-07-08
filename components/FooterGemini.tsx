"use client";

import { useRef, useEffect } from "react";
import {
  Mail24Filled,
  Call24Filled,
  Location24Filled,
} from "@fluentui/react-icons";
import { gsap, useGSAP } from "@/lib/gsap";

const COLUMNS = [
  {
    title: "المنتج",
    links: ["المسار", "الأدوار", "الميزات", "التقنية", "التسعير"],
  },
  {
    title: "الشركة",
    links: ["من نحن", "تواصل", "وظائف", "الأخبار"],
  },
  {
    title: "موارد",
    links: ["الأسئلة الشائعة", "الدعم", "سياسة الخصوصية", "الشروط"],
  },
];

const CONTACT = [
  { Icon: Mail24Filled, label: "hello@masar.ps" },
  { Icon: Call24Filled, label: "+970 000 000 000" },
  { Icon: Location24Filled, label: "رام الله، فلسطين" },
];

const SOCIAL = ["in", "X", "f", "ig"];

export default function FooterGemini() {
  const container = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Dynamic border-radius flattening on scroll (makes it feel elastic)
      gsap.from(container.current, {
        borderTopLeftRadius: "150px",
        borderTopRightRadius: "150px",
        y: 150,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "top 20%",
          scrub: true,
        },
      });

      // 2. Massive text scale, opacity, and subtle rotation
      gsap.fromTo(
        textRef.current,
        { scale: 0.7, opacity: 0, y: 150, rotateX: 20 },
        {
          scale: 1,
          opacity: 0.05,
          y: 0,
          rotateX: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      // 3. Advanced Mask Reveal for all text elements (Staggered translation)
      gsap.from(".reveal-mask > *", {
        y: "120%",
        duration: 1,
        stagger: 0.04,
        ease: "power4.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 65%",
        },
      });

      // 4. Fade and slide for the bottom bar
      gsap.from(".bottom-bar-element", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bottom-bar-element",
          start: "top 90%",
        },
      });
    },
    { scope: container }
  );

  // 5. Mouse move parallax effect for the glow orb
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgGlowRef.current || !container.current) return;
      const { clientX, clientY } = e;
      const { top, left, width, height } = container.current.getBoundingClientRect();
      
      // Calculate mouse position relative to the footer center
      const xPos = (clientX - left - width / 2) * 0.1;
      const yPos = (clientY - top - height / 2) * 0.1;

      gsap.to(bgGlowRef.current, {
        x: xPos,
        y: yPos,
        duration: 1,
        ease: "power2.out",
      });
      
      gsap.to(textRef.current, {
        x: xPos * -0.5,
        y: yPos * -0.5,
        duration: 1,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer
      ref={container}
      className="relative z-50 -mt-12 overflow-hidden rounded-t-[40px] bg-ink text-white"
      style={{ perspective: "1000px" }}
    >
      {/* Dynamic glow orb following the mouse */}
      <div 
        ref={bgGlowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40vw] w-[40vw] rounded-full bg-peacock opacity-[0.03] blur-[100px]"
      />

      {/* Background glowing massive text */}
      <div
        ref={textRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="font-display text-[27vw] leading-none text-peacock mix-blend-screen opacity-5">
          MASAR
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-28">
        <div className="grid gap-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand Block */}
          <div>
            <div className="reveal-mask overflow-hidden pb-2">
              <div className="flex items-center gap-3">
                <img
                  src="/logo/Logo 6.svg"
                  alt="Masar Logo"
                  className="h-10 w-10 brightness-0 invert"
                  aria-hidden
                  data-cursor="invert"
                />
                <span className="font-display text-3xl text-white">مسار</span>
              </div>
            </div>
            
            <div className="reveal-mask mt-5 overflow-hidden">
              <p className="max-w-xs text-body-3 leading-relaxed text-muted">
                منصّة إدارة أضرار الطرق للبلديات.
              </p>
            </div>
            <div className="reveal-mask mt-2 overflow-hidden">
              <p className="max-w-xs text-body-4 leading-relaxed text-peacock">
                بلاغٌ واحد، طريقٌ واحد، حلقةٌ تُغلق.
              </p>
            </div>

            <ul className="mt-8 flex flex-col gap-4">
              {CONTACT.map(({ Icon, label }) => (
                <li key={label} className="reveal-mask overflow-hidden">
                  <div className="group flex w-fit cursor-pointer items-center gap-3 text-muted transition-colors hover:text-white">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all duration-300 group-hover:bg-peacock/20 group-hover:scale-110">
                      <Icon className="shrink-0 text-white transition-colors group-hover:text-peacock" aria-hidden />
                    </div>
                    <span className="text-body-4">{label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav Columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="reveal-mask overflow-hidden pb-1">
                <h3 className="text-body-3 font-bold text-white">{col.title}</h3>
              </div>
              <ul className="mt-6 flex flex-col gap-4">
                {col.links.map((link) => (
                  <li key={link} className="reveal-mask overflow-hidden">
                    <a
                      href="#"
                      className="group relative inline-flex text-body-4 text-muted transition-all duration-300 hover:text-white hover:translate-x-[-8px]"
                    >
                      <span>{link}</span>
                      <span className="absolute -bottom-1 right-0 h-[2px] w-0 bg-peacock transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="bottom-bar-element text-body-5 text-muted">© مسار ٢٠٢٦ — جميع الحقوق محفوظة</p>
          <div className="mt-6 flex items-center gap-6 md:mt-0">
            <a href="#" className="bottom-bar-element text-body-5 text-muted transition-colors hover:text-white">
              سياسة الخصوصية
            </a>
            <a href="#" className="bottom-bar-element text-body-5 text-muted transition-colors hover:text-white">
              الشروط
            </a>
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="bottom-bar-element flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-body-4 font-bold text-muted transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:bg-peacock hover:text-white hover:shadow-[0_10px_20px_rgba(52,168,216,0.3)]"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
