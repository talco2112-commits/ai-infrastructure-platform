"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Bell, Search, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
    title: "Design Management",
    searchPlaceholder: "Search...",
    tabs: ["Submittals", "Drawing Register", "Approval Workflow"],
    newSubmittal: "New Submittal",
    aiAlertLabel: "AI Design Coordination Alert",
    aiAlertText: "Conflicting pile cap dimensions detected between SUB-009 (structural rebar schedule) and HW20-STR-DWG-068-002 (pier details Rev.B). Pier P7 cap dimensions differ by 150mm on the east face. Coordination meeting required before concrete pour scheduled for 08 Jul.",
    statsLabels: ["Total Submittals", "Approved", "Under Review", "Rejected / Resubmit", "Pending"],
    colNum: "#",
    colTitle: "Submittal Title",
    colDiscipline: "Discipline",
    colRev: "Rev.",
    colSubmitted: "Submitted",
    colDue: "Due Date",
    colDaysLeft: "Days Left",
    colStatus: "Status",
    overdue: (d: number) => `${d}d overdue`,
    dueToday: "Due today",
    daysLeft: (d: number) => `${d}d left`,
  },
  he: {
    title: "ניהול תכנון",
    searchPlaceholder: "חיפוש...",
    tabs: ["הגשות", "רשימת תכניות", "תהליך אישורים"],
    newSubmittal: "הגשה חדשה",
    aiAlertLabel: "התראת תיאום AI",
    aiAlertText: "אי-התאמה בממדי כובע הקלונסאות בין SUB-009 (לוח ברזל מבני) ל-HW20-STR-DWG-068-002 (פרטי עמוד Rev.B). ממדי כובע העמוד P7 שונים ב-150 מ״מ בפאה המזרחית. נדרשת ישיבת תיאום לפני יציקת בטון המתוכננת ל-08 ביולי.",
    statsLabels: ["סה״כ הגשות", "מאושר", "בבדיקה", "נדחה / הגשה חוזרת", "ממתין"],
    colNum: "#",
    colTitle: "כותרת ההגשה",
    colDiscipline: "תחום",
    colRev: "גרסה",
    colSubmitted: "הוגש",
    colDue: "תאריך יעד",
    colDaysLeft: "ימים נותרים",
    colStatus: "סטטוס",
    overdue: (d: number) => `${d}י באיחור`,
    dueToday: "יעד היום",
    daysLeft: (d: number) => `${d}י נותרו`,
  },
};

type SubStatus = "APPROVED" | "UNDER REVIEW" | "REJECTED" | "RESUBMIT" | "PENDING";

