import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"
import path from "path"

function loadEnvVar(name: string): string {
  if (process.env[name] && process.env[name] !== "ضع_المفتاح_هنا" && !process.env[name]!.startsWith("sk-...")) {
    return process.env[name]!
  }
  try {
    const envPath = path.join(process.cwd(), ".env")
    const content = fs.readFileSync(envPath, "utf8")
    const match = content.match(new RegExp(`${name}=["']?(.+?)["']?(\\r?\\n|$)`))
    if (match) {
      const val = match[1].trim()
      if (val && !val.startsWith("sk-...")) return val
    }
  } catch {}
  return ""
}

const groqApiKey = loadEnvVar("GROQ_API_KEY")
const geminiApiKey = loadEnvVar("GEMINI_API_KEY")
const openaiApiKey = loadEnvVar("OPENAI_API_KEY")

const groq = groqApiKey ? new OpenAI({ apiKey: groqApiKey, baseURL: "https://api.groq.com/openai/v1" }) : null
const openai = openaiApiKey && openaiApiKey !== "sk-..." ? new OpenAI({ apiKey: openaiApiKey }) : null
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null

function cleanJsonExtract(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  let extracted = jsonMatch ? jsonMatch[0] : text
  extracted = extracted.replace(/[^\x20-\x7E\u0600-\u06FF\u00A0-\u00FF{}[\]",:.\-0-9a-zA-Z]/g, "")
  return extracted
}

/**
 * Dedicated vision analysis — NEVER calls Groq (no vision support).
 * Uses Gemini (vision-capable) as primary, OpenAI as fallback.
 */
export async function visionAnalysis(prompt: string, jsonMode = true, imageData: { mimeType: string; data: string }): Promise<string> {
  const jsonSuffix = jsonMode ? "\n\nأرسل الرد بصيغة JSON فقط بدون أي نص إضافي. ابدأ بـ { وانتهي بـ }" : ""

  // Gemini with image (primary)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { temperature: 0.7 },
      })
      const result = await model.generateContent([
        { text: prompt + jsonSuffix },
        { inlineData: { mimeType: imageData.mimeType, data: imageData.data } },
      ])
      const text = result.response.text()
      if (jsonMode) {
        const cleaned = cleanJsonExtract(text)
        let parsed: any
        try { parsed = JSON.parse(cleaned) } catch (e2: any) {
          return JSON.stringify({ _raw: cleaned.slice(0, 500), _error: e2.message })
        }
        return JSON.stringify(parsed)
      }
      return text
    } catch (err: any) {
      const msg = err?.message?.toString() || err?.toString() || ""
      try { fs.writeFileSync(path.join(process.cwd(), "tmp", "gemini-vision-error.log"), msg, "utf8") } catch {}
      console.warn("Gemini vision failed:", msg.slice(0, 150))
    }
  }

  // OpenAI with image (fallback)
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt + jsonSuffix },
            { type: "image_url", image_url: { url: `data:${imageData.mimeType};base64,${imageData.data}` } },
          ],
        }],
        temperature: 0.7,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      })
      return completion.choices[0]?.message?.content || ""
    } catch (err: any) {
      console.error("OpenAI vision failed:", err?.message?.slice(0, 100))
    }
  }

  throw new Error("لا يوجد موديل يدعم تحليل الصور — تأكد من GEMINI_API_KEY أو OPENAI_API_KEY")
}

export async function askAI(prompt: string, jsonMode = true, imageData?: { mimeType: string; data: string }): Promise<string> {
  const jsonSuffix = jsonMode ? "\n\nأرسل الرد بصيغة JSON فقط بدون أي نص إضافي. ابدأ بـ { وانتهي بـ }" : ""

  // If image is provided, delegate to dedicated vision function (never calls Groq)
  if (imageData) {
    return visionAnalysis(prompt, jsonMode, imageData)
  }

  // Text-only: Groq free tier first (no credit card needed)
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: jsonMode ? "You only respond in JSON format. No markdown, no explanations, just valid JSON." : "" },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      })
      const text = completion.choices[0]?.message?.content || ""
      if (jsonMode) {
        let parsed: any
        try { parsed = JSON.parse(text) } catch {
          const cleaned = cleanJsonExtract(text)
          try { parsed = JSON.parse(cleaned) } catch (e2: any) {
            return JSON.stringify({ _raw: text.slice(0, 500), _error: e2.message })
          }
        }
        return JSON.stringify(parsed)
      }
      return text
    } catch (err: any) {
      console.warn("Groq failed:", (err?.message?.toString() || "").slice(0, 100))
    }
  }

  // Text-only fallback: Gemini
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { temperature: 0.7 },
      })
      const result = await model.generateContent(prompt + jsonSuffix)
      const text = result.response.text()
      if (jsonMode) {
        const cleaned = cleanJsonExtract(text)
        let parsed: any
        try { parsed = JSON.parse(cleaned) } catch (e2: any) {
          return JSON.stringify({ _raw: cleaned.slice(0, 500), _error: e2.message })
        }
        return JSON.stringify(parsed)
      }
      return text
    } catch (err: any) {
      const msg = err?.message?.toString() || err?.toString() || ""
      try { fs.writeFileSync(path.join(process.cwd(), "tmp", "gemini-error.log"), msg, "utf8") } catch {}
      if (msg.includes("429") || msg.includes("quota") || msg.includes("Quota") || msg.includes("Unavailable")) {
        console.warn("Gemini quota/rate limit exceeded")
      } else {
        console.warn("Gemini failed:", msg.slice(0, 200))
      }
    }
  }

  // Text-only fallback: OpenAI
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      })
      return completion.choices[0]?.message?.content || ""
    } catch (err: any) {
      console.error("OpenAI also failed:", err?.message?.slice(0, 100))
    }
  }

  const hasGroq = !!groqApiKey
  const hasGemini = !!geminiApiKey
  const hasOpenAI = !!openaiApiKey
  if (hasGroq) throw new Error("Groq API فشل. تأكد من GROQ_API_KEY في .env")
  if (hasGemini && !hasOpenAI) throw new Error("Gemini quota/rate limit. جرب تضيف GROQ_API_KEY مجاني من console.groq.com")
  throw new Error("مفتاح API غير موجود - افتح ملف .env وحط GROQ_API_KEY (مجاني) أو GEMINI_API_KEY أو OPENAI_API_KEY")
}
