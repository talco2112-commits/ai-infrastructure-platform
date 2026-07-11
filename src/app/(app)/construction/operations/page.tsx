import { cookies } from "next/headers";
import { Bell, Plus, Lightbulb, AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";

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
    title: "Special Operations", newOp: "New Operation",
    kpis: [
      { label: "Active Permits",        val: "3"  },
      { label: "Upcoming (7 days)",     val: "5"  },
      { label: "Completed This Month",  val: "18" },
      { label: "Expired / Cancelled",   val: "2"  },
    ],
    ai: "Night shift permit for Zone B expires tomorrow — renew before 22:00 or all night pours must stop. Crane lift OP-054 requires wind speed under 40 km/h; forecast shows 55 km/h on Friday — reschedule to Saturday morning. Lane closure OP-057 needs traffic authority co-signature — follow up today.",
    aiLabel: "AI Operations Alert",
    colID: "Op #", colType: "Type", colDesc: "Description", colZone: "Zone",
    colDate: "Date / Time", colPermit: "Permit #", colSupervisor: "Supervisor", colStatus: "Status",
    upcomingTitle: "Upcoming Special Operations",
  },
  he: {
    title: "פעולות מיוחדות", newOp: "פעולה חדשה",
    kpis: [
      { label: "היתרים פעילים",     val: "3"  },
      { label: "קרובות (7 ימים)",   val: "5"  },
      { label: "הושלמו החודש",       val: "18" },
      { label: "פגו/בוטלו",          val: "2"  },
    ],
    ai: "היתר משמרת לילה אזור B פג מחר — חדש לפני 22:00 אחרת כל יציקות הלילה יופסקו. הרמת עגורן OP-054 מצריכה מהירות רוח מתחת ל-40 ק\"מ/ש; תחזית מראה 55 ק\"מ/ש ביום שישי — תזמן מחדש לבוקר שבת. סגירת נתיב OP-057 צריכה חתימת-שותף מרשות התנועה — בצע מעקב היום.",
    aiLabel: "התראת AI לפעולות",
    colID: "מס' פעולה", colType: "סוג", colDesc: "תיאור", colZone: "אזור",
    colDate: "תאריך / שעה", colPermit: "מס' היתר", colSupervisor: "מפקח", colStatus: "סטטוס",
    upcomingTitle: "פעולות מיוחדות קרובות",
  },
};

type OpStatus = "ACTIVE" | "COMPLETE" | "PENDING APPROVAL" | "CANCELLED" | "EXPIRED";

