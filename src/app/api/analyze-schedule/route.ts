import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import type { ScheduleActivity } from "@/contexts/ProjectContext";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface AnalysisRequest {
  tasks: ScheduleActivity[];
  metadata: { name?: string; start?: string; finish?: string };
  language: "en" | "he";
}

function today() { return new Date().toISOString().slice(0, 10); }
function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export async function POST(req: NextRequest) {
  try {
    const { tasks, metadata, language }: AnalysisRequest = await req.json();

    const todayStr  = today();
    const isHe      = language === "he";

    /* ── pre-compute stats so Claude has facts, not raw arrays ── */
    const criticalTasks   = tasks.filter(t => t.isCritical && !t.isMilestone);
    const overdueTasks    = tasks.filter(t => t.finish < todayStr && t.pct < 100 && !t.isMilestone);
    const nearCritical    = tasks.filter(t => !t.isCritical && t.totalSlack >= 0 && t.totalSlack <= 10 && !t.isMilestone);
    const milestones      = tasks.filter(t => t.isMilestone);
    const milestonesAtRisk = milestones.filter(t =>
      t.finish > todayStr && diffDays(todayStr, t.finish) <= 90 && t.pct < 100 &&
      // milestone is at risk if any predecessor is overdue or critical+behind
      (t.predecessors ?? []).some(predId => {
        const pred = tasks.find(p => p.uniqueId === predId);
        return pred && pred.pct < 100 && (pred.finish < todayStr || pred.isCritical);
      })
    );
    const noPreds   = tasks.filter(t => !t.isMilestone && (t.predecessors ?? []).length === 0 && t.level > 0);
    const noSuccs   = tasks.filter(t => !t.isMilestone && (t.successors  ?? []).length === 0 && t.level > 0);

    // Compact task representation to stay within token budget
    const compactTasks = tasks.map(t => ({
      id:   t.uniqueId,
      name: t.name,
      wbs:  t.wbs,
      s:    t.start,
      f:    t.finish,
      pct:  t.pct,
      dur:  t.duration,
      lvl:  t.level,
      cr:   t.isCritical,
      ms:   t.isMilestone,
      sl:   t.totalSlack,
      preds: t.predecessors,
      succs: t.successors,
      blS:  t.baselineStart,
      blF:  t.baselineFinish,
    }));

    const prompt = `You are a senior construction project manager and schedule risk analyst.
Analyze the schedule data below and produce a professional health report.

PROJECT: ${metadata.name ?? "Project"}
ANALYSIS DATE: ${todayStr}
PLANNED PERIOD: ${metadata.start ?? "?"} → ${metadata.finish ?? "?"}

KEY STATISTICS:
- Total tasks: ${tasks.length}
- Critical tasks: ${criticalTasks.length} (${Math.round(criticalTasks.length / Math.max(tasks.length, 1) * 100)}%)
- Overdue tasks (past finish, <100%): ${overdueTasks.length}
- Near-critical (slack 1–10 days): ${nearCritical.length}
- Milestones: ${milestones.length} (${milestonesAtRisk.length} at risk in next 90 days)
- Tasks with no predecessors (excluding level-0 summary): ${noPreds.length}
- Tasks with no successors (excluding level-0 summary): ${noSuccs.length}

OVERDUE TASKS:
${overdueTasks.slice(0, 20).map(t => `• ${t.name} | finish ${t.finish} | ${t.pct}% done | slack ${t.totalSlack}d`).join("\n") || "None"}

MILESTONES AT RISK:
${milestonesAtRisk.slice(0, 10).map(t => `• ${t.name} | due ${t.finish} | ${diffDays(todayStr, t.finish)}d away`).join("\n") || "None identified"}

NEAR-CRITICAL TASKS:
${nearCritical.slice(0, 15).map(t => `• ${t.name} | slack ${t.totalSlack}d | ${t.pct}%`).join("\n") || "None"}

TASKS WITHOUT PREDECESSORS (potential logic gaps):
${noPreds.slice(0, 10).map(t => `• ${t.name} (WBS ${t.wbs})`).join("\n") || "None"}

TASKS WITHOUT SUCCESSORS (potential logic gaps):
${noSuccs.slice(0, 10).map(t => `• ${t.name} (WBS ${t.wbs})`).join("\n") || "None"}

FULL TASK JSON (compact):
${JSON.stringify(compactTasks.slice(0, 300))}

---
Respond with EXACTLY these six sections in order. Use the exact emoji+header format shown.
${isHe ? "Respond entirely in Hebrew." : "Respond in English."}

## 🔴 Critical Path
List the critical path tasks in logical execution order (start to finish). For each task: name, start, finish. Note any that are overdue or at risk. End with 1-2 sentences on critical path health.

## ⚠️ Delayed Tasks
For each overdue task: name, how many days late, percent complete, and which downstream tasks are affected. If none, state so.

## 🟡 Near-Critical Tasks
Tasks with 1–10 days of float that could become critical. Name, current slack, what might push them onto the critical path.

## 🏁 Milestones at Risk
List milestones due within 90 days that are behind or have at-risk predecessors. Include the date and reason for risk.

## 🔗 Logic Issues
Flag: (a) tasks with no predecessors that should have them, (b) tasks with no successors that should have them, (c) any suspicious durations or date anomalies. Be specific — name the tasks.

## 💡 Project Manager Recommendations
Exactly 6 recommendations, ordered high→low priority. Format each as:
**[Priority]** Action to take — rationale and consequence if ignored.

Keep each section tight and professional. Use bullet points within sections.`;

    /* ── stream response ── */
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
      cancel() { stream.controller.abort(); },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
