import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
    if (!session) return NextResponse.json({ error: "جلسة غير صالحة" }, { status: 401 })

    const { name } = await req.json()
    if (!name || !name.trim()) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    })

    return NextResponse.json({ success: true, user: { id: updated.id, name: updated.name, email: updated.email } })
  } catch (error: any) {
    return NextResponse.json({ error: (error?.message || "").slice(0, 200) }, { status: 500 })
  }
}
