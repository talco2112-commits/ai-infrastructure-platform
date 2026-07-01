import { cookies } from "next/headers";
import { Bell, Search, FileBarChart, Download, Eye, Sparkles, Calendar, FileText, CheckCircle2 } from "lucide-react";

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
    title: "Reports",
    aiPowered: "AI-Powered",
    searchPlaceholder: "Search reports...",
    templatesTitle: "Report Templates",
    latestLabel: "Latest Report",
    latestName: "Weekly Progress Report – W26",
    latestPeriod: "Generated 27 Jun 2026 · Period: 23–27 Jun 2026",
    preview: "Preview",
    download: "Download",
    keyIssuesTitle: "This Week's Key Issues",
    keyIssues: [
      "Utility relocation Zone D remains 14 days behind schedule — escalation required",
      "NCR-021 concrete failure at Pile Cap P7 — structural assessment initiated",
      "3 RFIs overdue, blocking Zone D piling operations",
      "CO-003 (₪3.1M) exceeds contractual review period — notice issued to Owner",
    ],
    generatedTitle: "Generated Reports",
    colReport: "Report Name",
    colPeriod: "Period",
    colGenerated: "Generated",
    colSize: "Size",
    colFormat: "Format",
    aiGenTitle: "AI Report Generator",
    reportTypeLabel: "Report Type",
    periodLabel: "Period",
    includeSectionsLabel: "Include Sections",
    sections: [
      "Executive Summary",
      "Schedule Status",
      "Budget & Finance",
      "Site Progress (DatumBIM)",
      "Open Issues & RFIs",
      "Safety Statistics",
      "Quality & NCRs",
      "Upcoming Activities",
    ],
    generateBtn: "Generate with AI",
    generateNote: "AI will auto-pull live data from all modules and compile the report in ~30 seconds",
    scheduledTitle: "Scheduled Distribution",
    schedules: [
      { report: "Weekly Progress", schedule: "Every Friday 17:00",  to: "12 recipients" },
      { report: "Monthly Owner",   schedule: "1st of month 09:00",  to: "8 recipients"  },
      { report: "Safety Report",   schedule: "Every Monday 08:00",  to: "6 recipients"  },
    ],
    templates: [
      { id: "weekly-progress",   name: "Weekly Progress Report",       desc: "7-day summary – schedule, finance, issues",     recipients: 12 },
      { id: "monthly-owner",     name: "Monthly Owner Report",         desc: "Full project status for client/owner review",   recipients: 8  },
      { id: "safety-report",     name: "Safety Report",                desc: "HSE summary – incidents, observations, LTI",   recipients: 6  },
      { id: "financial-report",  name: "Financial Report",             desc: "Budget, cash flow, procurement, invoices",      recipients: 5  },
      { id: "schedule-analysis", name: "Schedule Analysis Report",     desc: "Critical path, delays, recovery options",      recipients: 4  },
      { id: "payment-cert",      name: "Payment Certificate",          desc: "Contractor payment cert per contract clause",   recipients: 3  },
    ],
    metrics: [
      { label: "Overall Progress",   val: "57%",   delta: "-6% vs planned",      negative: true  },
      { label: "Budget Utilisation", val: "69%",   delta: "+2% vs planned",      negative: false },
      { label: "Open NCRs",          val: "6",     delta: "+2 this week",         negative: true  },
      { label: "Open RFIs",          val: "8",     delta: "3 overdue",            negative: true  },
      { label: "Safety – LTI Days",  val: "142",   delta: "No LTI",               negative: false },
      { label: "Pending Approvals",  val: "₪4.2M", delta: "7 awaiting sign-off",  negative: true  },
    ],
    recipients: "recipients",
  },
  he: {
    title: "דוחות",
    aiPowered: "מבוסס AI",
    searchPlaceholder: "חיפוש דוחות...",
    templatesTitle: "תבניות דוח",
    latestLabel: "הדוח האחרון",
    latestName: "דוח התקדמות שבועי – שבוע 26",
    latestPeriod: "נוצר 27 יוני 2026 · תקופה: 23–27 יוני 2026",
    preview: "צפה",
    download: "הורד",
    keyIssuesTitle: "סוגיות מרכזיות השבוע",
    keyIssues: [
      "העברת תשתיות אזור D נותרת 14 ימים מאחורי לוח הזמנים — נדרשת הסלמה",
      "NCR-021 כשל בטון בכובע קלונסאות P7 — הערכה קונסטרוקטיבית יזומה",
      "3 בקשות מידע באיחור, חוסמות פעולות קידוח אזור D",
      "CO-003 (₪3.1M) חורגת מתקופת הבדיקה החוזית — הודעה הוצאה לבעל הפרויקט",
    ],
    generatedTitle: "דוחות שנוצרו",
    colReport: "שם הדוח",
    colPeriod: "תקופה",
    colGenerated: "נוצר",
    colSize: "גודל",
    colFormat: "פורמט",
    aiGenTitle: "מחולל דוחות AI",
    reportTypeLabel: "סוג דוח",
    periodLabel: "תקופה",
    includeSectionsLabel: "כלול פרקים",
    sections: [
      "תקציר מנהלים",
      "סטטוס לוח זמנים",
      "תקציב ופיננסים",
      "התקדמות אתר (DatumBIM)",
      "סוגיות פתוחות ובקשות מידע",
      "סטטיסטיקת בטיחות",
      "איכות ו-NCR",
      "פעילויות קרובות",
    ],
    generateBtn: "צור עם AI",
    generateNote: "AI ישלוף נתונים חיים מכל מודול ויחבר את הדוח תוך ~30 שניות",
    scheduledTitle: "תזמון הפצה",
    schedules: [
      { report: "דוח שבועי",      schedule: "כל שישי 17:00",     to: "12 נמענים" },
      { report: "דוח לבעל הפרויקט", schedule: "ה-1 לחודש 09:00", to: "8 נמענים"  },
      { report: "דוח בטיחות",    schedule: "כל שני 08:00",       to: "6 נמענים"  },
    ],
    templates: [
      { id: "weekly-progress",   name: "דוח התקדמות שבועי",     desc: "סיכום 7 ימים – לו״ז, כספים, סוגיות",       recipients: 12 },
      { id: "monthly-owner",     name: "דוח חודשי לבעל הפרויקט", desc: "סטטוס מלא לבדיקת לקוח/בעל פרויקט",        recipients: 8  },
      { id: "safety-report",     name: "דוח בטיחות",             desc: "סיכום HSE – אירועים, תצפיות, LTI",        recipients: 6  },
      { id: "financial-report",  name: "דוח פיננסי",             desc: "תקציב, תזרים מזומנים, רכש, חשבוניות",    recipients: 5  },
      { id: "schedule-analysis", name: "ניתוח לוח זמנים",        desc: "נתיב קריטי, עיכובים, אפשרויות התאוששות", recipients: 4  },
      { id: "payment-cert",      name: "תעודת תשלום",            desc: "תעודת תשלום קבלן לפי סעיף חוזה",          recipients: 3  },
    ],
    metrics: [
      { label: "התקדמות כוללת",   val: "57%",   delta: "6%- מהמתוכנן",      negative: true  },
      { label: "ניצול תקציב",     val: "69%",   delta: "2%+ מהמתוכנן",      negative: false },
      { label: "NCR פתוחים",      val: "6",     delta: "+2 השבוע",            negative: true  },
      { label: "בקשות מידע פתוחות", val: "8",  delta: "3 באיחור",            negative: true  },
      { label: "בטיחות – ימי LTI", val: "142", delta: "ללא LTI",             negative: false },
      { label: "אישורים ממתינים", val: "₪4.2M", delta: "7 ממתינים לחתימה",   negative: true  },
    ],
    recipients: "נמענים",
  },
};

