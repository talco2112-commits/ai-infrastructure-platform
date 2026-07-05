import { cookies } from "next/headers";
import { Bell, Lightbulb, ChevronRight } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

const TRANSLATIONS = {
  en: {
    title: "Weekly Plan – 3-Week Lookahead",
    weeks: ["Week 89 (Current) 30 Jun – 6 Jul", "Week 90: 7–13 Jul", "Week 91: 14–20 Jul"],
    kpis: [
      { label: "Planned Activities (W89)", val: "38" },
      { label: "Completed",               val: "12" },
      { label: "In Progress",             val: "14" },
      { label: "At Risk",                 val: "6"  },
    ],
    ai: "Zone D utility relocation is the top constraint for Week 89 — if unresolved by 4 July, 9 downstream activities in Week 90 will slip. Concrete pour P8 should be front-loaded to Monday (Week 90) to de-risk the bridge deck critical path.",
    aiLabel: "AI Lookahead Insight",
    colActivity: "Activity", colZone: "Zone", colCrew: "Crew", colDuration: "Duration", colPredecessor: "Predecessor", colStatus: "Status",
    zoneProgress: "Zone Progress – Week 89",
  },
  he: {
    title: "תכנון שבועי – תחזית 3 שבועות",
    weeks: ["שבוע 89 (נוכחי) 30 יוני – 6 יולי", "שבוע 90: 7–13 יולי", "שבוע 91: 14–20 יולי"],
    kpis: [
      { label: "פעילויות מתוכננות (ש89)", val: "38" },
      { label: "הושלמו",                  val: "12" },
      { label: "בביצוע",                  val: "14" },
      { label: "בסיכון",                  val: "6"  },
    ],
    ai: "העברת תשתיות אזור D היא האילוץ העיקרי לשבוע 89 — אם לא ייפתר עד 4 יולי, 9 פעילויות שבוע 90 ידחו. יציקת כן P8 אמורה להיות מוקדמת ליום שני (שבוע 90) כדי להפחית סיכון בנתיב הגשר הקריטי.",
    aiLabel: "תובנת AI לתחזית",
    colActivity: "פעילות", colZone: "אזור", colCrew: "צוות", colDuration: "משך", colPredecessor: "קדים", colStatus: "סטטוס",
    zoneProgress: "התקדמות לפי אזור – שבוע 89",
  },
};

type ActStatus = "COMPLETE" | "IN PROGRESS" | "PLANNED" | "AT RISK" | "NOT STARTED";

type WeekActivity = {
  id: string; activity: string; actHe: string; zone: string;
  crew: string; duration: string; predecessor: string; status: ActStatus;
};

const week89: WeekActivity[] = [
  { id:"A-001", activity:"Concrete pour – Bridge pier P7",            actHe:"יציקת בטון – כן P7",             zone:"B", crew:"Crew A",    duration:"1d",  predecessor:"—",    status:"IN PROGRESS" },
  { id:"A-002", activity:"Pile drilling – positions 29–34",           actHe:"קידוח יסודות 29–34",             zone:"C", crew:"Drill Co.", duration:"2d",  predecessor:"—",    status:"IN PROGRESS" },
  { id:"A-003", activity:"Formwork erection – P8 (North)",            actHe:"הקמת קינוף – P8 (צפון)",         zone:"B", crew:"Crew C",    duration:"2d",  predecessor:"A-001",status:"IN PROGRESS" },
  { id:"A-004", activity:"Road base compaction – Sec. A",             actHe:"דחיסת בסיס – קטע A",             zone:"A", crew:"Crew F",    duration:"3d",  predecessor:"—",    status:"IN PROGRESS" },
  { id:"A-005", activity:"Utility trench excavation – Zone D sec. 2", actHe:"חפירת תשתיות – אזור D קטע 2",   zone:"D", crew:"Crew E",    duration:"4d",  predecessor:"—",    status:"AT RISK"     },
  { id:"A-006", activity:"Pile cage fabrication #22–28",              actHe:"ייצור כלוב קידוח #22–28",       zone:"C", crew:"Crew B",    duration:"1d",  predecessor:"—",    status:"COMPLETE"    },
  { id:"A-007", activity:"Drainage culvert installation – STA 0+220", actHe:"התקנת תעלת ניקוז – עמדה 0+220", zone:"A", crew:"Crew G",    duration:"1d",  predecessor:"A-004",status:"COMPLETE"    },
  { id:"A-008", activity:"Pre-pour survey – Pier P8 check",           actHe:"מדידה לפני יציקה – כן P8",       zone:"B", crew:"Surveyor", duration:"0.5d",predecessor:"A-003",status:"COMPLETE"    },
  { id:"A-009", activity:"Retaining wall backfill – Zone C sec. 3",   actHe:"מילוי קיר תומך – אזור C קטע 3", zone:"C", crew:"Crew B",    duration:"2d",  predecessor:"A-006",status:"PLANNED"     },
  { id:"A-010", activity:"Night shift – Zone B concrete P8",          actHe:"משמרת לילה – בטון P8 אזור B",   zone:"B", crew:"Crew A",    duration:"1d",  predecessor:"A-003",status:"AT RISK"     },
];

