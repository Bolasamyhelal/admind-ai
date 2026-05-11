import { NextRequest, NextResponse } from "next/server"
import { askAI } from "@/lib/ai-helper"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "رابط صحيح مطلوب (http:// أو https://)" }, { status: 400 })
    }

    // Fetch the website
    let html = ""
    let headers: Record<string, string> = {}
    let fetchError = ""

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      })
      clearTimeout(timeout)
      html = await res.text()
      res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v })
    } catch (e: any) {
      fetchError = e.message || "فشل الاتصال بالموقع"
    }

    if (fetchError) {
      return NextResponse.json({ error: `لا يمكن الوصول للموقع: ${fetchError}` }, { status: 400 })
    }

    // Extract meta tags
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || ""
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || ""
    const metaKeywords = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i)?.[1] || ""
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)?.[1] || ""
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] || ""
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i)?.[1] || ""

    // Detect platform
    const scripts: string[] = []
    const scriptRegex = /<script[^>]*src=["']([^"']*)["'][^>]*>/gi
    let match
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1])
    }

    const allScripts = scripts.join(" ")
    const htmlLower = html.toLowerCase()

    const platformDetect = detectPlatform(htmlLower, allScripts, headers)
    const techStack = detectTech(htmlLower, allScripts, headers)

    const pageInfo = {
      title,
      metaDescription: metaDesc,
      metaKeywords,
      ogTitle,
      ogDescription: ogDesc,
      ogImage,
      url,
      platform: platformDetect,
      techStack,
      pageSize: `${(new TextEncoder().encode(html).length / 1024).toFixed(0)} KB`,
      scriptsCount: scripts.length,
    }

    // AI Analysis
    const analysisPrompt = `أنت خبير تحليل مواقع إلكترونية. حلل هذا الموقع وقدم تقريرًا كاملاً.

معلومات الموقع:
- الرابط: ${url}
- العنوان: ${title}
- الوصف: ${metaDesc}
- الكلمات المفتاحية: ${metaKeywords}
- OG Title: ${ogTitle}
- OG Description: ${ogDesc}

المنصة المكتشفة: ${platformDetect.primary}
المنصات الإضافية: ${platformDetect.details}
التقنيات: ${techStack.join(", ")}

عدد الـ Scripts: ${scripts.length}
حجم الصفحة: ${pageInfo.pageSize}

أهم الـ Scripts:
${scripts.slice(0, 15).join("\n")}

قدم التحليل بالعربي بهذا التنسيق JSON بالضبط:
{
  "summary": "ملخص عام عن الموقع",
  "platformConfidence": "عالية / متوسطة / منخفضة",
  "siteType": "متجر إلكتروني / شركة / مدونة / موقع خدمات / landing page / موقع شخصي / منصة تعليمية / سوق / وسيط / أخرى",
  "ecommercePlatform": "شوبيفاي / ووكومرس / سلة / زد / إيزي أوردر / متجر إلكتروني custom / ليس متجر",
  "targetAudience": "الجمهور المستهدف (تقديري)",
  "trafficEstimate": "تقدير الزوار (عالي / متوسط / منخفض)",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3 على الأقل"],
  "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2", "نقطة ضعف 3 على الأقل"],
  "seoIssues": ["مشكلة SEO 1", "مشكلة SEO 2"],
  "performanceIssues": ["مشكلة أداء 1", "مشكلة أداء 2"],
  "missingFeatures": ["ميزة مفقودة 1", "ميزة مفقودة 2", "ميزة مفقودة 3"],
  "recommendations": ["توصية 1 للتطوير", "توصية 2 للتطوير", "توصية 3 للتطوير"],
  "competitorInsight": "تحليل المنافسة في هذا المجال",
  "overallScore": (رقم من 1-10)
}`

    const aiContent = await askAI(analysisPrompt)

    // Log raw AI response for debugging
    try {
      const logDir = path.join(process.cwd(), "tmp")
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)
      fs.writeFileSync(path.join(logDir, "ai-response.json"), aiContent.slice(0, 1000), "utf8")
    } catch {}

    let aiAnalysis: any
    try {
      aiAnalysis = JSON.parse(aiContent)
    } catch {
      // If direct parse fails, return the raw response for debugging
      return NextResponse.json({
        success: false,
        pageInfo,
        _raw: aiContent.slice(0, 500),
        error: "AI returned invalid response",
      })
    }

    return NextResponse.json({
      success: true,
      pageInfo,
      analysis: aiAnalysis,
    })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}

