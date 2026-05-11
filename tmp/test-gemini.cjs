"use strict";
const { GoogleGenerativeAI } = require("D:\\Claude ai\\Chats open code\\DATA MB CLIENTS\\admind-ai\\node_modules\\@google\\generative-ai");
const fs = require("fs");
const envContent = fs.readFileSync("D:\\Claude ai\\Chats open code\\DATA MB CLIENTS\\admind-ai\\.env", "utf8");
const m = envContent.match(/GEMINI_API_KEY\s*=\s*["']?(.+?)["']?(\r?\n|$)/);
const key = m ? m[1].trim() : "";
console.log("Has key:", !!key);
if (!key) { console.log("NO KEY FOUND"); process.exit(1); }

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

model.generateContent("Reply with ONLY valid JSON: {\"test\": \"hello\", \"number\": 42}")
  .then(r => {
    const text = r.response.text();
    console.log("SUCCESS, length:", text.length);
    console.log("First 200 chars:");
    console.log(text.slice(0, 200));
    console.log("\\nChar codes:");
    for (let i = 0; i < Math.min(text.length, 50); i++) {
      console.log("  pos", i, "U+" + text.charCodeAt(i).toString(16).padStart(4, "0"), "=", JSON.stringify(text[i]));
    }
  })
  .catch(e => {
    console.log("ERROR:", e.message);
    console.log("Stack:", e.stack?.slice(0, 300));
  });
