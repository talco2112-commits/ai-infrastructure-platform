"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDisciplines } from "@/contexts/DisciplineContext";
import { Bell, Search, AlertTriangle, Plus, Clock, Trash2, Settings2 } from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DisciplineManagerModal } from "@/components/DisciplineManagerModal";

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
    title: "RFI Register",
    overdueChip: "3 Overdue",
    searchPlaceholder: "Search RFIs...",
    newRFI: "New RFI",
    stats: ["Total RFIs", "Open", "Overdue", "Answered", "Closed"],
    aiLabel: "AI RFI Alert",
    aiText: "RFI-041 and RFI-042 are blocking active work in Zone D. Combined delay impact estimated at 6 working days on the critical path. Average response time this month: 8.4 days vs. contract target of 7 days. Recommend escalation of RFI-041 to senior structural engineer immediately.",
    tabs: ["All", "Open", "Overdue", "Answered", "Closed"],
    tabCounts: [47, 8, 3, 28, 8],
    colNum: "RFI #",
    colSubject: "Subject",
    colDiscipline: "Discipline",
    colSubmitted: "Submitted",
    colDue: "Due",
    colDaysOpen: "Days Open",
    colStatus: "Status",
    colPriority: "Priority",
    colAssigned: "Assigned To",
  },
  he: {
    title: "רשימת בקשות מידע",
    overdueChip: "3 באיחור",
    searchPlaceholder: "חיפוש בקשות מידע...",
    newRFI: "בקשת מידע חדשה",
    stats: ["סה״כ בקשות מידע", "פתוח", "באיחור", "נענה", "סגור"],
    aiLabel: "התראת בקשות מידע AI",
    aiText: "RFI-041 ו-RFI-042 חוסמות עבודה פעילה באזור D. השפעת האיחור המשולבת משוערת ב-6 ימי עבודה בנתיב הקריטי. זמן תגובה ממוצע החודש: 8.4 ימים מול יעד חוזי של 7 ימים. מומלץ להסלים את RFI-041 למהנדס קונסטרוקציה בכיר מיידית.",
    tabs: ["הכל", "פתוח", "באיחור", "נענה", "סגור"],
    tabCounts: [47, 8, 3, 28, 8],
    colNum: "מספר",
    colSubject: "נושא",
    colDiscipline: "תחום",
    colSubmitted: "הוגש",
    colDue: "יעד",
    colDaysOpen: "ימים פתוח",
    colStatus: "סטטוס",
    colPriority: "עדיפות",
    colAssigned: "מוקצה ל",
  },
};

type RFIStatus = "OVERDUE" | "OPEN" | "ANSWERED" | "CLOSED";
type Priority  = "HIGH" | "MEDIUM" | "LOW";

