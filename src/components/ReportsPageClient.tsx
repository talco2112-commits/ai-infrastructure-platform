"use client";

import { useState, useCallback } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import {
  Bell, Search, Download, Eye, FileText,
  FileBarChart, Loader2, FileSpreadsheet,
} from "lucide-react";
import {
  PROJECT, ZONE_PROGRESS, BUDGET_SECTIONS, OPEN_RFIS, OPEN_NCRS,
  CHANGE_ORDERS, SAFETY, INCIDENTS, WBS, CASHFLOW, INVOICES,
} from "@/lib/reportData";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const REPORT_TYPES = [
  {
    id: "weekly-progress",
    icon: "📊",
    nameEn: "Weekly Progress Report",
    nameHe: "דוח התקדמות שבועי",
    descEn: "7-day summary – schedule, finance, issues",
    descHe: "סיכום 7 ימים – לו״ז, כספים, סוגיות",
    recipients: 12,
    sheetsEn: ["KPIs", "Zone Progress", "Budget Snapshot", "Open Issues"],
    sheetsHe: ["מדדים", "התקדמות אזורים", "סיכום תקציב", "סוגיות פתוחות"],
  },
  {
    id: "monthly-owner",
    icon: "🏗️",
    nameEn: "Monthly Owner Report",
    nameHe: "דוח חודשי לבעל הפרויקט",
    descEn: "Full project status for client/owner review",
    descHe: "סטטוס מלא לבדיקת לקוח/בעל פרויקט",
    recipients: 8,
    sheetsEn: ["Executive Summary", "Budget", "Zone Progress", "Change Orders", "Safety", "RFIs", "NCRs"],
    sheetsHe: ["תקציר מנהלים", "תקציב", "התקדמות", "פקודות שינוי", "בטיחות", "בקשות מידע", "NCR"],
  },
  {
    id: "safety-report",
    icon: "🦺",
    nameEn: "Safety & HSE Report",
    nameHe: "דוח בטיחות וסביבה",
    descEn: "HSE summary – incidents, observations, LTI",
    descHe: "סיכום HSE – אירועים, תצפיות, LTI",
    recipients: 6,
    sheetsEn: ["Safety Statistics", "Incident Log", "Action Items"],
    sheetsHe: ["סטטיסטיקת בטיחות", "יומן אירועים", "פעולות מתקנות"],
  },
  {
    id: "financial-report",
    icon: "💰",
    nameEn: "Financial Report",
    nameHe: "דוח פיננסי",
    descEn: "Budget, cash flow, procurement, invoices",
    descHe: "תקציב, תזרים מזומנים, רכש, חשבוניות",
    recipients: 5,
    sheetsEn: ["Budget vs Actual", "Change Orders", "Cash Flow", "Invoices"],
    sheetsHe: ["תקציב מול ביצוע", "פקודות שינוי", "תזרים", "חשבוניות"],
  },
  {
    id: "schedule-analysis",
    icon: "📅",
    nameEn: "Schedule Analysis Report",
    nameHe: "ניתוח לוח זמנים",
    descEn: "Critical path, delays, recovery options",
    descHe: "נתיב קריטי, עיכובים, אפשרויות התאוששות",
    recipients: 4,
    sheetsEn: ["WBS Schedule", "Critical Path", "Zone Progress"],
    sheetsHe: ["לוח זמנים WBS", "נתיב קריטי", "התקדמות אזורים"],
  },
  {
    id: "payment-cert",
    icon: "📋",
    nameEn: "Payment Certificate",
    nameHe: "תעודת תשלום",
    descEn: "Contractor payment cert per contract clause",
    descHe: "תעודת תשלום קבלן לפי סעיף חוזה",
    recipients: 3,
    sheetsEn: ["Certificate Summary", "Breakdown of Works"],
    sheetsHe: ["סיכום תעודה", "פירוט עבודות"],
  },
];