const week90: WeekActivity[] = [
  { id:"B-001", activity:"Concrete pour – Bridge pier P8",            actHe:"יציקת בטון – כן P8",             zone:"B", crew:"Crew A",    duration:"1d",  predecessor:"A-010",status:"NOT STARTED" },
  { id:"B-002", activity:"Pile drilling – positions 35–42",           actHe:"קידוח יסודות 35–42",             zone:"C", crew:"Drill Co.", duration:"3d",  predecessor:"A-002",status:"NOT STARTED" },
  { id:"B-003", activity:"Earthworks Zone D – if unblocked",          actHe:"עפר אזור D – אם מוסר חסם",      zone:"D", crew:"Crew E",    duration:"5d",  predecessor:"A-005",status:"AT RISK"     },
  { id:"B-004", activity:"Bridge deck formwork – segment 5A",         actHe:"קינוף גשר – מקטע 5A",            zone:"B", crew:"Crew C",    duration:"3d",  predecessor:"B-001",status:"NOT STARTED" },
  { id:"B-005", activity:"Road base – Section B installation",        actHe:"שכבת בסיס – קטע B",              zone:"A", crew:"Crew F",    duration:"4d",  predecessor:"A-004",status:"NOT STARTED" },
];

const week91: WeekActivity[] = [
  { id:"C-001", activity:"Concrete pour – Bridge deck segment 5A",    actHe:"יציקת בטון – מקטע גשר 5A",      zone:"B", crew:"Crew A+C",  duration:"2d",  predecessor:"B-004",status:"NOT STARTED" },
  { id:"C-002", activity:"Pile completion Zone C (final 8 piles)",    actHe:"השלמת קידוח אזור C (8 אחרון)",   zone:"C", crew:"Drill Co.", duration:"4d",  predecessor:"B-002",status:"NOT STARTED" },
  { id:"C-003", activity:"Zone D – utility installation (if clear)",  actHe:"אזור D – התקנת תשתיות",         zone:"D", crew:"MEP+Crew E",duration:"5d",  predecessor:"B-003",status:"AT RISK"     },
  { id:"C-004", activity:"Asphalt base layer – Section A",            actHe:"שכבת אספלט – קטע A",             zone:"A", crew:"Peretz Co.",duration:"3d",  predecessor:"B-005",status:"NOT STARTED" },
];

const statusStyle: Record<ActStatus, { bg: string; color: string }> = {
  "COMPLETE":    { bg: P.goodBg,   color: P.good    },
  "IN PROGRESS": { bg: "#EFF6FF",  color: "#1D4ED8" },
  "PLANNED":     { bg: "#F1F5F9",  color: "#475569" },
  "AT RISK":     { bg: P.dangerBg, color: P.danger  },
  "NOT STARTED": { bg: P.bg,       color: P.text3   },
};

const zoneProgress = [
  { zone:"A", label:"Zone A – Road Base",     labelHe:"אזור A – שכבת בסיס",   pct:68, color:"#15803D" },
  { zone:"B", label:"Zone B – Bridge Works",  labelHe:"אזור B – עבודות גשר",  pct:51, color:"#1D4ED8" },
  { zone:"C", label:"Zone C – Pile Founds.",  labelHe:"אזור C – יסודות קידוח",pct:74, color:"#8B5A2B" },
  { zone:"D", label:"Zone D – Utilities",     labelHe:"אזור D – תשתיות",      pct:18, color:"#B91C1C" },
];

const kpiColors = [P.text1, P.good, "#1D4ED8", P.danger];

function WeekTable({ activities, isHe, T }: { activities: WeekActivity[]; isHe: boolean; T: typeof TRANSLATIONS["en"] }) {
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr style={{ borderBottom: `1px solid ${P.border}` }}>
          {["ID", T.colActivity, T.colZone, T.colCrew, T.colDuration, T.colPredecessor, T.colStatus].map(h => (
            <th key={h} className="px-3 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {activities.map((a) => {
          const ss = statusStyle[a.status];
          return (
            <tr key={a.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
              <td className="px-3 py-2 font-mono text-[11px]" style={{ color: P.text3 }}>{a.id}</td>
              <td className="px-3 py-2 font-medium" style={{ color: P.text1 }}>{isHe ? a.actHe : a.activity}</td>
              <td className="px-3 py-2 text-center">
                <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: P.copperLight, color: P.copper }}>{a.zone}</span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap" style={{ color: P.text2 }}>{a.crew}</td>
              <td className="px-3 py-2 font-mono text-[11px]" style={{ color: P.text2 }}>{a.duration}</td>
              <td className="px-3 py-2 font-mono text-[11px]" style={{ color: P.text3 }}>{a.predecessor}</td>
              <td className="px-3 py-2">
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{a.status}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function WeeklyPlanPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg }}>
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {T.kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[28px] font-bold" style={{ color: kpiColors[i] }}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* AI */}
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: P.warnBg, border: "1px solid #FDE68A" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-4">
            {[{ label: T.weeks[0], data: week89, highlight: true }, { label: T.weeks[1], data: week90, highlight: false }, { label: T.weeks[2], data: week91, highlight: false }].map(w => (
              <div key={w.label} className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${w.highlight ? P.copper + "44" : P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: w.highlight ? P.copperLight : P.bg }}>
                  <span className="text-[12px] font-bold" style={{ color: w.highlight ? P.copper : P.text2 }}>{w.label}</span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: P.text3 }} />
                </div>
                <WeekTable activities={w.data} isHe={isHe} T={T} />
              </div>
            ))}
          </div>

          {/* Zone Progress */}
          <div className="rounded-2xl p-5 space-y-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.zoneProgress}</h3>
            {zoneProgress.map((z) => (
              <div key={z.zone}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold" style={{ color: P.text1 }}>{isHe ? z.labelHe : z.label}</span>
                  <span className="text-[13px] font-bold" style={{ color: z.color }}>{z.pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full" style={{ background: P.border }}>
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${z.pct}%`, background: z.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