const DEMO_RFIS: {
  num: string; subject: string; discipline: string;
  submitted: string; due: string; daysOpen: number;
  status: RFIStatus; priority: Priority; assignedTo: string;
}[] = [
  { num:"RFI-041", subject:"Pile cap rebar layout at pier P7 – interference with anchor bolts",       discipline:"ST", submitted:"12 Jun", due:"19 Jun", daysOpen:18, status:"OVERDUE",  priority:"HIGH",   assignedTo:"Eng. Shapira"   },
  { num:"RFI-042", subject:"Utility crossing detail at Ch.2+450 – vertical clearance insufficient",   discipline:"UT", submitted:"14 Jun", due:"21 Jun", daysOpen:16, status:"OVERDUE",  priority:"HIGH",   assignedTo:"Eng. Mizrahi"   },
  { num:"RFI-043", subject:"Drainage pipe invert levels – Sec.B inconsistency with survey data",      discipline:"DR", submitted:"16 Jun", due:"30 Jun", daysOpen:14, status:"OPEN",     priority:"MEDIUM", assignedTo:"Eng. Levi"      },
  { num:"RFI-044", subject:"Electrical conduit routing in bridge deck – conflict with post-tension",   discipline:"EL", submitted:"18 Jun", due:"02 Jul", daysOpen:12, status:"OPEN",     priority:"MEDIUM", assignedTo:"Eng. Ben-David" },
  { num:"RFI-045", subject:"Expansion joint specification – Bridge 68 EJ-300 vs EJ-350 rating",       discipline:"ST", submitted:"19 Jun", due:"26 Jun", daysOpen:11, status:"OPEN",     priority:"HIGH",   assignedTo:"Eng. Shapira"   },
  { num:"RFI-046", subject:"Pavement marking colour specification – retroreflectivity class",          discipline:"TR", submitted:"20 Jun", due:"04 Jul", daysOpen:10, status:"OPEN",     priority:"LOW",    assignedTo:"Eng. Cohen"     },
  { num:"RFI-047", subject:"Guardrail post spacing near culvert headwall – structural interaction",    discipline:"HW", submitted:"22 Jun", due:"06 Jul", daysOpen:8,  status:"OPEN",     priority:"MEDIUM", assignedTo:"Eng. Levi"      },
  { num:"RFI-040", subject:"Bridge abutment backfill compaction specification – Zone 1 vs Zone 2",    discipline:"HW", submitted:"08 Jun", due:"22 Jun", daysOpen:22, status:"ANSWERED", priority:"MEDIUM", assignedTo:"Eng. Mizrahi"   },
  { num:"RFI-039", subject:"Rock anchor grout mix design – Zone D hard rock formation",               discipline:"GT", submitted:"05 Jun", due:"19 Jun", daysOpen:25, status:"ANSWERED", priority:"HIGH",   assignedTo:"Eng. Abramov"   },
  { num:"RFI-038", subject:"Asphalt binder grade change – PG 70-22 to PG 76-22 justification",       discipline:"HW", submitted:"01 Jun", due:"15 Jun", daysOpen:29, status:"ANSWERED", priority:"MEDIUM", assignedTo:"Eng. Cohen"     },
  { num:"RFI-037", subject:"Culvert headwall footing depth – frost penetration depth conflict",        discipline:"ST", submitted:"28 May", due:"11 Jun", daysOpen:32, status:"ANSWERED", priority:"LOW",    assignedTo:"Eng. Shapira"   },
  { num:"RFI-036", subject:"Median barrier type – NJTB vs F-shape – crash test data",                 discipline:"TR", submitted:"20 May", due:"03 Jun", daysOpen:40, status:"CLOSED",   priority:"MEDIUM", assignedTo:"Eng. Ben-David" },
  { num:"RFI-035", subject:"Pile toe elevation – Zone A bored piles vs driven requirement",            discipline:"ST", submitted:"15 May", due:"29 May", daysOpen:45, status:"CLOSED",   priority:"HIGH",   assignedTo:"Eng. Shapira"   },
];

const statusStyle: Record<RFIStatus, { bg: string; color: string }> = {
  "OVERDUE":  { bg: P.dangerBg, color: P.danger  },
  "OPEN":     { bg: P.warnBg,   color: P.warn    },
  "ANSWERED": { bg: P.goodBg,   color: P.good    },
  "CLOSED":   { bg: "#F5F5F4",  color: "#78716C" },
};
const priorityStyle: Record<Priority, { color: string }> = {
  "HIGH":   { color: P.danger },
  "MEDIUM": { color: P.warn   },
  "LOW":    { color: P.text3  },
};

