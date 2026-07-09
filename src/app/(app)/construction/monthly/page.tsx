import { cookies } from "next/headers";
import { Bell, Lightbulb, CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react";

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
    title: "Monthly Plan – July 2026",
    kpis: [
      { label: "Month Progress",         val: "6%"  },
      { label: "Milestones This Month",  val: "8"   },
      { label: "Milestones Achieved",    val: "1"   },
      { label: "Activities At Risk",     val: "4"   },
    ],
    ai: "July is a critical month — Bridge P8 pour and Zone D utilities are both on the critical path. If Zone D remains blocked past 10 July, August milestones for abutment works will slip by ~18 days. Recommend daily escalation meetings until Zone D access is resolved.",
    aiLabel: "AI Monthly Outlook",
    milestoneTitle: "July Milestones",
    planTitle: "Monthly Activity Plan by Zone",
    colActivity: "Activity", colZone: "Zone", colPlanned: "Planned", colActual: "Actual", colVariance: "Variance", colStatus: "Status",
    colMs: "Milestone", colDate: "Target Date", colOwner: "Owner", colMsStatus: "Status",
  },
  he: {
    title: "תכנון חודשי – יולי 2026",
    kpis: [
      { label: "התקדמות חודשית",         val: "6%"  },
      { label: "אבני דרך החודש",         val: "8"   },
      { label: "אבני דרך שהושגו",        val: "1"   },
      { label: "פעילויות בסיכון",        val: "4"   },
    ],
    ai: "יולי הוא חודש קריטי — יציקת גשר P8 ותשתיות אזור D נמצאים שניהם בנתיב הקריטי. אם אזור D יישאר חסום אחרי 10 יולי, אבני דרך אוגוסט לעבודות משקוף ידחו בכ-18 יום. מומלץ לקיים פגישות הסלמה יומיות עד פתרון הגישה לאזור D.",
    aiLabel: "תחזית AI חודשית",
    milestoneTitle: "אבני דרך יולי",
    planTitle: "תכנית פעולה חודשית לפי אזור",
    colActivity: "פעילות", colZone: "אזור", colPlanned: "מתוכנן", colActual: "בפועל", colVariance: "סטייה", colStatus: "סטטוס",
    colMs: "אבן דרך", colDate: "תאריך יעד", colOwner: "אחראי", colMsStatus: "סטטוס",
  },
};

type MsStatus = "ACHIEVED" | "ON TRACK" | "AT RISK" | "NOT STARTED";
type ActStatus2 = "ON TRACK" | "AT RISK" | "BEHIND" | "COMPLETE";

const milestones: { ms: string; msHe: string; date: string; owner: string; status: MsStatus }[] = [
  { ms:"Complete Zone A road base (Sec. A)",      msHe:"השלמת שכבת בסיס אזור A (קטע A)",    date:"6 Jul",  owner:"Eng. Mizrahi",  status:"ON TRACK"    },
  { ms:"Complete Bridge P8 concrete pour",        msHe:"השלמת יציקת בטון כן P8",             date:"8 Jul",  owner:"Eng. Cohen",    status:"AT RISK"     },
  { ms:"Complete pile drilling Zone C (42 piles)",msHe:"השלמת קידוח יסודות אזור C (42 יתד)",date:"13 Jul", owner:"Drill Co.",     status:"ON TRACK"    },
  { ms:"Zone D utility trench complete 50%",      msHe:"השלמת 50% תעלת תשתיות אזור D",      date:"15 Jul", owner:"Eng. Ben-Ami",  status:"AT RISK"     },
  { ms:"Bridge deck formwork segment 5A",         msHe:"טפסנות מקטע גשר 5A",                  date:"16 Jul", owner:"Foreman Dror",  status:"NOT STARTED" },
  { ms:"Section B road base start",               msHe:"תחילת שכבת בסיס קטע B",              date:"18 Jul", owner:"Crew F – Peretz",status:"NOT STARTED"},
  { ms:"Bridge P8 deck pour",                     msHe:"יציקת סיפון גשר P8",                 date:"22 Jul", owner:"Eng. Cohen",    status:"NOT STARTED" },
  { ms:"Drainage installation Zone A complete",   msHe:"השלמת מערכת ניקוז אזור A",           date:"31 Jul", owner:"Crew G – Katz", status:"ACHIEVED"    },
];

