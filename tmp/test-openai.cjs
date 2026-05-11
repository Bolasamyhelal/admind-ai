const OpenAI = require("D:\\Claude ai\\Chats open code\\DATA MB CLIENTS\\admind-ai\\node_modules\\openai")
const fs = require("fs")
const path = require("path")

// Read env
const envPath = "D:\\Claude ai\\Chats open code\\DATA MB CLIENTS\\admind-ai\\.env"
const env = fs.readFileSync(envPath, "utf8")
const m = env.match(/OPENAI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/)
const key = m ? m[1].trim() : ""
console.log("KEY:", key ? key.slice(0, 15) + "..." : "NOT FOUND")

async function test() {
  const openai = new OpenAI({ apiKey: key })
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: 'Say hello in JSON: {"msg":"hello","lang":"en"}' }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  })
  console.log("Response:", completion.choices[0]?.message?.content)
}

test().catch(e => console.log("ERROR:", e.message))
