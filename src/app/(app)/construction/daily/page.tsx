import { cookies } from "next/headers";
import { Bell, Plus, CheckCircle2, Clock, AlertCircle, XCircle, Lightbulb, Filter } from "lucide-react";

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
    title: "Daily Tasks", date: "Wednesday, 2 July 2026",
    newTask: "New Task", filter: "Filter",
    kpis: [
      { label: "Assigned Today", val: "28" },
      { label: "Completed",      val: "12" },
      { label: "In Progress",    val: "11" },
      { label: "Blocked",        val: "5"  },
    ],
    ai: "5 tasks in Zone D are blocked pending utility relocation sign-off. Rescheduling concrete pour in Zone B to Friday will free 3 crews for Zone D recovery. Night shift coverage is under-resourced — recommend adding 2 supervisors.",
    aiLabel: "AI Work Plan Insight",
    colTask: "Task", colZone: "Zone", colCrew: "Crew", colPriority: "Priority",
    colStart: "Start", colEnd: "End", colStatus: "Status",
  },
  he: {
    title: "משימות יומיות", date: "רביעי, 2 יולי 2026",
    newTask: "משימה חדשה", filter: "סינון",
    kpis: [
      { label: "הוקצו היום",    val: "28" },
      { label: "הושלמו",        val: "12" },
      { label: "בביצוע",        val: "11" },
      { label: "חסומות",        val: "5"  },
    ],
    ai: "5 משימות באזור D חסומות ממתינות לאישור העברת תשתיות. הזזת יציקת הבטון באזור B ליום שישי תשחרר 3 צוותים להתאוששות אזור D. כיסוי משמרת הלילה אינו מספיק — מומלץ להוסיף 2 מפקחים.",
    aiLabel: "תובנת AI לתכנית עבודה",
    colTask: "משימה", colZone: "אזור", colCrew: "צוות", colPriority: "עדיפות",
    colStart: "התחלה", colEnd: "סיום", colStatus: "סטטוס",
  },
};

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Status   = "COMPLETE" | "IN PROGRESS" | "PENDING" | "BLOCKED";

const tasks: {
  id: string; task: string; taskHe: string; zone: string;
  crew: string; priority: Priority; start: string; end: string; status: Status;
}[] = [
  { id:"DT-001", task:"Concrete pour – Bridge pier P7 (North face)",          taskHe:"יציקת בטון – כן גשר P7 (פנים צפוני)",           zone:"B", crew:"Crew A – Levy",      priority:"CRITICAL",  start:"06:00", end:"14:00", status:"IN PROGRESS" },
  { id:"DT-002", task:"Rebar fabrication – Zone C pile cage #22-#28",          taskHe:"עיבוד ברזל – כלוב קידוח אזור C #22-#28",         zone:"C", crew:"Crew B – Peretz",    priority:"HIGH",      start:"06:00", end:"15:00", status:"IN PROGRESS" },
  { id:"DT-003", task:"Formwork stripping – Bridge deck segment 4A",           taskHe:"פירוק קינוף – מקטע גשר 4A",                       zone:"B", crew:"Crew C – Dror",      priority:"HIGH",      start:"07:00", end:"13:00", status:"COMPLETE"    },
  { id:"DT-004", task:"Earthworks cut – Ch.3+400 to Ch.3+600",                taskHe:"חפירה – ק\"מ 3+400 עד 3+600",                       zone:"C", crew:"Crew D – Cohen",     priority:"HIGH",      start:"06:00", end:"16:00", status:"IN PROGRESS" },
  { id:"DT-005", task:"Utility trench excavation – Zone D (Section 2)",       taskHe:"חפירת תעלת תשתיות – אזור D (קטע 2)",              zone:"D", crew:"Crew E – Ben-Ami",   priority:"CRITICAL",  start:"07:00", end:"17:00", status:"BLOCKED"     },
  { id:"DT-006", task:"Road base compaction – Section A Ch.0+000–0+500",      taskHe:"דחיסת שכבת בסיס – קטע A ק\"מ 0+000–0+500",        zone:"A", crew:"Crew F – Mizrahi",   priority:"MEDIUM",    start:"07:00", end:"15:30", status:"COMPLETE"    },
  { id:"DT-007", task:"Install drainage culvert – Zone A STA 0+220",          taskHe:"התקנת תעלת ניקוז – אזור A עמדה 0+220",            zone:"A", crew:"Crew G – Katz",      priority:"MEDIUM",    start:"08:00", end:"14:00", status:"COMPLETE"    },
  { id:"DT-008", task:"Pre-pour survey check – Pier P8 formwork dimensions",  taskHe:"בדיקת מדידה לפני יציקה – מימדי קינוף כן P8",      zone:"B", crew:"Surveyor – Shapira", priority:"HIGH",      start:"09:00", end:"11:00", status:"COMPLETE"    },
  { id:"DT-009", task:"Retaining wall backfill – Zone C Section 3",           taskHe:"מילוי אחורי קיר תומך – אזור C קטע 3",             zone:"C", crew:"Crew B – Peretz",    priority:"MEDIUM",    start:"13:00", end:"17:00", status:"PENDING"     },
  { id:"DT-010", task:"Fuel storage relocation – Zone D emergency action",    taskHe:"העברת מיכל דלק – אזור D פעולת חירום",             zone:"D", crew:"HSE – Ben-Ami",      priority:"CRITICAL",  start:"08:00", end:"10:00", status:"BLOCKED"     },
  { id:"DT-011", task:"Pile drilling – Positions 29–34, Zone C",              taskHe:"קידוח יסודות – עמדות 29–34, אזור C",              zone:"C", crew:"Drill – Goldberg",   priority:"HIGH",      start:"06:00", end:"18:00", status:"IN PROGRESS" },
  { id:"DT-012", task:"Night shift preparation – Zone B lighting setup",      taskHe:"הכנת משמרת לילה – התקנת תאורה אזור B",            zone:"B", crew:"Crew A – Levy",      priority:"MEDIUM",    start:"15:00", end:"17:00", status:"PENDING"     },
  { id:"DT-013", task:"Topsoil strip – Zone D expansion area (400 m²)",       taskHe:"הסרת קרקע עליונה – שטח הרחבה אזור D (400 מ\"ר)",  zone:"D", crew:"Crew H – Avivi",     priority:"LOW",       start:"09:00", end:"16:00", status:"BLOCKED"     },
  { id:"DT-014", task:"Install traffic management – New diversion Route 20N", taskHe:"התקנת ניהול תנועה – הסטה חדשה כביש 20N",          zone:"A", crew:"Traffic – Stern",    priority:"HIGH",      start:"05:30", end:"08:00", status:"COMPLETE"    },
  { id:"DT-015", task:"Shotcrete – Bridge abutment back wall Zone B",         taskHe:"שוטקריט – קיר אחורי משקוף גשר אזור B",            zone:"B", crew:"Crew C – Dror",      priority:"MEDIUM",    start:"14:00", end:"18:00", status:"PENDING"     },
];

