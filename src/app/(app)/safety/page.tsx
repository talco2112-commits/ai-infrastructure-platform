"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, Search, AlertTriangle, CheckCircle2, Users, Lightbulb, Plus } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Safety Management",
    ltiFreeChip: "142 LTI-Free Days",
    reportObs: "Report Observation",
    kpis: [
      { label: "Days Without LTI",  val: "142",       sub: "No LTI since 07 Feb 2026" },
      { label: "Total Manhours",    val: "1,847,320",  sub: null },
      { label: "Near Misses (MTD)", val: "3",          sub: null },
      { label: "Open Actions",      val: "8",          sub: null },
      { label: "Safety Score",      val: "94/100",     sub: null },
    ],
    aiLabel: "AI Safety Insight",
    aiText: "Zone D has 40% higher unsafe condition reports than other zones — 3 of the last 5 near-misses occurred during night shifts. AI analysis correlates this with inadequate lighting infrastructure. Recommend dedicated lighting inspection by safety officer before next night shift (29 Jun). Zone D bunding deficiency (fuel storage) requires immediate corrective action — environmental incident risk is HIGH.",
    obsTitle: "Recent Safety Observations",
    obsSubtitle: "Last 7 days",
    toolboxTitle: "Toolbox Talks – This Week",
    incidentTitle: "Incident Statistics — 2026",
    nearMisses: "Near Misses",
    safetyObs: "Safety Observations",
    colType: "Type",
    colDesc: "Description",
    colZone: "Zone",
    colReporter: "Reporter",
    colDate: "Date",
    colStatus: "Status",
    attendees: "attendees",
    ledBy: "Led by",
    months: ["Jan","Feb","Mar","Apr","May","Jun"],
  },
  he: {
    title: "ניהול בטיחות",
    ltiFreeChip: "142 ימים ללא פגיעה",
    reportObs: "דווח תצפית",
    kpis: [
      { label: "ימים ללא פגיעה",      val: "142",       sub: "ללא LTI מאז 07 פבר 2026" },
      { label: "שעות עבודה כוללות",   val: "1,847,320",  sub: null },
      { label: "כמעט-תאונות (חודשי)", val: "3",          sub: null },
      { label: "פעולות פתוחות",       val: "8",          sub: null },
      { label: "ציון בטיחות",         val: "94/100",     sub: null },
    ],
    aiLabel: "תובנת בטיחות AI",
    aiText: "אזור D מציג 40% יותר דיווחי מצב מסוכן מאזורים אחרים — 3 מתוך 5 כמעט-תאונות אחרונות אירעו במשמרת לילה. ניתוח AI קושר זאת לתשתית תאורה לקויה. מומלץ לבצע בדיקת תאורה ייעודית לפני משמרת הלילה הבאה (29 ביוני). ליקוי הגידור בדלק באזור D מצריך פעולה מיידית — סיכון לאירוע סביבתי גבוה.",
    obsTitle: "תצפיות בטיחות אחרונות",
    obsSubtitle: "7 ימים אחרונים",
    toolboxTitle: "שיחות כלים – השבוע",
    incidentTitle: "סטטיסטיקת אירועים — 2026",
    nearMisses: "כמעט-תאונות",
    safetyObs: "תצפיות בטיחות",
    colType: "סוג",
    colDesc: "תיאור",
    colZone: "אזור",
    colReporter: "מדווח",
    colDate: "תאריך",
    colStatus: "סטטוס",
    attendees: "משתתפים",
    ledBy: "בניהול",
    months: ["ינו","פבר","מרץ","אפר","מאי","יונ"],
  },
};

type ObsType   = "Positive" | "Near Miss" | "Unsafe Act" | "Unsafe Condition";
type ObsStatus = "OPEN" | "CLOSED" | "IN PROGRESS";

