import { cookies } from "next/headers";
import { Bell, Search, AlertTriangle, CheckCircle2, XCircle, Pause, Lightbulb, Plus } from "lucide-react";

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
    title: "Quality Management",
    openNCRsChip: "6 Open NCRs",
    newNCR: "New NCR",
    kpis: ["Open NCRs", "In Review", "Pending CAR", "Inspections This Month", "Pass Rate"],
    aiLabel: "AI Quality Alert",
    aiText: "NCR-021 (concrete strength failure at Pile Cap P7) requires immediate structural assessment. Pile cap P7 is on the critical path for Bridge 68 substructure — pour of pier P7 column must be halted pending structural engineer sign-off on remedial works. Estimated recovery: 7–14 days if core samples confirm extent. NCR-026 (expired welder) — all joints from that welder must be 100% UT tested before backfill.",
    ncrTitle: "NCR Register",
    materialTitle: "Material Test Results",
    inspTitle: "Inspection Log — Recent",
    colNCR: "NCR #",
    colDesc: "Description",
    colTrade: "Trade",
    colLocation: "Location",
    colOpened: "Opened",
    colStatus: "Status",
    colCAR: "CAR",
    colInspType: "Inspection Type",
    colInspector: "Inspector",
    colResult: "Result",
    colDate: "Date",
    colSpec: "Spec",
    specLabel: "Spec:",
  },
  he: {
    title: "ניהול איכות",
    openNCRsChip: "6 NCR פתוחים",
    newNCR: "NCR חדש",
    kpis: ["NCR פתוחים", "בבדיקה", "ממתין CAR", "בדיקות החודש", "אחוז מעבר"],
    aiLabel: "התראת איכות AI",
    aiText: "NCR-021 (כשל חוזק בטון בכובע קלונסאות P7) מצריך הערכה קונסטרוקטיבית מיידית. כובע P7 נמצא בנתיב הקריטי לתת-מבנה Bridge 68 — יציקת עמוד P7 חייבת להיעצר עד לאישור מהנדס קונסטרוקציה על עבודות תיקון. זמן התאוששות משוער: 7–14 ימים אם דגימות ליבה יאשרו את ההיקף. NCR-026 (מרתך בעל אישור פג) — כל הריתוכים של אותו מרתך חייבים לעבור בדיקת UT ב-100% לפני מילוי.",
    ncrTitle: "רשומת NCR",
    materialTitle: "תוצאות בדיקות חומרים",
    inspTitle: "יומן בדיקות — אחרונות",
    colNCR: "מס׳ NCR",
    colDesc: "תיאור",
    colTrade: "מקצוע",
    colLocation: "מיקום",
    colOpened: "נפתח",
    colStatus: "סטטוס",
    colCAR: "CAR",
    colInspType: "סוג הבדיקה",
    colInspector: "מפקח",
    colResult: "תוצאה",
    colDate: "תאריך",
    colSpec: "מפרט",
    specLabel: "מפרט:",
  },
};

type NCRStatus  = "OPEN" | "IN REVIEW" | "CLOSED" | "PENDING CAR";
type InspResult = "PASS" | "FAIL" | "HOLD";

