import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"
import path from "path"

function loadGeminiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "ضع_المفتاح_هنا" && !process.env.GEMINI_API_KEY!.startsWith("sk-...")) {
    return process.env.GEMINI_API_KEY!
  }
  try {
    const envPath = path.join(process.cwd(), ".env")
    const content = fs.readFileSync(envPath, "utf8")
    const match = content.match(/GEMINI_API_KEY=["']?(.+?)["']?(\r?\n|$)/)
    if (match) {
      const val = match[1].trim()
      if (val && val !== "ضع_المفتاح_هنا") return val
    }
  } catch {}
  return ""
}

async function analyzeWithGemini(prompt: string): Promise<string> {
  const key = loadGeminiKey()
  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { temperature: 0.7 },
  })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function POST(req: NextRequest) {
  try {
    const { metricKey, metricLabel, value, currency, brandName, brandNiche, brandGoals, brandPlatforms } = await req.json()

    const prompt = `أنت خبير تسويق رقمي متخصص في تحليل أداء الحملات الإعلانية. حلل هذا المؤشر باللغة العربية المصرية:

اسم البراند: ${brandName || "غير محدد"}
تخصص البراند: ${brandNiche || "غير محدد"}
أهداف البراند: ${brandGoals || "غير محدد"}
المنصات: ${brandPlatforms || "غير محدد"}

المؤشر: ${metricLabel} (${metricKey})
القيمة: ${value}
العملة: ${currency || "USD"}

قم بتحليل دقيق يشمل:
1. تفسير القيمة الحالية (هل هي جيدة أم سيئة مع ذكر الأرقام)
2. تحليل استراتيجي بناءً على طبيعة البراند وتخصصه
3. توصيات عملية وقابلة للتنفيذ (3-5 توصيات)
4. نصيحة استراتيجية عامة

أرسل الرد بصيغة JSON كالتالي:
{
  "analysis": "تحليل مفصل للمؤشر...",
  "status": "excellent" | "good" | "warning" | "critical" | "info",
  "statusLabel": "ممتاز" | "جيد" | "محتاج تحسين" | "حرج" | "معلومة",
  "recommendations": ["توصية 1", "توصية 2", ...],
  "strategicTip": "نصيحة استراتيجية..."
}`

    const result = await analyzeWithGemini(prompt)

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : result
    let parsed: any
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({
        analysis: "تعذر تحليل البيانات بواسطة Gemini حالياً. جرب مرة أخرى.",
        status: "info",
        statusLabel: "معلومة",
        recommendations: ["حاول مرة أخرى", "تأكد من مفتاح Gemini API"],
        strategicTip: "تأكد من أن مفتاح Gemini API شغال بشكل صحيح.",
      })
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error("Analyze metric error:", error?.message?.slice(0, 200))
    return NextResponse.json({
      analysis: "حدث خطأ في الاتصال بخدمة Gemini.",
      status: "info",
      statusLabel: "خطأ",
      recommendations: ["حاول مرة أخرى لاحقاً", "تأكد من مفتاح Gemini API"],
      strategicTip: "",
    })
  }
}
