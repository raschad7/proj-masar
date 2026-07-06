import type { Metadata } from "next";
import localFont from "next/font/local";
import LenisProvider from "@/lib/lenis";
import "./globals.css";

/* Body — Almarai, local files (300/400/700/800) */
const almarai = localFont({
  variable: "--font-almarai",
  src: [
    { path: "./fonts/Almarai/Almarai-Light.ttf", weight: "300" },
    { path: "./fonts/Almarai/Almarai-Regular.ttf", weight: "400" },
    { path: "./fonts/Almarai/Almarai-Bold.ttf", weight: "700" },
    { path: "./fonts/Almarai/Almarai-ExtraBold.ttf", weight: "800" },
  ],
});

/* Display — Rubbama (single Black cut, declared as the regular weight) */
const rubbama = localFont({
  variable: "--font-rubbama",
  src: [{ path: "./fonts/Rubbama/KORubbama-Black.ttf", weight: "400" }],
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
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