const ncrs: {
  num: string; description: string; trade: string; location: string;
  opened: string; status: NCRStatus; carRequired: boolean; urgent: boolean;
}[] = [
  { num:"NCR-021", description:"Concrete compressive strength below specification: fc'=30MPa required, 24MPa achieved (cube test results 14 Jun 2026)", trade:"Concrete",   location:"Pile Cap P7 – Zone B",         opened:"10 Jun 2026", status:"OPEN",        carRequired:true,  urgent:true  },
  { num:"NCR-022", description:"Rebar splice length insufficient: 40Ø required per IS-1138, 28Ø provided in bridge deck",                               trade:"Steel Fix",  location:"Bridge 68 – Deck Span 2",      opened:"12 Jun 2026", status:"OPEN",        carRequired:true,  urgent:true  },
  { num:"NCR-023", description:"Asphalt wearing layer thickness deficiency: -15mm below 60mm specification over 80m section",                            trade:"Paving",     location:"Sec. A Ch.1+200 to Ch.1+280", opened:"15 Jun 2026", status:"IN REVIEW",   carRequired:false, urgent:false },
  { num:"NCR-024", description:"Pipe bedding material non-compliant: 40mm crushed stone used instead of specified 20mm graded aggregate",                trade:"Drainage",   location:"Culvert C-14 Zone A",          opened:"17 Jun 2026", status:"IN REVIEW",   carRequired:false, urgent:false },
  { num:"NCR-025", description:"Formwork stripping too early: props removed at 16h, specification requires minimum 24h for vertical forms",              trade:"Concrete",   location:"Pier P4 – Zone B",             opened:"19 Jun 2026", status:"IN REVIEW",   carRequired:true,  urgent:false },
  { num:"NCR-026", description:"Welding procedure non-conformance: welder certification expired – 3 joints on retaining wall",                           trade:"Steel Fix",  location:"Retaining Wall RW-03",          opened:"20 Jun 2026", status:"PENDING CAR", carRequired:true,  urgent:true  },
  { num:"NCR-027", description:"Compaction test failure: 88% Proctor density achieved vs 95% specification in subgrade Zone D",                          trade:"Earthworks", location:"Subgrade Zone D Ch.4+100",     opened:"22 Jun 2026", status:"OPEN",        carRequired:false, urgent:false },
  { num:"NCR-018", description:"Concrete cover to rebar: 30mm achieved vs 50mm specified at bridge soffit",                                              trade:"Concrete",   location:"Bridge 68 Span 1 – Soffit",    opened:"01 Jun 2026", status:"CLOSED",      carRequired:true,  urgent:false },
];

const inspections = [
  { type:"Pre-pour inspection – Pile Cap P8",       location:"Zone B Pier P8",              inspector:"QC Eng. Avraham", result:"PASS" as InspResult, date:"27 Jun 2026" },
  { type:"Formwork & falsework check – Pier P9",    location:"Zone B Pier P9",              inspector:"QC Eng. Avraham", result:"HOLD" as InspResult, date:"27 Jun 2026" },
  { type:"Compaction test – Sec.A subgrade",        location:"Sec. A Ch.0+800 to Ch.1+000", inspector:"QC Eng. Cohen",   result:"PASS" as InspResult, date:"26 Jun 2026" },
  { type:"Rebar inspection – Retaining Wall RW-04", location:"Zone A RW-04",                inspector:"QC Eng. Avraham", result:"PASS" as InspResult, date:"26 Jun 2026" },
  { type:"Asphalt core test – Sec.A Ch.0+400",      location:"Sec. A",                      inspector:"External Lab",    result:"FAIL" as InspResult, date:"25 Jun 2026" },
  { type:"Pile integrity test – SP-48 to SP-52",    location:"Zone B South",                inspector:"Geodata Testing", result:"PASS" as InspResult, date:"25 Jun 2026" },
  { type:"Weld visual inspection – RW-03 joints",   location:"Zone C RW-03",                inspector:"QC Eng. Levi",    result:"FAIL" as InspResult, date:"24 Jun 2026" },
  { type:"Drainage pipe joint leakage test",        location:"Sec. B Ch.2+100",             inspector:"QC Eng. Cohen",   result:"PASS" as InspResult, date:"23 Jun 2026" },
];

