"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles, AlertTriangle, CheckCircle2, RefreshCw,
  AlertOctagon, Flag, Link2, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";
import type { ScheduleActivity } from "@/contexts/ProjectContext";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperBg: "#FDF8F4",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  warn: "#B45309",   warnBg: "#FFFBEB",
  good: "#15803D",   goodBg: "#F0FDF4",
  info: "#1D4ED8",   infoBg: "#EFF6FF",
  purple: "#6D28D9", purpleBg: "#F5F3FF",
};

/* ── section definitions ─────────────────────────────────────────────── */

const SECTIONS = [
  { key: "critical",        emoji: "🔴", color: P.danger,  bg: P.dangerBg,  border: "#FECACA", Icon: AlertOctagon },
  { key: "delayed",         emoji: "⚠️", color: P.warn,    bg: P.warnBg,    border: "#FDE68A", Icon: AlertTriangle },
  { key: "near-critical",   emoji: "🟡", color: "#92400E", bg: "#FFFDE7",   border: "#FEF08A", Icon: AlertTriangle },
  { key: "milestones",      emoji: "🏁", color: P.purple,  bg: P.purpleBg,  border: "#DDD6FE", Icon: Flag },
  { key: "logic",           emoji: "🔗", color: P.info,    bg: P.infoBg,    border: "#BFDBFE", Icon: Link2 },
  { key: "recommendations", emoji: "💡", color: P.copper,  bg: P.copperBg,  border: "#E8D5BF", Icon: Lightbulb },
] as const;

const SECTION_HEADERS_EN: Record<string, string> = {
  critical:        "Critical Path",
  delayed:         "Delayed Tasks",
  "near-critical": "Near-Critical Tasks",
  milestones:      "Milestones at Risk",
  logic:           "Logic Issues",
  recommendations: "Project Manager Recommendations",
};
const SECTION_HEADERS_HE: Record<string, string> = {
  critical:        "נתיב קריטי",
  delayed:         "פעילויות מאחרות",
  "near-critical": "פעילויות קרובות-קריטיות",
  milestones:      "אבני דרך בסיכון",
  logic:           "בעיות לוגיקה",
  recommendations: "המלצות למנהל הפרויקט",
};

/* ── markdown → simple rich text ─────────────────────────────────────── */

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="flex gap-2 mb-1">
          <span style={{ color: P.copper, flexShrink: 0, marginTop: 2 }}>•</span>
          <span>{parts.slice(1)}</span>
        </li>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="mb-1">{parts}</p>;
  });
}

/* ── collapsible section card ─────────────────────────────────────────── */