const priorityStyle: Record<Priority, { bg: string; color: string }> = {
  CRITICAL: { bg: "#FEF2F2", color: "#991B1B" },
  HIGH:     { bg: "#FFFBEB", color: "#92400E" },
  MEDIUM:   { bg: "#EFF6FF", color: "#1D4ED8" },
  LOW:      { bg: P.goodBg,  color: P.good    },
};
const statusStyle: Record<Status, { bg: string; color: string; icon: React.FC<{ className?: string }> }> = {
  "COMPLETE":    { bg: P.goodBg,   color: P.good,    icon: CheckCircle2  },
  "IN PROGRESS": { bg: "#EFF6FF",  color: "#1D4ED8", icon: Clock         },
  "PENDING":     { bg: P.warnBg,   color: P.warn,    icon: Clock         },
  "BLOCKED":     { bg: P.dangerBg, color: P.danger,  icon: XCircle       },
};

const kpiColors = [P.text1, P.good, "#1D4ED8", P.danger];

export default async function DailyTasksPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg }}>
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <p className="text-[11px]" style={{ color: P.text3 }}>{T.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border"
            style={{ color: P.text2, borderColor: P.border, background: P.card }}>
            <Filter className="w-3.5 h-3.5" /> {T.filter}
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newTask}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {T.kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[28px] font-bold" style={{ color: kpiColors[i] }}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: P.warnBg, border: "1px solid #FDE68A" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["ID", T.colTask, T.colZone, T.colCrew, T.colPriority, T.colStart, T.colEnd, T.colStatus].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const ps = priorityStyle[t.priority];
                const ss = statusStyle[t.status];
                const StatusIcon = ss.icon;
                return (
                  <tr key={t.id} className="transition-colors hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text3 }}>{t.id}</td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <p className="font-medium leading-snug" style={{ color: P.text1 }}>{isHe ? t.taskHe : t.task}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: P.copperLight, color: P.copper }}>{t.zone}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{t.crew}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: ps.bg, color: ps.color }}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: P.text3 }}>{t.start}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: P.text3 }}>{t.end}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit"
                        style={{ background: ss.bg, color: ss.color }}>
                        <StatusIcon className="w-3 h-3" />{t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
