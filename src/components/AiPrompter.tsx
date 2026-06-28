"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Zap, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "user" | "ai";
interface Message { role: Role; content: string }

const suggestions = [
  "What is delaying Bridge 68?",
  "Show all open RFIs related to electricity",
  "Which quantities exceed the contract?",
  "What activities are on the critical path?",
  "Estimate delay if utility relocation slips 2 weeks",
];

const demoAnswers: Record<string, string> = {
  "What is delaying Bridge 68?":
    "Bridge 68 is currently 14 days behind schedule. The root cause is utility relocation in Zone D — currently at 23% vs. the planned 37%. Contributing factors include:\n\n• RFI-042 (electrical conduit routing) has been open for 8 days with no client response\n• Concrete delivery delay flagged by supplier on June 24\n• 2 structural drawings still at Rev.B pending design team approval\n\nAI recommendation: Escalate RFI-042 today. Moving pile foundation work earlier in the sequence could recover 8 days on the critical path.",
  "What activities are on the critical path?":
    "Based on the current schedule, the critical path runs through:\n\n1. Utility relocation – Zone D (bottleneck, 14d behind)\n2. Pile foundations – Bridge 68 approach\n3. Bridge deck formwork\n4. Concrete pour – deck slab\n5. Road base layer – Section B connection\n\nAny further delay to utility relocation directly extends project completion. The critical path has shifted twice this month due to the supplier delivery issue.",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 rounded-xl rounded-bl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function AiPrompter() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || thinking) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const answer =
        demoAnswers[q] ??
        "I'm analyzing your project documents and schedule data. Connect the AI backend to get real-time answers about your project.";
      setMessages((prev) => [...prev, { role: "ai", content: answer }]);
      setThinking(false);
    }, 1200);
  }

  return (
    <>
      {/* Collapsed button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 active:scale-95 text-white pl-4 pr-5 py-3 rounded-2xl transition-all duration-200 text-[14px] font-semibold"
        style={{ background: "#D4714A", boxShadow: "0 4px 20px rgba(212,113,74,0.35)" }}
        >
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          Ask InfrAI
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ background: "linear-gradient(135deg, #D4714A, #B05E38)" }}>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-white leading-tight">InfrAI Assistant</p>
              <p className="text-[11px] text-blue-200 mt-0.5">Ask anything about your project documents</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] px-4 py-4 space-y-3 bg-slate-50/50">
            {messages.length === 0 && !thinking && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#D4714A] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-slate-100 max-w-[85%]">
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      Hi David! I have access to all your project documents, schedule, contracts, and RFIs. What would you like to know?
                    </p>
                  </div>
                </div>
                <div className="ml-8 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Suggested questions
                  </p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="w-full text-left text-[12.5px] px-3.5 py-2 rounded-xl transition-colors leading-snug font-medium"
                      style={{ background: "#F5EDE8", color: "#B05E38", border: "1px solid #EDE0D8" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex items-start gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-[#D4714A] flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-line shadow-sm",
                    msg.role === "user"
                      ? "text-white rounded-tr-sm"
                      : "text-stone-800 rounded-tl-sm border border-stone-100 bg-stone-50"
                  )}
                  style={msg.role === "user" ? { background: "#D4714A" } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#D4714A] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-4 py-3 flex items-center gap-2.5 bg-white shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your project..."
              className="flex-1 text-[13.5px] bg-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || thinking}
              className="w-9 h-9 bg-[#D4714A] hover:bg-[#B05E38] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
