import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API client lazily to avoid crashing on startup if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI feature will use high-quality template fallback.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Generate Event-Specific Proposal using Gemini
app.post("/api/generate-proposal", async (req, res) => {
  const { eventName, eventSize, vendorCount, focusLanguage, currency } = req.body;

  const resolvedEventName = eventName || "Stockholm Summer Festival";
  const resolvedEventSize = eventSize || "30000";
  const resolvedVendorCount = vendorCount || "30";
  const resolvedLanguage = focusLanguage || "English";
  const resolvedCurrency = currency || "SEK";

  const ai = getAiClient();

  if (!ai) {
    // Elegant fallback proposal when API key is not yet set
    const fallbackText = resolvedLanguage === "Swedish" ? 
`# Projektförslag: VenueEat för ${resolvedEventName}

## 1. Sammanfattning
${resolvedEventName} är ett storskaligt utomhusevenemang i Stockholm med ca ${resolvedEventSize} besökare och ${resolvedVendorCount} matförsäljare. Detta dokument beskriver hur vi med en mobilbeställningsapp kan eliminera köer, öka försäljningen och skapa nya intäktsströmmar.

## 2. Värdeerbjudande för Matförsäljare
* **Eliminera kö-avhopp:** Många besökare vänder om när de ser långa köer. Genom att beställa i appen behåller vi dessa kunder.
* **Ökat genomsnittligt ordervärde (AOV):** Visuella menyer med tillvalsförslag i appen ökar merförsäljningen med upp till 22%.
* **Effektivare logistik:** Kockarna får beställningarna direkt till en skärm (Vendor Console) och kan förbereda maten i jämn takt.

## 3. Skatteverket & Regelverk i Sverige
Enligt svensk lagstiftning måste alla matförsäljare använda ett godkänt kassaregister (Kassaregisterlagen). Vår applikation löser detta genom att integrera med ett molnbaserat, certifierat kassasystem (t.ex. Onslip eller Esportal partner API:er), där varje köp via Swish eller kort automatiskt genererar ett digitalt kvitto och loggas i en certifierad kontrollenhet.

## 4. Intäktsmodell (Hur du tjänar pengar)
1. **Transaktionsavgift:** Ta ut en fast avgift på 2.5% + 2 SEK per beställning som betalas av kunden eller säljaren.
2. **SaaS-avgift för säljare:** En fast licensavgift på 750 SEK per matförsäljare för användning av hårdvara/konsol under evenemanget.
3. **VIP Snabbspår (Skip-the-line):** Sälj "Express-pass" i appen för 49 SEK där köparen får förtur i matkön. Du delar denna intäkt 50/50 med säljaren.

## 5. Implementationsplan (6 veckor till lansering)
* **Vecka 1-2:** API-integration för betalningar (Swish Handel & BankID) och molnkvitto.
* **Vecka 3-4:** Bygg deltagarapp (beställning) och säljarkonsol (beställningshantering).
* **Vecka 5:** Fälttester på plats med 5G-routers och kvittoskrivare.
* **Vecka 6:** Live-lansering under ${resolvedEventName}!`
    :
`# Project Proposal: QueueFree for ${resolvedEventName}

## 1. Executive Summary
${resolvedEventName} is a high-profile outdoor event in Stockholm welcoming ${resolvedEventSize} attendees and hosting ${resolvedVendorCount} premium food vendors. This proposal outlines how to eliminate friction, capture lost sales due to queue abandonment, and establish highly lucrative monetization channels via an integrated event ordering application.

## 2. Value Proposition for Food Vendors
* **Recover Lost Sales:** 30% of event-goers abandon long queues. Our app lets them order from their spot and only approach the stall when notified.
* **Higher Average Order Value (AOV):** Dynamic upselling inside the digital menu typically increases order size by 20-25% compared to chaotic manual order boards.
* **Optimized Kitchen Operations:** Incoming orders are structured cleanly on a tablet screen, preventing verbal errors and improving chef efficiency.

## 3. Regulatory Compliance in Sweden (Skatteverket)
In Sweden, all retail and food sales must comply with the Cash Register Act (Kassaregisterlagen). Our solution integrates a cloud-certified fiscal unit (clean box) directly into the payment gateway (e.g., Stripe, Swish, or Adyen), ensuring every mobile transaction automatically issues an authorized digital receipt and satisfies Skatteverket requirements.

## 4. Revenue & Monetization Channels
1. **Transaction Commission:** Charge a 3.0% commission per order processed through the platform.
2. **Vendor Activation Fee:** Flat rate of 500 ${resolvedCurrency} per vendor for digital onboarding and menu setup.
3. **Priority Priority Pass (Sponsorable):** Sell "Priority Prep" passes for 30 ${resolvedCurrency} to high-intent users, split with vendors.

## 5. Deployment Roadmap
* **Weeks 1-2:** Swish Handel Merchant API onboarding & Database Schema design.
* **Weeks 3-4:** Frontend core mobile views & Vendor dashboard logic completion.
* **Week 5:** Load testing with high concurrency simulations.
* **Week 6:** On-site deployment and vendor staff training.`;

    return res.json({ proposal: fallbackText, isFallback: true });
  }

  try {
    const prompt = `Write a comprehensive, professional, highly persuasive business proposal and deployment blueprint for an event organizer/vendor seeking to launch a mobile food-ordering queue-eliminator app named "VenueEat" (or similar local Swedish brand name) for a large outdoor event in Stockholm.

Event Details:
- Event Name: ${resolvedEventName}
- Target Attendees: ${resolvedEventSize} people
- Food Vendors: ${resolvedVendorCount} stalls
- Preferred Currency: ${resolvedCurrency}
- Target Language: ${resolvedLanguage}

The proposal MUST be formatted in clean Markdown and contain the following sections:
1. Executive Summary: Tailor this to a high-density, outdoor Stockholm festival vibe (like Smaka på Stockholm or Lollapalooza Stockholm) and explain the "Queue-Buster" concept.
2. Local Swedish Regulatory Compliance: Detail how the app satisfies Sweden's Skatteverket (Tax Authority) cash register laws (Kassaregisterlagen) and digital receipt requirements.
3. Monetization Strategy: Give a bulleted breakdown of how the entrepreneur (app owner) earns money (such as Transaction Commissions, Vendor SaaS fees, VIP Priority Express checkout, and Premium Sponsor Placements). Include concrete pricing recommendations in ${resolvedCurrency}.
4. Payment Integrations in Sweden: Explain how to integrate Swish Handel API (via BankID), Klarna Checkout, and credit cards (via Stripe/Adyen). Mention BankID authentication.
5. End-to-End System Architecture & High Concurrency Plan: Describe the tech stack (React, Node, WebSockets, Firebase/Firestore) and how to ensure the system handles 30,000 users accessing 5G networks in a crowded park.
6. Phase-by-Phase Development & Deployment Roadmap: 6-week countdown schedule.

Keep the tone professional, encouraging, and authoritative. Return the markdown content directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ proposal: response.text, isFallback: false });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate proposal via Gemini", details: error.message });
  }
});

// API: Support Chat Bot for Customer and Vendor interfaces
app.post("/api/support-chat", async (req, res) => {
  const { messages, type } = req.body;
  const chatType = type || "customer"; // "customer" or "vendor"

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages history array" });
  }

  const lastUserMessageObj = messages[messages.length - 1];
  const lastUserMessage = lastUserMessageObj?.text || lastUserMessageObj?.content || "";

  const ai = getAiClient();

  if (!ai) {
    // Dynamic mock response fallback when GEMINI_API_KEY is not defined
    const lowerMsg = lastUserMessage.toLowerCase();
    let text = "";

    if (chatType === "vendor") {
      if (lowerMsg.includes("skatteverket") || lowerMsg.includes("tax") || lowerMsg.includes("kassa") || lowerMsg.includes("law")) {
        text = "Hej! The VenueEat platform keeps your business 100% compliant with Swedish Skatteverket (Kassaregisterlagen). Every purchase made via Swish/Card automatically connects to our cloud-certified fiscal box (clean box) and instantly shoots an authorized digital receipt to the customer's phone history. You don't need any bulky extra on-site hardware!";
      } else if (lowerMsg.includes("payout") || lowerMsg.includes("swish") || lowerMsg.includes("money") || lowerMsg.includes("get paid")) {
        text = "Your customer payouts from Swish Handel go directly into your connected restaurant bank account in real-time! The platform's standard 3.0% commission fee is computed automatically and is fully transparent in your 'Analytics' dashboard. No manual reconciliation required.";
      } else if (lowerMsg.includes("queue") || lowerMsg.includes("congestion") || lowerMsg.includes("rush")) {
        text = "During peak hours, your kitchen congestion state will display as 'Busy'. To manage high volume, you can pause background traffic using the 'Pause Traffic' switch on the console. Also, ensure you click 'Accept & Cook' as soon as order tickets arrive so customers know you're on it!";
      } else if (lowerMsg.includes("ready") || lowerMsg.includes("serve") || lowerMsg.includes("prepare")) {
        text = "As soon as you finish preparing a dish, click the blue 'Notify Ready' button. This triggers a real-time sound and status update on the customer's phone tracker telling them to come to the counter for pickup!";
      } else {
        text = `Hej Chef! I am your VenueEat Vendor Operations Assistant. I can help you with menu item customization, live analytics, Stockholm festival logistics, or complying with Skatteverket's Cash Register Act. Ask me any question about your kitchen operations!`;
      }
    } else {
      // Customer
      if (lowerMsg.includes("swish") || lowerMsg.includes("pay") || lowerMsg.includes("betala") || lowerMsg.includes("money")) {
        text = "Ordering and paying with Swish is fully automated! Just pick your favorite meals from any vendor menu, tap the 'Pay with Swish' button, fill in your billing details, and verify in your Swish app on your real phone. Once completed, your ticket is fired instantly to the chef's dashboard!";
      } else if (lowerMsg.includes("tracker") || lowerMsg.includes("ready") || lowerMsg.includes("status") || lowerMsg.includes("delay")) {
        text = "You can view your order progress live by tapping the 'Tracker' tab (indicated by the orange beacon icon) at the bottom of your phone screen. You will see stages: 'Processing' (waiting for vendor), 'Preparing' (chef is cooking), and 'Ready for Pickup' (come get it!).";
      } else if (lowerMsg.includes("menu") || lowerMsg.includes("price") || lowerMsg.includes("food") || lowerMsg.includes("recommend")) {
        text = "We have 4 premium pre-approved street food partners! Delhi Street Sensation (Chaat & Rolls), Bombay Cutting & Grill (Street Eats), Kerala Coastal Spice (South Indian Delights), and Jaipur Palace Sweets (Traditional Sweets & Drinks). Tap any of their cards to view and customize delicious, authentic dishes!";
      } else {
        text = `Hej! I am your VenueEat Guest Support Concierge. Ask me anything about exploring menus, customizing toppings, paying with Swish, or tracking your order live. I'm here to help you skip the queue!`;
      }
    }

    return res.json({ text, isFallback: true });
  }

  try {
    const systemInstruction = chatType === "vendor" 
      ? `You are "VenueEat Vendor Operations Coach", an expert AI advisor for food truck owners and kitchen chefs participating in premium Stockholm outdoor festivals (like Smaka på Stockholm or Lollapalooza). 
Your tone is professional, encouraging, practical, and knowledgeable about Swedish street food operations.
You help vendors with:
1. Managing their kitchen orders, updating stock/menus, and preparing food quickly.
2. Complying with Skatteverket (Sweden's Tax Authority) regulations, specifically the Kassaregisterlagen (Cash Register Act) - explain that VenueEat provides integrated cloud fiscal registers and digital receipts.
3. Swish payments (Swish Handel API) and secure processing.
4. Tips to optimize average order value (AOV) and reduce peak congestion levels.
Keep responses concise, formatted with bullet points where appropriate, and support both English and Swedish queries.`
      : `You are "VenueEat Guest Support Concierge", a warm, polite, and responsive festival host helping visitors order food at Stockholm events.
Your tone is enthusiastic, helpful, and friendly.
You help festival guests with:
1. Explaining how to browse food truck menus (Delhi Street Sensation, Bombay Cutting, Kerala Coastal, Jaipur Palace).
2. Guiding them on how to order and pay via Swish instantly.
3. Describing how to track their order live on the 'Tracker' tab of their phone.
4. Explaining the value of 'Queue-Free' - no standing in lines, they can relax in the park (e.g. Kungsträdgården) until they get a push notification.
Keep responses snappy, helpful, delightful, and speak in the language (Swedish or English) that the user queries in.`;

    // Map conversation messages to GenAI contents structure
    const contents = messages.map(msg => ({
      role: msg.role === "model" || msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text || msg.content || "" }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Support Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat message", details: error.message });
  }
});

// Mount Vite middleware for development or serve build folder in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