function SectionCard({
  sectionKey, content, isStreaming, isHe,
}: {
  sectionKey: typeof SECTIONS[number]["key"];
  content: string;
  isStreaming: boolean;
  isHe: boolean;
}) {
  const [open, setOpen] = useState(true);
  const def = SECTIONS.find(s => s.key === sectionKey)!;
  const label = isHe ? SECTION_HEADERS_HE[sectionKey] : SECTION_HEADERS_EN[sectionKey];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${def.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 transition-colors text-start"
        style={{ background: def.bg }}
      >
        <def.Icon className="w-4 h-4 shrink-0" style={{ color: def.color }} />
        <span className="text-[14px] font-bold flex-1" style={{ color: def.color }}>
          {def.emoji} {label}
        </span>
        {isStreaming && content.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: def.color + "20", color: def.color }}>
            {isHe ? "מנתח…" : "analyzing…"}
          </span>
        )}
        {open
          ? <ChevronUp className="w-4 h-4" style={{ color: def.color }} />
          : <ChevronDown className="w-4 h-4" style={{ color: def.color }} />
        }
      </button>
      {open && content && (
        <div className="px-5 py-4 text-[13px] leading-relaxed" style={{ background: P.card, color: P.text1 }}>
          <ul className="space-y-0.5">{renderMarkdown(content)}</ul>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 animate-pulse rounded-sm" style={{ background: def.color }} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */

interface Props {
  activities: ScheduleActivity[];
  projectName: string;
  projectStart?: string;
  projectFinish?: string;
  isHe: boolean;
}

type SectionKey = typeof SECTIONS[number]["key"];

function parseSections(text: string): Record<SectionKey, string> {
  const result = {} as Record<SectionKey, string>;
  const sectionMap: Record<string, SectionKey> = {
    "critical path":                   "critical",
    "delayed tasks":                   "delayed",
    "near-critical tasks":             "near-critical",
    "near critical tasks":             "near-critical",
    "milestones at risk":              "milestones",
    "logic issues":                    "logic",
    "project manager recommendations": "recommendations",
    // Hebrew section titles
    "נתיב קריטי":                    "critical",
    "פעילויות מאחרות":               "delayed",
    "פעילויות קרובות-קריטיות":       "near-critical",
    "פעילויות קרובות קריטיות":       "near-critical",
    "אבני דרך בסיכון":               "milestones",
    "בעיות לוגיקה":                  "logic",
    "המלצות למנהל הפרויקט":         "recommendations",
    "המלצות":                         "recommendations",
  };

  // Split on ## headers
  const chunks = text.split(/^##\s*/m).filter(Boolean);
  for (const chunk of chunks) {
    const nl = chunk.indexOf("\n");
    const header = (nl === -1 ? chunk : chunk.slice(0, nl)).toLowerCase().replace(/[🔴⚠️🟡🏁🔗💡\s]+$/g, "").trim();
    const body   = (nl === -1 ? "" : chunk.slice(nl + 1)).trim();
    const key    = sectionMap[header];
    if (key) result[key] = body;
  }
  return result;
}

export function ScheduleAnalysis({ activities, projectName, projectStart, projectFinish, isHe }: Props) {
  const [status,   setStatus]   = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [rawText,  setRawText]  = useState("");
  const [errMsg,   setErrMsg]   = useState("");
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const analyze = useCallback(async () => {
    if (status === "loading" || status === "streaming") {
      readerRef.current?.cancel();
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setRawText("");
    setErrMsg("");

    try {
      const res = await fetch("/api/analyze-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: activities,
          metadata: { name: projectName, start: projectStart, finish: projectFinish },
          language: isHe ? "he" : "en",
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      setStatus("streaming");
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRawText(accumulated);
      }

      setRawText(accumulated);
      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") { setStatus("idle"); return; }
      setErrMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [activities, projectName, projectStart, projectFinish, isHe, status]);

  const sections = parseSections(rawText);
  const isStreaming = status === "streaming";
  const hasResults  = rawText.length > 0;

  /* ── idle / no-results state ── */
  if (!hasResults && status !== "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background: P.copperBg, border: `1px solid ${P.border}` }}>
            <Sparkles className="w-10 h-10" style={{ color: P.copper }} />
          </div>
          <div>
            <h2 className="text-[22px] font-bold mb-2" style={{ color: P.text1 }}>
              {isHe ? "ניתוח לוח זמנים בינה מלאכותית" : "AI Schedule Analysis"}
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: P.text2 }}>
              {isHe
                ? `ניתוח עמוק של ${activities.length} הפעילויות בפרויקט: נתיב קריטי, עיכובים, אבני דרך בסיכון, בעיות לוגיקה והמלצות מקצועיות.`
                : `Deep analysis of ${activities.length} tasks: critical path, delays, at-risk milestones, logic gaps, and actionable PM recommendations.`}
            </p>
          </div>
          <button onClick={analyze}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl text-[14px] font-bold transition-all"
            style={{ background: P.copper, color: "#fff" }}>
            <Sparkles className="w-4 h-4" />
            {isHe ? "הפעל ניתוח" : "Run Analysis"}
          </button>
          {status === "error" && (
            <div className="rounded-2xl p-4 text-start" style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
              <p className="text-[13px] font-bold mb-1" style={{ color: P.danger }}>
                {isHe ? "שגיאה" : "Error"}
              </p>
              <p className="text-[12px]" style={{ color: P.danger }}>{errMsg}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── loading spinner ── */
  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto animate-pulse"
            style={{ background: P.copperBg }}>
            <Sparkles className="w-8 h-8" style={{ color: P.copper }} />
          </div>
          <p className="text-[15px] font-bold" style={{ color: P.text1 }}>
            {isHe ? "מנתח את לוח הזמנים…" : "Analyzing schedule…"}
          </p>
          <p className="text-[12px]" style={{ color: P.text3 }}>
            {isHe ? "בודק נתיב קריטי, עיכובים ובעיות לוגיקה" : "Checking critical path, delays and logic"}
          </p>
        </div>
      </div>
    );
  }

  /* ── results ── */
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: P.bg }}>
      {/* header bar */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: P.copperBg }}>
          <Sparkles className="w-5 h-5" style={{ color: P.copper }} />
        </div>
        <div className="flex-1">
          <h2 className="text-[15px] font-bold" style={{ color: P.text1 }}>
            {isHe ? "ניתוח בינה מלאכותית" : "AI Schedule Analysis"}
          </h2>
          <p className="text-[12px]" style={{ color: P.text3 }}>
            {projectName} · {activities.length} {isHe ? "פעילויות" : "tasks"}
          </p>
        </div>
        <div className="flex gap-2">
          {status === "done" && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: P.goodBg, color: P.good }}>
              <CheckCircle2 className="w-3 h-3" />
              {isHe ? "הושלם" : "Complete"}
            </span>
          )}
          <button onClick={analyze}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
            <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? "animate-spin" : ""}`} />
            {isStreaming
              ? (isHe ? "עצור" : "Stop")
              : (isHe ? "נתח מחדש" : "Re-analyze")}
          </button>
        </div>
      </div>

      {/* section cards */}
      <div className="px-6 py-5 space-y-4 max-w-4xl mx-auto pb-16">
        {SECTIONS.map(({ key }) => {
          const content = sections[key] ?? "";
          // Show card if: has content, or we're streaming and haven't reached this section yet
          const shouldShow = content.length > 0 || (isStreaming && key === "critical" && rawText.length < 50);
          if (!shouldShow) return null;
          return (
            <SectionCard
              key={key}
              sectionKey={key}
              content={content}
              isStreaming={isStreaming && !sections[key + "_done" as SectionKey]}
              isHe={isHe}
            />
          );
        })}

        {/* streaming: show raw if no sections parsed yet */}
        {isStreaming && Object.keys(sections).length === 0 && rawText && (
          <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
            <p className="text-[13px] whitespace-pre-wrap" style={{ color: P.text1 }}>{rawText}</p>
            <span className="inline-block w-1.5 h-4 ml-1 animate-pulse rounded-sm" style={{ background: P.copper }} />
          </div>
        )}

        {status === "done" && Object.keys(sections).length === 0 && rawText && (
          <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
            <p className="text-[13px] whitespace-pre-wrap" style={{ color: P.text1 }}>{rawText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
