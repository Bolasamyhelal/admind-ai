import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null
  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  return session?.user ?? null
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")
    const type = searchParams.get("type") || "all"

    if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 })

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: user.id },
      select: { name: true },
    })
    if (!brand) return NextResponse.json({ error: "البراند غير موجود" }, { status: 404 })

    const result: any = {}

    if (type === "all" || type === "campaigns") {
      const campaigns = await prisma.campaignExecution.findMany({
        where: { userId: user.id, brand: brand.name },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { dailyLogs: { orderBy: { date: "desc" }, take: 30 } },
      })
      result.campaigns = campaigns.map((c) => ({
        id: c.id, name: c.name, clientName: c.clientName, platform: c.platform,
        goal: c.goal, totalBudget: c.totalBudget, dailyBudget: c.dailyBudget,
        startDate: c.startDate, endDate: c.endDate, status: c.status, currency: c.currency,
        totalSpend: c.dailyLogs.reduce((s, l) => s + l.spend, 0),
        logCount: c.dailyLogs.length,
      }))
      result.campaignStats = {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === "active").length,
        totalBudget: campaigns.reduce((s, c) => s + c.totalBudget, 0),
        totalSpend: campaigns.reduce((s, c) => s + c.dailyLogs.reduce((ss, l) => ss + l.spend, 0), 0),
        currency: campaigns[0]?.currency || "USD",
      }
    }

    if (type === "all" || type === "creatives") {
      const creatives = await prisma.creative.findMany({
        where: { userId: user.id, brandId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
      result.creatives = creatives.map((cr) => ({
        id: cr.id, name: cr.name, fileData: cr.fileData, fileType: cr.fileType,
        platform: cr.platform, aiScore: cr.aiScore, aiAnalysis: cr.aiAnalysis,
        status: cr.status, createdAt: cr.createdAt,
      }))
    }

    if (type === "all" || type === "alerts") {
      const alerts = await prisma.alert.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
      result.alerts = alerts
    }

    if (type === "all" || type === "uploads") {
      const uploads = await prisma.upload.findMany({
        where: { userId: user.id, brandId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
      result.uploads = uploads
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 300) }, { status: 500 })
  }
}
