import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AdMind AI - منصة تحليلات التسويق الذكية",
  description: "منصة مدعومة بالذكاء الاصطناعي لتحليل الحملات الإعلانية واستخراج الرؤى وتحسين استراتيجيات الإعلان عبر ميتا وتيك توك وجوجل وسناب شات",
  keywords: "media buying, ad analytics, AI marketing, performance marketing, Meta Ads, TikTok Ads",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