const DEMO_SUBMITTALS: {
  num: string; title: string; discipline: string; rev: string;
  submitted: string; due: string; daysRemaining: number; status: SubStatus;
}[] = [
  { num: "SUB-001", title: "Bridge 68 – Bearing Pad Shop Drawings",               discipline: "Structural", rev: "Rev.B", submitted: "02 Mar 2026", due: "23 Mar 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-002", title: "Pile Drilling Equipment & Methodology",                discipline: "Civil",      rev: "Rev.A", submitted: "15 Mar 2026", due: "05 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-003", title: "Concrete Mix Design – fc'30MPa",                       discipline: "Structural", rev: "Rev.C", submitted: "20 Mar 2026", due: "10 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-004", title: "Structural Steel Fabrication Drawings – Bridge 68",    discipline: "Structural", rev: "Rev.A", submitted: "01 Apr 2026", due: "22 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-005", title: "Geotextile & Filter Fabric Specification",             discipline: "Civil",      rev: "Rev.B", submitted: "10 Apr 2026", due: "01 May 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-006", title: "Traffic Signal Equipment – Phase 1",                   discipline: "Traffic",    rev: "Rev.A", submitted: "05 May 2026", due: "26 May 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-007", title: "Expansion Joint – Bridge 68 Type EJ-300",             discipline: "Structural", rev: "Rev.A", submitted: "12 May 2026", due: "02 Jun 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-008", title: "Retaining Wall Block System – Manufacturer Data",      discipline: "Structural", rev: "Rev.A", submitted: "18 May 2026", due: "08 Jun 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-009", title: "Pile Cap Rebar Schedule – Piers P5–P10",              discipline: "Structural", rev: "Rev.B", submitted: "02 Jun 2026", due: "16 Jun 2026", daysRemaining: -13, status: "UNDER REVIEW"  },
  { num: "SUB-010", title: "Asphalt Mix Design – Wearing Course",                  discipline: "Civil",      rev: "Rev.A", submitted: "05 Jun 2026", due: "19 Jun 2026", daysRemaining: -10, status: "UNDER REVIEW"  },
  { num: "SUB-011", title: "Drainage Pipe – HDPE Class SN8 Technical Data",       discipline: "Civil",      rev: "Rev.A", submitted: "08 Jun 2026", due: "22 Jun 2026", daysRemaining: -7,  status: "UNDER REVIEW"  },
  { num: "SUB-012", title: "Electrical Conduit – Galvanized Steel Shop Drawings",  discipline: "MEP",        rev: "Rev.A", submitted: "10 Jun 2026", due: "24 Jun 2026", daysRemaining: -5,  status: "UNDER REVIEW"  },
  { num: "SUB-013", title: "Bridge Deck Formwork – Falsework Design",              discipline: "Structural", rev: "Rev.A", submitted: "14 Jun 2026", due: "28 Jun 2026", daysRemaining: -1,  status: "REJECTED"      },
  { num: "SUB-014", title: "Guardrail System – TL-4 Crash Test Data",             discipline: "Civil",      rev: "Rev.A", submitted: "18 Jun 2026", due: "02 Jul 2026", daysRemaining: 3,   status: "RESUBMIT"      },
  { num: "SUB-015", title: "Lighting Pole Foundation Design",                      discipline: "MEP",        rev: "Rev.A", submitted: "22 Jun 2026", due: "06 Jul 2026", daysRemaining: 7,   status: "PENDING"       },
];

const statusStyle: Record<SubStatus, { bg: string; color: string }> = {
  "APPROVED":     { bg: P.goodBg,   color: P.good   },
  "UNDER REVIEW": { bg: P.warnBg,   color: P.warn   },
  "REJECTED":     { bg: P.dangerBg, color: P.danger },
  "RESUBMIT":     { bg: "#FEF3C7",  color: "#92400E" },
  "PENDING":      { bg: "#F5F5F4",  color: "#78716C" },
};