const templateIcons = ["📊","🏗️","🦺","💰","📅","📋"];

const recentReports = [
  { name: "Weekly Progress Report – W26",      nameHe:"דוח שבועי – שבוע 26",        period: "23–27 Jun 2026", generated: "27 Jun 2026", size: "2.4 MB",  fmt: "PDF"   },
  { name: "Financial Report – June 2026",      nameHe:"דוח פיננסי – יוני 2026",      period: "Jun 2026",        generated: "25 Jun 2026", size: "1.8 MB",  fmt: "PDF"   },
  { name: "Safety Report – June MTD",          nameHe:"דוח בטיחות – יוני מצטבר",    period: "01–25 Jun 2026",  generated: "25 Jun 2026", size: "1.2 MB",  fmt: "PDF"   },
  { name: "Payment Certificate #13",           nameHe:"תעודת תשלום #13",              period: "May 2026",         generated: "22 Jun 2026", size: "890 KB",  fmt: "PDF"   },
  { name: "Weekly Progress Report – W25",      nameHe:"דוח שבועי – שבוע 25",         period: "16–20 Jun 2026",  generated: "20 Jun 2026", size: "2.1 MB",  fmt: "PDF"   },
  { name: "Schedule Analysis – Q2 Review",     nameHe:"ניתוח לוח זמנים – Q2",        period: "Q2 2026",          generated: "18 Jun 2026", size: "3.2 MB",  fmt: "PDF"   },
  { name: "Monthly Owner Report – May 2026",   nameHe:"דוח חודשי לבעל – מאי 2026",   period: "May 2026",         generated: "05 Jun 2026", size: "8.4 MB",  fmt: "PDF"   },
  { name: "Budget vs Actual – Q2 2026",        nameHe:"תקציב מול ביצוע – Q2 2026",   period: "Q2 2026",          generated: "01 Jun 2026", size: "2.8 MB",  fmt: "Excel" },
];

