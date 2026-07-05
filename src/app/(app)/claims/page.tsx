"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, Search, AlertTriangle, Lightbulb, Plus } from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";

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
    title: "Claims & Risk",
    newCO: "New Change Order",
    kpis: [
      { label: "Total Change Orders", sub: "₪9.46M total value"   },
      { label: "Approved Value",       sub: "2 approved COs"       },
      { label: "Under Review",         sub: ""                     },
      { label: "Total Risk Exposure",  sub: "6 risks on register"  },
    ],
    coTitle: "Change Order Register",
    riskTitle: "Risk Register",
    colCO: "CO #",
    colDesc: "Description",
    colReason: "Reason",
    colSubmitted: "Submitted",
    colValue: "Value",
    colStatus: "Status",
    colRiskId: "ID",
    colRiskDesc: "Risk",
    colProb: "Probability",
    colExposure: "Exposure",
    colMitigation: "Mitigation",
    aiLabel: "AI Claims Analysis",
    aiText: "CO-003 (Bridge 68 widening, ₪3.1M) has been under review for 72 days — exceeding the 28-day contractual review period. This may constitute a deemed approval under Clause 36.4 of the contract. Recommend issuing formal notice to Owner by 30 Jun 2026. RSK-01 and RSK-02 are correlated — utility delay pushes bridge substructure start, amplifying critical path risk.",
  },
  he: {
    title: "תביעות וסיכונים",
    newCO: "צו שינוי חדש",
    kpis: [
      { label: "סה״כ צווי שינוי",     sub: "שווי כולל ₪9.46M"    },
      { label: "שווי מאושר",           sub: "2 צווי שינוי מאושרים" },
      { label: "בבדיקה",              sub: ""                      },
      { label: "סך חשיפת סיכונים",    sub: "6 סיכונים ברשומה"     },
    ],
    coTitle: "רשומת צווי שינוי",
    riskTitle: "רשומת סיכונים",
    colCO: "מס׳",
    colDesc: "תיאור",
    colReason: "סיבה",
    colSubmitted: "הוגש",
    colValue: "שווי",
    colStatus: "סטטוס",
    colRiskId: "מזהה",
    colRiskDesc: "סיכון",
    colProb: "הסתברות",
    colExposure: "חשיפה",
    colMitigation: "הפחתה",
    aiLabel: "ניתוח תביעות AI",
    aiText: "CO-003 (הרחבת Bridge 68, ₪3.1M) נמצא בבדיקה 72 יום — חורג מתקופת הבדיקה החוזית של 28 יום. עשוי להיות אישור שנחשב לפי סעיף 36.4 בחוזה. מומלץ להוציא הודעה רשמית לבעל הפרויקט עד 30 ביוני 2026. RSK-01 ו-RSK-02 קורלטיביים — איחור התשתיות דוחף את תחילת תת-מבנה הגשר ומגביר את הסיכון בנתיב הקריטי.",
  },
};

type COStatus = "APPROVED" | "UNDER REVIEW" | "PENDING" | "REJECTED";
type COCategory = "Unforeseen condition" | "Client-requested" | "Design change" | "Force majeure";
type RiskRating = "HIGH" | "MEDIUM" | "LOW";

const DEMO_CHANGE_ORDERS: {
  num: string; desc: string; reason: COCategory;
  submitted: string; value: number; status: COStatus;
}[] = [
  { num:"CO-001", desc:"Additional earthworks – unforeseen rock formation Zone A",     reason:"Unforeseen condition", submitted:"15 Mar 2026", value:1_240_000, status:"APPROVED"     },
  { num:"CO-002", desc:"Utility relocation scope increase – added 860 LM of conduit",  reason:"Client-requested",     submitted:"02 Apr 2026", value:2_800_000, status:"APPROVED"     },
  { num:"CO-003", desc:"Bridge 68 deck widening from 13.5m to 15.0m carriageway",      reason:"Design change",        submitted:"18 Apr 2026", value:3_100_000, status:"UNDER REVIEW" },
  { num:"CO-004", desc:"Additional piling – soft ground Zone B (12 extra piles)",      reason:"Unforeseen condition", submitted:"10 May 2026", value:890_000,   status:"UNDER REVIEW" },
  { num:"CO-005", desc:"Extended night work – NCA traffic permit requirement",          reason:"Client-requested",     submitted:"22 May 2026", value:340_000,   status:"PENDING"      },
  { num:"CO-006", desc:"Environmental mitigation – noise barrier Sec. A Ch.0+200",     reason:"Client-requested",     submitted:"28 May 2026", value:520_000,   status:"PENDING"      },
  { num:"CO-007", desc:"Dewatering – unforeseen groundwater level Zone B piling",      reason:"Unforeseen condition", submitted:"05 Jun 2026", value:380_000,   status:"PENDING"      },
  { num:"CO-008", desc:"Stone pitching erosion protection – slope failure Zone C",      reason:"Force majeure",        submitted:"15 Jun 2026", value:195_000,   status:"PENDING"      },
];