const RECENT_REPORTS = [
  { nameEn: "Weekly Progress Report – W26", nameHe: "דוח שבועי – שבוע 26", type: "weekly-progress",   period: "23–27 Jun 2026",  generated: "27 Jun 2026", size: "2.4 MB", fmt: "PDF"   },
  { nameEn: "Financial Report – June 2026", nameHe: "דוח פיננסי – יוני 2026", type: "financial-report",  period: "Jun 2026",         generated: "25 Jun 2026", size: "1.8 MB", fmt: "PDF"   },
  { nameEn: "Safety Report – June MTD",     nameHe: "דוח בטיחות – יוני",     type: "safety-report",    period: "01–25 Jun 2026",   generated: "25 Jun 2026", size: "1.2 MB", fmt: "PDF"   },
  { nameEn: "Payment Certificate #13",      nameHe: "תעודת תשלום #13",        type: "payment-cert",     period: "May 2026",          generated: "22 Jun 2026", size: "890 KB", fmt: "PDF"   },
  { nameEn: "Weekly Progress Report – W25", nameHe: "דוח שבועי – שבוע 25",   type: "weekly-progress",   period: "16–20 Jun 2026",   generated: "20 Jun 2026", size: "2.1 MB", fmt: "PDF"   },
  { nameEn: "Schedule Analysis – Q2 Review",nameHe: "ניתוח לוח זמנים – Q2",  type: "schedule-analysis", period: "Q2 2026",           generated: "18 Jun 2026", size: "3.2 MB", fmt: "PDF"   },
  { nameEn: "Monthly Owner Report – May 2026",nameHe: "דוח חודשי – מאי 2026",type: "monthly-owner",     period: "May 2026",          generated: "05 Jun 2026", size: "8.4 MB", fmt: "PDF"   },
  { nameEn: "Budget vs Actual – Q2 2026",   nameHe: "תקציב מול ביצוע – Q2",  type: "financial-report",  period: "Q2 2026",           generated: "01 Jun 2026", size: "2.8 MB", fmt: "Excel" },
];

const METRICS = {
  en: [
    { label: "Overall Progress",    val: "57%",   delta: "−6% vs planned", neg: true  },
    { label: "Budget Utilisation",  val: "69.3%", delta: "+2% vs planned", neg: false },
    { label: "Open NCRs",           val: "6",     delta: "+2 this week",   neg: true  },
    { label: "Open RFIs",           val: "8",     delta: "3 overdue",      neg: true  },
    { label: "Safety – LTI Days",   val: "142",   delta: "No LTI",         neg: false },
    { label: "Pending Approvals",   val: "₪4.2M", delta: "7 awaiting",     neg: true  },
  ],
  he: [
    { label: "התקדמות כוללת",        val: "57%",   delta: "6%− מהמתוכנן",  neg: true  },
    { label: "ניצול תקציב",          val: "69.3%", delta: "2%+ מהמתוכנן",  neg: false },
    { label: "NCR פתוחים",           val: "6",     delta: "+2 השבוע",       neg: true  },
    { label: "בקשות מידע פתוחות",    val: "8",     delta: "3 באיחור",       neg: true  },
    { label: "בטיחות – ימי LTI",     val: "142",   delta: "ללא LTI",        neg: false },
    { label: "אישורים ממתינים",      val: "₪4.2M", delta: "7 ממתינים",      neg: true  },
  ],
};

const KEY_ISSUES = {
  en: [
    "Utility relocation Zone D — 14 days behind, escalation required",
    "NCR-021 concrete failure at Pile Cap P7 — structural assessment initiated",
    "3 RFIs overdue, blocking Zone D piling operations",
    "CO-003 (₪3.1M) exceeds contractual review period — notice issued to Owner",
  ],
  he: [
    "העברת תשתיות אזור D — 14 ימים מאחור, נדרשת הסלמה",
    "NCR-021 כשל בטון בכובע קלונסאות P7 — הערכה קונסטרוקטיבית יזומה",
    "3 בקשות מידע באיחור, חוסמות פעולות קידוח אזור D",
    "CO-003 (₪3.1M) חורגת מתקופת הבדיקה החוזית — הודעה הוצאה לבעל הפרויקט",
  ],
};

