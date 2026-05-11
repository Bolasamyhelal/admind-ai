import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const token = cookie.split("session=")?.[1]?.split(";")?.[0]

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: session.user })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
