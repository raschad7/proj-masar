"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const LINKS = [
  { label: "المسار", href: "#path" },
  { label: "الأدوار", href: "#roles" },
  { label: "الميزات", href: "#features" },
  { label: "الأثر", href: "#impact" },
  { label: "تواصل", href: "#contact" },
];

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // White + blur + soft shadow once the page moves past 30px.
      ScrollTrigger.create({
        start: 30,
        end: "max",
        toggleClass: { targets: navRef.current, className: "nav-scrolled" },
      });
    },
    { scope: navRef }
  );

  return (
    <nav
      ref={navRef}
      className="site-nav fixed inset-x-0 top-0 z-50"
      aria-label="التنقل الرئيسي"
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        {/* Brand — right side in RTL */}
        <a href="#top" className="flex items-center gap-2">
          {/* TODO: asset — replace dot + wordmark with the real logo */}
          <span className="h-3 w-3 rounded-full bg-peacock" aria-hidden />
          <span className="font-display text-2xl text-ink">مسار</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="text-[16px] text-subtext transition-colors hover:text-ink"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="pill bg-peacock px-6 py-3 text-[16px] font-bold text-white transition-colors hover:bg-horizon"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          احجز عرضاً توضيحياً
        </a>
      </div>
    </nav>
  );
}
