import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/hooks/useProgress";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "العقل الخوارزمي | تعلّم التفكير البرمجي بدون كود",
  description: "درّب عقلك على التفكير الحاسوبي والخوارزميات والمنطق البرمجي عبر ألغاز واقعية ممتعة — بدون كتابة أي كود.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#05070f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-cosmos min-h-screen text-slate-100 antialiased`}>
        <ProgressProvider>
          <Header />
          <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-5">{children}</main>
          <BottomNav />
        </ProgressProvider>
      </body>
    </html>
  );
}
