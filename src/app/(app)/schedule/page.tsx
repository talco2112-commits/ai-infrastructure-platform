"use client";

import { useState } from "react";
import { Bell, Search, Lightbulb, CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProjects } from "@/contexts/ProjectContext";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

type ViewId = "gantt" | "timeloc" | "milestones" | "scurve" | "critical";
type FilterId = "all" | "critical" | "delays" | "A" | "B" | "C" | "D";

const VIEW_IDS: ViewId[] = ["gantt", "timeloc", "milestones", "scurve", "critical"];
const FILTER_IDS: FilterId[] = ["all", "critical", "delays", "A", "B", "C", "D"];

const TRANSLATIONS = {
  en: {
    title: "Schedule",
    views: ["Gantt", "Time-Location (TILOS)", "Milestones", "S-Curve", "Critical Path"],
    searchPlaceholder: "Search activities...",
    filterLabel: "Filter:",
    filterChips: ["All Activities", "Critical Path Only", "Delays Only", "Zone A", "Zone B", "Zone C", "Zone D"],
    kpis: [
      { label: "Overall Progress",     val: "57%",       sub: "Planned: 63%" },
      { label: "Critical Activities",  val: "8",         sub: "3 with delays" },
      { label: "Total Float (CP)",     val: "-14d",      sub: "Schedule behind" },
      { label: "Completion Forecast",  val: "Mar 2027",  sub: "Planned: Jan 2027" },
    ],
    wbsCol: "WBS / Activity",
    aiLabel: "AI Schedule Analysis",
    aiText: "Critical path runs through Utility relocation Zone D → Pile drilling Sec. B → Pile caps → Bridge 68 substructure. Current 14-day delay in utility relocation is pushing forecast completion to Mar 2027. Recovery option: accelerate Zone D crew to 3 shifts (cost ~₪180K) to recover 8 working days by end of July. Recommend review with subcontractor Ambar Engineering by 02 Jul.",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    noResults: "No activities match this filter",
    milestonesTitle: "Project Milestones",
    achieved: "Achieved",
    upcoming: "Upcoming",
    scurveTitle: "Cumulative Progress — Planned vs Actual",
    planned: "Planned",
    actual: "Actual",
    criticalTitle: "Critical Path Activities",
    colFloat: "Float",
    colDelay: "Delay",
    timelocTitle: "Time-Location Diagram — Progress vs Chainage",
    chainageAxis: "Chainage",
    legendLinear: "Linear progression",
    legendFixed: "Fixed location",
    legendCritical: "Critical",
    zoneLabel: "Zone",
  },
  he: {
    title: "לוח זמנים",
    views: ["גאנט", "מיקום-זמן (TILOS)", "אבני דרך", "עקום S", "נתיב קריטי"],
    searchPlaceholder: "חיפוש פעילויות...",
    filterLabel: "סינון:",
    filterChips: ["כל הפעילויות", "נתיב קריטי בלבד", "איחורים בלבד", "אזור A", "אזור B", "אזור C", "אזור D"],
    kpis: [
      { label: "התקדמות כוללת",       val: "57%",       sub: "מתוכנן: 63%" },
      { label: "פעילויות קריטיות",    val: "8",         sub: "3 עם איחורים" },
      { label: "פלואט כולל (CP)",     val: "-14י",      sub: "לוח זמנים באיחור" },
      { label: "תחזית סיום",          val: "מרץ 2027",  sub: "מתוכנן: ינואר 2027" },
    ],
    wbsCol: "WBS / פעילות",
    aiLabel: "ניתוח לוח זמנים AI",
    aiText: "הנתיב הקריטי עובר דרך העברת תשתיות אזור D ← קידוח יסודות מקטע B ← כובעי יסוד ← תת-מבנה Bridge 68. האיחור הנוכחי של 14 יום בהעברת תשתיות מזיז את תחזית הסיום למרץ 2027. אפשרות התאוששות: האצת צוות אזור D לשלוש משמרות (עלות ~₪180K) לשחזור 8 ימי עבודה עד סוף יולי. מומלץ לבחון עם קבלן המשנה אמבר הנדסה עד 02 יולי.",
    months: ["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],
    noResults: "אין פעילויות התואמות לסינון זה",
    milestonesTitle: "אבני דרך של הפרויקט",
    achieved: "הושג",
    upcoming: "צפוי",
    scurveTitle: "התקדמות מצטברת — מתוכנן מול בפועל",
    planned: "מתוכנן",
    actual: "בפועל",
    criticalTitle: "פעילויות נתיב קריטי",
    colFloat: "פלואט",
    colDelay: "איחור",
    timelocTitle: "תרשים מיקום-זמן — התקדמות מול קילומטראז'",
    chainageAxis: "קילומטראז'",
    legendLinear: "התקדמות רציפה",
    legendFixed: "מיקום קבוע",
    legendCritical: "קריטי",
    zoneLabel: "אזור",
  },
};

function monthOffset(month: number, day: number = 1) {
  return ((month - 1) * 30 + day - 1) / 365;
}
function monthDuration(startM: number, startD: number, endM: number, endD: number) {
  const start = (startM - 1) * 30 + startD - 1;
  const end   = (endM - 1)   * 30 + endD   - 1;
  return (end - start) / 365;
}

type Activity = {
  id: string; wbs: string; name: string;
  startM: number; startD: number; endM: number; endD: number;
  progress: number; critical: boolean; delay?: string;
  isSummary?: boolean; zone?: "A" | "B" | "C" | "D"; float?: string;
  chainageStart?: number; chainageEnd?: number; linear?: boolean;
};

const activities: Activity[] = [
  { id:"1",   wbs:"1",   name:"EARTHWORKS",                      startM:1, startD:2,  endM:7,  endD:15, progress:78, critical:false, isSummary:true  },
  { id:"1.1", wbs:"1.1", name:"Site clearing & grubbing",         startM:1, startD:2,  endM:2,  endD:15, progress:100, critical:false, chainageStart:0,    chainageEnd:8400, linear:true },
  { id:"1.2", wbs:"1.2", name:"Bulk excavation – Zone A",         startM:2, startD:1,  endM:4,  endD:30, progress:92,  critical:false, zone:"A", chainageStart:0,    chainageEnd:2100, linear:true },
  { id:"1.3", wbs:"1.3", name:"Bulk excavation – Zone B",         startM:3, startD:15, endM:6,  endD:30, progress:75,  critical:false, zone:"B", chainageStart:2100, chainageEnd:4800, linear:true },
  { id:"1.4", wbs:"1.4", name:"Utility relocation – Zone D",      startM:3, startD:1,  endM:7,  endD:15, progress:23,  critical:true,  delay:"14d", zone:"D", float:"-14d", chainageStart:6600, chainageEnd:8400, linear:true },
  { id:"2",   wbs:"2",   name:"FOUNDATIONS",                      startM:4, startD:15, endM:10, endD:31, progress:35, critical:true,  isSummary:true  },
  { id:"2.1", wbs:"2.1", name:"Pile drilling – Sec. A",           startM:4, startD:15, endM:7,  endD:31, progress:65,  critical:true,  zone:"A", float:"-7d", chainageStart:0,    chainageEnd:2100, linear:true },
  { id:"2.2", wbs:"2.2", name:"Pile drilling – Sec. B",           startM:6, startD:1,  endM:9,  endD:30, progress:30,  critical:true,  zone:"B", float:"-14d", chainageStart:2100, chainageEnd:4800, linear:true },
  { id:"2.3", wbs:"2.3", name:"Pile caps & grade beams",          startM:7, startD:15, endM:10, endD:31, progress:12,  critical:true,  float:"-14d", chainageStart:0,    chainageEnd:4800, linear:true },
  { id:"3",   wbs:"3",   name:"STRUCTURES",                       startM:6, startD:15, endM:12, endD:31, progress:10, critical:true,  isSummary:true  },
  { id:"3.1", wbs:"3.1", name:"Bridge 68 – substructure",         startM:8, startD:1,  endM:11, endD:30, progress:5,   critical:true,  zone:"B", float:"-14d", chainageStart:3200, chainageEnd:3600, linear:false },
  { id:"3.2", wbs:"3.2", name:"Bridge 68 – superstructure",       startM:11,startD:1,  endM:12, endD:31, progress:0,   critical:true,  zone:"B", float:"-14d", chainageStart:3200, chainageEnd:3600, linear:false },
  { id:"3.3", wbs:"3.3", name:"Retaining walls – Zone A",         startM:6, startD:15, endM:9,  endD:30, progress:28,  critical:false, zone:"A", chainageStart:0,    chainageEnd:2100, linear:true },
  { id:"3.4", wbs:"3.4", name:"Bridge deck formwork",             startM:8, startD:15, endM:12, endD:15, progress:0,   critical:false, zone:"B", chainageStart:3200, chainageEnd:3600, linear:false },
  { id:"4",   wbs:"4",   name:"ROAD PAVEMENT",                    startM:5, startD:1,  endM:12, endD:31, progress:24, critical:false, isSummary:true  },
  { id:"4.1", wbs:"4.1", name:"Subgrade preparation",             startM:5, startD:1,  endM:8,  endD:31, progress:61,  critical:false, chainageStart:0, chainageEnd:8400, linear:true },
  { id:"4.2", wbs:"4.2", name:"Sub-base layer",                   startM:8, startD:1,  endM:10, endD:31, progress:15,  critical:false, chainageStart:0, chainageEnd:8400, linear:true },
  { id:"4.3", wbs:"4.3", name:"Asphalt base course",              startM:10,startD:15, endM:12, endD:31, progress:0,   critical:false, chainageStart:0, chainageEnd:8400, linear:true },
  { id:"4.4", wbs:"4.4", name:"Wearing course & markings",        startM:12,startD:1,  endM:12, endD:31, progress:0,   critical:false, chainageStart:0, chainageEnd:8400, linear:true },
  { id:"5",   wbs:"5",   name:"TRAFFIC SYSTEMS",                  startM:9, startD:1,  endM:12, endD:31, progress:0,  critical:false, isSummary:true  },
  { id:"5.1", wbs:"5.1", name:"Traffic signals & signage",        startM:9, startD:1,  endM:12, endD:31, progress:0,   critical:false, chainageStart:0, chainageEnd:8400, linear:true },
  { id:"5.2", wbs:"5.2", name:"Lighting installation",            startM:10,startD:1,  endM:12, endD:31, progress:0,   critical:false, chainageStart:0, chainageEnd:8400, linear:true },
];

const TODAY_POS = 177 / 365;

const TOTAL_CHAINAGE = 8400;
const ZONE_BOUNDS: { zone: "A" | "B" | "C" | "D"; start: number; end: number }[] = [
  { zone: "A", start: 0,    end: 2100 },
  { zone: "B", start: 2100, end: 4800 },
  { zone: "C", start: 4800, end: 6600 },
  { zone: "D", start: 6600, end: 8400 },
];

function fmtChainage(m: number) {
  return `${Math.floor(m / 1000)}+${String(Math.round(m % 1000)).padStart(3, "0")}`;
}

const PLANNED_CUM = [5, 12, 20, 30, 45, 63, 71, 78, 85, 91, 96, 100];
const ACTUAL_CUM  = [4, 9, 15, 23, 36, 57];

function matchesFilter(a: Activity, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (filter === "critical") return a.critical;
  if (filter === "delays") return !!a.delay;
  return a.zone === filter;
}

function GanttRows({ list, wbsCol }: { list: Activity[]; wbsCol: string }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
      <div className="flex" style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="w-64 shrink-0 px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider"
          style={{ color: P.text3, borderRight: `1px solid ${P.border}`, background: P.bg }}>
          {wbsCol}
        </div>
        <div className="flex-1 relative">
          <div className="flex">
            {TRANSLATIONS.en.months.map((_, i) => (
              <div key={i} className="flex-1 py-2.5" style={{ borderRight: `1px solid ${P.border}`, background: P.bg }} />
            ))}
          </div>
        </div>
      </div>

      {list.map((act) => {
        const left    = monthOffset(act.startM, act.startD) * 100;
        const width   = monthDuration(act.startM, act.startD, act.endM, act.endD) * 100;
        const barColor = act.isSummary ? "#1C1917" : act.critical ? P.danger : P.copper;

        return (
          <div key={act.id} className="flex items-center"
            style={{
              borderBottom: `1px solid ${P.border}`,
              background: act.isSummary ? "#F5F2EF" : "transparent",
              minHeight: act.isSummary ? 36 : 40,
            }}>
            <div className="w-64 shrink-0 px-3 flex items-center gap-2"
              style={{ borderRight: `1px solid ${P.border}`, height: "100%" }}>
              <span className="text-[11.5px] font-mono shrink-0" style={{ color: P.text3, minWidth: 28 }}>
                {act.wbs}
              </span>
              <span
                className={act.isSummary ? "text-[12px] font-bold uppercase tracking-wide" : "text-[12px] font-medium"}
                style={{ color: act.isSummary ? P.text1 : act.critical ? P.danger : P.text2 }}>
                {act.name}
              </span>
              {act.delay && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: P.dangerBg, color: P.danger }}>
                  +{act.delay}
                </span>
              )}
            </div>

            <div className="flex-1 relative flex items-center" style={{ height: 40 }}>
              <div className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{ left: `${TODAY_POS * 100}%`, width: 2, background: P.copper, opacity: 0.6 }} />

              {!act.isSummary && (
                <div className="absolute h-5 rounded-full overflow-hidden"
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 1)}%`,
                    background: `${barColor}26`,
                    border: `1.5px solid ${barColor}`,
                  }}>
                  {act.progress > 0 && (
                    <div className="h-full rounded-full"
                      style={{ width: `${act.progress}%`, background: barColor, opacity: 0.85 }} />
                  )}
                </div>
              )}

              {act.isSummary && (
                <div className="absolute h-3 rounded-sm"
                  style={{ left: `${left}%`, width: `${Math.max(width, 1)}%`, background: "#1C1917", opacity: 0.75 }}>
                  <div className="h-full rounded-sm" style={{ width: `${act.progress}%`, background: "#1C1917" }} />
                </div>
              )}

              {!act.isSummary && act.progress > 0 && (
                <div className="absolute text-[10px] font-bold"
                  style={{ left: `calc(${left}% + ${Math.max(width, 1)}% + 4px)`, color: P.text3, whiteSpace: "nowrap" }}>
                  {act.progress}%
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimeLocationChart({ list, T }: { list: Activity[]; T: typeof TRANSLATIONS.en }) {
  const CHART_H = 380;
  const chainageTicks = [0, ...ZONE_BOUNDS.map(z => z.end)];
  const plottable = list.filter(a => a.chainageStart != null && a.chainageEnd != null);

  return (
    <div className="rounded-2xl p-5"
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.timelocTitle}</h3>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: P.text2 }}>
          <span className="flex items-center gap-1.5">
            <svg width="16" height="8"><line x1="1" y1="7" x2="15" y2="1" stroke={P.copper} strokeWidth="1.6" /></svg>
            {T.legendLinear}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: P.copper, opacity: 0.5 }} />
            {T.legendFixed}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block rounded-sm" style={{ background: P.danger }} />
            {T.legendCritical}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Chainage axis */}
        <div className="relative shrink-0" style={{ width: 52, height: CHART_H }}>
          {chainageTicks.map(c => (
            <div key={c} className="absolute text-[10px] font-mono font-semibold whitespace-nowrap"
              style={{ top: `${(c / TOTAL_CHAINAGE) * 100}%`, transform: "translateY(-50%)", color: P.text3 }}>
              {fmtChainage(c)}
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={{ height: CHART_H }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
              {ZONE_BOUNDS.map((z, i) => (
                <rect key={z.zone} x={0} y={(z.start / TOTAL_CHAINAGE) * 100} width={100}
                  height={((z.end - z.start) / TOTAL_CHAINAGE) * 100}
                  fill={i % 2 === 0 ? P.bg : "transparent"} opacity={0.5} />
              ))}
              {ZONE_BOUNDS.map(z => (
                <line key={z.zone} x1={0} x2={100} y1={(z.end / TOTAL_CHAINAGE) * 100} y2={(z.end / TOTAL_CHAINAGE) * 100}
                  stroke={P.border} strokeWidth={0.3} />
              ))}
              <line x1={TODAY_POS * 100} x2={TODAY_POS * 100} y1={0} y2={100}
                stroke={P.copper} strokeWidth={0.4} strokeDasharray="1.5,1.5" opacity={0.6} />

              {plottable.map(a => {
                const x1 = monthOffset(a.startM, a.startD) * 100;
                const x2 = monthOffset(a.endM, a.endD) * 100;
                const y1 = (a.chainageStart! / TOTAL_CHAINAGE) * 100;
                const y2 = (a.chainageEnd! / TOTAL_CHAINAGE) * 100;
                const color = a.critical ? P.danger : P.copper;
                const progFrac = a.progress / 100;
                const tooltip = `${a.name} (${fmtChainage(a.chainageStart!)}–${fmtChainage(a.chainageEnd!)})`;

                if (a.linear) {
                  const xp = x1 + (x2 - x1) * progFrac;
                  const yp = y1 + (y2 - y1) * progFrac;
                  return (
                    <g key={a.id}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={0.9} opacity={0.28} vectorEffect="non-scaling-stroke" />
                      {a.progress > 0 && (
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
                    {a.progress > 0 && (
                      <rect x={x1} y={y1} width={Math.max((x2 - x1) * progFrac, 0.3)} height={h} fill={color} opacity={0.55} />
                    )}
                    <title>{tooltip}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex mt-1">
            {T.months.map((m) => (
              <div key={m} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: P.text3 }}>{m}</div>
            ))}
          </div>
        </div>

        {/* Zone labels */}
        <div className="relative shrink-0" style={{ width: 18, height: CHART_H }}>
          {ZONE_BOUNDS.map(z => (
            <div key={z.zone} className="absolute text-[10px] font-bold"
              style={{ top: `${((z.start + z.end) / 2 / TOTAL_CHAINAGE) * 100}%`, transform: "translateY(-50%)", color: P.text3 }}>
              {z.zone}
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] mt-3" style={{ color: P.text3 }}>
        {T.chainageAxis}: Ch.{fmtChainage(0)} – Ch.{fmtChainage(TOTAL_CHAINAGE)}
      </p>
    </div>
  );
}

export default function SchedulePage() {
  const { lang, isHe } = useLanguage();
  const { active } = useProjects();
  const T = TRANSLATIONS[lang];

  const [view, setView] = useState<ViewId>("gantt");
  const [filter, setFilter] = useState<FilterId>("all");

  const filteredActivities = activities.filter(a => matchesFilter(a, filter));
  const criticalActivities = activities.filter(a => a.critical);

  const now = Date.now();

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <div className="flex items-center gap-1">
            {T.views.map((v, i) => {
              const id = VIEW_IDS[i];
              const activeView = view === id;
              return (
                <button key={v} onClick={() => setView(id)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors"
                  style={{
                    background: activeView ? P.copper : P.bg,
                    color: activeView ? "#fff" : P.text2,
                    border: `1px solid ${activeView ? P.copper : P.border}`,
                  }}>
                  {v}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{T.searchPlaceholder}</span>
          </div>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Filter chips — only meaningful on the Gantt view */}
        {view === "gantt" && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[12px] font-semibold" style={{ color: P.text3 }}>{T.filterLabel}</span>
            {T.filterChips.map((chip, i) => {
              const id = FILTER_IDS[i];
              const activeChip = filter === id;
              return (
                <button key={chip} onClick={() => setFilter(id)}
                  className="px-3 py-1 rounded-full text-[11.5px] font-semibold"
                  style={{
                    background: activeChip ? P.copper : P.bg,
                    color: activeChip ? "#fff" : P.text2,
                    border: `1px solid ${activeChip ? P.copper : P.border}`,
                  }}>
                  {chip}
                </button>
              );
            })}
          </div>
        )}

        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {T.kpis.map((k, i) => {
            const colors = [P.warn, P.danger, P.danger, P.warn];
            return (
              <div key={k.label} className="rounded-2xl p-4"
                style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <p className="text-[12px] font-medium mb-1" style={{ color: P.text3 }}>{k.label}</p>
                <p className="text-[22px] font-bold" style={{ color: colors[i] }}>{k.val}</p>
                <p className="text-[11px] mt-0.5" style={{ color: P.text3 }}>{k.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Gantt view ── */}
        {view === "gantt" && (
          filteredActivities.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-[13px]"
              style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text3 }}>
              {T.noResults}
            </div>
          ) : (
            <GanttRows list={filteredActivities} wbsCol={T.wbsCol} />
          )
        )}

        {/* ── Time-Location (TILOS) view ── */}
        {view === "timeloc" && (
          <TimeLocationChart list={activities} T={T} />
        )}

        {/* ── Critical Path view ── */}
        {view === "critical" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.criticalTitle}</h3>
            </div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.wbsCol, T.colFloat, T.colDelay].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticalActivities.map(a => (
                  <tr key={a.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: a.isSummary ? P.text1 : P.danger }}>
                      <span className="font-mono text-[11px] me-2" style={{ color: P.text3 }}>{a.wbs}</span>
                      {a.name}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold" style={{ color: P.danger }}>{a.float ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      {a.delay
                        ? <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: P.dangerBg, color: P.danger }}>+{a.delay}</span>
                        : <span style={{ color: P.text3 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Milestones view ── */}
        {view === "milestones" && (
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-4" style={{ color: P.text1 }}>{T.milestonesTitle}</h3>
            <div className="space-y-2">
              {active.milestones.map((m) => {
                const achieved = new Date(m.date).getTime() <= now;
                return (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    {achieved
                      ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: P.good }} />
                      : <Circle className="w-4 h-4 shrink-0" style={{ color: P.text3 }} />}
                    <span className="flex-1 text-[13px] font-semibold" style={{ color: P.text1 }}>
                      {isHe ? (m.nameHe || m.name) : m.name}
                    </span>
                    <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: achieved ? P.goodBg : P.copperLight, color: achieved ? P.good : P.copper }}>
                      {achieved ? T.achieved : T.upcoming}
                    </span>
                    <span className="text-[12px] font-medium" style={{ color: P.text3 }}>
                      {new Date(m.date).toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── S-Curve view ── */}
        {view === "scurve" && (
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.scurveTitle}</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: P.track }} />{T.planned}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: P.copper }} />{T.actual}</span>
              </div>
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: 220 }}>
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1={0} x2={100} y1={100 - y} y2={100 - y} stroke={P.track} strokeWidth={0.3} />
              ))}
              <polyline
                points={PLANNED_CUM.map((v, i) => `${(i / (PLANNED_CUM.length - 1)) * 100},${100 - v}`).join(" ")}
                fill="none" stroke={P.track} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <polyline
                points={ACTUAL_CUM.map((v, i) => `${(i / (PLANNED_CUM.length - 1)) * 100},${100 - v}`).join(" ")}
                fill="none" stroke={P.copper} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
              <line x1={TODAY_POS * 100} x2={TODAY_POS * 100} y1={0} y2={100} stroke={P.copper} strokeWidth={0.4} strokeDasharray="2,2" opacity={0.6} />
            </svg>
            <div className="flex mt-1">
              {T.months.map((m) => (
                <div key={m} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: P.text3 }}>{m}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI insight */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mt-5"
          style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiText}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
