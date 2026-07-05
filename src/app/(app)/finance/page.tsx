"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, Search, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";

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
    title: "Finance & Budget",
    searchPlaceholder: "Search...",
    kpis: [
      { label: "Total Contract",  val: "₪450M",  sub: "Awarded Jan 2025"            },
      { label: "Spent to Date",   val: "₪312M",  sub: "69% of contract"             },
      { label: "Committed",       val: "₪28M",   sub: "Open POs & LOIs"             },
      { label: "Remaining",       val: "₪110M",  sub: "31% budget remaining"        },
      { label: "Cash Flow MTD",   val: "₪18.2M", sub: "Jun 2026 · ₪48M planned"    },
    ],
    budgetTitle: "Budget Breakdown by Section",
    fy: "FY 2026",
    colSection: "Work Section",
    colContract: "Contract Value",
    colSpent: "Spent",
    colProgress: "Progress",
    colStatus: "Status",
    totalRow: "TOTAL",
    totalPlanned: "₪218M planned / ₪312M spent",
    procurementTitle: "Procurement Tracker",
    cashFlowTitle: "Monthly Cash Flow — 2026",
    planned: "Planned",
    actual: "Actual",
    invoicesTitle: "Pending Invoices",
    overdueLabel: (d: number) => `${d}d overdue`,
    dueTodayLabel: "Due today",
    dueLabel: (due: string) => `Due ${due}`,
    aiLabel: "AI Financial Alert",
    aiText: "Utility relocation cost overrun of ₪2.8M is likely to increase further — subcontractor Ambar Engineering has submitted a variation notice for additional rock excavation (est. ₪800K). Review scope and confirm authorization before issuing Payment Certificate #14 scheduled for 30 Jun.",
    statusLabels: { "On Track": "On Track", "Warning": "Warning", "Over Budget": "Over Budget" },
  },
  he: {
    title: "פיננסים ותקציב",
    searchPlaceholder: "חיפוש...",
    kpis: [
      { label: "סך החוזה",          val: "₪450M",  sub: "נחתם ינואר 2025"           },
      { label: "הוצאה עד כה",       val: "₪312M",  sub: "69% מהחוזה"               },
      { label: "מחויבות",            val: "₪28M",   sub: "הזמנות ומכתבי כוונות פתוחים" },
      { label: "יתרה",               val: "₪110M",  sub: "31% תקציב נותר"           },
      { label: "תזרים חודשי",        val: "₪18.2M", sub: "יוני 2026 · ₪48M מתוכנן" },
    ],
    budgetTitle: "פירוט תקציב לפי מקטע עבודה",
    fy: "שנת 2026",
    colSection: "מקטע עבודה",
    colContract: "ערך חוזה",
    colSpent: "הוצאה",
    colProgress: "התקדמות",
    colStatus: "סטטוס",
    totalRow: "סה״כ",
    totalPlanned: "₪218M מתוכנן / ₪312M הוצאה",
    procurementTitle: "מעקב רכש",
    cashFlowTitle: "תזרים מזומנים חודשי — 2026",
    planned: "מתוכנן",
    actual: "בפועל",
    invoicesTitle: "חשבוניות ממתינות",
    overdueLabel: (d: number) => `${d}י באיחור`,
    dueTodayLabel: "לתשלום היום",
    dueLabel: (due: string) => `פירעון ${due}`,
    aiLabel: "התראה פיננסית AI",
    aiText: "חריגת עלות בהעברת תשתיות של ₪2.8M צפויה לגדול — קבלן המשנה אמבר הנדסה הגיש הודעת תוספת בגין חפירת סלע נוספת (אומד ₪800K). בדוק היקף ואשר הרשאה לפני הנפקת תעודת תשלום מס׳ 14 המתוכננת ל-30 ביוני.",
    statusLabels: { "On Track": "בתוכנית", "Warning": "אזהרה", "Over Budget": "חריגת תקציב" },
  },
};

const DEMO_BUDGET_ROWS = [
  { section: "Earthworks",         sectionHe: "עפר",                contract: 48_500_000,  spent: 47_200_000, pct: 97, status: "On Track"   },
  { section: "Foundations",        sectionHe: "יסודות",             contract: 112_000_000, spent: 68_400_000, pct: 61, status: "On Track"   },
  { section: "Bridge Structures",  sectionHe: "מבני גשר",           contract: 158_000_000, spent: 42_100_000, pct: 27, status: "On Track"   },
  { section: "Road Pavement",      sectionHe: "מדרכה וכביש",        contract: 67_500_000,  spent: 38_900_000, pct: 58, status: "Warning"    },
  { section: "Traffic Systems",    sectionHe: "מערכות תנועה",       contract: 24_000_000,  spent: 2_100_000,  pct: 9,  status: "On Track"   },
  { section: "Utilities",          sectionHe: "תשתיות",             contract: 18_000_000,  spent: 11_800_000, pct: 66, status: "Over Budget" },
  { section: "Drainage",           sectionHe: "ניקוז",              contract: 14_000_000,  spent: 7_200_000,  pct: 51, status: "On Track"   },
  { section: "Landscaping",        sectionHe: "נוף וגינון",         contract: 8_000_000,   spent: 300_000,    pct: 4,  status: "On Track"   },
];