export default function RFIsPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const { lang, isHe } = useLanguage();
  const T = TRANSLATIONS[lang];
  const { disciplines, styleFor } = useDisciplines();

  const [rfis, setRfis]     = useState(isDemo ? DEMO_RFIS : []);
  const [showModal, setShowModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [showDisciplineMgr, setShowDisciplineMgr] = useState(false);
  useEffect(() => { setRfis(isDemo ? DEMO_RFIS : []); }, [isDemo]);

  function confirmDelete() {
    if (deleteIdx === null) return;
    setRfis(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }

  const statsColors  = [P.copper, P.warn, P.danger, P.good, "#78716C"];
  const statsValues  = isDemo ? [47, 8, 3, 28, 8] : [
    rfis.length,
    rfis.filter(r => r.status === "OPEN").length,
    rfis.filter(r => r.status === "OVERDUE").length,
    rfis.filter(r => r.status === "ANSWERED").length,
    rfis.filter(r => r.status === "CLOSED").length,
  ];
  const tabCounts    = isDemo ? T.tabCounts : statsValues;
  const overdueCount = isDemo ? 3 : rfis.filter(r => r.status === "OVERDUE").length;
  const overdueChip  = isHe ? `${overdueCount} באיחור` : `${overdueCount} Overdue`;

  function addRfi(values: Record<string, string>) {
    const now = new Date();
    const num = `RFI-${String(rfis.length + 1).padStart(3, "0")}`;
    setRfis(prev => [{
      num,
      subject: values.subject || "",
      discipline: values.discipline || disciplines[0]?.code || "",
      submitted: now.toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "2-digit", month: "short" }),
      due: values.due ? new Date(values.due).toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "2-digit", month: "short" }) : "",
      daysOpen: 0,
      status: "OPEN" as RFIStatus,
      priority: (values.priority as Priority) || "MEDIUM",
      assignedTo: values.assignedTo || "",
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
          <span className="text-[12px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: P.dangerBg, color: P.danger }}>
            {overdueChip}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{T.searchPlaceholder}</span>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newRFI}
          </button>
          <button onClick={() => setShowDisciplineMgr(true)} title={isHe ? "ניהול תחומים" : "Manage Disciplines"}
            className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Settings2 className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {T.stats.map((label, i) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[26px] font-bold" style={{ color: statsColors[i] }}>{statsValues[i]}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: P.text3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* AI insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
            style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiText}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-3">
          {T.tabs.map((tab, i) => (
            <button key={tab}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{
                background: i === 0 ? P.copper : P.bg,
                color: i === 0 ? "#fff" : P.text2,
                border: `1px solid ${i === 0 ? P.copper : P.border}`,
              }}>
              {tab}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: i === 0 ? "rgba(255,255,255,0.25)" : P.border, color: i === 0 ? "#fff" : P.text3 }}>
                {tabCounts[i]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colNum, T.colSubject, T.colDiscipline, T.colSubmitted, T.colDue, T.colDaysOpen, T.colStatus, T.colPriority, T.colAssigned, ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rfis.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                  {isHe ? "אין בקשות מידע עדיין" : "No RFIs yet"}
                </td></tr>
              )}
              {rfis.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                  style={{ borderBottom: `1px solid ${P.border}`, opacity: r.status === "CLOSED" ? 0.65 : 1 }}>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: P.copper }}>{r.num}</td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium leading-snug" style={{ color: P.text1 }}>{r.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: styleFor(r.discipline).color }}>
                      {r.discipline}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text3 }}>{r.submitted}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text3 }}>{r.due}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: r.status === "OVERDUE" ? P.danger : P.text3 }} />
                      <span className="font-bold" style={{ color: r.status === "OVERDUE" ? P.danger : P.text2 }}>{r.daysOpen}d</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: statusStyle[r.status].bg, color: statusStyle[r.status].color }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold" style={{ color: priorityStyle[r.priority].color }}>
                      ● {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{r.assignedTo}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteIdx(i)} className="p-1 rounded-lg transition-colors hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {deleteIdx !== null && (
        <ConfirmDialog
          isHe={isHe}
          message={`Delete RFI "${rfis[deleteIdx]?.subject}"? This cannot be undone.`}
          messageHe={`למחוק את בקשת המידע "${rfis[deleteIdx]?.subject}"? לא ניתן לשחזר פעולה זו.`}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDelete}
        />
      )}

      {showModal && (
        <QuickAddModal
          isHe={isHe}
          title="New RFI" titleHe="בקשת מידע חדשה"
          onClose={() => setShowModal(false)}
          onSave={addRfi}
          fields={[
            { key: "subject", label: "Subject", labelHe: "נושא", type: "text", required: true },
            { key: "discipline", label: "Discipline", labelHe: "תחום", type: "select",
              options: disciplines.map(d => ({ value: d.code, label: `${d.code} — ${d.en}`, labelHe: `${d.code} — ${d.he}` })) },
            { key: "priority", label: "Priority", labelHe: "עדיפות", type: "select", options: [
              { value: "HIGH", label: "High", labelHe: "גבוהה" },
              { value: "MEDIUM", label: "Medium", labelHe: "בינונית" },
              { value: "LOW", label: "Low", labelHe: "נמוכה" },
            ]},
            { key: "due", label: "Due Date", labelHe: "תאריך יעד", type: "date" },
            { key: "assignedTo", label: "Assigned To", labelHe: "מוקצה ל", type: "text" },
          ]}
        />
      )}

      {showDisciplineMgr && (
        <DisciplineManagerModal isHe={isHe} onClose={() => setShowDisciplineMgr(false)} />
      )}
    </div>
  );
}
