import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const cwd = process.cwd()
  const envPath = path.join(cwd, ".env")
  const exists = fs.existsSync(envPath)
  let content = ""
  let geminiKey = ""
  if (exists) {
    content = fs.readFileSync(envPath, "utf8")
    const m = content.match(/GEMINI_API_KEY\s*=\s*["']?(.+?)["']?(\r?\n|$)/)
    if (m) geminiKey = m[1].trim()
  }
  return NextResponse.json({
    cwd,
    envPath,
    envExists: exists,
    envKeys: Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("OPENAI")),
    geminiFromProcess: process.env.GEMINI_API_KEY ? "EXISTS: " + process.env.GEMINI_API_KEY!.slice(0, 10) : "NOT FOUND",
    geminiFromFile: geminiKey ? "EXISTS: " + geminiKey.slice(0, 10) : "NOT FOUND",
    fileContent: content.slice(0, 200),
  })
}
