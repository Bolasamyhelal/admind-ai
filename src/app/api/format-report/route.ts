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

const prompt = `أنت كاتب تقارير تنفيذي محترف. المطلوب: خذ الإنجازات الخام التالية وحولها إلى تقرير يومي قصير ومباشر بالعربية الفصحى. 

القواعد الصارمة:
- لا تستخدم كلمات مبالغ فيها (مثمر، مميز، رائع، إلخ)
- لا تزيد الفقرة عن سطرين
- استخدم لغة تقارير الأعمال: مباشرة، مهنية، محايدة
- لا مقدمات ولا خاتمات عاطفية
- كل إنجاز في فقرة منفصلة
- التقرير كله لا يزيد عن 6 سطور
- ممنوع استخدام الرموز التعبيرية أو علامات التعجب

الإنجازات الخام:
${entriesText}

اكتب التقرير فقط بدون عنوان أو توقيع.`

    const result = await askGemini(prompt)
    const clean = result.replace(/```/g, "").trim()

    return NextResponse.json({ report: clean })
  } catch (error) {
    console.error("Format report error:", error)
    return NextResponse.json({ error: "Failed to format report" }, { status: 500 })
  }
}
