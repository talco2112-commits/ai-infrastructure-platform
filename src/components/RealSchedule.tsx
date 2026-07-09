"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CalendarDays, AlertTriangle,
  Search, FileSpreadsheet, RefreshCw, Lightbulb,
  LayoutList, GanttChartSquare, Sparkles,
  Route, Milestone as MilestoneIcon, TrendingUp, AlertOctagon,
  CheckCircle2, Circle,
} from "lucide-react";
import { GanttChart } from "@/components/GanttChart";
import { ScheduleAnalysis } from "@/components/ScheduleAnalysis";
import { useProjects, type ScheduleActivity, type Project } from "@/contexts/ProjectContext";
import { DEMO_SCHEDULE_ACTIVITIES, DEMO_SCHEDULE_FILE_NAME, TOTAL_CHAINAGE, ZONE_BOUNDS } from "@/data/demoSchedule";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

/* ── Upload file to the API and get back parsed activities ── */

export interface ParseResult {
  activities: ScheduleActivity[];
  fileName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(t: any): ScheduleActivity {
  return {
    id:             String(t.uniqueId ?? t.id),
    uniqueId:       Number(t.uniqueId ?? t.id ?? 0),
    name:           t.name,
    start:          t.start,
    finish:         t.finish,
    duration:       t.duration ?? 0,
    pct:            t.percentComplete ?? t.pct ?? 0,
    isMilestone:    t.isMilestone ?? false,
    isCritical:     t.isCritical ?? false,
    level:          Math.max(0, (t.outlineLevel ?? t.level ?? 1) - 1),
    wbs:            t.wbs ?? null,
    baselineStart:  t.baselineStart ?? null,
    baselineFinish: t.baselineFinish ?? null,
    predecessors:   t.predecessors ?? [],
    successors:     t.successors ?? [],
    totalSlack:     t.totalSlack ?? 0,
    freeSlack:      t.freeSlack ?? 0,
  };
}

export async function parseScheduleFile(file: File): Promise<ParseResult> {
  const form = new FormData();
  form.append("file", file);

  const res  = await fetch("/api/parse-schedule", { method: "POST", body: form });
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Server error ${res.status}`);
  }

  // New backend returns { tasks, metadata, fileName }
  const raw = json.tasks ?? json.activities ?? [];
  return { activities: raw.map(mapTask), fileName: json.fileName };
}

/* ── Status helpers ── */

function actStatus(a: ScheduleActivity, today: string): "done" | "overdue" | "active" | "future" {
  if (a.pct === 100) return "done";
  if (a.finish < today && a.pct < 100) return "overdue";
  if (a.start <= today) return "active";
  return "future";
}

const STATUS_LABEL: Record<string,{en:string;he:string;bg:string;color:string}> = {
  done:    { en:"Complete",    he:"הושלם",   bg: P.goodBg,   color: P.good   },
  overdue: { en:"Overdue",     he:"באיחור",  bg: P.dangerBg, color: P.danger },
  active:  { en:"In Progress", he:"בביצוע",  bg: P.warnBg,   color: P.warn   },
  future:  { en:"Not Started", he:"טרם החל", bg: "#F5F5F4",  color: P.text3  },
};

function fmtDate(s: string, isHe: boolean) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString(isHe ? "he-IL" : "en-GB", { day:"numeric", month:"short", year:"numeric" });
}

function fmtChainage(m: number) {
  return `${Math.floor(m / 1000)}+${String(Math.round(m % 1000)).padStart(3, "0")}`;
}

function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function addMonths(s: string, n: number) {
  const d = new Date(s + "T00:00:00");
  // day 0 of (month + n + 1) = last day of (month + n)
  return new Date(d.getFullYear(), d.getMonth() + n + 1, 0).toISOString().slice(0, 10);
}
function monthLabel(s: string, isHe: boolean) {
  return new Date(s).toLocaleDateString(isHe ? "he-IL" : "en-GB", { month: "short" });
}

/* ── S-Curve — derived from real activity dates/duration/pct ── */

function buildSCurve(activities: ScheduleActivity[], todayStr: string) {
  const leaves = activities.filter(a => !a.isMilestone && a.duration > 0);
  if (leaves.length === 0) return null;

  const totalDur = leaves.reduce((s, a) => s + a.duration, 0) || 1;
  const minStart = leaves.reduce((m, a) => (a.start < m ? a.start : m), leaves[0].start);
  const maxFinish = leaves.reduce((m, a) => (a.finish > m ? a.finish : m), leaves[0].finish);

  const monthPoints: string[] = [];
  let cursor = minStart;
  while (cursor < maxFinish) {
    monthPoints.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  monthPoints.push(maxFinish);

  const planned = monthPoints.map((point) => {
    let done = 0;
    for (const a of leaves) {
      if (point >= a.finish) done += a.duration;
      else if (point > a.start) {
        const span = diffDays(a.start, a.finish) || 1;
        done += a.duration * Math.min(1, diffDays(a.start, point) / span);
      }
    }
    return (done / totalDur) * 100;
  });

  const actualToday = leaves.reduce((s, a) => s + a.duration * (a.pct / 100), 0) / totalDur * 100;

  // interpolate the planned curve at "today" to derive a planned-vs-actual ratio,
  // since we only have a single actual snapshot (current pct), not a full history.
  let plannedAtToday = planned[planned.length - 1];
  for (let i = 0; i < monthPoints.length - 1; i++) {
    if (todayStr >= monthPoints[i] && todayStr <= monthPoints[i + 1]) {
      const span = diffDays(monthPoints[i], monthPoints[i + 1]) || 1;
      const frac = diffDays(monthPoints[i], todayStr) / span;
      plannedAtToday = planned[i] + (planned[i + 1] - planned[i]) * frac;
      break;
    }
  }
  const ratio = plannedAtToday > 0 ? actualToday / plannedAtToday : 1;

  const actual = monthPoints
    .filter(p => p <= todayStr)
    .map((_, i) => Math.max(0, Math.min(100, planned[i] * ratio)));

  const todayFrac = Math.max(0, Math.min(1, diffDays(minStart, todayStr) / (diffDays(minStart, maxFinish) || 1)));

  return { monthPoints, planned, actual, todayFrac, actualToday: Math.round(actualToday), plannedAtToday: Math.round(plannedAtToday) };
}

/* ── Drop zone ── */

function DropZone({ onFile, isHe }: { onFile: (f: File) => void; isHe: boolean }) {
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <label
      className="flex flex-col items-center justify-center gap-4 rounded-3xl cursor-pointer transition-all"
      style={{
        border: `2px dashed ${drag ? P.copper : P.border}`,
        background: drag ? P.copperLight : P.bg,
        padding: "64px 40px", minHeight: "280px",
      }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}>
      <input type="file" className="hidden"
        accept=".mpp,.mpt,.xlsx,.xls,.csv,.xer,.xml"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}/>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: P.warnBg }}>
        <CalendarDays className="w-8 h-8" style={{ color: P.warn }}/>
      </div>
      <div className="text-center">
        <p className="text-[17px] font-bold mb-1" style={{ color: P.text1 }}>
          {isHe ? "גרור קובץ לוח זמנים לכאן" : "Drop your schedule file here"}
        </p>
        <p className="text-[13px]" style={{ color: P.text3 }}>
          {isHe ? "MS Project · Excel · CSV · Primavera P6 XER" : "MS Project .mpp · Excel · CSV · Primavera P6 XER"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {[".mpp",".xlsx",".xls",".csv",".xer",".xml"].map(ext => (
          <span key={ext} className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
            style={{ background: P.card, border: `1px solid ${P.border}`, color: ext === ".mpp" ? P.copper : P.text3 }}>
            {ext}
          </span>
        ))}
      </div>
    </label>
  );
}

/* ── Milestones panel ── */

function MilestonesPanel({ activities, isHe, today }: { activities: ScheduleActivity[]; isHe: boolean; today: string }) {
  const milestones = activities.filter(a => a.isMilestone).sort((a, b) => a.finish.localeCompare(b.finish));
  return (
    <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
      <h3 className="text-[14px] font-bold mb-4" style={{ color: P.text1 }}>{isHe ? "אבני דרך של הפרויקט" : "Project Milestones"}</h3>
      {milestones.length === 0 ? (
        <p className="text-[13px] text-center py-10" style={{ color: P.text3 }}>{isHe ? "לא נמצאו אבני דרך בלוח הזמנים" : "No milestones found in this schedule"}</p>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => {
            const achieved = m.finish <= today;
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                {achieved
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: P.good }} />
                  : <Circle className="w-4 h-4 shrink-0" style={{ color: P.text3 }} />}
                <span className="flex-1 text-[13px] font-semibold" style={{ color: P.text1 }}>{m.name}</span>
                <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: achieved ? P.goodBg : P.copperLight, color: achieved ? P.good : P.copper }}>
                  {achieved ? (isHe ? "הושג" : "Achieved") : (isHe ? "צפוי" : "Upcoming")}
                </span>
                <span className="text-[12px] font-medium" style={{ color: P.text3 }}>{fmtDate(m.finish, isHe)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Critical Path panel ── */

function CriticalPathPanel({ activities, isHe, today }: { activities: ScheduleActivity[]; isHe: boolean; today: string }) {
  const critical = activities.filter(a => a.isCritical && !a.isMilestone).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{isHe ? "פעילויות נתיב קריטי" : "Critical Path Activities"}</h3>
      </div>
      {critical.length === 0 ? (
        <p className="text-[13px] text-center py-10" style={{ color: P.text3 }}>{isHe ? "לא סומנו פעילויות קריטיות" : "No activities flagged as critical"}</p>
      ) : (
        <table className="w-full text-[12.5px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              {[isHe ? "WBS / פעילות" : "WBS / Activity", isHe ? "פלואט" : "Float", isHe ? "איחור" : "Delay"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {critical.map(a => {
              const delayDays = a.finish < today && a.pct < 100 ? diffDays(a.finish, today) : 0;
              return (
                <tr key={a.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: P.danger }}>
                    {a.wbs && <span className="font-mono text-[11px] me-2" style={{ color: P.text3 }}>{a.wbs}</span>}
                    {a.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold" style={{ color: a.totalSlack < 0 ? P.danger : P.text2 }}>
                    {a.totalSlack !== 0 ? `${a.totalSlack > 0 ? "+" : ""}${a.totalSlack}d` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {delayDays > 0
                      ? <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: P.dangerBg, color: P.danger }}>+{delayDays}d</span>
                      : <span style={{ color: P.text3 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ── S-Curve panel ── */

function SCurvePanel({ activities, isHe, today }: { activities: ScheduleActivity[]; isHe: boolean; today: string }) {
  const curve = useMemo(() => buildSCurve(activities, today), [activities, today]);
  if (!curve) {
    return (
      <div className="rounded-2xl p-10 text-center text-[13px]" style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text3 }}>
        {isHe ? "אין מספיק נתונים לחישוב עקום S" : "Not enough data to compute an S-Curve"}
      </div>
    );
  }
  const { monthPoints, planned, actual, todayFrac } = curve;
  return (
    <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{isHe ? "התקדמות מצטברת — מתוכנן מול בפועל" : "Cumulative Progress — Planned vs Actual"}</h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: P.border }} />{isHe ? "מתוכנן" : "Planned"}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: P.copper }} />{isHe ? "בפועל" : "Actual"}</span>
        </div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 220 }}>
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1={0} x2={100} y1={100 - y} y2={100 - y} stroke={P.border} strokeWidth={0.3} />
        ))}
        <polyline
          points={planned.map((v, i) => `${(i / (planned.length - 1)) * 100},${100 - v}`).join(" ")}
          fill="none" stroke={P.border} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <polyline
          points={actual.map((v, i) => `${(i / (planned.length - 1)) * 100},${100 - v}`).join(" ")}
          fill="none" stroke={P.copper} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
        <line x1={todayFrac * 100} x2={todayFrac * 100} y1={0} y2={100} stroke={P.copper} strokeWidth={0.4} strokeDasharray="2,2" opacity={0.6} />
      </svg>
      <div className="flex mt-1">
        {monthPoints.map((m, i) => (
          <div key={i} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: P.text3 }}>{monthLabel(m, isHe)}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Time-Location (TILOS) panel ── */

function TimeLocationPanel({ activities, isHe }: { activities: ScheduleActivity[]; isHe: boolean }) {
  const CHART_H = 380;
  const withChainage = activities.filter(a => a.chainageStart != null && a.chainageEnd != null && !a.isMilestone);
  const hasChainage = withChainage.length > 0;

  // Fallback for real uploaded schedules with no chainage: swimlane by top-level WBS group.
  const wbsGroups = useMemo(() => {
    if (hasChainage) return [];
    const groups = new Map<string, string>(); // top wbs -> name of the level-0 activity
    for (const a of activities) {
      if (a.isMilestone) continue;
      const top = (a.wbs ?? "").split(".")[0] || "0";
      if (!groups.has(top)) groups.set(top, a.level === 0 ? a.name : top);
    }
    return Array.from(groups.entries());
  }, [activities, hasChainage]);

  const plotted = hasChainage ? withChainage : activities.filter(a => !a.isMilestone && a.wbs);
  const groupIndex = new Map(wbsGroups.map(([wbs], i) => [wbs, i]));
  const bandCount = hasChainage ? 0 : Math.max(wbsGroups.length, 1);

  function yFor(a: ScheduleActivity): [number, number] {
    if (hasChainage) {
      return [(a.chainageStart! / TOTAL_CHAINAGE) * 100, (a.chainageEnd! / TOTAL_CHAINAGE) * 100];
    }
    const top = (a.wbs ?? "").split(".")[0] || "0";
    const idx = groupIndex.get(top) ?? 0;
    const bandH = 100 / bandCount;
    return [idx * bandH + bandH * 0.15, idx * bandH + bandH * 0.85];
  }

  if (plotted.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center text-[13px]" style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text3 }}>
        {isHe ? "אין נתונים מתאימים לתרשים מיקום-זמן" : "No data suitable for a Time-Location diagram"}
      </div>
    );
  }

  const minStart = plotted.reduce((m, a) => (a.start < m ? a.start : m), plotted[0].start);
  const maxFinish = plotted.reduce((m, a) => (a.finish > m ? a.finish : m), plotted[0].finish);
  const totalSpan = diffDays(minStart, maxFinish) || 1;
  const today = new Date().toISOString().slice(0, 10);
  const todayFrac = Math.max(0, Math.min(1, diffDays(minStart, today) / totalSpan));

  const months: string[] = [];
  let cursor = minStart;
  while (cursor < maxFinish) { months.push(cursor); cursor = addMonths(cursor, 1); }
  months.push(maxFinish);

  function xFor(dateStr: string) {
    return (diffDays(minStart, dateStr) / totalSpan) * 100;
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>
          {isHe ? "תרשים מיקום-זמן — התקדמות מול קילומטראז'" : "Time-Location Diagram — Progress vs Chainage"}
        </h3>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: P.text2 }}>
          <span className="flex items-center gap-1.5">
            <svg width="16" height="8"><line x1="1" y1="7" x2="15" y2="1" stroke={P.copper} strokeWidth="1.6" /></svg>
            {isHe ? "התקדמות רציפה" : "Linear progression"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: P.copper, opacity: 0.5 }} />
            {isHe ? "מיקום קבוע" : "Fixed location"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: P.danger }} />
            {isHe ? "קריטי" : "Critical"}
          </span>
        </div>
      </div>

      {!hasChainage && (
        <p className="text-[11.5px] mb-3" style={{ color: P.text3 }}>
          {isHe
            ? "אין נתוני קילומטראז' בקובץ שהועלה — התצוגה מקובצת לפי מבנה WBS."
            : "No chainage data in the uploaded file — grouped by WBS structure instead."}
        </p>
      )}

      <div className="flex gap-2">
        <div className="relative shrink-0" style={{ width: 60, height: CHART_H }}>
          {hasChainage
            ? [0, ...ZONE_BOUNDS.map(z => z.end)].map(c => (
                <div key={c} className="absolute text-[10px] font-mono font-semibold whitespace-nowrap"
                  style={{ top: `${(c / TOTAL_CHAINAGE) * 100}%`, transform: "translateY(-50%)", color: P.text3 }}>
                  {fmtChainage(c)}
                </div>
              ))
            : wbsGroups.map(([wbs], i) => (
                <div key={wbs} className="absolute text-[10px] font-semibold truncate"
                  style={{ top: `${((i + 0.5) / bandCount) * 100}%`, transform: "translateY(-50%)", color: P.text3, width: 56 }}>
                  {wbs}
                </div>
              ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: CHART_H }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
              {hasChainage && ZONE_BOUNDS.map((z, i) => (
                <rect key={z.zone} x={0} y={(z.start / TOTAL_CHAINAGE) * 100} width={100}
                  height={((z.end - z.start) / TOTAL_CHAINAGE) * 100}
                  fill={i % 2 === 0 ? P.bg : "transparent"} opacity={0.5} />
              ))}
              {hasChainage && ZONE_BOUNDS.map(z => (
                <line key={z.zone} x1={0} x2={100} y1={(z.end / TOTAL_CHAINAGE) * 100} y2={(z.end / TOTAL_CHAINAGE) * 100}
                  stroke={P.border} strokeWidth={0.3} />
              ))}
              {!hasChainage && wbsGroups.map(([wbs], i) => (
                <rect key={wbs} x={0} y={(i / bandCount) * 100} width={100} height={(1 / bandCount) * 100}
                  fill={i % 2 === 0 ? P.bg : "transparent"} opacity={0.5} />
              ))}

              <line x1={todayFrac * 100} x2={todayFrac * 100} y1={0} y2={100}
                stroke={P.copper} strokeWidth={0.4} strokeDasharray="1.5,1.5" opacity={0.6} />

              {plotted.map(a => {
                const x1 = xFor(a.start);
                const x2 = xFor(a.finish);
                const [y1, y2] = yFor(a);
                const color = a.isCritical ? P.danger : P.copper;
                const progFrac = a.pct / 100;
                const linear = hasChainage ? a.linear : false;
                const tooltip = hasChainage
                  ? `${a.name} (${fmtChainage(a.chainageStart!)}–${fmtChainage(a.chainageEnd!)})`
                  : a.name;

                if (linear) {
                  const xp = x1 + (x2 - x1) * progFrac;
                  const yp = y1 + (y2 - y1) * progFrac;
                  return (
                    <g key={a.id}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.9} opacity={0.28} vectorEffect="non-scaling-stroke" />
                      {a.pct > 0 && (
                        <line x1={x1} y1={y1} x2={xp} y2={yp} stroke={color} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
                      )}
                      <title>{tooltip}</title>
                    </g>
                  );
                }

                const h = Math.max(y2 - y1, 1.2);
                return (
                  <g key={a.id}>
                    <rect x={x1} y={y1} width={Math.max(x2 - x1, 0.6)} height={h}
                      fill={color} opacity={0.18} stroke={color} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                    {a.pct > 0 && (
                      <rect x={x1} y={y1} width={Math.max((x2 - x1) * progFrac, 0.3)} height={h} fill={color} opacity={0.55} />
                    )}
                    <title>{tooltip}</title>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex mt-1">
            {months.map((m, i) => (
              <div key={i} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: P.text3 }}>{monthLabel(m, isHe)}</div>
            ))}
          </div>
        </div>

        {hasChainage && (
          <div className="relative shrink-0" style={{ width: 18, height: CHART_H }}>
            {ZONE_BOUNDS.map(z => (
              <div key={z.zone} className="absolute text-[10px] font-bold"
                style={{ top: `${((z.start + z.end) / 2 / TOTAL_CHAINAGE) * 100}%`, transform: "translateY(-50%)", color: P.text3 }}>
                {z.zone}
              </div>
            ))}
          </div>
        )}
      </div>

      {hasChainage && (
        <p className="text-[11px] mt-3" style={{ color: P.text3 }}>
          {isHe ? "קילומטראז'" : "Chainage"}: Ch.{fmtChainage(0)} – Ch.{fmtChainage(TOTAL_CHAINAGE)}
        </p>
      )}
    </div>
  );
}

/* ── Full schedule table view ── */

type ViewMode   = "table" | "gantt" | "timeloc" | "milestones" | "scurve" | "critical" | "ai";
type FilterTab  = "all" | "active" | "overdue" | "done" | "future";

function ScheduleView({ activities, project, fileName, isHe, onReplace }: {
  activities: ScheduleActivity[];
  project: Project;
  fileName: string;
  isHe: boolean;
  onReplace: () => void;
}) {
  const [view,   setView]   = useState<ViewMode>("table");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const withStatus = activities.map(a => ({ ...a, status: actStatus(a, today) }));

  const filtered = withStatus.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all:     withStatus.length,
    active:  withStatus.filter(a => a.status === "active").length,
    overdue: withStatus.filter(a => a.status === "overdue").length,
    done:    withStatus.filter(a => a.status === "done").length,
    future:  withStatus.filter(a => a.status === "future").length,
  };

  const avgPct   = activities.length
    ? Math.round(activities.reduce((s,a) => s + a.pct, 0) / activities.length) : 0;
  const earliest = activities.reduce((m,a) => a.start < m ? a.start : m, activities[0]?.start ?? today);
  const latest   = activities.reduce((m,a) => a.finish > m ? a.finish : m, activities[0]?.finish ?? today);
  const displayName = isHe ? (project.nameHe || project.name) : project.name;

  const TABS: { key: FilterTab; en: string; he: string; color?: string }[] = [
    { key:"all",     en:`All (${counts.all})`,               he:`הכל (${counts.all})`           },
    { key:"active",  en:`In Progress (${counts.active})`,    he:`בביצוע (${counts.active})`,    color: P.warn   },
    { key:"overdue", en:`Overdue (${counts.overdue})`,       he:`באיחור (${counts.overdue})`,   color: P.danger },
    { key:"done",    en:`Complete (${counts.done})`,         he:`הושלם (${counts.done})`,       color: P.good   },
    { key:"future",  en:`Not Started (${counts.future})`,    he:`טרם החל (${counts.future})`,   color: P.text3  },
  ];

  return (
    <div className="flex flex-col" style={{ background: P.bg, height: "100%", overflow: view === "gantt" ? "hidden" : "auto" }}>

      <div className="px-6 py-3 flex items-center gap-4 flex-wrap"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: P.warnBg }}>
          <CalendarDays className="w-5 h-5" style={{ color: P.warn }}/>
        </div>
        <div className="flex-1 min-w-[160px]">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{isHe ? "לוח זמנים" : "Schedule"}</h1>
          <p className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: P.text3 }}>
            <FileSpreadsheet className="w-3 h-3"/>
            {displayName} · {fileName}
          </p>
        </div>

        <button onClick={onReplace}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl shrink-0"
          style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
          <RefreshCw className="w-3.5 h-3.5"/>
          {isHe ? "החלף קובץ" : "Replace file"}
        </button>
      </div>

      {/* View toggle */}
      <div className="px-6 py-2.5 flex items-center gap-1.5 flex-wrap" style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        {([
          { key: "table"      as ViewMode, Icon: LayoutList,       en: "Table",            he: "טבלה"            },
          { key: "gantt"      as ViewMode, Icon: GanttChartSquare, en: "Gantt",             he: "גאנט"            },
          { key: "timeloc"    as ViewMode, Icon: Route,            en: "Time-Location",     he: "מיקום-זמן"       },
          { key: "milestones" as ViewMode, Icon: MilestoneIcon,    en: "Milestones",        he: "אבני דרך"        },
          { key: "scurve"     as ViewMode, Icon: TrendingUp,       en: "S-Curve",           he: "עקום S"          },
          { key: "critical"   as ViewMode, Icon: AlertOctagon,     en: "Critical Path",     he: "נתיב קריטי"      },
          { key: "ai"         as ViewMode, Icon: Sparkles,         en: "AI Analysis",       he: "ניתוח AI"        },
        ]).map(({ key, Icon, en, he }) => (
          <button key={key} onClick={() => setView(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              background: view === key ? P.warn : P.bg,
              color:      view === key ? "#fff"  : P.text2,
              border: `1px solid ${view === key ? P.warn : P.border}`,
            }}>
            <Icon className="w-3.5 h-3.5"/>
            {isHe ? he : en}
          </button>
        ))}
      </div>

      {/* ── Gantt view ── */}
      {view === "gantt" && (
        <div style={{ flex: 1, overflow: "hidden", height: "calc(100vh - 168px)" }}>
          <GanttChart activities={activities} isHe={isHe}/>
        </div>
      )}

      {/* ── Time-Location (TILOS) view ── */}
      {view === "timeloc" && (
        <div className="px-7 py-5 max-w-[1440px] mx-auto w-full pb-24">
          <TimeLocationPanel activities={activities} isHe={isHe}/>
        </div>
      )}

      {/* ── Milestones view ── */}
      {view === "milestones" && (
        <div className="px-7 py-5 max-w-[1440px] mx-auto w-full pb-24">
          <MilestonesPanel activities={activities} isHe={isHe} today={today}/>
        </div>
      )}

      {/* ── S-Curve view ── */}
      {view === "scurve" && (
        <div className="px-7 py-5 max-w-[1440px] mx-auto w-full pb-24">
          <SCurvePanel activities={activities} isHe={isHe} today={today}/>
        </div>
      )}

      {/* ── Critical Path view ── */}
      {view === "critical" && (
        <div className="px-7 py-5 max-w-[1440px] mx-auto w-full pb-24">
          <CriticalPathPanel activities={activities} isHe={isHe} today={today}/>
        </div>
      )}

      {/* ── AI Analysis view ── */}
      {view === "ai" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "calc(100vh - 168px)" }}>
          <ScheduleAnalysis
            activities={activities}
            projectName={displayName}
            projectStart={activities[0]?.start}
            projectFinish={activities.reduce((m,a) => a.finish > m ? a.finish : m, "")}
            isHe={isHe}
          />
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && <div className="px-7 py-5 space-y-5 max-w-[1440px] mx-auto w-full pb-24">

        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: isHe ? "סה״כ פעילויות" : "Total Activities",
              value: String(counts.all),
              sub:   `${activities.filter(a=>a.isMilestone).length} ${isHe?"אבני דרך":"milestones"}` },
            { label: isHe ? "אחוז השלמה" : "% Complete",
              value: `${avgPct}%`,
              bar: true },
            { label: isHe ? "באיחור" : "Overdue",
              value: String(counts.overdue),
              danger: counts.overdue > 0 },
            { label: isHe ? "טווח הפרויקט" : "Project Span",
              value: fmtDate(earliest, isHe),
              sub:   `→ ${fmtDate(latest, isHe)}` },
          ].map((k, i) => (
            <div key={i} className="rounded-2xl p-5"
              style={{ background: k.danger ? P.dangerBg : P.card, border: `1px solid ${k.danger ? "#FECACA" : P.border}` }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[30px] font-bold leading-none" style={{ color: k.danger ? P.danger : P.text1 }}>{k.value}</p>
              {k.bar && (
                <div className="mt-3 h-1.5 rounded-full" style={{ background: "#E7E0D8" }}>
                  <div className="h-1.5 rounded-full" style={{ width:`${avgPct}%`, background: avgPct > 60 ? P.good : P.warn }}/>
                </div>
              )}
              {k.sub && <p className="text-[12px] mt-2" style={{ color: k.danger ? P.danger : P.text3 }}>{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className="px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all"
                style={{
                  background: filter === tab.key ? (tab.color ?? P.copper) : P.card,
                  color:      filter === tab.key ? "#fff" : (tab.color ?? P.text2),
                  border:     `1px solid ${filter === tab.key ? "transparent" : P.border}`,
                }}>
                {isHe ? tab.he : tab.en}
              </button>
            ))}
          </div>
          <div className="relative ms-auto w-full sm:w-64">
            <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: P.text3, insetInlineStart:"12px" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isHe ? "חיפוש פעילות…" : "Search activities…"}
              className="w-full py-2 text-[13px] rounded-xl border outline-none"
              style={{ paddingInlineStart:"36px", paddingInlineEnd:"12px", background: P.card, borderColor: P.border, color: P.text1 }}/>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
          <table className="w-full text-start">
            <thead>
              <tr style={{ background: P.bg }}>
                {(isHe
                  ? ["#","שם הפעילות","התחלה","סיום","מש' (י)","% ביצוע","סטטוס"]
                  : ["#","Task Name","Start","Finish","Dur (d)","% Done","Status"]
                ).map((h,i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-start ${i===1?"w-[35%]":""}`}
                    style={{ color: P.text3, borderBottom: `1px solid ${P.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-[13px]" style={{ color: P.text3 }}>
                  {isHe ? "לא נמצאו פעילויות" : "No activities match"}
                </td></tr>
              )}
              {filtered.map((a, idx) => {
                const st    = STATUS_LABEL[a.status];
                const isOvr = a.status === "overdue";
                return (
                  <tr key={a.id}
                    style={{ background: isOvr ? "#FFF5F5" : idx % 2 === 0 ? P.card : P.bg, borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-3 text-[12px] font-mono" style={{ color: P.text3 }}>
                      {a.wbs || (idx + 1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{ display:"inline-block", width:`${a.level * 16}px`, flexShrink:0 }}/>
                        {a.isMilestone
                          ? <span className="w-3 h-3 rotate-45 shrink-0 inline-block rounded-sm" style={{ background: P.copper }}/>
                          : <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: st.color + "40" }}/>
                        }
                        <span className={`text-[13px] font-${a.level === 0 ? "bold" : "medium"}`} style={{ color: P.text1 }}>
                          {a.name}
                        </span>
                        {a.isCritical && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: P.dangerBg, color: P.danger }}>
                            CR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px]" style={{ color: P.text2 }}>{fmtDate(a.start, isHe)}</td>
                    <td className="px-4 py-3 text-[12.5px]" style={{ color: isOvr ? P.danger : P.text2 }}>{fmtDate(a.finish, isHe)}</td>
                    <td className="px-4 py-3 text-[12.5px] font-mono" style={{ color: P.text2 }}>{a.duration}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full" style={{ background: "#E7E0D8" }}>
                          <div className="h-1.5 rounded-full" style={{ width:`${a.pct}%`, background: st.color }}/>
                        </div>
                        <span className="text-[12px] font-bold" style={{ color: st.color }}>{a.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: st.bg, color: st.color }}>
                        {isHe ? st.he : st.en}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {counts.overdue > 0 && (
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: P.warn }}/>
            <p className="text-[13px] font-medium" style={{ color: P.warn }}>
              {isHe
                ? `${counts.overdue} פעילויות עברו את תאריך הסיום המתוכנן. בדוק את הנתיב הקריטי ועדכן את הסטטוס.`
                : `${counts.overdue} ${counts.overdue===1?"activity is":"activities are"} past their planned finish. Review the critical path and update actual progress.`}
            </p>
          </div>
        )}
      </div>}
    </div>
  );
}

/* ── Root export ── */

export function RealSchedule({ isHe, project }: { isHe: boolean; project: Project }) {
  const { updateProject } = useProjects();
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [fileName,   setFileName]   = useState<string>("");
  const [replacing,  setReplacing]  = useState(false);

  const isDemo = project.id === "highway-20";
  // Uploaded/parsed data always takes priority; the demo project falls back to
  // its bundled sample schedule only until the user uploads a real file.
  const uploaded  = project.scheduleActivities ?? [];
  const usingDemoData = isDemo && uploaded.length === 0;
  const activities = usingDemoData ? DEMO_SCHEDULE_ACTIVITIES : uploaded;
  const hasData    = activities.length > 0;

  const handleFile = useCallback(async (file: File) => {
    setUploading(true); setError(null);
    try {
      const result = await parseScheduleFile(file);
      setFileName(result.fileName);
      updateProject(project.id, {
        scheduleActivities: result.activities,
        scheduleFiles: 1,
      });
      setReplacing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setUploading(false);
    }
  }, [project.id, updateProject]);

  if (hasData && !replacing) {
    return (
      <ScheduleView
        activities={activities}
        project={project}
        fileName={usingDemoData ? DEMO_SCHEDULE_FILE_NAME : (fileName || (isHe ? "קובץ לוח זמנים" : "schedule file"))}
        isHe={isHe}
        onReplace={() => setReplacing(true)}
      />
    );
  }

  const displayName = isHe ? (project.nameHe || project.name) : project.name;

  return (
    <div className="min-h-full flex flex-col" style={{ background: P.bg }}>
      <div className="px-8 py-5 flex items-center gap-4"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: P.warnBg }}>
          <CalendarDays className="w-5 h-5" style={{ color: P.warn }}/>
        </div>
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{isHe ? "לוח זמנים" : "Schedule"}</h1>
          <p className="text-[12px] font-medium" style={{ color: P.text3 }}>{displayName}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-4">
          {uploading ? (
            <div className="rounded-3xl p-12 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}` }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ background: P.warnBg }}>
                <CalendarDays className="w-8 h-8 animate-pulse" style={{ color: P.warn }}/>
              </div>
              <p className="text-[17px] font-bold" style={{ color: P.text1 }}>
                {isHe ? "מנתח את לוח הזמנים…" : "Parsing your schedule…"}
              </p>
              <p className="text-[13px] mt-2" style={{ color: P.text3 }}>
                {isHe ? "מזהה פעילויות, תאריכים ואחוז ביצוע" : "Detecting activities, dates and progress"}
              </p>
            </div>
          ) : (
            <>
              <DropZone onFile={handleFile} isHe={isHe}/>

              {error && (
                <div className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: P.danger }}/>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: P.danger }}>
                      {isHe ? "שגיאה בקריאת הקובץ" : "Could not parse file"}
                    </p>
                    <p className="text-[12px] mt-1 whitespace-pre-wrap" style={{ color: P.danger }}>{error}</p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: P.card, border: `1px solid ${P.border}` }}>
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: P.copper }}/>
                <p className="text-[12.5px]" style={{ color: P.text2 }}>
                  {isHe
                    ? "נתמך: MS Project .mpp/.mpt, Excel .xlsx/.xls, CSV, Primavera P6 XER, MSPDI XML. כותרות עמודות בעברית ואנגלית נתמכות."
                    : "Supported: MS Project .mpp/.mpt, Excel .xlsx/.xls, CSV, Primavera P6 XER, MSPDI XML. Hebrew and English column headers both supported."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
