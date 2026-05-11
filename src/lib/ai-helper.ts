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

export async function askAI(prompt: string, jsonMode = true): Promise<string> {
  // Groq free tier first (Llama 3, Mixtral, Gemma — no credit card needed)
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
      console.warn("Groq failed:", err?.message?.slice(0, 100))
    }
  }

  // Fallback to Gemini (free tier)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
        },
      })
      const result = await model.generateContent(jsonMode
        ? `${prompt}\n\nأرسل الرد بصيغة JSON فقط بدون أي نص إضافي. ابدأ بـ { وانتهي بـ }`
        : prompt
      )
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

  // Fallback to OpenAI (paid key)
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
