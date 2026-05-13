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

    const prompt = `أنت مساعد كتابة. المطلوب: خذ النص الخام التالي وأعد كتابته بشكل طبيعي وسلس كأنك توصف لمدريرك إيه اللي اتعمل النهارده. 

القواعد:
- اكتب كلام طبيعي مش رسمي زائد
- كل إنجاز في سطر منفصل
- لا تستخدم صيغة المبني للمجهول (تم كذا) كتير — استخدم الفعل المباشر
- لا تضف معلومات جديدة
- لا عناوين ولا مقدمات
- خليها زي ما حد بيحكي عادي

المدخلات:
${entriesText}

اكتب الإنجازات فقط:`

    const result = await askGemini(prompt)
    const clean = result.replace(/```/g, "").trim()

    return NextResponse.json({ report: clean, raw: entries })
  } catch (error) {
    console.error("Format report error:", error)
    return NextResponse.json({ error: "Failed to format report" }, { status: 500 })
  }
}
