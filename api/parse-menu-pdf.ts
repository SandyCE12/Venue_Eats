import { GoogleGenAI } from "@google/genai";

// Vercel serverless function — handles PDF menu parsing using Gemini multimodal API.
// Called ONLY when a vendor explicitly uploads a PDF. Zero background overhead.
// PDF is processed in-memory and never stored anywhere.

// Increase Vercel's default 4.5MB body limit to handle PDF base64 payloads (up to ~6MB base64 = ~4MB PDF)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "6mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pdfBase64 } = req.body;

  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    return res.status(400).json({ error: "Missing pdfBase64 in request body." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback: return sample items so the UI is still usable in dev without an API key
    return res.json({
      items: [
        { name: "Sample Dish (AI Key Missing)", price: 95, category: "Food", description: "Set GEMINI_API_KEY to enable real PDF parsing." },
      ],
      isFallback: true,
    });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              text: `You are a menu digitization assistant. Extract ALL food and drink items from this restaurant/food stall menu PDF.

Return ONLY a raw JSON array — no markdown fences, no explanations, no extra text. Just the JSON array.

Each item must have this exact structure:
{
  "name": "Item name as written in the menu",
  "price": <number in SEK, use 0 if unclear>,
  "category": "<one of: Food, Drink, Snack, Dessert>",
  "description": "Brief description (1 sentence max, or empty string if none)"
}

Rules:
- If a price is listed in a currency other than SEK, convert it (1 EUR ≈ 11 SEK, 1 USD ≈ 10 SEK).
- If a price is completely unreadable, use 0.
- Categorize as: Food (main dishes, rice, curry, rolls, grills), Drink (juice, lassi, chai, water, soda), Snack (starters, samosas, fries, small bites), Dessert (sweets, ice cream, kheer, halwa).
- If the PDF is not a menu or has no readable items, return an empty array [].
- Do not include section headers, combos with unclear pricing, or non-food items.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1, // Low temperature for deterministic structured output
      },
    });

    const rawText = (response.text || "").trim();

    // Strip any accidental markdown fences if the model adds them despite instructions
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let items: any[];
    try {
      items = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, return a descriptive error rather than crashing
      console.error("PDF parse: Gemini returned non-JSON response:", rawText.substring(0, 300));
      return res.status(422).json({
        error: "Could not extract menu items from this PDF. Please ensure the PDF contains a readable, text-based menu (not a scanned image).",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(422).json({ error: "Unexpected response format from AI. Please try again." });
    }

    // Sanitize each item to ensure correct types before sending to client
    const sanitized = items
      .filter((item) => item && typeof item.name === "string" && item.name.trim())
      .map((item) => ({
        name: String(item.name).trim(),
        price: Math.max(0, Math.round(Number(item.price) || 0)),
        category: ["Food", "Drink", "Snack", "Dessert"].includes(item.category) ? item.category : "Food",
        description: String(item.description || "").trim().substring(0, 200),
      }));

    res.json({ items: sanitized, isFallback: false });
  } catch (error: any) {
    console.error("PDF menu parse error:", error);
    res.status(500).json({ error: "Failed to parse menu PDF. Please try again.", details: error.message });
  }
}
