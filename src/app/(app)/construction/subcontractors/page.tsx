import { cookies } from "next/headers";
import { Bell, Plus, Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

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
    title: "Subcontractors", addSub: "Add Subcontractor",
    kpis: [
      { label: "Active Subs",       val: "14"   },
      { label: "Workers on Site",   val: "218"  },
      { label: "Avg Performance",   val: "82%"  },
      { label: "Open NCRs",         val: "6"    },
    ],
    ai: "Ambar Excavations is 11% below its performance target this month, linked to equipment availability issues. Gal Civil's concrete crew has the highest productivity score (94%) — consider expanding their scope to include Zone D piling support. 2 subcontractors have outstanding insurance certificate renewals due this week.",
    aiLabel: "AI Subcontractor Insight",
    colCompany: "Company", colTrade: "Trade", colWorkers: "Workers", colContract: "Contract Value",
    colPerf: "Performance", colSchedule: "Schedule", colNCRs: "Open NCRs", colStatus: "Status",
    ncrsTitle: "Recent NCRs",
  },
  he: {
    title: "קבלני משנה", addSub: "הוסף קבלן משנה",
    kpis: [
      { label: "קבלני משנה פעילים",  val: "14"   },
      { label: "עובדים באתר",        val: "218"  },
      { label: "ביצוע ממוצע",        val: "82%"  },
      { label: "NCR פתוחים",         val: "6"    },
    ],
    ai: "אמבר חפירות נמוכה ב-11% ממטרת הביצוע החודשית, עקב בעיות זמינות ציוד. צוות הבטון של גל אזרחי הציג את ציון הפרודוקטיביות הגבוה ביותר (94%) — שקול להרחיב היקפם לתמיכה בקידוח אזור D. 2 קבלני משנה ממתינים לחידוש תעודות ביטוח שפג תוקפן השבוע.",
    aiLabel: "תובנת AI לקבלני משנה",
    colCompany: "חברה", colTrade: "מקצוע", colWorkers: "עובדים", colContract: "שווי חוזה",
    colPerf: "ביצוע", colSchedule: "לוח זמנים", colNCRs: "NCR פתוחים", colStatus: "סטטוס",
    ncrsTitle: "NCR אחרונים",
  },
};

type SubStatus = "ACTIVE" | "ON HOLD" | "MOBILIZING";

