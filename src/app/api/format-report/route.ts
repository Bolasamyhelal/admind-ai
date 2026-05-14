import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
})

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

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ""
    const clean = result.replace(/```/g, "").trim()

    return NextResponse.json({ report: clean, raw: entries })
  } catch (error) {
    console.error("Format report error:", error)
    return NextResponse.json({ error: "Failed to format report" }, { status: 500 })
  }
}