const DEMO_OBSERVATIONS: {
  type: ObsType; description: string; zone: string;
  reporter: string; date: string; status: ObsStatus;
}[] = [
  { type:"Positive",         description:"Pile crew wearing full PPE during concreting operations – exemplary practice",      zone:"B", reporter:"Safety Off. Ben-Ami", date:"27 Jun", status:"CLOSED"      },
  { type:"Unsafe Condition", description:"Inadequate lighting at night shift – Zone D utility trench, 2 fixtures failed",     zone:"D", reporter:"Eng. Mizrahi",       date:"27 Jun", status:"IN PROGRESS" },
  { type:"Near Miss",        description:"Excavator bucket swung near pedestrian access path at Ch.3+180",                    zone:"C", reporter:"S.O. Dror Katz",     date:"26 Jun", status:"OPEN"        },
  { type:"Unsafe Act",       description:"Worker operating angle grinder without face shield at rebar fabrication yard",      zone:"B", reporter:"S.O. Ben-Ami",       date:"26 Jun", status:"CLOSED"      },
  { type:"Positive",         description:"Toolbox talk attendance 100% – full crew Zone A morning shift",                     zone:"A", reporter:"Foreman Peretz",      date:"25 Jun", status:"CLOSED"      },
  { type:"Unsafe Condition", description:"Missing edge protection – bridge pier P6 work platform at +5.2m elevation",         zone:"B", reporter:"S.O. Ben-Ami",       date:"25 Jun", status:"OPEN"        },
  { type:"Near Miss",        description:"Concrete pump hose failure near workers – no injuries, zone evacuated safely",      zone:"A", reporter:"Foreman Katz",        date:"24 Jun", status:"CLOSED"      },
  { type:"Unsafe Act",       description:"Lifting sling not inspected before use – 8t steel cage lift",                      zone:"B", reporter:"S.O. Ben-Ami",       date:"24 Jun", status:"IN PROGRESS" },
  { type:"Positive",         description:"Subcontractor Ambar self-initiated safety inspection prior to rock excavation",    zone:"D", reporter:"S.O. Dror Katz",     date:"23 Jun", status:"CLOSED"      },
  { type:"Unsafe Condition", description:"Fuel storage improperly bunded – diesel tank Zone D without secondary containment", zone:"D", reporter:"Eng. Cohen",         date:"23 Jun", status:"OPEN"        },
];

const DEMO_TOOLBOX_TALKS = [
  { topic: "Working at Height – Scaffold & Formwork Safety",        date: "27 Jun 2026", attendance: 48, conductor: "S.O. Ben-Ami"      },
  { topic: "Lifting Operations – Slinging & Signal Man Procedures", date: "26 Jun 2026", attendance: 35, conductor: "S.O. Dror Katz"    },
  { topic: "Confined Space Entry – Utility Trench Zone D",          date: "25 Jun 2026", attendance: 22, conductor: "Eng. Mizrahi"       },
  { topic: "Concrete Pouring Safety & Pump Hose Hazards",          date: "24 Jun 2026", attendance: 41, conductor: "Foreman Peretz"     },
  { topic: "Heat Stress Management – Summer Work Protocols",        date: "23 Jun 2026", attendance: 63, conductor: "Project Safety Mgr" },
];

const DEMO_INCIDENT_DATA = [
  { nearmiss: 1, observations: 12 },
  { nearmiss: 0, observations: 9  },
  { nearmiss: 2, observations: 15 },
  { nearmiss: 1, observations: 18 },
  { nearmiss: 2, observations: 21 },
  { nearmiss: 3, observations: 14 },
];

const obsTypeStyle: Record<ObsType, { bg: string; color: string }> = {
  "Positive":         { bg: P.goodBg,   color: P.good    },
  "Near Miss":        { bg: P.dangerBg, color: P.danger  },
  "Unsafe Act":       { bg: P.warnBg,   color: P.warn    },
  "Unsafe Condition": { bg: "#EFF6FF",  color: "#1D4ED8" },
};
const obsStatusStyle: Record<ObsStatus, { bg: string; color: string }> = {
  "OPEN":        { bg: P.warnBg,  color: P.warn    },
  "CLOSED":      { bg: P.goodBg,  color: P.good    },
  "IN PROGRESS": { bg: "#EFF6FF", color: "#1D4ED8" },
};

