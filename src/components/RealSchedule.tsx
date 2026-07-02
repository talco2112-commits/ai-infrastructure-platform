"use client";

import { useState, useCallback } from "react";
import {
  CalendarDays, AlertTriangle,
  Search, FileSpreadsheet, RefreshCw, Lightbulb,
  LayoutList, GanttChartSquare, Sparkles,
} from "lucide-react";
import { GanttChart } from "@/components/GanttChart";
import { ScheduleAnalysis } from "@/components/ScheduleAnalysis";
import { useProjects, type ScheduleActivity, type Project } from "@/contexts/ProjectContext";

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

/* ── Full schedule table view ── */

type ViewMode   = "table" | "gantt" | "ai";
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

      <div className="px-6 py-4 flex items-center gap-4"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: P.warnBg }}>
          <CalendarDays className="w-5 h-5" style={{ color: P.warn }}/>
        </div>
        <div className="flex-1">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{isHe ? "לוח זמנים" : "Schedule"}</h1>
          <p className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: P.text3 }}>
            <FileSpreadsheet className="w-3 h-3"/>
            {displayName} · {fileName}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
          {([
            { key: "table" as ViewMode, Icon: LayoutList,       en: "Table",  he: "טבלה" },
            { key: "gantt" as ViewMode, Icon: GanttChartSquare, en: "Gantt",  he: "גנט"  },
          { key: "ai"    as ViewMode, Icon: Sparkles,         en: "AI Analysis", he: "ניתוח AI" },
          ]).map(({ key, Icon, en, he }) => (
            <button key={key} onClick={() => setView(key)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background: view === key ? P.warn : P.card,
                color:      view === key ? "#fff"  : P.text2,
              }}>
              <Icon className="w-3.5 h-3.5"/>
              {isHe ? he : en}
            </button>
          ))}
        </div>

        <button onClick={onReplace}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl"
          style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
          <RefreshCw className="w-3.5 h-3.5"/>
          {isHe ? "החלף קובץ" : "Replace file"}
        </button>
      </div>

      {/* ── Gantt view ── */}
      {view === "gantt" && (
        <div style={{ flex: 1, overflow: "hidden", height: "calc(100vh - 120px)" }}>
          <GanttChart activities={activities} isHe={isHe}/>
        </div>
      )}

      {/* ── AI Analysis view ── */}
      {view === "ai" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "calc(100vh - 120px)" }}>
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

  const activities = project.scheduleActivities ?? [];
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
        fileName={fileName || (isHe ? "קובץ לוח זמנים" : "schedule file")}
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
