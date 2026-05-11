import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, notes, userId } = await req.json()

    const client = await prisma.client.create({
      data: { name, email, company, notes, userId },
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Fetch clients error:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
