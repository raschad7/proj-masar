import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import LenisProvider from "@/lib/lenis";
import "./globals.css";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
});

/*
 * TODO: asset — Rubbama display font files.
 * When the .woff2 files arrive, drop them in ./fonts and replace the
 * fallback below with:
 *
 *   import localFont from "next/font/local";
 *   const rubbama = localFont({
 *     variable: "--font-rubbama",
 *     src: [
 *       { path: "./fonts/Rubbama-Regular.woff2", weight: "400" },
 *       { path: "./fonts/Rubbama-Bold.woff2", weight: "700" },
 *     ],
 *   });
 *
 * …and add `rubbama.variable` to the <html> className. Until then,
 * --font-rubbama resolves to Almarai 800 (the specified fallback).
 */

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
      className={`${almarai.variable} antialiased`}
      style={{ ["--font-rubbama" as string]: "var(--font-almarai)" }}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
