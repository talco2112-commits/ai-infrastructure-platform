"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
interface Message { role: Role; content: string }

const suggestionsEn = [
  "What is delaying Bridge 68?",
  "Show all open RFIs related to structural",
  "Which budget sections are over plan?",
  "What activities are on the critical path?",
  "Summarize today's safety issues",
];

const suggestionsHe = [
  "מה מעכב את גשר 68?",
  "הצג את כל הבקשות מידע הפתוחות",
  "אילו מקטעי תקציב חרגו מהתוכנית?",
  "אילו פעילויות נמצאות במסלול הקריטי?",
  "סכם את בעיות הבטיחות של היום",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl rounded-bl-sm w-fit"
      style={{ background: "#F5F0EB" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "#A8A29E", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function AiPrompter({ lang = "en" }: { lang?: "en" | "he" }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const isHe       = lang === "he";
  const suggestions = isHe ? suggestionsHe : suggestionsEn;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || streaming) return;

    const userMsg: Message = { role: "user", content: q };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Add empty assistant message that we'll fill via streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `Error: ${err.error ?? "Something went wrong"}` };
          return copy;
        });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snap = accumulated;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: snap };
          return copy;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: isHe
            ? "שגיאה בחיבור. בדוק שמפתח ה-API מוגדר ב-.env.local"
            : "Connection error. Make sure ANTHROPIC_API_KEY is set in .env.local",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleClose() {
    abortRef.current?.abort();
    setOpen(false);
  }

  return (
    <>
      {/* Collapsed button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 active:scale-95 text-white pl-4 pr-5 py-3 rounded-2xl transition-all duration-200 text-[14px] font-semibold"
          style={{ background: "#8B5A2B", boxShadow: "0 4px 20px rgba(139,90,43,0.35)" }}
        >
          <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          {isHe ? "שאל InfrAI" : "Ask InfrAI"}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[440px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: "#FAF8F5", border: "1px solid #EDE8DF", boxShadow: "0 8px 40px rgba(28,25,23,0.18)" }}
          dir={isHe ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #8B5A2B, #6B3E18)" }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-white leading-tight">InfrAI Assistant</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {isHe ? "שאל כל שאלה על הפרויקט" : "Ask anything about your project"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { (e.currentTarget.style.background = "rgba(255,255,255,0.22)"); (e.currentTarget.style.color = "#fff"); }}
              onMouseLeave={(e) => { (e.currentTarget.style.background = "rgba(255,255,255,0.12)"); (e.currentTarget.style.color = "rgba(255,255,255,0.7)"); }}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[440px] px-4 py-4 space-y-3" style={{ background: "#F5F0EB" }}>
            {messages.length === 0 && !streaming && (
              <div className="space-y-3">
                {/* Greeting */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#8B5A2B" }}>
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]" style={{ background: "#FAF8F5", border: "1px solid #EDE8DF" }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#1C1917" }}>
                      {isHe
                        ? "שלום דוד! יש לי גישה לכל נתוני הפרויקט — לוח זמנים, תקציב, בקשות מידע, חוזים ועוד. מה תרצה לדעת?"
                        : "Hi David! I have full access to all project data — schedule, budget, RFIs, contracts and more. What would you like to know?"}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                <div className={cn("space-y-1.5", isHe ? "mr-8" : "ml-8")}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#A8A29E" }}>
                    {isHe ? "שאלות מוצעות" : "Suggested questions"}
                  </p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="w-full text-[12.5px] px-3.5 py-2 rounded-xl transition-colors leading-snug font-medium"
                      style={{
                        background: "#F5EBE0", color: "#6B3E18",
                        border: "1px solid #EDE0D8",
                        textAlign: isHe ? "right" : "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#EDE0D8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#F5EBE0")}
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
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#8B5A2B" }}>
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-line",
                    msg.role === "user" ? "rounded-tr-sm text-white" : "rounded-tl-sm"
                  )}
                  style={
                    msg.role === "user"
                      ? { background: "#8B5A2B" }
                      : { background: "#FAF8F5", border: "1px solid #EDE8DF", color: "#1C1917" }
                  }
                >
                  {msg.content || (streaming && i === messages.length - 1 ? "" : "—")}
                  {/* blinking cursor while streaming last assistant message */}
                  {streaming && msg.role === "assistant" && i === messages.length - 1 && (
                    <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: "#8B5A2B" }} />
                  )}
                </div>
              </div>
            ))}

            {streaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#8B5A2B" }}>
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 flex items-center gap-2.5 shrink-0" style={{ borderTop: "1px solid #EDE8DF", background: "#FAF8F5" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isHe ? "שאל על הפרויקט שלך..." : "Ask about your project..."}
              dir={isHe ? "rtl" : "ltr"}
              className="flex-1 text-[13.5px] rounded-xl px-4 py-2.5 outline-none transition-all"
              style={{
                background: "#EDE8E1", color: "#1C1917",
                border: "1.5px solid #EDE8DF",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1.5px solid #8B5A2B")}
              onBlur={(e) => (e.currentTarget.style.border = "1.5px solid #EDE8DF")}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming}
              className="w-9 h-9 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#8B5A2B" }}
              onMouseEnter={(e) => { if (input.trim() && !streaming) e.currentTarget.style.background = "#6B3E18"; }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#8B5A2B")}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
