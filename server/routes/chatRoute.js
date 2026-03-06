import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { prisma } from "../config/prismaConfig.js";
import { smartFilter } from "../utils/filterEngine.js";

dotenv.config();
const router = express.Router();

const PRIMARY_MODEL = "gemini-2.5-flash";
const BACKUP_MODEL = "gemini-2.5-flash-lite";
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

/* -----------------------------------------------------------
🔥 Gemini API Helper
----------------------------------------------------------- */
async function callGeminiAPI(prompt, model = PRIMARY_MODEL) {
  const response = await fetch(
    `${GEMINI_BASE_URL}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  // Retry with backup model if overloaded
  if (data?.error?.code === 503) {
    console.log("⚠️ Primary model busy. Switching to backup model…");
    return callGeminiAPI(prompt, BACKUP_MODEL);
  }

  return data;
}

/* -----------------------------------------------------------
🏙️ Cities to detect automatically
----------------------------------------------------------- */
const knownCities = [
  "bengaluru",
  "bangalore",
  "mysuru",
  "mysore",
  "chikmagalur",
  "chikkamagaluru",
  "mangaluru",
  "mangalore",
  "udupi",
  "hubballi",
  "davanagere",
];

/* -----------------------------------------------------------
💬 Chat Endpoint
----------------------------------------------------------- */
router.post("/", async (req, res) => {
  const { message } = req.body || {};
  if (!message)
    return res.status(400).json({ error: "Message field is required." });

  try {
    const msgLower = message.toLowerCase();

    /* -----------------------------------------------------------
    🏡 Detect property search intent
    ----------------------------------------------------------- */
    const isPropertySearch =
      [
        "property",
        "villa",
        "house",
        "flat",
        "plot",
        "apartment",
        "home",
        "estate",
        "bungalow",
      ].some((w) => msgLower.includes(w)) ||
      knownCities.some((city) => msgLower.includes(city)) ||
      msgLower.includes("beach") ||
      msgLower.includes("coffee estate") ||
      msgLower.includes("sea");

    if (isPropertySearch) {
      console.log("🔍 Smart Property Search Triggered…");

      // Fetch all properties
      const all = await prisma.residency.findMany({
        orderBy: { createdAt: "desc" },
      });

      // Apply intelligent filtering logic
      const filtered = smartFilter(all, msgLower);

      if (filtered.length === 0) {
        return res.json({
          reply: `❌ No matching properties found for "${message}". Try specifying a location or a type.`,
        });
      }

      /* -----------------------------------------------------------
      🎨 Format Properties Professionally
      ----------------------------------------------------------- */
      const formatted = filtered
        .map(
          (p) => `
🏡 **${p.title}**

📍 ${p.address}, ${p.city}  
💰 **₹${p.price.toLocaleString()}**

🛏️ ${p.facilities?.bedrooms || "-"} Beds  
🚿 ${p.facilities?.bathrooms || "-"} Baths  
🚗 ${p.facilities?.parking || "-"} Parking

📝 ${p.description.substring(0, 140)}…

🖼️ ${p.image}

━━━━━━━━━━━━━━━━━━
`
        )
        .join("");

      return res.json({
        reply: `Here are the best matches I found:\n\n${formatted}`,
      });
    }

    /* -----------------------------------------------------------
    🤖 Normal AI Chat (Gemini)
    ----------------------------------------------------------- */
    const prompt = `
You are Homyz Realty's AI Assistant.
Provide helpful and friendly responses.

User: ${message}
    `;

    const data = await callGeminiAPI(prompt);
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return res.json({ reply });
  } catch (err) {
    console.error("❌ Chat Route Error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

export default router;
