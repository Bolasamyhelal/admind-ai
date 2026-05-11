import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"
import path from "path"

function loadEnvVar(name: string): string {
  if (process.env[name] && process.env[name] !== "ضع_المفتاح_هنا" && !process.env[name]!.startsWith("sk-...")) return process.env[name]!
  try {
    const envPath = path.join(process.cwd(), ".env")
    const content = fs.readFileSync(envPath, "utf8")
    const match = content.match(new RegExp(`${name}=["']?(.+?)["']?(\\r?\\n|$)`))
    if (match) { const val = match[1].trim(); if (val && !val.startsWith("sk-...")) return val }
  } catch {}
  return ""
}

export async function GET() {
  const key = loadEnvVar("GEMINI_API_KEY")
  if (!key) return NextResponse.json({ error: "No key" })

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  try {
    const result = await model.generateContent("رد بـ JSON فقط: {\"test\": \"hello\", \"number\": 123}")
    const text = result.response.text()
    // Show raw bytes and chars
    const bytes: string[] = []
    for (let i = 0; i < Math.min(text.length, 100); i++) {
      bytes.push(`${i}:U+${text.charCodeAt(i).toString(16).padStart(4, '0')}(${text[i]})`)
    }
    return NextResponse.json({ text, bytes })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
