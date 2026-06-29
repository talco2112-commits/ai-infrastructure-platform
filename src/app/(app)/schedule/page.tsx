import { cookies } from "next/headers";
import { Bell, Search, AlertTriangle, Lightbulb } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#D4714A", copperLight: "#F5EDE8", copperMid: "#E8A080",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Schedule",
    views: ["Gantt", "Milestones", "S-Curve", "Critical Path"],
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
  },
  he: {
    title: "לוח זמנים",
    views: ["גאנט", "אבני דרך", "עקום S", "נתיב קריטי"],
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
  isSummary?: boolean;
};

const activities: Activity[] = [
  { id:"1",   wbs:"1",   name:"EARTHWORKS",                      startM:1, startD:2,  endM:7,  endD:15, progress:78, critical:false, isSummary:true  },
  { id:"1.1", wbs:"1.1", name:"Site clearing & grubbing",         startM:1, startD:2,  endM:2,  endD:15, progress:100, critical:false },
  { id:"1.2", wbs:"1.2", name:"Bulk excavation – Zone A",         startM:2, startD:1,  endM:4,  endD:30, progress:92,  critical:false },
  { id:"1.3", wbs:"1.3", name:"Bulk excavation – Zone B",         startM:3, startD:15, endM:6,  endD:30, progress:75,  critical:false },
  { id:"1.4", wbs:"1.4", name:"Utility relocation – Zone D",      startM:3, startD:1,  endM:7,  endD:15, progress:23,  critical:true,  delay:"14d" },
  { id:"2",   wbs:"2",   name:"FOUNDATIONS",                      startM:4, startD:15, endM:10, endD:31, progress:35, critical:true,  isSummary:true  },
  { id:"2.1", wbs:"2.1", name:"Pile drilling – Sec. A",           startM:4, startD:15, endM:7,  endD:31, progress:65,  critical:true  },
  { id:"2.2", wbs:"2.2", name:"Pile drilling – Sec. B",           startM:6, startD:1,  endM:9,  endD:30, progress:30,  critical:true  },
  { id:"2.3", wbs:"2.3", name:"Pile caps & grade beams",          startM:7, startD:15, endM:10, endD:31, progress:12,  critical:true  },
  { id:"3",   wbs:"3",   name:"STRUCTURES",                       startM:6, startD:15, endM:12, endD:31, progress:10, critical:true,  isSummary:true  },
  { id:"3.1", wbs:"3.1", name:"Bridge 68 – substructure",         startM:8, startD:1,  endM:11, endD:30, progress:5,   critical:true  },
  { id:"3.2", wbs:"3.2", name:"Bridge 68 – superstructure",       startM:11,startD:1,  endM:12, endD:31, progress:0,   critical:true  },
  { id:"3.3", wbs:"3.3", name:"Retaining walls – Zone A",         startM:6, startD:15, endM:9,  endD:30, progress:28,  critical:false },
  { id:"3.4", wbs:"3.4", name:"Bridge deck formwork",             startM:8, startD:15, endM:12, endD:15, progress:0,   critical:false },
  { id:"4",   wbs:"4",   name:"ROAD PAVEMENT",                    startM:5, startD:1,  endM:12, endD:31, progress:24, critical:false, isSummary:true  },
  { id:"4.1", wbs:"4.1", name:"Subgrade preparation",             startM:5, startD:1,  endM:8,  endD:31, progress:61,  critical:false },
  { id:"4.2", wbs:"4.2", name:"Sub-base layer",                   startM:8, startD:1,  endM:10, endD:31, progress:15,  critical:false },
  { id:"4.3", wbs:"4.3", name:"Asphalt base course",              startM:10,startD:15, endM:12, endD:31, progress:0,   critical:false },
  { id:"4.4", wbs:"4.4", name:"Wearing course & markings",        startM:12,startD:1,  endM:12, endD:31, progress:0,   critical:false },
  { id:"5",   wbs:"5",   name:"TRAFFIC SYSTEMS",                  startM:9, startD:1,  endM:12, endD:31, progress:0,  critical:false, isSummary:true  },
  { id:"5.1", wbs:"5.1", name:"Traffic signals & signage",        startM:9, startD:1,  endM:12, endD:31, progress:0,   critical:false },
  { id:"5.2", wbs:"5.2", name:"Lighting installation",            startM:10,startD:1,  endM:12, endD:31, progress:0,   critical:false },
];

const TODAY_POS = 177 / 365;

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <div className="flex items-center gap-1">
            {T.views.map((v, i) => (
              <button key={v}
                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors"
                style={{
                  background: i === 0 ? P.copper : P.bg,
                  color: i === 0 ? "#fff" : P.text2,
                  border: `1px solid ${i === 0 ? P.copper : P.border}`,
                }}>
                {v}
              </button>
            ))}
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

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] font-semibold" style={{ color: P.text3 }}>{T.filterLabel}</span>
          {T.filterChips.map((chip, i) => (
            <button key={chip}
              className="px-3 py-1 rounded-full text-[11.5px] font-semibold"
              style={{
                background: i === 0 ? P.copper : P.bg,
                color: i === 0 ? "#fff" : P.text2,
                border: `1px solid ${i === 0 ? P.copper : P.border}`,
              }}>
              {chip}
            </button>
          ))}
        </div>

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

        {/* Gantt Chart */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>

          {/* Month header row */}
          <div className="flex" style={{ borderBottom: `1px solid ${P.border}` }}>
            <div className="w-64 shrink-0 px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider"
              style={{ color: P.text3, borderRight: `1px solid ${P.border}`, background: P.bg }}>
              {T.wbsCol}
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {T.months.map((m) => (
                  <div key={m} className="flex-1 text-center py-2.5 text-[11px] font-bold uppercase"
                    style={{ color: P.text3, borderRight: `1px solid ${P.border}`, background: P.bg }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity rows */}
          {activities.map((act) => {
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

                {/* Name col */}
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

                {/* Bar area */}
                <div className="flex-1 relative flex items-center" style={{ height: 40 }}>
                  {/* Today line */}
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