const monthlyActivities: { activity: string; actHe: string; zone: string; planned: string; actual: string; variance: string; status: ActStatus2 }[] = [
  { activity:"Bridge pier concrete (P7, P8, P9)",      actHe:"יציקת כני גשר (P7, P8, P9)",        zone:"B", planned:"3 pours",  actual:"1 pour",    variance:"-2 pours", status:"AT RISK"  },
  { activity:"Bridge deck formwork (seg. 5A–6A)",      actHe:"טפסנות סיפון גשר (מקטע 5A–6A)",      zone:"B", planned:"560 m²",   actual:"0 m²",      variance:"—",        status:"NOT STARTED" as ActStatus2 },
  { activity:"Pile drilling completion",               actHe:"השלמת קידוח יסודות",                  zone:"C", planned:"42 piles", actual:"34 piles",  variance:"-8 piles", status:"ON TRACK" },
  { activity:"Earthworks – Zone C cut & fill",         actHe:"עפר – כריה ומילוי אזור C",           zone:"C", planned:"12,000 m³",actual:"6,800 m³",  variance:"-5,200",   status:"ON TRACK" },
  { activity:"Zone D utility trench excav. & install", actHe:"חפירה והתקנת תשתיות אזור D",         zone:"D", planned:"800 lm",   actual:"0 lm",      variance:"-800 lm",  status:"BEHIND"   },
  { activity:"Zone A road base compaction",            actHe:"דחיסת שכבת בסיס אזור A",             zone:"A", planned:"2,400 m²", actual:"1,500 m²",  variance:"-900 m²",  status:"ON TRACK" },
  { activity:"Drainage culvert Zone A",                actHe:"תעלות ניקוז אזור A",                  zone:"A", planned:"4 culverts",actual:"4 culverts",variance:"0",        status:"COMPLETE" },
  { activity:"Traffic management update – Jul",        actHe:"עדכון ניהול תנועה – יולי",           zone:"A", planned:"1 update", actual:"1 update",  variance:"0",        status:"COMPLETE" },
];

const msStatusStyle: Record<MsStatus, { bg: string; color: string; icon: React.FC<{ className?: string; style?: React.CSSProperties }> }> = {
  ACHIEVED:    { bg: P.goodBg,   color: P.good,    icon: CheckCircle2  },
  "ON TRACK":  { bg: "#EFF6FF",  color: "#1D4ED8", icon: Clock         },
  "AT RISK":   { bg: P.dangerBg, color: P.danger,  icon: AlertTriangle },
  "NOT STARTED":{ bg: P.bg,     color: P.text3,   icon: Circle        },
};
const actStatusStyle: Record<ActStatus2, { bg: string; color: string }> = {
  "ON TRACK":    { bg: "#EFF6FF",  color: "#1D4ED8" },
  "AT RISK":     { bg: P.dangerBg, color: P.danger  },
  BEHIND:        { bg: P.warnBg,   color: P.warn    },
  COMPLETE:      { bg: P.goodBg,   color: P.good    },
  "NOT STARTED": { bg: P.bg,       color: P.text3   },
} as Record<ActStatus2, { bg: string; color: string }>;

const kpiColors = [P.copper, P.text1, P.good, P.danger];

export default async function MonthlyPlanPage() {
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

        <div className="grid grid-cols-3 gap-4">
          {/* Milestones */}
          <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.milestoneTitle}</h3>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {milestones.map((m) => {
                const ss = msStatusStyle[m.status];
                const Icon = ss.icon;
                return (
                  <div key={m.ms} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: ss.bg }}>
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ss.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold leading-snug" style={{ color: P.text1 }}>{isHe ? m.msHe : m.ms}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px]" style={{ color: P.text3 }}>{m.date}</span>
                        <span className="text-[10px] font-bold" style={{ color: ss.color }}>{m.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Activities */}
          <div className="col-span-2 rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.planTitle}</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colActivity, T.colZone, T.colPlanned, T.colActual, T.colVariance, T.colStatus].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyActivities.map((a) => {
                  const ss = actStatusStyle[a.status] ?? { bg: P.bg, color: P.text3 };
                  return (
                    <tr key={a.activity} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-4 py-3 font-medium" style={{ color: P.text1 }}>{isHe ? a.actHe : a.activity}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: P.copperLight, color: P.copper }}>{a.zone}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text2 }}>{a.planned}</td>
                      <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text1 }}>{a.actual}</td>
                      <td className="px-4 py-3 font-mono text-[11px]" style={{ color: a.variance.startsWith("-") ? P.warn : P.good }}>{a.variance}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{a.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