const DEMO_RISKS: {
  id: string; description: string; probability: string; impact: string;
  rating: RiskRating; exposure: string; mitigation: string;
}[] = [
  { id:"RSK-01", description:"Utility relocation further delays – hidden infrastructure",               probability:"High (75%)",   impact:"Critical", rating:"HIGH",   exposure:"₪1.8M / 21d", mitigation:"Daily progress meeting + 3-shift work rotation" },
  { id:"RSK-02", description:"Bridge 68 design change approval delayed beyond Jul 15",                  probability:"Medium (45%)", impact:"High",     rating:"HIGH",   exposure:"₪3.1M / 28d", mitigation:"Escalate to Owner design team, expedite RFI-045" },
  { id:"RSK-03", description:"Concrete supply disruption – Heidelberg plant maintenance",               probability:"Low (20%)",    impact:"High",     rating:"MEDIUM", exposure:"₪900K / 14d",  mitigation:"Pre-qualify alternative supplier Readymix IL"   },
  { id:"RSK-04", description:"Seasonal flooding – drainage not complete by Oct",                        probability:"Medium (40%)", impact:"Medium",   rating:"MEDIUM", exposure:"₪600K / 10d",  mitigation:"Prioritize drainage works Aug–Sep"              },
  { id:"RSK-05", description:"Labour shortage – pile drilling crew availability",                       probability:"Low (25%)",    impact:"Medium",   rating:"LOW",    exposure:"₪450K / 7d",   mitigation:"Lock in subcontractor crew through Oct agreement" },
  { id:"RSK-06", description:"Permit delay – NCA tunnel crossing inspection",                           probability:"Low (15%)",    impact:"Low",      rating:"LOW",    exposure:"₪120K / 5d",   mitigation:"Dedicated permit liaison officer assigned"       },
];

const statusStyle: Record<COStatus, { bg: string; color: string }> = {
  "APPROVED":     { bg: P.goodBg,   color: P.good   },
  "UNDER REVIEW": { bg: P.warnBg,   color: P.warn   },
  "PENDING":      { bg: "#F5F5F4",  color: "#78716C" },
  "REJECTED":     { bg: P.dangerBg, color: P.danger  },
};
const ratingStyle: Record<RiskRating, { bg: string; color: string }> = {
  "HIGH":   { bg: P.dangerBg, color: P.danger  },
  "MEDIUM": { bg: P.warnBg,   color: P.warn    },
  "LOW":    { bg: P.goodBg,   color: P.good    },
};
const categoryColor: Record<COCategory, string> = {
  "Unforeseen condition": "#1D4ED8",
  "Client-requested":     P.warn,
  "Design change":        "#7C3AED",
  "Force majeure":        "#78716C",
};

function fmt(n: number) { return `₪${(n / 1_000_000).toFixed(2)}M`; }