const T = {
  en: {
    title: "Reports", aiPowered: "AI-Powered",
    search: "Search reports...", templates: "Report Templates",
    latest: "Latest Report", latestName: "Weekly Progress Report – W26",
    latestPeriod: "Generated 27 Jun 2026 · Period: 23–27 Jun 2026",
    preview: "Preview", download: "Download",
    keyIssues: "This Week's Key Issues",
    generated: "Generated Reports",
    colReport: "Report Name", colPeriod: "Period",
    colGenerated: "Generated", colSize: "Size", colFormat: "Format",
    exportTitle: "Export Report",
    exportType: "Selected Report",
    exportPDF: "Export as PDF",
    exportExcel: "Export as Excel",
    exportingPDF: "Opening PDF...",
    exportingExcel: "Generating Excel...",
    pdfNote: "Opens a print-optimised view in a new tab. Use Print → Save as PDF.",
    excelNote: "Generates a multi-sheet .xlsx workbook with live project data.",
    sheetsLabel: "Excel sheets:",
    recipients: "recipients",
    scheduledTitle: "Scheduled Distribution",
    schedules: [
      { report: "Weekly Progress", schedule: "Every Friday 17:00",  to: "12 recipients" },
      { report: "Monthly Owner",   schedule: "1st of month 09:00",  to: "8 recipients"  },
      { report: "Safety Report",   schedule: "Every Monday 08:00",  to: "6 recipients"  },
    ],
  },
  he: {
    title: "דוחות", aiPowered: "מבוסס AI",
    search: "חיפוש דוחות...", templates: "תבניות דוח",
    latest: "הדוח האחרון", latestName: "דוח התקדמות שבועי – שבוע 26",
    latestPeriod: "נוצר 27 יוני 2026 · תקופה: 23–27 יוני 2026",
    preview: "צפה", download: "הורד",
    keyIssues: "סוגיות מרכזיות השבוע",
    generated: "דוחות שנוצרו",
    colReport: "שם הדוח", colPeriod: "תקופה",
    colGenerated: "נוצר", colSize: "גודל", colFormat: "פורמט",
    exportTitle: "יצוא דוח",
    exportType: "דוח נבחר",
    exportPDF: "יצוא כ-PDF",
    exportExcel: "יצוא כ-Excel",
    exportingPDF: "פותח PDF...",
    exportingExcel: "מייצר Excel...",
    pdfNote: "פותח תצוגה מותאמת להדפסה בלשונית חדשה. השתמש ב-Print → Save as PDF.",
    excelNote: "מייצר חוברת עבודה .xlsx עם נתוני פרויקט חיים.",
    sheetsLabel: "גיליונות Excel:",
    recipients: "נמענים",
    scheduledTitle: "תזמון הפצה",
    schedules: [
      { report: "דוח שבועי",         schedule: "כל שישי 17:00",      to: "12 נמענים" },
      { report: "דוח לבעל הפרויקט", schedule: "ה-1 לחודש 09:00",    to: "8 נמענים"  },
      { report: "דוח בטיחות",        schedule: "כל שני 08:00",        to: "6 נמענים"  },
    ],
  },
};