export default async function ReportsPage() {
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
          <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: P.copperLight, color: P.copper }}>
            {T.aiPowered}
          </span>
        </div>
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
        <div className="grid grid-cols-4 gap-5">

          {/* Templates — left col */}
          <div className="col-span-1 flex flex-col gap-3">
            <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{T.templatesTitle}</h3>
            {T.templates.map((t, i) => (
              <div key={t.id}
                className="rounded-2xl p-4 cursor-pointer transition-all"
                style={{ background: P.card, border: `1px solid ${t.id === "weekly-progress" ? P.copper : P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <div className="flex items-start gap-2">
                  <span className="text-[20px] shrink-0">{templateIcons[i]}</span>
                  <div>
                    <p className="text-[12px] font-bold leading-tight" style={{ color: t.id === "weekly-progress" ? P.copper : P.text1 }}>{t.name}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: P.text3 }}>{t.desc}</p>
                    <p className="text-[10px] mt-1.5" style={{ color: P.text3 }}>{t.recipients} {T.recipients}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent reports — center */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Latest report preview */}
            <div className="rounded-2xl p-5"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.text3 }}>{T.latestLabel}</p>
                  <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.latestName}</h3>
                  <p className="text-[11px]" style={{ color: P.text3 }}>{T.latestPeriod}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                    style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                    <Eye className="w-3 h-3" /> {T.preview}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white"
                    style={{ background: P.copper }}>
                    <Download className="w-3 h-3" /> {T.download}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {T.metrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-xl" style={{ background: P.bg }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: P.text3 }}>{m.label}</p>
                    <p className="text-[16px] font-bold" style={{ color: P.text1 }}>{m.val}</p>
                    <p className="text-[10px] font-semibold" style={{ color: m.negative ? P.danger : P.good }}>{m.delta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl text-[12px]" style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
                <p className="font-bold mb-0.5" style={{ color: P.warn }}>{T.keyIssuesTitle}</p>
                <ul className="list-disc list-inside space-y-0.5" style={{ color: P.text2 }}>
                  {T.keyIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              </div>
            </div>

            {/* Report list */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="px-5 pt-4 pb-3">
                <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{T.generatedTitle}</h3>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    {[T.colReport, T.colPeriod, T.colGenerated, T.colSize, T.colFormat, ""].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((r, i) => (
                    <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                      style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: P.copper }} />
                          <span className="font-medium" style={{ color: P.text1 }}>{isHe ? r.nameHe : r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[11px]" style={{ color: P.text3 }}>{r.period}</td>
                      <td className="px-4 py-2.5 text-[11px] whitespace-nowrap" style={{ color: P.text3 }}>{r.generated}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{r.size}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: r.fmt === "PDF" ? P.dangerBg : P.goodBg, color: r.fmt === "PDF" ? P.danger : P.good }}>
                          {r.fmt}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button className="p-1 rounded hover:bg-gray-100"><Eye className="w-3.5 h-3.5" style={{ color: P.text3 }} /></button>
                          <button className="p-1 rounded hover:bg-gray-100"><Download className="w-3.5 h-3.5" style={{ color: P.text3 }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Report generator — right col */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="rounded-2xl p-5"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: P.copperLight }}>
                  <Sparkles className="w-4 h-4" style={{ color: P.copper }} />
                </div>
                <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{T.aiGenTitle}</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold mb-1 block" style={{ color: P.text2 }}>{T.reportTypeLabel}</label>
                  <div className="px-3 py-2 rounded-xl text-[12px]"
                    style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }}>
                    {isHe ? "דוח התקדמות שבועי" : "Weekly Progress Report"}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold mb-1 block" style={{ color: P.text2 }}>{T.periodLabel}</label>
                  <div className="px-3 py-2 rounded-xl text-[12px] flex items-center gap-2"
                    style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }}>
                    <Calendar className="w-3 h-3" style={{ color: P.text3 }} />
                    {isHe ? "שבוע 26 (23–27 יוני 2026)" : "W26 (23–27 Jun 2026)"}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold mb-1.5 block" style={{ color: P.text2 }}>{T.includeSectionsLabel}</label>
                  <div className="flex flex-col gap-1.5">
                    {T.sections.map((sec) => (
                      <label key={sec} className="flex items-center gap-2 cursor-pointer">
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: P.copper }}>
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11.5px]" style={{ color: P.text2 }}>{sec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 mt-1"
                  style={{ background: P.copper, boxShadow: "0 4px 16px rgba(139,90,43,0.28)" }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {T.generateBtn}
                </button>
                <p className="text-[10px] text-center" style={{ color: P.text3 }}>{T.generateNote}</p>
              </div>
            </div>

            <div className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <h3 className="text-[13px] font-bold mb-3" style={{ color: P.text1 }}>{T.scheduledTitle}</h3>
              <div className="flex flex-col gap-2">
                {T.schedules.map((s) => (
                  <div key={s.report} className="p-2.5 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    <p className="text-[12px] font-semibold" style={{ color: P.text1 }}>{s.report}</p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: P.text3 }}>{s.schedule} · {s.to}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