const subcontractors: {
  company: string; companyHe: string; trade: string; tradeHe: string;
  workers: number; contract: string; perf: number; schedule: "ahead" | "on-track" | "behind";
  ncrs: number; status: SubStatus;
}[] = [
  { company:"Ambar Excavations Ltd.",       companyHe:"אמבר חפירות בע\"מ",       trade:"Earthworks & Excavation",    tradeHe:"עפר וחפירות",            workers:42, contract:"₪12.4M", perf:71, schedule:"behind",   ncrs:2, status:"ACTIVE"     },
  { company:"Gal Civil Engineering",        companyHe:"גל הנדסה אזרחית",         trade:"Concrete & Formwork",        tradeHe:"בטון וטפסנות",             workers:38, contract:"₪18.7M", perf:94, schedule:"ahead",    ncrs:0, status:"ACTIVE"     },
  { company:"Goldberg Drilling Co.",        companyHe:"חברת קידוח גולדברג",      trade:"Piling & Foundations",       tradeHe:"יסודות וקידוח",           workers:22, contract:"₪9.2M",  perf:88, schedule:"on-track", ncrs:1, status:"ACTIVE"     },
  { company:"Stern Traffic Management",    companyHe:"שטרן ניהול תנועה",         trade:"Traffic Control",            tradeHe:"ניהול תנועה",             workers:14, contract:"₪3.1M",  perf:96, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Mizrahi MEP Services",        companyHe:"מזרחי שירותי מ.מ.ח",      trade:"Mechanical, Elec. & Plumb.", tradeHe:"מ.מ.ח",                   workers:29, contract:"₪7.8M",  perf:79, schedule:"behind",   ncrs:1, status:"ACTIVE"     },
  { company:"Ben-David Steel Erectors",    companyHe:"בן-דוד קונסטרוקטורים",    trade:"Structural Steel",           tradeHe:"קונסטרוקציית פלדה",       workers:18, contract:"₪5.4M",  perf:85, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Peretz Road Surfacing",       companyHe:"פרץ כבישים ומשטחים",       trade:"Asphalt & Road Base",        tradeHe:"אספלט ושכבות בסיס",       workers:16, contract:"₪8.9M",  perf:82, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Haim Waterproofing",          companyHe:"חיים איטום",               trade:"Waterproofing & Drainage",   tradeHe:"איטום וניקוז",            workers:8,  contract:"₪2.3M",  perf:91, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Dror Safety Solutions",       companyHe:"דרור פתרונות בטיחות",      trade:"Safety & PPE Supply",        tradeHe:"בטיחות וציוד מגן",        workers:6,  contract:"₪1.2M",  perf:98, schedule:"ahead",    ncrs:0, status:"ACTIVE"     },
  { company:"Avivi Survey Engineering",    companyHe:"אביבי הנדסת מדידות",       trade:"Surveying & Setting-Out",    tradeHe:"מדידות וסימון",           workers:5,  contract:"₪1.8M",  perf:90, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Katz Crane Services",         companyHe:"קץ שירותי עגורנים",        trade:"Crane & Lifting Operations", tradeHe:"עגורנים והרמות",          workers:9,  contract:"₪4.6M",  perf:87, schedule:"on-track", ncrs:1, status:"ACTIVE"     },
  { company:"Eastern Shotcrete Ltd.",      companyHe:"מזרח שוטקריט בע\"מ",       trade:"Shotcrete & Sprayed Concrete",tradeHe:"שוטקריט ובטון מרוסס",    workers:7,  contract:"₪2.9M",  perf:83, schedule:"on-track", ncrs:0, status:"ACTIVE"     },
  { company:"Cohen Landscaping",           companyHe:"כהן נוף וגינון",           trade:"Landscaping & Revegetation", tradeHe:"נוף ושיקום צמחייה",       workers:3,  contract:"₪0.8M",  perf:75, schedule:"behind",   ncrs:1, status:"ON HOLD"    },
  { company:"Oren Electrical Contractors", companyHe:"אורן קבלני חשמל",         trade:"Electrical",                 tradeHe:"חשמל",                    workers:1,  contract:"₪3.4M",  perf:0,  schedule:"on-track", ncrs:0, status:"MOBILIZING" },
];

const ncrs = [
  { id:"NCR-041", sub:"Ambar Excavations",   desc:"Soil compaction test failed – Ch.3+100 Zone C (density 91% vs 95% required)", descHe:"בדיקת דחיסת קרקע נכשלה – ק\"מ 3+100 אזור C (צפיפות 91% לעומת 95% נדרש)", date:"1 Jul", status:"OPEN" },
  { id:"NCR-042", sub:"Ambar Excavations",   desc:"Excavation slope exceeded design angle – Zone D trench sec. 1",              descHe:"שיפוע חפירה חרג מזווית תכנון – תעלה אזור D קטע 1",                           date:"28 Jun", status:"OPEN" },
  { id:"NCR-043", sub:"Goldberg Drilling",   desc:"Pile verticality tolerance exceeded – pile #19, deviation 1.4% vs 1% allowed",descHe:"סטיית אנכיות יתד חרגה – יתד #19, סטייה 1.4% לעומת 1% מותר",               date:"26 Jun", status:"OPEN" },
  { id:"NCR-044", sub:"Mizrahi MEP",         desc:"Conduit installation not to approved drawing Rev.B – Zone A Section 2",      descHe:"התקנת צנרת לא לפי תכנון מאושר Rev.B – אזור A קטע 2",                         date:"25 Jun", status:"OPEN" },
  { id:"NCR-045", sub:"Katz Cranes",         desc:"Pre-lift check sheet not completed prior to 8t lift at Zone B",              descHe:"גיליון בדיקה לפני הרמה לא הושלם לפני הרמה 8 טון באזור B",                    date:"24 Jun", status:"OPEN" },
  { id:"NCR-046", sub:"Cohen Landscaping",   desc:"Planted species substitution not approved by engineer before planting",       descHe:"החלפת מין צמח לא אושרה על ידי המהנדס לפני שתילה",                            date:"22 Jun", status:"OPEN" },
];

const statusStyle: Record<SubStatus, { bg: string; color: string }> = {
  ACTIVE:     { bg: P.goodBg,  color: P.good   },
  "ON HOLD":  { bg: P.warnBg,  color: P.warn   },
  MOBILIZING: { bg: "#EFF6FF", color: "#1D4ED8" },
};

const kpiColors = [P.text1, P.copper, P.good, P.danger];

export default async function SubcontractorsPage() {
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
            <Plus className="w-3 h-3" /> {T.addSub}
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
          {/* Sub table */}
          <div className="col-span-2 rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colCompany, T.colTrade, T.colWorkers, T.colContract, T.colPerf, T.colSchedule, T.colNCRs, T.colStatus].map(h => (
                    <th key={h} className="px-3 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subcontractors.map((s) => {
                  const ss = statusStyle[s.status];
                  const perfColor = s.perf >= 90 ? P.good : s.perf >= 80 ? P.warn : s.status === "MOBILIZING" ? P.text3 : P.danger;
                  return (
                    <tr key={s.company} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: P.text1 }}>{isHe ? s.companyHe : s.company}</td>
                      <td className="px-3 py-2.5" style={{ color: P.text2 }}>{isHe ? s.tradeHe : s.trade}</td>
                      <td className="px-3 py-2.5 text-center font-bold" style={{ color: P.text1 }}>{s.workers}</td>
                      <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: P.text1 }}>{s.contract}</td>
                      <td className="px-3 py-2.5">
                        {s.status === "MOBILIZING" ? (
                          <span className="text-[11px]" style={{ color: P.text3 }}>—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: P.border }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${s.perf}%`, background: perfColor }} />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: perfColor }}>{s.perf}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {s.schedule === "ahead"    && <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: P.good }}><TrendingUp className="w-3 h-3" />Ahead</span>}
                        {s.schedule === "on-track" && <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#1D4ED8" }}><CheckCircle2 className="w-3 h-3" />On Track</span>}
                        {s.schedule === "behind"   && <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: P.danger }}><TrendingDown className="w-3 h-3" />Behind</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {s.ncrs > 0
                          ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: P.dangerBg, color: P.danger }}>{s.ncrs}</span>
                          : <span className="text-[11px] font-bold" style={{ color: P.text3 }}>—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{s.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* NCRs */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.ncrsTitle}</h3>
            {ncrs.map((n) => (
              <div key={n.id} className="p-3 rounded-xl" style={{ background: P.dangerBg, border: "1px solid #FECACA" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold font-mono" style={{ color: P.danger }}>{n.id}</span>
                  <span className="text-[10px]" style={{ color: P.text3 }}>{n.date}</span>
                </div>
                <p className="text-[11px] font-semibold mb-0.5" style={{ color: P.text2 }}>{n.sub}</p>
                <p className="text-[11.5px] leading-snug" style={{ color: P.text1 }}>{isHe ? n.descHe : n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
