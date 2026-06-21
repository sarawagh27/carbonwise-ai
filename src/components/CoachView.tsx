import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../AppContext";
import { 
  Send, 
  Leaf, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  Flame,
  Info
} from "lucide-react";

export default function CoachView() {
  const { profile, activities } = useApp();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: `Welcome! I am your **CarbonWise Coach**, a dedicated advisor for carbon footprint reduction and sustainable energy habits. 🌿 I can assist you with optimizing physical utility consumption, exploring plant-based alternatives, and tracking daily eco strategies.

What would you like to explore today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    {
      icon: "🚗",
      label: "Transport",
      text: "Recommend a personalized 3-step plan for my transport habits."
    },
    {
      icon: "🥩",
      label: "Food Comparison",
      text: "Compare beef carbon footprints vs chicken and vegan alternatives."
    },
    {
      icon: "⚡",
      label: "Energy Savings",
      text: "What are 3 simple household vampire energy drainers I can fix tonight?"
    },
    {
      icon: "📊",
      label: "Footprint Review",
      text: "Review my recent carbon balance score and suggest improvements."
    }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage = { role: "user", content: textToSend };
    setMessages((p) => [...p, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userProfile: profile,
          recentActivities: activities
        })
      });

      if (!response.ok) {
        throw new Error("Coach connection timed out");
      }

      const data = await response.json();
      setMessages((p) => [...p, { role: "assistant", content: data.reply || "Your advisor is currently offline. Please try sending another query shortly." }]);
    } catch {
      // Local safety model fallback
      setMessages((p) => [...p, {
        role: "assistant",
        content: `The connection experienced a brief interruption. 

        **Quick tip:** Based on standard guidelines, substituting beef with chicken or lentils shaves off roughly **80% of dietary carbon footprint intensity**! 
        Try logging a vegan or vegetarian recipe in the AI Tracker.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const parseMessageContent = (content: string) => {
    // Elegant basic renderer for bold markers and bullet items
    return content.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return <h5 key={idx} className="font-bold text-gray-900 text-sm mt-3 mb-1">{trimmed.replace("###", "")}</h5>;
      }
      if (trimmed.startsWith("##")) {
        return <h4 key={idx} className="font-extrabold text-gray-900 text-base mt-4 mb-2">{trimmed.replace("##", "")}</h4>;
      }

      // Check for bullet list
      const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*");
      if (isBullet) {
        trimmed = trimmed.replace(/^[-*]\s*/, "");
      }

      // Basic replacement for bold formatting markdown e.g. **text**
      const parts = trimmed.split(/\*\*([^*]+)\*\*/g);
      const parsedLine = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-extrabold text-emerald-950">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="list-disc ml-5 text-gray-700 text-xs leading-relaxed mt-1">
            {parsedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-gray-700 text-xs leading-relaxed mt-1.5">
          {parsedLine}
        </p>
      );
    });
  };

  const hasChatted = messages.length > 1;

  return (
    <div className={`space-y-4 max-w-4xl mx-auto flex flex-col transition-all duration-300 ${
      hasChatted 
        ? "h-[calc(100vh-140px)] md:h-[calc(100vh-80px)]" 
        : "h-auto"
    }`}>
      
      {/* Upper context overview */}
      <div className="flex-none flex items-center justify-between border-b border-emerald-50/50 pb-2.5">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Sustainability Coach</h2>
          <p className="text-sm text-gray-500 font-medium">Get customized carbon reduction advice and data-backed sustainability strategies.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100/40">
          <Sparkles size={14} className="text-emerald-600" />
          <span>Eco Rank: {profile?.level}</span>
        </div>
      </div>

      {/* Main scrolling chat panel */}
      <div className={`
        bg-white rounded-3xl border border-emerald-100/40 shadow-[0_4px_25px_rgba(16,185,129,0.015)] p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative transition-all duration-300
        ${hasChatted ? "flex-1" : "h-auto space-y-4"}
      `}>
        
        {!hasChatted ? (
          /* COMPACT WELCOME CARD & PROMPTS BEFORE SENDING THE FIRST MESSAGE */
          <div className="space-y-3">
            
            {/* Elegant Welcome Card */}
            <div className="bg-emerald-50/15 border border-emerald-100/20 p-4 rounded-xl flex gap-3 items-start text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                <Leaf size={14} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-stone-900 text-xs">Welcome to CarbonWise Coach 🌿</h4>
                <div className="text-stone-600 leading-relaxed text-xs">
                  {parseMessageContent(messages[0].content)}
                </div>
              </div>
            </div>

            {/* Suggested Eco Topics directly below the welcome card */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider pl-1 font-mono">Suggested Eco Topics:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {starterPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.text)}
                    className="text-left text-xs bg-stone-50/40 hover:bg-emerald-50/20 border border-stone-200/40 hover:border-emerald-200 p-2.5 rounded-xl text-stone-700 hover:text-emerald-800 transition-all duration-200 cursor-pointer flex gap-2.5 items-start shadow-3xs"
                  >
                    <span className="text-sm shrink-0 select-none mt-0.5">{p.icon}</span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-750 tracking-wider uppercase font-mono block leading-none">
                        {p.label}
                      </span>
                      <p className="text-stone-600 font-semibold text-[11px] leading-snug">
                        {p.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* ACTIVE SCROLLABLE CHATFLOW */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            
            {messages.map((m, index) => {
              const isAI = m.role === "assistant";
              return (
                <div key={index} className={`flex ${isAI ? "justify-start" : "justify-end"} animate-fade-in`}>
                  <div className={`
                    flex gap-3 max-w-[85%]
                    ${isAI ? "flex-row" : "flex-row-reverse"}
                  `}>
                    {/* Icon */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold border
                      ${isAI ? "bg-emerald-500 text-white border-emerald-400" : "bg-neutral-100 text-gray-600 border-gray-200"}
                    `}>
                      {isAI ? <Leaf size={14} /> : profile?.name[0]?.toUpperCase() || "U"}
                    </div>

                    {/* Bubble Container */}
                    <div className={`
                      p-4 rounded-3xl text-sm
                      ${isAI 
                        ? "bg-neutral-50/70 border border-emerald-50/50 text-gray-800 rounded-tl-xs" 
                        : "bg-emerald-600 text-white rounded-tr-xs shadow-md shadow-emerald-600/10"}
                    `}>
                      {isAI ? (
                        <div className="space-y-1">
                          {parseMessageContent(m.content)}
                        </div>
                      ) : (
                        <p className="leading-relaxed text-xs">{m.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white border border-emerald-400 font-bold justify-self-center">
                  <Leaf size={14} className="animate-spin" />
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-emerald-50 text-xs text-gray-400 italic">
                  CarbonWise Coach is analyzing...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {/* PROMPT PANEL INPUT BOX */}
        <div className="flex-none border-t border-emerald-50 pt-4 flex gap-2">
          <input
            type="text"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(input);
            }}
            placeholder="Ask anything about carbon footprints, energy conservation, sustainable diets..."
            className="flex-1 px-4 py-3.5 border border-emerald-100/50 outline-none focus:border-emerald-500 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 transition-all bg-stone-50/30"
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => handleSendMessage(input)}
            className="bg-emerald-600 text-white px-4.5 rounded-xl hover:bg-emerald-700 transition-all duration-150 disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-3xs"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

    </div>
  );
}
