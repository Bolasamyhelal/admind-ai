import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askAI, visionAnalysis } from "@/lib/ai-helper"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const userId = formData.get("userId") as string
    const name = (formData.get("name") as string) || file?.name || "Creative"
    const platform = (formData.get("platform") as string) || ""
    const notes = (formData.get("notes") as string) || ""
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    let fileData: string | null = null
    let fileType: string | null = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      fileData = `data:${file.type};base64,${buffer.toString("base64")}`
      fileType = file.type
    }

    const creative = await prisma.creative.create({
      data: { name, fileData, fileType, platform, notes, userId, status: "pending" },
    })

    // AI Analysis (non-blocking - fire and forget)
    analyzeCreative(creative.id, name, platform, notes, fileType).catch(console.error)

    return NextResponse.json({ success: true, creative })
  } catch (error) {
    console.error("Creative upload error:", error)
    return NextResponse.json({ error: "Failed to upload creative" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, fileData, name, userId } = body
    if (!id || !userId) return NextResponse.json({ error: "id and userId required" }, { status: 400 })

    const existing = await prisma.creative.findFirst({ where: { id, userId } })
    if (!existing) return NextResponse.json({ error: "Creative not found" }, { status: 404 })

    const creative = await prisma.creative.update({
      where: { id },
      data: {
        ...(fileData !== undefined ? { fileData } : {}),
        ...(name !== undefined ? { name } : {}),
      },
    })
    return NextResponse.json({ success: true, creative })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update creative" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const where: any = { userId }

    const creatives = await prisma.creative.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ creatives })
  } catch (error) {
    console.error("Fetch creatives error:", error)
    return NextResponse.json({ error: "Failed to fetch creatives" }, { status: 500 })
  }
}

async function analyzeCreative(id: string, name: string, platform: string, notes: string, fileType: string | null) {
  // Fetch the creative to get its fileData (image)
  let fileData: string | null = null
  try {
    const creative = await prisma.creative.findUnique({ where: { id } })
    if (creative) fileData = creative.fileData
  } catch {}
  try {
    const prompt = `أنت خبير تحليل إعلانات رقمية. حلل هذا الإعلان وقدم تقييمًا دقيقًا:

اسم الإعلان: ${name}
المنصة: ${platform || "غير محدد"}
ملاحظات: ${notes || "لا يوجد"}
نوع الملف: ${fileType || "غير محدد"}

قدم التحليل بالعربي بهذا التنسيق JSON بالضبط:
{
  "score": (رقم من 1-10),
  "summary": "ملخص تحليل الإعلان",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
  "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
  "successProbability": "عالية / متوسطة / منخفضة",
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"],
  "targetAudience": "الجمهور المستهدف المناسب",
  "bestPlatform": "أفضل منصة لهذا الإعلان"
}`

    let content: string
    if (fileData && fileData.startsWith("data:image/")) {
      const parts = fileData.split(",")
      const mimeMatch = fileData.match(/^data:(image\/\w+);/)
      if (parts.length > 1 && mimeMatch) {
        const imageArg = { mimeType: mimeMatch[1], data: parts[1] }
        content = await visionAnalysis(prompt, true, imageArg)
      } else {
        content = await askAI(prompt, true)
      }
    } else {
      content = await askAI(prompt, true)
    }
    const analysis = JSON.parse(content)

    await prisma.creative.update({
      where: { id },
      data: {
        aiScore: analysis.score,
        aiAnalysis: content,
        status: "analyzed",
      },
    })
  } catch (error) {
    console.error("Creative analysis error:", error)
    await prisma.creative.update({
      where: { id },
      data: { status: "failed", aiAnalysis: "فشل تحليل الإعلان" },
    })
  }
}
