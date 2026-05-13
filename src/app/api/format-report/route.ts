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

    const prompt = `أنت مدقق تقارير. أعطني النص التالي واطلب مني فقط إعادة صياغته بطريقة مختصرة ومهنية دون إضافة أي كلمات جديدة.

المدخلات:
${entriesText}

المطلوب بالضبط:
- أعد كتابة كل إنجاز في سطر واحد فقط
- لا تضف كلمات جديدة غير الموجودة
- فقط رتب الجملة بشكل مهني مختصر
- لا عناوين، لا مقدمات، لا خواتيم
- كل سطر = إنجاز واحد فقط
- اكتب بالعربية الفصحى البسيطة

مثال:
المدخل: "ضبطت الكامبين بتاع براند X وغيرت الكريتيف"
الإخراج: "ضبط حملة براند X وتحديث الكريتيف"

أعد كتابة الإنجازات التالية فقط:`

    const result = await askGemini(prompt)
    const clean = result.replace(/```/g, "").trim()

    return NextResponse.json({ report: clean, raw: entries })
  } catch (error) {
    console.error("Format report error:", error)
    return NextResponse.json({ error: "Failed to format report" }, { status: 500 })
  }
}