export default function DesignPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const [lang, setLang] = useState<"en" | "he">("en");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    if (c === "he") setLang("he");
  }, []);
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  const [submittals, setSubmittals] = useState(isDemo ? DEMO_SUBMITTALS : []);
  const [showModal, setShowModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  useEffect(() => { setSubmittals(isDemo ? DEMO_SUBMITTALS : []); }, [isDemo]);

  function confirmDelete() {
    if (deleteIdx === null) return;
    setSubmittals(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }

  const statsValues = isDemo ? [38, 14, 17, 4, 3] : [
    submittals.length,
    submittals.filter(s => s.status === "APPROVED").length,
    submittals.filter(s => s.status === "UNDER REVIEW").length,
    submittals.filter(s => s.status === "REJECTED" || s.status === "RESUBMIT").length,
    submittals.filter(s => s.status === "PENDING").length,
  ];

  function addSubmittal(values: Record<string, string>) {
    const num = `SUB-${String(submittals.length + 1).padStart(3, "0")}`;
    setSubmittals(prev => [{
      num,
      title: values.title || "",
      discipline: values.discipline || "Civil",
      rev: "Rev.A",
      submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      due: values.due ? new Date(values.due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
      daysRemaining: values.due ? Math.round((new Date(values.due).getTime() - Date.now()) / 86400000) : 21,
      status: "PENDING" as SubStatus,
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

      <div className="flex-1 overflow-y-auto p-6">

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {T.statsLabels.map((label, idx) => {
            const colors = [P.copper, P.good, P.warn, P.danger, "#78716C"];
            return (
              <div key={label} className="rounded-2xl p-4 text-center"
                style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <p className="text-[28px] font-bold" style={{ color: colors[idx] }}>{statsValues[idx]}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: P.text3 }}>{label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          {T.tabs.map((tab, idx) => (
            <button key={tab}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
              style={{
                background: idx === 0 ? P.copper : P.bg,
                color: idx === 0 ? "#fff" : P.text2,
                border: `1px solid ${idx === 0 ? P.copper : P.border}`,
              }}>
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newSubmittal}
          </button>
        </div>

        {/* AI Insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
            style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiAlertLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiAlertText}</p>
            </div>
          </div>
        )}

        {/* Submittals Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colNum, T.colTitle, T.colDiscipline, T.colRev, T.colSubmitted, T.colDue, T.colDaysLeft, T.colStatus, ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submittals.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                  {isHe ? "אין הגשות עדיין" : "No submittals yet"}
                </td></tr>
              )}
              {submittals.map((s, i) => (
                <tr key={i} className="transition-colors hover:bg-[#F5F2EF]"
                  style={{ borderBottom: `1px solid ${P.border}` }}>
                  <td className="px-4 py-3 font-mono text-[11px] font-bold" style={{ color: P.copper }}>{s.num}</td>
                  <td className="px-4 py-3 font-medium max-w-[280px]" style={{ color: P.text1 }}>{s.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{
                        background: s.discipline === "Structural" ? "#EDE9FE" : s.discipline === "Civil" ? "#E0F2FE" : s.discipline === "MEP" ? "#E0FFFE" : "#ECFDF5",
                        color: s.discipline === "Structural" ? "#7C3AED" : s.discipline === "Civil" ? "#0369A1" : s.discipline === "MEP" ? "#0891B2" : "#047857",
                      }}>
                      {s.discipline}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text3 }}>{s.rev}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{s.submitted}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{s.due}</td>
                  <td className="px-4 py-3">
                    {s.daysRemaining < 0
                      ? <span className="font-bold text-[12px]" style={{ color: P.danger }}>{T.overdue(Math.abs(s.daysRemaining))}</span>
                      : s.daysRemaining === 0
                      ? <span className="font-bold text-[12px]" style={{ color: P.warn }}>{T.dueToday}</span>
                      : <span className="font-medium text-[12px]" style={{ color: P.good }}>{T.daysLeft(s.daysRemaining)}</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].color }}>
                      {s.status}
                    </span>
                  </td>
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
          message={`Delete submittal "${submittals[deleteIdx]?.title}"? This cannot be undone.`}
          messageHe={`למחוק את ההגשה "${submittals[deleteIdx]?.title}"? לא ניתן לשחזר פעולה זו.`}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDelete}
        />
      )}

      {showModal && (
        <QuickAddModal
          isHe={isHe}
          title="New Submittal" titleHe="הגשה חדשה"
          onClose={() => setShowModal(false)}
          onSave={addSubmittal}
          fields={[
            { key: "title", label: "Submittal Title", labelHe: "כותרת ההגשה", type: "text", required: true },
            { key: "discipline", label: "Discipline", labelHe: "תחום", type: "select", options: [
              { value: "Structural", label: "Structural", labelHe: "קונסטרוקציה" },
              { value: "Civil", label: "Civil", labelHe: "אזרחית" },
              { value: "MEP", label: "MEP", labelHe: "מ.מ.ח" },
              { value: "Traffic", label: "Traffic", labelHe: "תנועה" },
            ]},
            { key: "due", label: "Due Date", labelHe: "תאריך יעד", type: "date" },
          ]}
        />
      )}
    </div>
  );
}
