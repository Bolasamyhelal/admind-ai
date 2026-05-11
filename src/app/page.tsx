import Link from "next/link"
import { Brain } from "lucide-react"
import { HeroSection } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { PricingSection } from "@/components/landing/pricing"
import { CTASection } from "@/components/landing/cta"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">AdMind AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              المميزات
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              الأسعار
            </Link>
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              ابدأ مجاناً
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <CTASection />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} AdMind AI. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
