import { NextRequest, NextResponse } from "next/server"
import { askAI } from "@/lib/ai-helper"

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

    const result = await askAI(prompt, true)
    let parsed: any
    try {
      parsed = JSON.parse(result)
    } catch {
      return NextResponse.json({
        analysis: "تعذر تحليل البيانات بواسطة AI حالياً. جرب مرة أخرى.",
        status: "info",
        statusLabel: "معلومة",
        recommendations: ["حاول مرة أخرى", "تأكد من اتصال API"],
        strategicTip: "تأكد من أن مفاتيح API شغالة بشكل صحيح.",
      })
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error("Analyze metric error:", error?.message?.slice(0, 200))
    return NextResponse.json({
      analysis: "حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي.",
      status: "info",
      statusLabel: "خطأ",
      recommendations: ["حاول مرة أخرى لاحقاً"],
      strategicTip: "",
    })
  }
}
