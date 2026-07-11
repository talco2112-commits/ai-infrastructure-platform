import { cookies } from "next/headers";
import { Bell, Plus, Sun, CloudRain, Cloud, Users, AlertTriangle, Lightbulb, Camera } from "lucide-react";

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
    title: "Site Diary", newEntry: "New Entry",
    today: "Wednesday, 2 July 2026", weather: "Clear / 31°C",
    crew: "Workers on Site", visitors: "Visitors",
    workTitle: "Work Activities", issuesTitle: "Issues & Observations", photosTitle: "Site Photos",
    ai: "Concrete pour at P7 progressing well — 87m³ placed by 13:00. Zone D utility trench blocked by land access dispute; expect 2-day delay if unresolved by tomorrow. Daily manhours 1,842 — highest this month.",
    aiLabel: "AI Diary Summary",
    colZone: "Zone", colActivity: "Activity", colCrew: "Crew", colQty: "Qty / Units", colNote: "Notes",
    colType: "Type", colDesc: "Description", colReporter: "Reporter", colAction: "Action",
    photos: "Photo documentation (8 photos uploaded today)",
  },
  he: {
    title: "יומן אתר", newEntry: "רשומה חדשה",
    today: "רביעי, 2 יולי 2026", weather: "בהיר / 31°C",
    crew: "עובדים באתר", visitors: "מבקרים",
    workTitle: "פעילויות עבודה", issuesTitle: "נושאים ותצפיות", photosTitle: "תמונות מהאתר",
    ai: "יציקת הבטון בכן P7 מתקדמת היטב — 87 מ\"ק הונחו עד 13:00. תעלת תשתיות אזור D חסומה בשל סכסוך גישה לקרקע; צפי עיכוב יומיים אם לא ייפתר מחר. שעות עבודה יומיות 1,842 — הגבוהות החודש.",
    aiLabel: "סיכום יומן AI",
    colZone: "אזור", colActivity: "פעילות", colCrew: "צוות", colQty: "כמות / יחידות", colNote: "הערות",
    colType: "סוג", colDesc: "תיאור", colReporter: "מדווח", colAction: "פעולה",
    photos: "תיעוד צילום (8 תמונות הועלו היום)",
  },
};

const workActivities = [
  { zone:"A", activity:"Road base layer compaction – Sec. A, Ch.0+000–0+500", actHe:"דחיסת שכבת בסיס – קטע A ק\"מ 0+000–0+500", crew:"Crew F – Mizrahi",  qty:"500 m", note:"Passed compaction test (98% MDD)", noteHe:"עבר בדיקת דחיסה (98% MDD)" },
  { zone:"A", activity:"Drainage culvert installation at STA 0+220",           actHe:"התקנת תעלת ניקוז בעמדה 0+220",            crew:"Crew G – Katz",    qty:"1 no.",  note:"Complete",                       noteHe:"הושלם"            },
  { zone:"B", activity:"Concrete pour – Bridge pier P7 (North face)",          actHe:"יציקת בטון – כן גשר P7 (פנים צפוני)",    crew:"Crew A – Levy",    qty:"87 m³",  note:"Pour ongoing, est. complete 16:00", noteHe:"יציקה בביצוע, צפי סיום 16:00" },
  { zone:"B", activity:"Formwork stripping – Bridge deck segment 4A",          actHe:"פירוק טפסנות – מקטע גשר 4A",              crew:"Crew C – Dror",    qty:"180 m²", note:"Complete",                       noteHe:"הושלם"            },
  { zone:"C", activity:"Pile drilling – Positions 29–34",                      actHe:"קידוח יסודות – עמדות 29–34",             crew:"Drill – Goldberg", qty:"6 piles",note:"4 of 6 complete, 2 ongoing",     noteHe:"4 מתוך 6 הושלמו, 2 בביצוע" },
  { zone:"C", activity:"Rebar fabrication – Pile cage #22–#28",               actHe:"עיבוד ברזל – כלוב קידוח #22–#28",        crew:"Crew B – Peretz",  qty:"7.2 t",  note:"Complete, delivered to Zone C",  noteHe:"הושלם, נמסר לאזור C" },
  { zone:"D", activity:"Utility trench excavation – Section 2",               actHe:"חפירת תעלת תשתיות – קטע 2",              crew:"Crew E – Ben-Ami", qty:"0 m",    note:"BLOCKED – land access dispute",  noteHe:"חסום – סכסוך גישה לקרקע" },
];

