import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Party byADF — Quiz",
  description: "Hra na letní party byADF. 10 let. Jedna výzva.",
  applicationName: "Party byADF Quiz",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "byADF Quiz",
    startupImage: ["/icons/icon-512.png"],
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Party byADF — 10 let. Jedna výzva.",
    description: "Interaktivní quiz pro letní party byADF 2026.",
    type: "website",
    locale: "cs_CZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#050d1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-dvh flex flex-col">
        <AnimatedBackground />
        <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