async function generateExcel(typeId: string) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  const ws = (rows: (string | number)[][], cols?: number[]) => {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    if (cols) sheet["!cols"] = cols.map(w => ({ wch: w }));
    return sheet;
  };

  switch (typeId) {
    case "weekly-progress": {
      XLSX.utils.book_append_sheet(wb,
        ws([
          [`Highway 20 – Northern Extension — Weekly Progress Report, Week 26`],
          [`Generated: ${PROJECT.reportDate}`],
          [],
          ["METRIC", "VALUE", "PLANNED", "VARIANCE", "STATUS"],
          ["Overall Progress", "57%", "63%", "−6%", "Behind Schedule"],
          ["Budget Utilised", "₪312M", "₪302M", "+₪10M", "On Track"],
          ["Open RFIs", "8", "", "3 OVERDUE", "Action Required"],
          ["Open NCRs", "6", "", "1 Major", "Action Required"],
          ["LTI-Free Days", PROJECT.reportDate, "", "", "PASS"],
          ["Safety LTI-Free Days", 142, "", "", "PASS"],
          ["Workforce on Site", SAFETY.workforce, "", "", ""],
        ], [35, 15, 15, 15, 20]),
        "KPIs"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["ZONE", "DESCRIPTION", "PLANNED %", "ACTUAL %", "VARIANCE", "STATUS"],
          ...ZONE_PROGRESS.map(z => [
            `Zone ${z.zone}`, z.desc, `${z.planned}%`, `${z.actual}%`,
            `${z.actual - z.planned > 0 ? "+" : ""}${z.actual - z.planned}%`, z.status,
          ]),
        ], [10, 18, 12, 12, 12, 22]),
        "Zone Progress"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["SECTION", "BUDGET (₪M)", "SPENT (₪M)", "REMAINING (₪M)", "% SPENT"],
          ...BUDGET_SECTIONS.map(b => [
            b.section, b.budget, b.spent, +(b.budget - b.spent).toFixed(1),
            `${Math.round(b.spent / b.budget * 100)}%`,
          ]),
          ["TOTAL", 450, 312.0, 138.0, "69.3%"],
        ], [30, 14, 14, 16, 10]),
        "Budget Snapshot"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["RFI NO.", "SUBJECT", "SUBMITTED", "DUE DATE", "STATUS", "ASSIGNEE"],
          ...OPEN_RFIS.map(r => [r.id, r.subject, r.submitted, r.due, r.status, r.assignee]),
          [], [],
          ["NCR NO.", "ZONE", "ISSUE", "SEVERITY", "STATUS", "DATE RAISED"],
          ...OPEN_NCRS.map(n => [n.id, n.zone, n.issue, n.severity, n.status, n.date]),
        ], [10, 42, 14, 14, 12, 12]),
        "Open Issues"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["WBS ID", "ACTIVITY", "PLANNED", "FORECAST", "FLOAT (DAYS)", "STATUS"],
          ...WBS.map(w => [w.id, w.activity, w.planned, w.forecast, w.float, w.status]),
        ], [8, 40, 18, 22, 13, 14]),
        "Schedule"
      );
      XLSX.writeFile(wb, `Highway20-Weekly-Progress-W26-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    case "financial-report": {
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["SECTION", "BUDGET (₪M)", "SPENT (₪M)", "REMAINING (₪M)", "% SPENT", "STATUS"],
          ...BUDGET_SECTIONS.map(b => {
            const p = Math.round(b.spent / b.budget * 100);
            return [b.section, b.budget, b.spent, +(b.budget - b.spent).toFixed(1), `${p}%`,
              p >= 95 ? "Nearly Exhausted" : p >= 75 ? "On Track" : "Under Budget"];
          }),
          ["TOTAL", 450, 312.0, 138.0, "69.3%", "On Track"],
        ], [30, 14, 14, 16, 10, 18]),
        "Budget vs Actual"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["CO NO.", "DESCRIPTION", "VALUE (₪M)", "STATUS", "DATE"],
          ...CHANGE_ORDERS.map(c => [c.id, c.desc, c.value, c.status, c.date]),
          [], ["", "Total Approved", CHANGE_ORDERS.filter(c => c.status === "Approved").reduce((s, c) => s + c.value, 0), "", ""],
          ["", "Total Pending", CHANGE_ORDERS.filter(c => c.status === "Pending").reduce((s, c) => s + c.value, 0), "", ""],
        ], [10, 48, 14, 12, 12]),
        "Change Orders"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["MONTH", "PLANNED (₪M)", "ACTUAL (₪M)", "VARIANCE (₪M)"],
          ...CASHFLOW.map(m => [m.month, m.planned, m.actual, +(m.actual - m.planned).toFixed(1)]),
        ], [14, 16, 16, 16]),
        "Cash Flow"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["INVOICE NO.", "CONTRACTOR", "AMOUNT (₪M)", "DATE SUBMITTED", "STATUS"],
          ...INVOICES.map(i => [i.id, i.contractor, i.amount, i.submitted, i.status]),
          [], ["", "Total Pending Payment", +INVOICES.filter(i => i.status !== "Approved").reduce((s, i) => s + i.amount, 0).toFixed(1), "", ""],
        ], [18, 28, 14, 16, 12]),
        "Invoices"
      );
      XLSX.writeFile(wb, `Highway20-Financial-Report-Jun2026-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    case "safety-report": {
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["KPI", "YTD VALUE", "TARGET", "STATUS"],
          ["LTI-Free Days", SAFETY.ltiFreeDays, ">100", "PASS"],
          ["Lost Time Injuries (LTI)", SAFETY.ltisYTD, "0", "PASS"],
          ["LTI Frequency Rate", "0.00", "<0.50", "PASS"],
          ["Near Misses Reported", SAFETY.nearMissesYTD, "<20", "PASS"],
          ["First Aid Cases", SAFETY.firstAidYTD, "<30", "PASS"],
          ["Safety Observations", SAFETY.observationsYTD, ">200", "PASS"],
          ["Toolbox Talks", SAFETY.toolboxTalksYTD, ">80", "PASS"],
          ["Total Manhours YTD", "1,820,000", "–", ""],
          ["Current Workforce", SAFETY.workforce, "–", ""],
        ], [32, 16, 12, 10]),
        "Safety Statistics"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["DATE", "TYPE", "ZONE", "DESCRIPTION", "STATUS"],
          ...INCIDENTS.map(i => [i.date, i.type, i.zone, i.desc, i.status]),
        ], [14, 12, 12, 55, 10]),
        "Incident Log"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["ACTION NO.", "ACTION", "OWNER", "DUE DATE", "STATUS"],
          ["SA-2026-014", "Crane exclusion zone markings upgrade – Zone B", "Site Manager", "04 Jul 2026", "Open"],
          ["SA-2026-015", "Review emergency evacuation plan (annual)", "HSE Officer", "07 Jul 2026", "Open"],
          ["SA-2026-016", "Confined space re-training – drainage crew Zone C", "Training", "08 Jul 2026", "Open"],
          ["SA-2026-017", "Fall protection netting inspection – Bridge 3", "HSE Officer", "10 Jul 2026", "Open"],
        ], [14, 50, 16, 14, 10]),
        "Action Items"
      );
      XLSX.writeFile(wb, `Highway20-Safety-Report-Jun2026-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    case "schedule-analysis": {
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["WBS ID", "ACTIVITY", "PLANNED DURATION", "FORECAST COMPLETION", "FLOAT (DAYS)", "STATUS"],
          ...WBS.map(w => [w.id, w.activity, w.planned, w.forecast, w.float, w.status]),
        ], [8, 40, 18, 25, 13, 14]),
        "WBS Schedule"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["WBS ID", "ACTIVITY", "FLOAT (DAYS)", "RISK LEVEL", "STATUS"],
          ...WBS.filter(w => w.float <= -30).sort((a, b) => a.float - b.float).map(w => [
            w.id, w.activity, w.float, w.float <= -45 ? "CRITICAL" : "HIGH", w.status,
          ]),
        ], [8, 40, 13, 14, 14]),
        "Critical Path"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["ZONE", "DESCRIPTION", "PLANNED %", "ACTUAL %", "VARIANCE", "STATUS"],
          ...ZONE_PROGRESS.map(z => [
            `Zone ${z.zone}`, z.desc, `${z.planned}%`, `${z.actual}%`,
            `${z.actual - z.planned > 0 ? "+" : ""}${z.actual - z.planned}%`, z.status,
          ]),
        ], [10, 18, 12, 12, 12, 22]),
        "Zone Progress"
      );
      XLSX.writeFile(wb, `Highway20-Schedule-Analysis-W26-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    case "monthly-owner": {
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["Highway 20 – Northern Extension"], ["Monthly Owner Report – June 2026"],
          [], ["KPI", "VALUE", "PLANNED", "VARIANCE", "STATUS"],
          ["Overall Progress", "57%", "63%", "−6%", "Behind Schedule"],
          ["Budget Utilised", "₪312M", "₪302M", "+₪10M", "On Track"],
          ["Contract Value", "₪450M", "", "", ""],
          ["Weeks Elapsed", "89/156", "", "", ""],
          ["LTI-Free Days", 142, "", "", "PASS"],
          ["Open RFIs", "8 (3 overdue)", "", "", "Action Required"],
          ["Open NCRs", "6 (1 major)", "", "", "Action Required"],
        ], [30, 20, 15, 15, 20]),
        "Executive Summary"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["SECTION", "BUDGET (₪M)", "SPENT (₪M)", "REMAINING (₪M)", "% SPENT"],
          ...BUDGET_SECTIONS.map(b => [
            b.section, b.budget, b.spent, +(b.budget - b.spent).toFixed(1),
            `${Math.round(b.spent / b.budget * 100)}%`,
          ]),
          ["TOTAL", 450, 312.0, 138.0, "69.3%"],
        ], [30, 14, 14, 16, 10]),
        "Budget"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["ZONE", "DESCRIPTION", "PLANNED %", "ACTUAL %", "VARIANCE", "STATUS"],
          ...ZONE_PROGRESS.map(z => [`Zone ${z.zone}`, z.desc, `${z.planned}%`, `${z.actual}%`,
            `${z.actual - z.planned > 0 ? "+" : ""}${z.actual - z.planned}%`, z.status]),
        ], [10, 18, 12, 12, 12, 22]),
        "Zone Progress"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["CO NO.", "DESCRIPTION", "VALUE (₪M)", "STATUS", "DATE"],
          ...CHANGE_ORDERS.map(c => [c.id, c.desc, c.value, c.status, c.date]),
        ], [10, 48, 14, 12, 12]),
        "Change Orders"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["KPI", "VALUE", "TARGET", "STATUS"],
          ["LTI-Free Days", 142, ">100", "PASS"],
          ["LTIs YTD", 0, "0", "PASS"],
          ["Near Misses YTD", SAFETY.nearMissesYTD, "<20", "PASS"],
          ["Safety Observations", SAFETY.observationsYTD, ">200", "PASS"],
          ["Toolbox Talks YTD", SAFETY.toolboxTalksYTD, ">80", "PASS"],
          ["Manhours YTD", "1,820,000", "", ""],
        ], [30, 15, 12, 10]),
        "Safety"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["RFI NO.", "SUBJECT", "SUBMITTED", "DUE DATE", "STATUS", "ASSIGNEE"],
          ...OPEN_RFIS.map(r => [r.id, r.subject, r.submitted, r.due, r.status, r.assignee]),
        ], [10, 42, 14, 14, 12, 12]),
        "Open RFIs"
      );
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["NCR NO.", "ZONE", "ISSUE", "SEVERITY", "STATUS", "DATE"],
          ...OPEN_NCRS.map(n => [n.id, n.zone, n.issue, n.severity, n.status, n.date]),
        ], [10, 16, 42, 12, 10, 14]),
        "NCRs"
      );
      XLSX.writeFile(wb, `Highway20-Monthly-Owner-Jun2026-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    case "payment-cert": {
      const grossTotal = 312.0, prevCert = 285.5;
      const thisCert   = grossTotal - prevCert;
      const retention  = +(thisCert * 0.05).toFixed(2);
      const netPayment = +(thisCert - retention).toFixed(2);
      XLSX.utils.book_append_sheet(wb,
        ws([
          ["PAYMENT CERTIFICATE No. 14"], [`Project: ${PROJECT.name}`],
          [`Contractor: ${PROJECT.contractor}`], ["Period: June 2026"],
          [], ["SECTION", "CONTRACT VALUE (₪M)", "% COMPLETE", "GROSS TO DATE (₪M)", "PREV CERTIFIED (₪M)", "THIS CERT. (₪M)"],
          ...BUDGET_SECTIONS.map(b => {
            const pct = Math.round(b.spent / b.budget * 100);
            const prev = +(b.spent * 0.92).toFixed(2);
            return [b.section, b.budget, `${pct}%`, b.spent, prev, +(b.spent - prev).toFixed(2)];
          }),
          ["TOTAL", 450, "69.3%", grossTotal, prevCert, thisCert],
          [],
          ["Less Retention (5%)", "", "", "", "", -retention],
          ["NET PAYMENT THIS CERTIFICATE", "", "", "", "", netPayment],
        ], [30, 18, 12, 18, 18, 16]),
        "Certificate Summary"
      );
      XLSX.writeFile(wb, `Highway20-Payment-Certificate-14-Jun2026-${PROJECT.reportDate.replace(/ /g, "-")}.xlsx`);
      break;
    }

    default:
      XLSX.writeFile(wb, `report-${typeId}.xlsx`);
  }
}

export function ReportsPageClient({ lang }: { lang: "en" | "he" }) {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const isHe = lang === "he";
  const tx   = T[lang];
  const metrics   = (isDemo ? METRICS[lang] : METRICS[lang].map(m => ({ ...m, val: "–", delta: "–" })));
  const keyIssues = KEY_ISSUES[lang];
  const recentReports = isDemo ? RECENT_REPORTS : [];
  const latestName   = isDemo ? tx.latestName   : (isHe ? "אין דוחות שנוצרו עדיין" : "No reports generated yet");
  const latestPeriod = isDemo ? tx.latestPeriod : (isHe ? "העלה קבצים כדי ליצור דוחות" : "Upload files to start generating reports");

  const [selectedId, setSelectedId]   = useState("weekly-progress");
  const [exporting, setExporting]     = useState<"pdf" | "excel" | null>(null);

  const selected = REPORT_TYPES.find(r => r.id === selectedId) ?? REPORT_TYPES[0];
  const sheets   = isHe ? selected.sheetsHe : selected.sheetsEn;

  const openPDF = useCallback((typeId: string) => {
    if (!isDemo) return;
    setSelectedId(typeId);
    setExporting("pdf");
    window.open(`/print/${typeId}`, "_blank");
    setTimeout(() => setExporting(null), 1200);
  }, [isDemo]);

  const openExcel = useCallback(async (typeId: string) => {
    if (!isDemo) return;
    setSelectedId(typeId);
    setExporting("excel");
    try {
      await generateExcel(typeId);
    } finally {
      setTimeout(() => setExporting(null), 800);
    }
  }, [isDemo]);

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full"
      style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{tx.title}</h1>
          <span className="text-[12px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: P.copperLight, color: P.copper }}>{tx.aiPowered}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{tx.search}</span>
          </div>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-4 gap-5">

          {/* ── Left: Templates ── */}
          <div className="col-span-1 flex flex-col gap-2.5">
            <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{tx.templates}</h3>
            {REPORT_TYPES.map((t, i) => {
              const isSel = t.id === selectedId;
              return (
                <button key={t.id} onClick={() => setSelectedId(t.id)}
                  className="text-left w-full rounded-2xl p-4 transition-all"
                  style={{
                    background: isSel ? P.copperLight : P.card,
                    border: `1.5px solid ${isSel ? P.copper : P.border}`,
                    boxShadow: isSel ? `0 2px 12px rgba(139,90,43,0.15)` : "0 1px 6px rgba(28,25,23,0.04)",
                  }}>
                  <div className="flex items-start gap-2">
                    <span className="text-[20px] shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight truncate"
                        style={{ color: isSel ? P.copper : P.text1 }}>
                        {isHe ? t.nameHe : t.nameEn}
                      </p>
                      <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: P.text3 }}>
                        {isHe ? t.descHe : t.descEn}
                      </p>
                      <p className="text-[10px] mt-1.5" style={{ color: P.text3 }}>
                        {t.recipients} {tx.recipients}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Center: Preview + Table ── */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Latest report preview card */}
            <div className="rounded-2xl p-5"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.text3 }}>{tx.latest}</p>
                  <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{latestName}</h3>
                  <p className="text-[11px]" style={{ color: P.text3 }}>{latestPeriod}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPDF("weekly-progress")}
                    disabled={!isDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold disabled:opacity-60"
                    style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                    <Eye className="w-3 h-3" /> {tx.preview}
                  </button>
                  <button
                    onClick={() => openPDF("weekly-progress")}
                    disabled={!isDemo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white disabled:opacity-60"
                    style={{ background: P.copper }}>
                    <Download className="w-3 h-3" /> {tx.download}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {metrics.map(m => (
                  <div key={m.label} className="p-3 rounded-xl" style={{ background: P.bg }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: P.text3 }}>{m.label}</p>
                    <p className="text-[16px] font-bold" style={{ color: P.text1 }}>{m.val}</p>
                    <p className="text-[10px] font-semibold" style={{ color: m.neg ? P.danger : P.good }}>{m.delta}</p>
                  </div>
                ))}
              </div>
              {isDemo && (
                <div className="mt-3 p-3 rounded-xl text-[12px]" style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
                  <p className="font-bold mb-0.5" style={{ color: P.warn }}>{tx.keyIssues}</p>
                  <ul className="list-disc list-inside space-y-0.5" style={{ color: P.text2 }}>
                    {keyIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Report list table */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="px-5 pt-4 pb-3">
                <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{tx.generated}</h3>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    {[tx.colReport, tx.colPeriod, tx.colGenerated, tx.colSize, tx.colFormat, ""].map((h, i) => (
                      <th key={i} className="px-4 py-2 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReports.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                      {isHe ? "אין דוחות שנוצרו עדיין" : "No reports generated yet"}
                    </td></tr>
                  )}
                  {recentReports.map((r, i) => (
                    <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                      style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: P.copper }} />
                          <span className="font-medium" style={{ color: P.text1 }}>{isHe ? r.nameHe : r.nameEn}</span>
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
                          <button onClick={() => openPDF(r.type)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors">
                            <Eye className="w-3.5 h-3.5" style={{ color: P.text3 }} />
                          </button>
                          <button onClick={() => openPDF(r.type)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors">
                            <Download className="w-3.5 h-3.5" style={{ color: P.text3 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right: Export Panel ── */}
          <div className="col-span-1 flex flex-col gap-4">

            {/* Export card */}
            <div className="rounded-2xl p-5"
              style={{ background: P.card, border: `1.5px solid ${P.copper}`, boxShadow: "0 4px 20px rgba(139,90,43,0.12)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: P.copperLight }}>
                  <FileBarChart className="w-4 h-4" style={{ color: P.copper }} />
                </div>
                <h3 className="text-[13px] font-bold" style={{ color: P.text1 }}>{tx.exportTitle}</h3>
              </div>

              {/* Selected report display */}
              <div className="rounded-xl p-3 mb-4" style={{ background: P.copperLight, border: `1px solid ${P.track}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: P.copperMid }}>{tx.exportType}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{selected.icon}</span>
                  <p className="text-[12.5px] font-bold leading-tight" style={{ color: P.copper }}>
                    {isHe ? selected.nameHe : selected.nameEn}
                  </p>
                </div>
                <p className="text-[10.5px] mt-1.5" style={{ color: P.copperMid }}>
                  {tx.sheetsLabel} {sheets.join(", ")}
                </p>
              </div>

              {/* Export PDF */}
              <div className="mb-3">
                <button
                  onClick={() => openPDF(selectedId)}
                  disabled={exporting !== null || !isDemo}
                  className="w-full py-3 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: exporting === "pdf" ? "#6B3E18" : P.copper,
                    boxShadow: exporting === "pdf" ? "none" : "0 4px 16px rgba(139,90,43,0.30)",
                  }}
                  onMouseEnter={e => { if (!exporting) e.currentTarget.style.background = "#6B3E18"; }}
                  onMouseLeave={e => { if (!exporting) e.currentTarget.style.background = P.copper; }}>
                  {exporting === "pdf"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {tx.exportingPDF}</>
                    : <><FileText className="w-4 h-4" /> {tx.exportPDF}</>}
                </button>
                <p className="text-[10px] mt-1.5 text-center leading-snug" style={{ color: P.text3 }}>{tx.pdfNote}</p>
              </div>

              {/* Export Excel */}
              <div>
                <button
                  onClick={() => openExcel(selectedId)}
                  disabled={exporting !== null || !isDemo}
                  className="w-full py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    background: P.bg,
                    border: `1.5px solid ${exporting === "excel" ? P.copper : P.border}`,
                    color: exporting === "excel" ? P.copper : P.text1,
                  }}
                  onMouseEnter={e => { if (!exporting) { e.currentTarget.style.background = P.copperLight; e.currentTarget.style.borderColor = P.copper; e.currentTarget.style.color = P.copper; }}}
                  onMouseLeave={e => { if (!exporting) { e.currentTarget.style.background = P.bg; e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.text1; }}}>
                  {exporting === "excel"
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {tx.exportingExcel}</>
                    : <><FileSpreadsheet className="w-4 h-4" /> {tx.exportExcel}</>}
                </button>
                <p className="text-[10px] mt-1.5 text-center leading-snug" style={{ color: P.text3 }}>{tx.excelNote}</p>
              </div>
            </div>

            {/* Scheduled Distribution */}
            <div className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <h3 className="text-[13px] font-bold mb-3" style={{ color: P.text1 }}>{tx.scheduledTitle}</h3>
              <div className="flex flex-col gap-2">
                {tx.schedules.map(s => (
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
