import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactGrab } from "./react-grab";
import { Budge } from "./__budge";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.expect.dev",
  ),
  title: "budge",
  description: "Tweak UI without going back-and-forth with AI.",
  openGraph: {
    title: "budge",
    description: "Tweak UI without going back-and-forth with AI.",
    siteName: "budge",
  },
  twitter: {
    card: "summary_large_image",
    title: "budge",
    description: "Tweak UI without going back-and-forth with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <ReactGrab />
        <Budge />
        <Analytics />
      </body>
    </html>
  );
}