const issues = [
  { type:"Blocker",   desc:"Utility trench Zone D – private land access blocked by owner",               descHe:"תעלת תשתיות אזור D – גישה לקרקע פרטית חסומה על ידי הבעלים", reporter:"Eng. Cohen",      action:"Escalated to legal team – resolution by 3 Jul", actionHe:"הועבר לצוות משפטי – פתרון עד 3 ביולי" },
  { type:"Issue",     desc:"Concrete pump #2 hydraulic oil leak – removed from service",                  descHe:"דליפת שמן הידראולי במשאבת בטון #2 – הוצאה משירות",            reporter:"Foreman Levy",    action:"Maintenance crew dispatched, repair by 14:00",  actionHe:"צוות תחזוקה נשלח, תיקון עד 14:00" },
  { type:"Positive",  desc:"Zone B pile crew completed safety audit with zero findings",                   descHe:"צוות יסודות אזור B השלים ביקורת בטיחות ללא ממצאים",           reporter:"S.O. Ben-Ami",    action:"Recorded in safety log",                       actionHe:"תועד ביומן בטיחות" },
  { type:"Near Miss", desc:"Near-miss: crane slew near unsupervised pedestrian path at Zone C",           descHe:"כמעט-תאונה: עגורן סב ליד שביל הולכי רגל לא מפוקח באזור C",  reporter:"S.O. Dror Katz",  action:"Pedestrian path barricaded, briefing conducted", actionHe:"שביל הוגדר, הועברה הנחיה" },
];

const issueStyle: Record<string, { bg: string; color: string }> = {
  "Blocker":   { bg: P.dangerBg, color: P.danger },
  "Issue":     { bg: P.warnBg,   color: P.warn   },
  "Positive":  { bg: P.goodBg,   color: P.good   },
  "Near Miss": { bg: "#FEF2F2",  color: "#7F1D1D" },
};

export default async function SiteDiaryPage() {
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
          <p className="text-[11px]" style={{ color: P.text3 }}>{T.today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newEntry}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Day Summary Bar */}
        <div className="rounded-2xl p-5 grid grid-cols-4 gap-6"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <div className="flex items-center gap-3">
            <Sun className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{isHe ? "מזג אוויר" : "Weather"}</p>
              <p className="text-[16px] font-bold" style={{ color: P.text1 }}>{T.weather}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.copperLight }}>
              <Users className="w-5 h-5" style={{ color: P.copper }} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{T.crew}</p>
              <p className="text-[24px] font-bold" style={{ color: P.text1 }}>312</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{T.visitors}</p>
              <p className="text-[24px] font-bold" style={{ color: P.text1 }}>4</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.goodBg }}>
              <span className="text-[18px] font-bold" style={{ color: P.good }}>1842</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{isHe ? "שעות עבודה" : "Manhours"}</p>
              <p className="text-[12px] font-semibold" style={{ color: P.good }}>{isHe ? "גבוה ביותר החודש" : "Highest this month"}</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
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

        <div className="grid grid-cols-3 gap-4">
          {/* Work Activities */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.workTitle}</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colZone, T.colActivity, T.colCrew, T.colQty, T.colNote].map(h => (
                    <th key={h} className="px-4 py-2.5 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workActivities.map((a, i) => (
                  <tr key={i} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: P.copperLight, color: P.copper }}>{a.zone}</span>
                    </td>
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <p className="leading-snug font-medium" style={{ color: P.text1 }}>{isHe ? a.actHe : a.activity}</p>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text2 }}>{a.crew}</td>
                    <td className="px-4 py-2.5 font-mono font-bold whitespace-nowrap" style={{ color: P.text1 }}>{a.qty}</td>
                    <td className="px-4 py-2.5" style={{ color: a.note.includes("BLOCKED") ? P.danger : P.text3 }}>
                      {isHe ? a.noteHe : a.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Issues */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.issuesTitle}</h3>
            {issues.map((iss, i) => {
              const s = issueStyle[iss.type];
              return (
                <div key={i} className="p-3 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{iss.type}</span>
                    <span className="text-[10px]" style={{ color: P.text3 }}>{iss.reporter}</span>
                  </div>
                  <p className="text-[12px] font-medium leading-snug mb-1.5" style={{ color: P.text1 }}>{isHe ? iss.descHe : iss.desc}</p>
                  <p className="text-[11px]" style={{ color: P.text2 }}>{isHe ? iss.actionHe : iss.action}</p>
                </div>
              );
            })}

            {/* Photos */}
            <div className="pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
              <h3 className="text-[13px] font-bold mb-2" style={{ color: P.text1 }}>{T.photosTitle}</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    <Camera className="w-4 h-4" style={{ color: P.text3 }} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-2" style={{ color: P.text3 }}>{T.photos}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
