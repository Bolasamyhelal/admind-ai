import { NextRequest, NextResponse } from "next/server"
import { askGemini } from "@/lib/ai-helper"

function cleanJsonFromText(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? jsonMatch[0] : text
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

    const result = await askGemini(prompt)

    const jsonStr = cleanJsonFromText(result)
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
