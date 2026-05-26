import type { Metadata } from "next"
import { Syne, DM_Sans } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "QuickBiz AI — Powerful Marketing Copy in Seconds",
  description:
    "Generate compelling marketing content tailored to your brand voice, audience, and African market. Free to start.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080808] text-[#fef3c7]">{children}</body>
    </html>
  )
}
