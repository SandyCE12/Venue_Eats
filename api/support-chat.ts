import { GoogleGenAI } from "@google/genai";

// Vercel serverless function — mirrors the /api/support-chat handler in server.ts
// This file is only used in Vercel production. Local dev still uses server.ts.

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, type } = req.body;
  const chatType = type || "customer"; // "customer" or "vendor"

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages history array" });
  }

  const lastUserMessageObj = messages[messages.length - 1];
  const lastUserMessage = lastUserMessageObj?.text || lastUserMessageObj?.content || "";

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
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

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  try {
    const systemInstruction =
      chatType === "vendor"
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
    const contents = messages.map((msg: any) => ({
      role: msg.role === "model" || msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text || msg.content || "" }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Support Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat message", details: error.message });
  }
}