const operations: {
  id: string; type: string; typeHe: string; desc: string; descHe: string;
  zone: string; datetime: string; permit: string; supervisor: string; status: OpStatus;
}[] = [
  { id:"OP-048", type:"Night Shift",         typeHe:"משמרת לילה",    desc:"Night concrete pour – Bridge pier P7",          descHe:"יציקת בטון לילה – כן גשר P7",          zone:"B", datetime:"1 Jul 22:00–04:00", permit:"NS-2026-31", supervisor:"Foreman Levy",    status:"COMPLETE"         },
  { id:"OP-049", type:"Crane Lift",          typeHe:"הרמת עגורן",    desc:"Steel cage lift – 18t pile cage positions 27–28",descHe:"הרמת כלוב פלדה – 18 טון, עמדות 27–28", zone:"C", datetime:"2 Jul 07:00–10:00", permit:"CL-2026-44", supervisor:"S.O. Dror Katz", status:"ACTIVE"           },
  { id:"OP-050", type:"Night Shift",         typeHe:"משמרת לילה",    desc:"Night shift Zone B – P7 formwork stripping",    descHe:"משמרת לילה – פירוק טפסנות P7 אזור B",   zone:"B", datetime:"2 Jul 22:00–04:00", permit:"NS-2026-32", supervisor:"Foreman Dror",   status:"ACTIVE"           },
  { id:"OP-051", type:"Concrete Pour",       typeHe:"יציקת בטון",    desc:"Bridge pier P8 – 185m³ pour",                  descHe:"יציקת כן גשר P8 – 185 מ\"ק",           zone:"B", datetime:"3 Jul 06:00–16:00", permit:"CP-2026-18", supervisor:"Eng. Cohen",     status:"PENDING APPROVAL" },
  { id:"OP-052", type:"Blasting",            typeHe:"פיצוץ",         desc:"Rock blasting – Zone D utility corridor sec. 3",descHe:"פיצוץ סלע – פרוזדור תשתיות אזור D קטע 3",zone:"D",datetime:"5 Jul 09:00–11:00", permit:"BL-2026-09", supervisor:"S.O. Ben-Ami",   status:"PENDING APPROVAL" },
  { id:"OP-053", type:"Lane Closure",        typeHe:"סגירת נתיב",    desc:"Full closure Route 20N – bridge falsework removal",descHe:"סגירת מסלול כביש 20N – פינוי שלד גשר",zone:"B", datetime:"6 Jul 00:00–05:00", permit:"LC-2026-14", supervisor:"Traffic – Stern", status:"PENDING APPROVAL" },
  { id:"OP-054", type:"Crane Lift",          typeHe:"הרמת עגורן",    desc:"Precast girder lift – 28t Bridge Zone B",       descHe:"הרמת קורה מוגמרת – 28 טון, גשר אזור B",zone:"B", datetime:"4 Jul 07:00–15:00", permit:"CL-2026-45", supervisor:"S.O. Dror Katz", status:"PENDING APPROVAL" },
  { id:"OP-055", type:"Confined Space",      typeHe:"מרחב מצומצם",   desc:"Utility inspection – manhole UC-14 Zone A",     descHe:"בדיקת תשתיות – בור ביקורת UC-14 אזור A",zone:"A",datetime:"3 Jul 10:00–12:00", permit:"CS-2026-21", supervisor:"Eng. Mizrahi",   status:"ACTIVE"           },
  { id:"OP-056", type:"Demolition",          typeHe:"הריסה",         desc:"Remove old retaining wall – Zone C sec. 1",     descHe:"הסרת קיר תומך ישן – אזור C קטע 1",     zone:"C", datetime:"7 Jul 07:00–16:00", permit:"DM-2026-07", supervisor:"Foreman Peretz", status:"PENDING APPROVAL" },
  { id:"OP-057", type:"Lane Closure",        typeHe:"סגירת נתיב",    desc:"Emergency lane closure – Bridge Zone B pour",   descHe:"סגירת נתיב חירום – יציקת גשר אזור B",   zone:"B", datetime:"8 Jul 05:00–19:00", permit:"LC-2026-15", supervisor:"Traffic – Stern", status:"PENDING APPROVAL" },
  { id:"OP-044", type:"Night Shift",         typeHe:"משמרת לילה",    desc:"Night shift cancelled – Zone D access blocked",  descHe:"משמרת לילה בוטלה – גישה לאזור D חסומה", zone:"D", datetime:"28 Jun",            permit:"NS-2026-29", supervisor:"Crew E",         status:"CANCELLED"        },
  { id:"OP-045", type:"Crane Lift",          typeHe:"הרמת עגורן",    desc:"Lift postponed – high wind conditions",          descHe:"הרמה נדחתה – תנאי רוח חזקים",          zone:"B", datetime:"30 Jun",            permit:"CL-2026-42", supervisor:"S.O. Dror Katz", status:"EXPIRED"          },
];

const statusStyle: Record<OpStatus, { bg: string; color: string }> = {
  ACTIVE:             { bg: P.goodBg,   color: P.good    },
  COMPLETE:           { bg: "#F1F5F9",  color: "#475569" },
  "PENDING APPROVAL": { bg: P.warnBg,   color: P.warn    },
  CANCELLED:          { bg: P.dangerBg, color: P.danger  },
  EXPIRED:            { bg: P.dangerBg, color: "#7F1D1D" },
};

const typeColors: Record<string, string> = {
  "Night Shift": "#5B21B6", "Crane Lift": "#1D4ED8", "Concrete Pour": P.copper,
  Blasting: P.danger, "Lane Closure": "#B45309", "Confined Space": "#0F766E",
  Demolition: "#7F1D1D",
};
const kpiColors = [P.good, "#1D4ED8", P.copper, P.danger];

export default async function OperationsPage() {
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
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white" style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newOp}
          </button>
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
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: P.dangerBg, border: "1px solid #FECACA" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        {/* Operations Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colID, T.colType, T.colDesc, T.colZone, T.colDate, T.colPermit, T.colSupervisor, T.colStatus].map(h => (
                  <th key={h} className="px-3 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => {
                const ss = statusStyle[op.status];
                const typeColor = typeColors[op.type] ?? P.text2;
                return (
                  <tr key={op.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{op.id}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: typeColor + "18", color: typeColor }}>
                        {isHe ? op.typeHe : op.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 max-w-[220px] font-medium" style={{ color: P.text1 }}>{isHe ? op.descHe : op.desc}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: P.copperLight, color: P.copper }}>{op.zone}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px] whitespace-nowrap" style={{ color: P.text2 }}>{op.datetime}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{op.permit}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: P.text2 }}>{op.supervisor}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: ss.bg, color: ss.color }}>{op.status}</span>
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