const materialTests = [
  { test:"Concrete cube 28d (Batch #2841)",   spec:"fc'≥30 MPa",    result:"28.4 MPa",  status:"FAIL" as InspResult },
  { test:"Concrete cube 28d (Batch #2849)",   spec:"fc'≥30 MPa",    result:"32.1 MPa",  status:"PASS" as InspResult },
  { test:"Aggregate gradation – 20mm stone",  spec:"IS 1142 Zone C", result:"Zone C",   status:"PASS" as InspResult },
  { test:"Proctor density – subgrade Zone D", spec:"≥95% MDD",      result:"88% MDD",   status:"FAIL" as InspResult },
  { test:"Asphalt core density – AC-20",      spec:"≥97% TMD",      result:"97.8% TMD", status:"PASS" as InspResult },
  { test:"Rebar tensile test – Ø25 bars",     spec:"fy≥420 MPa",    result:"438 MPa",   status:"PASS" as InspResult },
];

const ncrStatusStyle: Record<NCRStatus, { bg: string; color: string }> = {
  "OPEN":        { bg: P.dangerBg, color: P.danger  },
  "IN REVIEW":   { bg: P.warnBg,   color: P.warn    },
  "PENDING CAR": { bg: "#EFF6FF",  color: "#1D4ED8" },
  "CLOSED":      { bg: P.goodBg,   color: P.good    },
};
const inspResultStyle: Record<InspResult, { bg: string; color: string; Icon: React.ElementType }> = {
  "PASS": { bg: P.goodBg,   color: P.good,   Icon: CheckCircle2 },
  "FAIL": { bg: P.dangerBg, color: P.danger, Icon: XCircle      },
  "HOLD": { bg: P.warnBg,   color: P.warn,   Icon: Pause        },
};

const kpiVals   = ["6", "3", "2", "48", "94%"];
const kpiColors = [P.danger, P.warn, "#1D4ED8", P.copper, P.good];

export default async function QualityPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: P.dangerBg, color: P.danger }}>
            {T.openNCRsChip}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newNCR}
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
          {T.kpis.map((label, i) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[26px] font-bold" style={{ color: kpiColors[i] }}>{kpiVals[i]}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: P.text3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
          style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiText}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* NCR Register */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.ncrTitle}</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colNCR, T.colDesc, T.colTrade, T.colLocation, T.colOpened, T.colStatus, T.colCAR].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ncrs.map((n, i) => (
                  <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}`, opacity: n.status === "CLOSED" ? 0.65 : 1 }}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {n.urgent && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: P.danger }} />}
                        <span className="font-mono font-bold" style={{ color: P.copper }}>{n.num}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px]">
                      <p className="leading-snug text-[11.5px]" style={{ color: P.text1 }}>{n.description}</p>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text2 }}>{n.trade}</td>
                    <td className="px-4 py-2.5 max-w-[120px] text-[11px]" style={{ color: P.text3 }}>{n.location}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[11px]" style={{ color: P.text3 }}>{n.opened.slice(0,6)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: ncrStatusStyle[n.status].bg, color: ncrStatusStyle[n.status].color }}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {n.carRequired
                        ? <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: P.dangerBg, color: P.danger }}>YES</span>
                        : <span className="text-[10.5px]" style={{ color: P.text3 }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Material test results */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <h3 className="text-[13px] font-bold mb-3" style={{ color: P.text1 }}>{T.materialTitle}</h3>
              <div className="flex flex-col gap-1.5">
                {materialTests.map((t, i) => {
                  const s = inspResultStyle[t.status];
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: s.bg }}>
                      <s.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: P.text1 }}>{t.test}</p>
                        <p className="text-[10px]" style={{ color: P.text3 }}>{T.specLabel} {t.spec}</p>
                      </div>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: s.color }}>{t.result}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection log */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.inspTitle}</h3>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colInspType, T.colLocation, T.colInspector, T.colResult, T.colDate].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspections.map((ins, i) => {
                const s = inspResultStyle[ins.result];
                return (
                  <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: P.text1 }}>{ins.type}</td>
                    <td className="px-4 py-2.5" style={{ color: P.text2 }}>{ins.location}</td>
                    <td className="px-4 py-2.5" style={{ color: P.text3 }}>{ins.inspector}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <s.Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                        <span className="font-bold text-[11.5px]" style={{ color: s.color }}>{ins.result}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text3 }}>{ins.date}</td>
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
