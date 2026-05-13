import { NextRequest, NextResponse } from "next/server"
import { askGemini } from "@/lib/ai-helper"

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json()

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No entries provided" }, { status: 400 })
    }

    const entriesText = entries.map((e: any, i: number) =>
      `${i + 1}. ${e.brand !== "عام" ? `[${e.brand}] ` : ""}${e.text}`
    ).join("\n")

    const prompt = `أنت كاتب تقارير محترف في مجال التسويق الرقمي. قمت اليوم بعدة إنجازات للعملاء. المطلوب: خذ الإنجازات الخام التالية وحولها إلى تقرير يومي احترافي باللغة العربية الفصحى، بلغة مفهومة وجذابة، مناسبة لتقديمها لصاحب العلامة التجارية (العميل).

الإنجازات الخام:
${entriesText}

المطلوب:
- أعد صياغة الإنجازات بطريقة احترافية وجذابة
- استخدم لغة واضحة ومفهومة (مش technical)
- رتبها في فقرات منسقة
- اجعلها تبدو وكأنها تقرير من وكالة تسويق محترفة
- لا تستخدم نقاط رقميه، استخدم فقرات نصية
- ابدأ بمقدمة قصيرة عن اليوم، ثم اذكر الإنجازات، ثم اختم بخاتمة إيجابية

اكتب التقرير فقط بدون أي مقدمات أو تعليقات إضافية.`

    const result = await askGemini(prompt)
    const clean = result.replace(/```/g, "").trim()

    return NextResponse.json({ report: clean })
  } catch (error) {
    console.error("Format report error:", error)
    return NextResponse.json({ error: "Failed to format report" }, { status: 500 })
  }
}
