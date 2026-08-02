import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, RotateCcw, User, MessageSquare, Bot, HelpCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface SupportChatProps {
  type: "customer" | "vendor";
  vendorName?: string;
  customerName?: string;
}

export default function SupportChat({ type, vendorName, customerName }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions to guide users
  const customerSuggestions = [
    "How do I pay with Swish?",
    "Where is the tracker?",
    "How do I customize my food toppings?",
    "What is Delhi Street Sensation?"
  ];

  const vendorSuggestions = [
    "Is this Skatteverket compliant?",
    "How do Swish payouts work?",
    "What do I do when an order is ready?",
    "How can I increase my average sales?"
  ];

  const suggestions = type === "customer" ? customerSuggestions : vendorSuggestions;

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeText = type === "vendor"
      ? `Hej ${vendorName || "Chef"}! Welcome to your AI Vendor Operations Assistant. I am ready to advise you on kitchen optimization, Sweden's Kassaregisterlagen (Tax Laws), Swish Handeln transaction streams, or customizing menu lists. Ask me anything!`
      : `Hej ${customerName || "there"}! I'm your VenueEat Guest Support Concierge. Ask me anything about exploring food stalls, customizing meals, checking out via Swish, or tracking your active prepare status live!`;
    
    setMessages([
      { role: "model", text: welcomeText }
    ]);
  }, [type, vendorName, customerName]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    setError(null);
    const userMsg: Message = { role: "user", text: textToSend };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputValue("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          type: type
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reach AI support assistant.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err: any) {
      console.error("Support Chat Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetChat = () => {
    const welcomeText = type === "vendor"
      ? `Hej ${vendorName || "Chef"}! Welcome to your AI Vendor Operations Assistant. I am ready to advise you on kitchen optimization, Sweden's Kassaregisterlagen (Tax Laws), Swish Handeln transaction streams, or customizing menu lists. Ask me anything!`
      : `Hej ${customerName || "there"}! I'm your VenueEat Guest Support Concierge. Ask me anything about exploring food stalls, customizing meals, checking out via Swish, or tracking your active prepare status live!`;
    
    setMessages([
      { role: "model", text: welcomeText }
    ]);
    setError(null);
    setInputValue("");
  };

  const isCustomer = type === "customer";

  return (
    <div className={`flex flex-col h-full bg-zinc-950 text-zinc-100 ${isCustomer ? "rounded-b-[24px]" : "rounded-3xl border-2 border-zinc-800 shadow-xl"} overflow-hidden`}>
      {/* Chat Header */}
      <div className={`px-4 py-3 shrink-0 flex justify-between items-center ${isCustomer ? "bg-orange-500/10 border-b border-orange-500/20" : "bg-zinc-900 border-b-2 border-zinc-850"}`}>
        <div className="flex items-center gap-2 text-left">
          <div className={`p-1.5 rounded-xl ${isCustomer ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {isCustomer ? "AI Guest Concierge" : "AI Vendor Coach"}
            </h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
              Powered by Gemini 3.5
            </p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          title="Reset chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 scrollbar-thin select-text">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div key={index} className={`flex items-start gap-2 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              {/* Profile Bubble */}
              <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                isUser 
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300" 
                  : (isCustomer ? "bg-orange-600/10 border-orange-500/30 text-orange-400" : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400")
              }`}>
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Text Balloon */}
              <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed text-left font-medium ${
                isUser 
                  ? "bg-zinc-800 text-white rounded-tr-none" 
                  : "bg-zinc-900/60 border border-zinc-850 text-zinc-100 rounded-tl-none"
              }`}>
                {msg.text.split("\n").map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-1.5" : ""}>{para}</p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isGenerating && (
          <div className="flex items-center gap-2 max-w-[80%] mr-auto">
            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border ${
              isCustomer ? "bg-orange-600/10 border-orange-500/30 text-orange-400" : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
            }`}>
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="bg-zinc-900/60 border border-zinc-850 rounded-2xl rounded-tl-none px-3.5 py-2 text-zinc-400 text-xs font-mono font-bold animate-pulse">
              thinking...
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      {messages.length === 1 && !isGenerating && (
        <div className="px-3.5 pb-2 shrink-0 space-y-1.5">
          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Suggested Topics
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="w-full text-left text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer truncate"
              >
                💡 {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Field Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 bg-zinc-900/40 border-t border-zinc-850 shrink-0 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder={isGenerating ? "Gemini is typing..." : (isCustomer ? "Ask about menu, Swish, tracker..." : "Ask about tax rules, orders, payouts...")}
          disabled={isGenerating}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isGenerating}
          className={`p-2.5 rounded-xl transition-all font-bold cursor-pointer ${
            isCustomer 
              ? "bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white" 
              : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-white"
          } disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
