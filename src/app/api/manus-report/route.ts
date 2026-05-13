import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { reportData } = await req.json()
    const apiKey = process.env.MANUS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "MANUS_API_KEY not configured" }, { status: 400 })
    }

    const prompt = `قم بإنشاء تقرير أداء يومي مميز باللغة العربية بصيغة PDF يحتوي على:
- ملخص أداء اليوم
- عدد التقارير المرفوعة: ${reportData?.summary?.uploadsToday || 0}
- عدد التحليلات: ${reportData?.summary?.analysesToday || 0}
- عدد الحملات المنطلقة: ${reportData?.summary?.campaignsToday || 0}
- الإنفاق: ${reportData?.summary?.spendToday || 0}
- الإيرادات: ${reportData?.summary?.revenueToday || 0}
- ROAS: ${reportData?.summary?.roasToday || 0}
- إجمالي البراندات: ${reportData?.allTime?.totalBrands || 0}
- إجمالي الحملات: ${reportData?.allTime?.totalCampaigns || 0}

صمم التقرير بشكل احترافي مع رسوم بيانية وتنسيق جميل مناسب لعرضه على العملاء.`

    const response = await fetch("https://api.manus.ai/v1/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        task: prompt,
        model: "manus-standard",
        output_format: "pdf",
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Manus API error:", err)
      return NextResponse.json({ error: "Manus API failed" }, { status: 500 })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Manus report error:", error)
    return NextResponse.json({ error: "Failed to generate with Manus" }, { status: 500 })
  }
}
