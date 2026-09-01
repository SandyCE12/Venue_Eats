import { GoogleGenAI } from "@google/genai";

// Vercel serverless function — handles /api/generate-proposal
function getFallbackProposal(resolvedEventName: string, resolvedEventSize: string, resolvedVendorCount: string, resolvedLanguage: string, resolvedCurrency: string) {
  return resolvedLanguage === "Swedish"
    ? `# Projektförslag: VenueEat för ${resolvedEventName}\n\n## 1. Sammanfattning\n${resolvedEventName} är ett storskaligt utomhusevenemang i Stockholm med ca ${resolvedEventSize} besökare och ${resolvedVendorCount} matförsäljare. Detta dokument beskriver hur vi med en mobilbeställningsapp kan eliminera köer, öka försäljningen och skapa nya intäktsströmmar.\n\n## 2. Värdeerbjudande för Matförsäljare\n* **Eliminera kö-avhopp:** Många besökare vänder om när de ser långa köer. Genom att beställa i appen behåller vi dessa kunder.\n* **Ökat genomsnittligt ordervärde (AOV):** Visuella menyer med tillvalsförslag i appen ökar merförsäljningen med upp till 22%.\n* **Effektivare logistik:** Kockarna får beställningarna direkt till en skärm (Vendor Console) och kan förbereda maten i jämn takt.\n\n## 3. Skatteverket & Regelverk i Sverige\nEnligt svensk lagstiftning måste alla matförsäljare använda ett godkänt kassaregister (Kassaregisterlagen). Vår applikation löser detta genom att integrera med ett molnbaserat, certifierat kassasystem.\n\n## 4. Intäktsmodell\n1. **Transaktionsavgift:** 2.5% + 2 SEK per beställning.\n2. **SaaS-avgift för säljare:** 750 SEK per matförsäljare.\n3. **VIP Snabbspår:** 49 SEK per pass.`
    : `# Project Proposal: VenueEat for ${resolvedEventName}\n\n## 1. Executive Summary\n${resolvedEventName} is a high-profile outdoor event in Stockholm welcoming ${resolvedEventSize} attendees and hosting ${resolvedVendorCount} premium food vendors. This proposal outlines how to eliminate friction, capture lost sales due to queue abandonment, and establish highly lucrative monetization channels.\n\n## 2. Value Proposition for Food Vendors\n* **Recover Lost Sales:** 30% of event-goers abandon long queues. Our app lets them order from their spot.\n* **Higher Average Order Value (AOV):** Digital menus with upselling typically increase order size by 20-25%.\n* **Optimized Kitchen Operations:** Incoming orders are structured cleanly on a tablet screen.\n\n## 3. Regulatory Compliance (Skatteverket)\nAll retail and food sales must comply with the Cash Register Act (Kassaregisterlagen). Our solution integrates a cloud-certified fiscal unit ensuring every mobile transaction issues an authorized digital receipt.\n\n## 4. Revenue & Monetization\n1. **Transaction Commission:** 3.0% per order processed.\n2. **Vendor Activation Fee:** 500 ${resolvedCurrency} per vendor.\n3. **Priority Pass:** 30 ${resolvedCurrency} per pass, split with vendors.`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { eventName, eventSize, vendorCount, focusLanguage, currency } = req.body || {};

  const resolvedEventName = eventName || "Stockholm Summer Festival";
  const resolvedEventSize = eventSize || "30000";
  const resolvedVendorCount = vendorCount || "30";
  const resolvedLanguage = focusLanguage || "English";
  const resolvedCurrency = currency || "SEK";

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ proposal: getFallbackProposal(resolvedEventName, resolvedEventSize, resolvedVendorCount, resolvedLanguage, resolvedCurrency), isFallback: true });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Write a comprehensive, professional, highly persuasive business proposal and deployment blueprint for an event organizer/vendor seeking to launch a mobile food-ordering queue-eliminator app named "VenueEat" for a large outdoor event in Stockholm.

Event Details:
- Event Name: ${resolvedEventName}
- Target Attendees: ${resolvedEventSize} people
- Food Vendors: ${resolvedVendorCount} stalls
- Preferred Currency: ${resolvedCurrency}
- Target Language: ${resolvedLanguage}

The proposal MUST be formatted in clean Markdown and contain the following sections:
1. Executive Summary: Tailor this to a high-density, outdoor Stockholm festival vibe and explain the "Queue-Buster" concept.
2. Local Swedish Regulatory Compliance: Detail how the app satisfies Sweden's Skatteverket (Tax Authority) cash register laws (Kassaregisterlagen) and digital receipt requirements.
3. Monetization Strategy: Give a bulleted breakdown of how the entrepreneur earns money. Include concrete pricing recommendations in ${resolvedCurrency}.
4. Payment Integrations in Sweden: Explain how to integrate Swish Handel API (via BankID), Klarna Checkout, and credit cards (via Stripe/Adyen).
5. End-to-End System Architecture & High Concurrency Plan: Describe the tech stack (React, Node, Firebase/Firestore) and how to handle 30,000 users on 5G networks.
6. Phase-by-Phase Development & Deployment Roadmap: 6-week countdown schedule.

Keep the tone professional, encouraging, and authoritative. Return the markdown content directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.7 },
    });

    res.json({ proposal: response.text || getFallbackProposal(resolvedEventName, resolvedEventSize, resolvedVendorCount, resolvedLanguage, resolvedCurrency), isFallback: false });
  } catch (error: any) {
    console.error("Gemini API Error, returning fallback:", error);
    res.json({ proposal: getFallbackProposal(resolvedEventName, resolvedEventSize, resolvedVendorCount, resolvedLanguage, resolvedCurrency), isFallback: true });
  }
}