const DEMO_CASH_FLOW = [
  { month: "Jan", monthHe: "ינו", plan: 28, actual: 31 },
  { month: "Feb", monthHe: "פבר", plan: 32, actual: 29 },
  { month: "Mar", monthHe: "מרץ", plan: 38, actual: 41 },
  { month: "Apr", monthHe: "אפר", plan: 42, actual: 44 },
  { month: "May", monthHe: "מאי", plan: 45, actual: 42 },
  { month: "Jun", monthHe: "יונ", plan: 48, actual: 18.2 },
];

const DEMO_PROCUREMENT = [
  { supplier: "Tadiran Steel Works",   category: "Structural Steel",     categoryHe: "פלדה מבנית",    po: "₪8,420,000",  status: "DELIVERED"  },
  { supplier: "Vulcan Aggregates Ltd", category: "Crushed Stone & Agg.", categoryHe: "אבן כתושה",    po: "₪3,150,000",  status: "DELIVERED"  },
  { supplier: "Heidelberg Cement IL",  category: "Ready-Mix Concrete",   categoryHe: "בטון מוכן",    po: "₪12,800,000", status: "IN TRANSIT" },
  { supplier: "Roadway Asphalt Co.",   category: "Asphalt – AC-20",      categoryHe: "אספלט AC-20",  po: "₪5,600,000",  status: "PENDING"    },
  { supplier: "Elco Bridge Systems",   category: "Expansion Joints",     categoryHe: "מפרקי התפשטות",po: "₪2,200,000",  status: "DELAYED"    },
  { supplier: "Strad Traffic Systems", category: "Traffic Signals",      categoryHe: "רמזורים",      po: "₪4,100,000",  status: "PENDING"    },
];

const DEMO_INVOICES = [
  { supplier: "Ambar Engineering",      amount: "₪2,840,000", due: "15 Jun 2026", overdue: 15 },
  { supplier: "Heidelberg Cement IL",   amount: "₪1,920,000", due: "18 Jun 2026", overdue: 12 },
  { supplier: "Tadiran Steel Works",    amount: "₪3,100,000", due: "22 Jun 2026", overdue: 8  },
  { supplier: "Geotechnica Labs",       amount: "₪180,000",   due: "25 Jun 2026", overdue: 5  },
  { supplier: "Vulcan Aggregates Ltd",  amount: "₪890,000",   due: "28 Jun 2026", overdue: 2  },
  { supplier: "SafeWork Solutions",     amount: "₪420,000",   due: "30 Jun 2026", overdue: 0  },
  { supplier: "Roadway Asphalt Co.",    amount: "₪1,340,000", due: "05 Jul 2026", overdue: -5 },
];

const procStatus: Record<string, { bg: string; color: string }> = {
  "DELIVERED":  { bg: P.goodBg,   color: P.good   },
  "IN TRANSIT": { bg: "#EFF6FF",  color: "#1D4ED8" },
  "PENDING":    { bg: "#F5F5F4",  color: "#78716C" },
  "DELAYED":    { bg: P.dangerBg, color: P.danger  },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `₪${(n / 1_000_000).toFixed(1)}M`;
  return `₪${(n / 1_000).toFixed(0)}K`;
}

const MAX_CF = 50;