export default function ClaimsPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const [lang, setLang] = useState<"en" | "he">("en");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    if (c === "he") setLang("he");
  }, []);
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  const [changeOrders, setChangeOrders] = useState(isDemo ? DEMO_CHANGE_ORDERS : []);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => { setChangeOrders(isDemo ? DEMO_CHANGE_ORDERS : []); }, [isDemo]);

  const risks        = isDemo ? DEMO_RISKS : [];
  const kpis         = T.kpis.map(k => isDemo ? k : { ...k, sub: "–" });
  const kpiVals      = isDemo
    ? ["8", fmt(changeOrders.filter(c => c.status === "APPROVED").reduce((s, c) => s + c.value, 0)), "2", "₪7.0M"]
    : [
        String(changeOrders.length),
        fmt(changeOrders.filter(c => c.status === "APPROVED").reduce((s, c) => s + c.value, 0)),
        String(changeOrders.filter(c => c.status === "UNDER REVIEW").length),
        "–",
      ];
  const kpiColors    = [P.copper, P.good, P.warn, P.danger];

  function addChangeOrder(values: Record<string, string>) {
    const num = `CO-${String(changeOrders.length + 1).padStart(3, "0")}`;
    setChangeOrders(prev => [{
      num,
      desc: values.desc || "",
      reason: (values.reason as COCategory) || "Client-requested",
      submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      value: Number(values.value) || 0,
      status: "PENDING" as COStatus,
    }, ...prev]);
    setShowModal(false);
  }

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newCO}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[22px] font-bold" style={{ color: kpiColors[i] }}>{kpiVals[i]}</p>
              <p className="text-[11px] mt-0.5" style={{ color: P.text3 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Change Orders table */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.coTitle}</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colCO, T.colDesc, T.colReason, T.colSubmitted, T.colValue, T.colStatus].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {changeOrders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                    {isHe ? "אין צווי שינוי עדיין" : "No change orders yet"}
                  </td></tr>
                )}
                {changeOrders.map((co, i) => (
                  <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: P.copper }}>{co.num}</td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="font-medium leading-snug" style={{ color: P.text1 }}>{co.desc}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: categoryColor[co.reason] }}>
                        {co.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text3 }}>{co.submitted}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: P.text1 }}>{fmt(co.value)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: statusStyle[co.status].bg, color: statusStyle[co.status].color }}>
                        {co.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Risk Register */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-3" style={{ color: P.text1 }}>{T.riskTitle}</h3>
            <div className="flex flex-col gap-3">
              {risks.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>
                  {isHe ? "אין סיכונים ברשומה עדיין" : "No risks on register yet"}
                </p>
              )}
              {risks.map((r) => (
                <div key={r.id} className="p-3 rounded-xl"
                  style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="text-[10px] font-bold font-mono" style={{ color: P.text3 }}>{r.id}</span>
                      <p className="text-[11.5px] font-semibold mt-0.5 leading-snug" style={{ color: P.text1 }}>{r.description}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: ratingStyle[r.rating].bg, color: ratingStyle[r.rating].color }}>
                      {r.rating}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1.5">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{T.colProb}</p>
                      <p className="text-[10.5px]" style={{ color: P.text2 }}>{r.probability}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: P.text3 }}>{T.colExposure}</p>
                      <p className="text-[10.5px] font-bold" style={{ color: ratingStyle[r.rating].color }}>{r.exposure}</p>
                    </div>
                  </div>
                  <p className="text-[10.5px] mt-1.5 italic" style={{ color: P.text3 }}>↳ {r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI insight */}
        {isDemo && (
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
        )}

      </div>

      {showModal && (
        <QuickAddModal
          isHe={isHe}
          title="New Change Order" titleHe="צו שינוי חדש"
          onClose={() => setShowModal(false)}
          onSave={addChangeOrder}
          fields={[
            { key: "desc", label: "Description", labelHe: "תיאור", type: "textarea", required: true },
            { key: "reason", label: "Reason", labelHe: "סיבה", type: "select", options: [
              { value: "Unforeseen condition", label: "Unforeseen condition", labelHe: "תנאי בלתי צפוי" },
              { value: "Client-requested", label: "Client-requested", labelHe: "בקשת לקוח" },
              { value: "Design change", label: "Design change", labelHe: "שינוי תכנון" },
              { value: "Force majeure", label: "Force majeure", labelHe: "כוח עליון" },
            ]},
            { key: "value", label: "Value (₪)", labelHe: "שווי (₪)", type: "number", required: true },
          ]}
        />
      )}
    </div>
  );
}