function detectPlatform(html: string, scripts: string, headers: Record<string, string>) {
  const primary = "غير معروف"
  const details: string[] = []

  if (scripts.includes("shopify") || html.includes("/cdn/shopifycloud/") || html.includes("shopify.com")) {
    details.push("شوبيفاي (Shopify)")
  }
  if (scripts.includes("woocommerce") || html.includes("woocommerce") || html.includes("/wp-content/plugins/woocommerce")) {
    details.push("ووكومرس (WooCommerce)")
  }
  if (html.includes("salla") || html.includes("salla.sa") || scripts.includes("salla")) {
    details.push("سلة (Salla)")
  }
  if (html.includes("zid") || scripts.includes("zid")) {
    details.push("زد (Zid)")
  }
  if (html.includes("easyorder") || scripts.includes("easyorder")) {
    details.push("إيزي أوردر (EasyOrder)")
  }
  if (html.includes("wp-content") || html.includes("wordpress") || scripts.includes("wp-")) {
    details.push("ووردبريس (WordPress)")
  }
  if (html.includes("wix") || scripts.includes("wix") || html.includes("wixstatic")) {
    details.push("ويكس (Wix)")
  }
  if (html.includes("webflow") || scripts.includes("webflow")) {
    details.push("ويب فلو (Webflow)")
  }
  if (html.includes("squarespace") || scripts.includes("squarespace") || html.includes("squarespace.com")) {
    details.push("سكوير سبيس (Squarespace)")
  }
  if (html.includes("magento") || scripts.includes("magento")) {
    details.push("ماجنتو (Magento)")
  }

  return { primary: details[0] || "Custom / غير معروف", details: details.join(", ") || "غير محدد" }
}

function detectTech(html: string, scripts: string, headers: Record<string, string>): string[] {
  const tech: string[] = []

  if (scripts.includes("react") || html.includes("react")) tech.push("React")
  if (scripts.includes("next")) tech.push("Next.js")
  if (scripts.includes("vue") || html.includes("vue")) tech.push("Vue.js")
  if (scripts.includes("angular")) tech.push("Angular")
  if (scripts.includes("jquery")) tech.push("jQuery")
  if (scripts.includes("tailwind")) tech.push("Tailwind CSS")
  if (scripts.includes("bootstrap")) tech.push("Bootstrap")
  if (html.includes("font-awesome") || scripts.includes("fontawesome")) tech.push("Font Awesome")
  if (scripts.includes("google-analytics") || scripts.includes("ga(") || scripts.includes("gtag")) tech.push("Google Analytics")
  if (scripts.includes("facebook") || scripts.includes("fbq(")) tech.push("Facebook Pixel")
  if (scripts.includes("tiktok")) tech.push("TikTok Pixel")
  if (scripts.includes("hotjar")) tech.push("Hotjar")
  if (scripts.includes("intercom")) tech.push("Intercom")
  if (scripts.includes("livechat") || scripts.includes("tawk")) tech.push("Chat")
  if (scripts.includes("yandex")) tech.push("Yandex Metrica")
  if (scripts.includes("taboola") || scripts.includes("outbrain")) tech.push("Native Ads")
  if (scripts.includes("googleoptimize") || scripts.includes("optimize")) tech.push("Google Optimize")
  if (headers["x-powered-by"]) tech.push(`X-Powered-By: ${headers["x-powered-by"]}`)
  if (headers["server"]) tech.push(`Server: ${headers["server"]}`)

  return tech
}