export default function FinancePage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const [lang, setLang] = useState<"en" | "he">("en");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    if (c === "he") setLang("he");
  }, []);
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  const budgetRows   = isDemo ? DEMO_BUDGET_ROWS   : [];
  const cashFlow     = isDemo ? DEMO_CASH_FLOW     : [];
  const procurement  = isDemo ? DEMO_PROCUREMENT   : [];
  const invoices     = isDemo ? DEMO_INVOICES      : [];
  const kpis         = T.kpis.map(k => isDemo ? k : { ...k, val: "–", sub: "–" });
  const totalContract = isDemo ? "₪450M" : "–";
  const totalPlanned  = isDemo ? T.totalPlanned : "–";
  const totalPct      = isDemo ? 69 : 0;

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
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

        {/* Top KPIs */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {kpis.map((k, i) => {
            const colors = [P.text1, P.copper, P.warn, P.good, P.warn];
            return (
              <div key={k.label} className="rounded-2xl p-4"
                style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
                <p className="text-[22px] font-bold" style={{ color: colors[i] }}>{k.val}</p>
                <p className="text-[11px] mt-0.5" style={{ color: P.text3 }}>{k.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* Budget breakdown */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.budgetTitle}</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: P.copperLight, color: P.copper }}>
                {T.fy}
              </span>
            </div>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colSection, T.colContract, T.colSpent, T.colProgress, T.colStatus].map(h => (
                    <th key={h} className="px-5 py-2 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgetRows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px]" style={{ color: P.text3 }}>
                    {isHe ? "אין נתוני תקציב עדיין" : "No budget data yet"}
                  </td></tr>
                )}
                {budgetRows.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-5 py-2.5 font-medium" style={{ color: P.text1 }}>{isHe ? r.sectionHe : r.section}</td>
                    <td className="px-5 py-2.5 font-mono" style={{ color: P.text2 }}>{fmt(r.contract)}</td>
                    <td className="px-5 py-2.5 font-mono font-semibold"
                      style={{ color: r.status === "Over Budget" ? P.danger : P.text2 }}>
                      {fmt(r.spent)}
                    </td>
                    <td className="px-5 py-2.5 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: P.track }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${r.pct}%`,
                              background: r.status === "Over Budget" ? P.danger : r.status === "Warning" ? P.warn : P.good,
                            }} />
                        </div>
                        <span className="text-[11px] font-bold shrink-0" style={{ color: P.text3 }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: r.status === "Over Budget" ? P.dangerBg : r.status === "Warning" ? P.warnBg : P.goodBg,
                          color: r.status === "Over Budget" ? P.danger : r.status === "Warning" ? P.warn : P.good,
                        }}>
                        {T.statusLabels[r.status as keyof typeof T.statusLabels] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {budgetRows.length > 0 && (
                  <tr style={{ background: "#F5F2EF" }}>
                    <td className="px-5 py-2.5 font-bold" style={{ color: P.text1 }}>{T.totalRow}</td>
                    <td className="px-5 py-2.5 font-bold font-mono" style={{ color: P.text1 }}>{totalContract}</td>
                    <td className="px-5 py-2.5 font-bold font-mono" style={{ color: P.copper }}>{totalPlanned}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: P.track }}>
                          <div className="h-full rounded-full" style={{ width: `${totalPct}%`, background: P.copper }} />
                        </div>
                        <span className="text-[11px] font-bold shrink-0" style={{ color: P.text1 }}>{totalPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5" />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Procurement tracker */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-3" style={{ color: P.text1 }}>{T.procurementTitle}</h3>
            <div className="flex flex-col gap-2">
              {procurement.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>
                  {isHe ? "אין נתוני רכש עדיין" : "No procurement data yet"}
                </p>
              )}
              {procurement.map((p, i) => (
                <div key={i} className="p-2.5 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11.5px] font-semibold" style={{ color: P.text1 }}>{p.supplier}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: procStatus[p.status].bg, color: procStatus[p.status].color }}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px]" style={{ color: P.text3 }}>{isHe ? p.categoryHe : p.category}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: P.text2 }}>{p.po}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* Cash Flow Chart */}
          <div className="col-span-2 rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.cashFlowTitle}</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: P.track }} />{T.planned}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: P.copper }} />{T.actual}</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-36">
              {cashFlow.length === 0 && (
                <p className="flex-1 text-center text-[12px] self-center" style={{ color: P.text3 }}>
                  {isHe ? "אין נתוני תזרים מזומנים עדיין" : "No cash flow data yet"}
                </p>
              )}
              {cashFlow.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5" style={{ height: 100 }}>
                    <div className="flex-1 rounded-t-md"
                      style={{ height: `${(m.plan / MAX_CF) * 100}%`, background: P.track }} />
                    <div className="flex-1 rounded-t-md"
                      style={{
                        height: `${(m.actual / MAX_CF) * 100}%`,
                        background: m.actual > m.plan ? P.danger : P.copper,
                        opacity: m.month === "Jun" ? 0.6 : 1,
                      }} />
                  </div>
                  <span className="text-[10.5px] font-semibold" style={{ color: P.text3 }}>{isHe ? m.monthHe : m.month}</span>
                  <span className="text-[10px]" style={{ color: P.text2 }}>₪{m.actual}M</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending invoices */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-3" style={{ color: P.text1 }}>{T.invoicesTitle}</h3>
            <div className="flex flex-col gap-1.5">
              {invoices.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>
                  {isHe ? "אין חשבוניות ממתינות" : "No pending invoices yet"}
                </p>
              )}
              {invoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: inv.overdue > 0 ? P.dangerBg : P.bg, border: `1px solid ${inv.overdue > 0 ? "#FECACA" : P.border}` }}>
                  <div>
                    <p className="text-[11.5px] font-semibold" style={{ color: P.text1 }}>{inv.supplier}</p>
                    <p className="text-[10.5px]" style={{ color: inv.overdue > 0 ? P.danger : P.text3 }}>
                      {inv.overdue > 0
                        ? T.overdueLabel(inv.overdue)
                        : inv.overdue === 0
                        ? T.dueTodayLabel
                        : T.dueLabel(inv.due)}
                    </p>
                  </div>
                  <span className="text-[12px] font-bold font-mono" style={{ color: inv.overdue > 0 ? P.danger : P.text2 }}>
                    {inv.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl"
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
    </div>
  );
}
