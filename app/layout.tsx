import type { Metadata } from "next";
import localFont from "next/font/local";
import LenisProvider from "@/lib/lenis";
import CursorFollower from "@/components/CursorFollower";
import Preloader from "@/components/Preloader";
import "./globals.css";

/* Body — Almarai, local files (400/700/800).
   WOFF2 (converted from the TTF sources kept beside them) — ~68% smaller,
   and fonts are render-blocking so this directly moves FCP/LCP.
   Light (300) was preloaded but never used anywhere — dropped (~47KB). */
const almarai = localFont({
  variable: "--font-almarai",
  src: [
    { path: "./fonts/Almarai/Almarai-Regular.woff2", weight: "400" },
    { path: "./fonts/Almarai/Almarai-Bold.woff2", weight: "700" },
    { path: "./fonts/Almarai/Almarai-ExtraBold.woff2", weight: "800" },
  ],
});

/* Display — Rubbama (single Black cut, declared as the regular weight) */
const rubbama = localFont({
  variable: "--font-rubbama",
  src: [{ path: "./fonts/Rubbama/KORubbama-Black.woff2", weight: "400" }],
});

export const metadata: Metadata = {
  title: "مسار — بلاغٌ واحد، طريقٌ واحد، حلقةٌ تُغلق",
  description:
    "مسار يحوّل بلاغات الطرق المتناثرة إلى مسارٍ واحد واضح: يُكتشف، يُسنَد، يُصلَح، ويُغلَق. كل ذلك على خريطة مدينتك.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${almarai.variable} ${rubbama.variable} antialiased`}
      /* browser extensions / Chrome auto-translate mutate <html> attrs
         before hydration on Arabic pages — tolerate that noise */
      suppressHydrationWarning
    >
      {/* body also suppressed: extensions (Grammarly, dark-mode, ColorZilla)
          and Chrome auto-translate inject attributes onto <body> before
          hydration — html's flag doesn't cascade to it */}
      <body suppressHydrationWarning>
        <Preloader />
        <CursorFollower />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
