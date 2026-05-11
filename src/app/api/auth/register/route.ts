import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes, scryptSync } from "crypto"

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password) },
    })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