const MAX_OBS = 25;
const kpiColors = [P.good, P.text1, P.danger, P.warn, P.copper];

export default function SafetyPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const [lang, setLang] = useState<"en" | "he">("en");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    if (c === "he") setLang("he");
  }, []);
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  const observations   = isDemo ? DEMO_OBSERVATIONS : [];
  const toolboxTalks   = isDemo ? DEMO_TOOLBOX_TALKS : [];
  const incidentData   = isDemo ? DEMO_INCIDENT_DATA : T.months.map(() => ({ nearmiss: 0, observations: 0 }));
  const kpis           = T.kpis.map(k => isDemo ? k : { ...k, val: "–", sub: null });
  const ltiFreeChip    = isDemo ? T.ltiFreeChip : (isHe ? "0 ימים ללא פגיעה" : "0 LTI-Free Days");

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: P.goodBg, color: P.good }}>
            {ltiFreeChip}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.reportObs}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[22px] font-bold" style={{ color: kpiColors[i] }}>{k.val}</p>
              {k.sub && <p className="text-[10px] mt-0.5" style={{ color: P.good }}>{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* AI insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
              <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiText}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* Observations table */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.obsTitle}</h3>
              <span className="text-[11px]" style={{ color: P.text3 }}>{T.obsSubtitle}</span>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colType, T.colDesc, T.colZone, T.colReporter, T.colDate, T.colStatus].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {observations.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                    {isHe ? "אין תצפיות בטיחות עדיין" : "No safety observations yet"}
                  </td></tr>
                )}
                {observations.map((o, i) => (
                  <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: obsTypeStyle[o.type].bg, color: obsTypeStyle[o.type].color }}>
                        {o.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 max-w-[240px]">
                      <p className="leading-snug" style={{ color: P.text2 }}>{o.description}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                        style={{ background: P.copperLight, color: P.copper }}>
                        {o.zone}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text3 }}>{o.reporter}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text3 }}>{o.date}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: obsStatusStyle[o.status].bg, color: obsStatusStyle[o.status].color }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toolbox talks */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-3" style={{ color: P.text1 }}>{T.toolboxTitle}</h3>
            <div className="flex flex-col gap-3">
              {toolboxTalks.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>
                  {isHe ? "אין שיחות כלים השבוע" : "No toolbox talks yet"}
                </p>
              )}
              {toolboxTalks.map((t, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <p className="text-[12px] font-semibold leading-snug mb-1.5" style={{ color: P.text1 }}>{t.topic}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" style={{ color: P.text3 }} />
                      <span className="text-[11px] font-bold" style={{ color: P.text2 }}>{t.attendance} {T.attendees}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: P.text3 }}>{t.date.slice(0,6)}</span>
                  </div>
                  <p className="text-[10.5px] mt-1" style={{ color: P.text3 }}>{T.ledBy} {t.conductor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incident statistics chart */}
        <div className="rounded-2xl p-5"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.incidentTitle}</h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: P.danger }} />{T.nearMisses}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: P.copper }} />{T.safetyObs}
              </span>
            </div>
          </div>
          <div className="flex items-end gap-6 h-32">
            {incidentData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1" style={{ height: 90 }}>
                  <div className="flex-1 rounded-t"
                    style={{ height: `${(d.nearmiss / MAX_OBS) * 100}%`, background: P.danger, opacity: 0.85, minHeight: 4 }} />
                  <div className="flex-1 rounded-t"
                    style={{ height: `${(d.observations / MAX_OBS) * 100}%`, background: P.copper, opacity: 0.7, minHeight: 4 }} />
                </div>
                <span className="text-[10.5px] font-semibold" style={{ color: P.text3 }}>{T.months[i]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
