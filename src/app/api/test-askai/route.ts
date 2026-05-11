import { NextResponse } from "next/server"
import { askAI } from "@/lib/ai-helper"

export async function GET() {
  try {
    const result = await askAI("Say hello in JSON format", true)
    return NextResponse.json({ result })
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      stack: e.stack?.slice(0, 500),
    })
  }
}
